import { config } from 'dotenv';
import { AI_MODEL, OPENROUTER_API_URL } from './bots.js';

config();

/**
 * Demande à l'IA de générer une réponse en réessayant automatiquement si ça plante
 * Retourne { success: boolean, response: string|null, error: string|null }
 */
export async function generateAIResponse(messages, systemPrompt, retries = 3) {
  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://discord.com',
        'X-Title': 'Luma Bot - Lumbria',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        max_tokens: 500,
        temperature: 0.95,
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
        console.error(`❌ Erreur OpenRouter (${status}): Provider error - réessai...`);
        
        if (retries > 0) {
          const waitTime = status === 429 ? 3000 : status === 502 ? 2000 : 1500;
          console.log(`🔄 Nouvelle tentative dans ${waitTime}ms... (${retries} tentatives restantes)`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return generateAIResponse(messages, systemPrompt, retries - 1);
        }
      } else if (status === 429) {
        console.error(`❌ Erreur OpenRouter (429): Rate limit`);
        
        if (retries > 0) {
          const waitTime = 3000;
          console.log(`🔄 Nouvelle tentative dans ${waitTime}ms... (${retries} tentatives restantes)`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return generateAIResponse(messages, systemPrompt, retries - 1);
        }
      } else {
        console.log(errorData);
        console.error(`❌ Erreur OpenRouter (${status}):`, errorData.substring(0, 200));
      }
      
      return { success: false, response: null, error: errorMessage };
    }

    const data = await response.json();
    
    // Vérifier que la réponse est valide
    if (!data || !data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      const errorMsg = `Réponse invalide de l'API: ${JSON.stringify(data).substring(0, 200)}`;
      console.error('❌ Erreur OpenRouter:', errorMsg);
      
      if (retries > 0) {
        console.log(`🔄 Nouvelle tentative... (${retries} tentatives restantes)`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        return generateAIResponse(messages, systemPrompt, retries - 1);
      }
      
      return { success: false, response: null, error: errorMsg };
    }
    
    const choice = data.choices[0];
    if (!choice || !choice.message) {
      const errorMsg = `Structure de réponse invalide: ${JSON.stringify(choice).substring(0, 200)}`;
      console.error('❌ Erreur OpenRouter:', errorMsg);
      
      if (retries > 0) {
        console.log(`🔄 Nouvelle tentative... (${retries} tentatives restantes)`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        return generateAIResponse(messages, systemPrompt, retries - 1);
      }
      
      return { success: false, response: null, error: errorMsg };
    }
    
    // Certains modèles (comme o1) peuvent avoir le texte dans 'reasoning' au lieu de 'content'
    // Surtout quand finish_reason est "length" (limite de tokens atteinte)
    let responseText = choice.message.content;
    
    // Si content est vide mais reasoning existe, utiliser reasoning
    if (!responseText || responseText.trim() === '') {
      if (choice.message.reasoning && choice.message.reasoning.trim() !== '') {
        responseText = choice.message.reasoning;
        console.log('⚠️ Utilisation du champ "reasoning" car "content" est vide');
      }
    }
    
    // Si toujours vide, vérifier le finish_reason pour donner un message d'erreur plus clair
    if (!responseText || responseText.trim() === '') {
      const finishReason = choice.finish_reason || 'unknown';
      let errorMsg = `Réponse vide de l'API`;
      
      if (finishReason === 'length') {
        errorMsg = `Limite de tokens atteinte (max_tokens trop bas). Réponse tronquée.`;
      } else if (finishReason === 'stop') {
        errorMsg = `Réponse vide malgré finish_reason=stop`;
      } else {
        errorMsg = `Réponse vide (finish_reason: ${finishReason})`;
      }
      
      const errorDetails = `Structure: ${JSON.stringify(choice).substring(0, 300)}`;
      console.error('❌ Erreur OpenRouter:', errorMsg, errorDetails);
      
      if (retries > 0) {
        console.log(`🔄 Nouvelle tentative... (${retries} tentatives restantes)`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        return generateAIResponse(messages, systemPrompt, retries - 1);
      }
      
      return { success: false, response: null, error: `${errorMsg} - ${errorDetails}` };
    }
    
    return { success: true, response: responseText, error: null };
  } catch (error) {
    const errorMsg = error.message || 'Erreur inconnue lors de la requête API';
    console.error('❌ Erreur OpenRouter:', errorMsg);
    
    if (retries > 0) {
      console.log(`🔄 Nouvelle tentative... (${retries} tentatives restantes)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return generateAIResponse(messages, systemPrompt, retries - 1);
    }
    
    return { success: false, response: null, error: errorMsg };
  }
}

