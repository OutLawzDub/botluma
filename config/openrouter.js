import { config } from 'dotenv';
import { AI_MODEL, AI_API_URL } from './bots.js';
import { logError } from '../utils/logger.js';

config();

const BASE_MAX_TOKENS = 300;

/**
 * Demande à l'IA locale de générer une réponse (réessais auto si erreur).
 * Retourne { success: boolean, response: string|null, error: string|null }
 * @param {number} currentMaxTokens - Nombre de tokens max pour cette tentative (augmente de +100 si finish_reason="length")
 */
export async function generateAIResponse(messages, systemPrompt, retries = 3, currentMaxTokens = BASE_MAX_TOKENS) {
  try {
    const response = await fetch(AI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.95,
        top_p: 0.95,
        max_tokens: currentMaxTokens,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      const status = response.status;
      let errorMessage = `Erreur API (${status})`;
      
      try {
        const errorJson = JSON.parse(errorData);
        errorMessage = errorJson.error?.message || errorJson.message || errorMessage;
      } catch {
        errorMessage = errorData.substring(0, 500) || errorMessage;
      }
      
      if (status === 502 || status === 503 || status === 504 || (status >= 500 && status < 600)) {
        logError('LLM', `HTTP ${status} - Erreur serveur, réessai`, { status, model: AI_MODEL, retriesLeft: retries - 1, errorBody: String(errorData).substring(0, 300) });
        
        if (retries > 0) {
          const waitTime = status === 429 ? 3000 : status === 502 ? 2000 : 1500;
          console.log(`🔄 Nouvelle tentative dans ${waitTime}ms... (${retries} tentatives restantes)`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return generateAIResponse(messages, systemPrompt, retries - 1, currentMaxTokens);
        }
      } else if (status === 429) {
        logError('LLM', 'Rate limit (429)', { status: 429, model: AI_MODEL, retriesLeft: retries - 1 });
        
        if (retries > 0) {
          const waitTime = 3000;
          console.log(`🔄 Nouvelle tentative dans ${waitTime}ms... (${retries} tentatives restantes)`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return generateAIResponse(messages, systemPrompt, retries - 1, currentMaxTokens);
        }
      } else {
        logError('LLM', `HTTP ${status} - ${errorMessage}`, { status, model: AI_MODEL, rawBody: String(errorData).substring(0, 500) });
      }
      
      return { success: false, response: null, error: errorMessage };
    }

    const data = await response.json();
    
    // Log réponse API (résumé en prod)
    const responsePreview = data?.choices?.[0] ? { id: data.id, usage: data.usage, choicesCount: data.choices?.length } : data;
    console.log(`[${new Date().toISOString()}] 📥 LLM réponse:`, JSON.stringify(responsePreview));
    
    // Vérifier que la réponse est valide
    if (!data || !data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      const errorMsg = `Réponse invalide de l'API: ${JSON.stringify(data).substring(0, 200)}`;
      logError('LLM', errorMsg, { model: AI_MODEL, retriesLeft: retries - 1, rawResponse: JSON.stringify(data).substring(0, 400) });
      
      if (retries > 0) {
        console.log(`🔄 Nouvelle tentative... (${retries} tentatives restantes)`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        return generateAIResponse(messages, systemPrompt, retries - 1, currentMaxTokens);
      }
      
      return { success: false, response: null, error: errorMsg };
    }
    
    const choice = data.choices[0];
    if (!choice || !choice.message) {
      const errorMsg = `Structure de réponse invalide: ${JSON.stringify(choice).substring(0, 200)}`;
      logError('LLM', errorMsg, { model: AI_MODEL, retriesLeft: retries - 1, choiceKeys: choice ? Object.keys(choice) : [] });
      
      if (retries > 0) {
        console.log(`🔄 Nouvelle tentative... (${retries} tentatives restantes)`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        return generateAIResponse(messages, systemPrompt, retries - 1, currentMaxTokens);
      }
      
      return { success: false, response: null, error: errorMsg };
    }

    const responseText = choice.message.content;
    const finishReason = choice.finish_reason || 'unknown';

    // On utilise UNIQUEMENT le champ "content". On ignore complètement "reasoning".
    // Si "content" est vide, on considère que c'est une erreur côté provider.
    if (!responseText || responseText.trim() === '') {
      const errorMsg = `Réponse vide (finish_reason: ${finishReason})`;
      logError('LLM', errorMsg, { model: AI_MODEL, finishReason, retriesLeft: retries - 1, choicePreview: JSON.stringify(choice).substring(0, 300) });

      // Si finish_reason est "length" et qu'on a encore des retries, augmenter max_tokens de +100
      if (finishReason === 'length' && retries > 0) {
        const newMaxTokens = currentMaxTokens + 100;
        console.log(`⚠️ Limite de tokens atteinte. Augmentation max_tokens: ${currentMaxTokens} → ${newMaxTokens}`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        return generateAIResponse(messages, systemPrompt, retries - 1, newMaxTokens);
      }

      if (retries > 0) {
        console.log(`🔄 Nouvelle tentative... (${retries} tentatives restantes)`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        return generateAIResponse(messages, systemPrompt, retries - 1, currentMaxTokens);
      }

      return { success: false, response: null, error: errorMsg };
    }
    
    // Si finish_reason est "length" mais qu'on a du contenu, on accepte quand même la réponse
    // mais on peut loguer un avertissement
    if (finishReason === 'length') {
      console.log(`⚠️ Réponse tronquée (finish_reason: length) mais contenu présent, acceptée`);
    }
    
    return { success: true, response: responseText, error: null };
  } catch (error) {
    const errorMsg = error?.message || 'Erreur inconnue lors de la requête API';
    logError('LLM', errorMsg, { model: AI_MODEL, retriesLeft: retries - 1 }, error);
    
    if (retries > 0) {
      console.log(`🔄 Nouvelle tentative... (${retries} tentatives restantes)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return generateAIResponse(messages, systemPrompt, retries - 1, currentMaxTokens);
    }
    
    return { success: false, response: null, error: errorMsg };
  }
}

