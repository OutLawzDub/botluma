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
        max_tokens: 150,
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
    if (!choice || !choice.message || !choice.message.content) {
      const errorMsg = `Structure de réponse invalide: ${JSON.stringify(choice).substring(0, 200)}`;
      console.error('❌ Erreur OpenRouter:', errorMsg);
      
      if (retries > 0) {
        console.log(`🔄 Nouvelle tentative... (${retries} tentatives restantes)`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        return generateAIResponse(messages, systemPrompt, retries - 1);
      }
      
      return { success: false, response: null, error: errorMsg };
    }
    
    return { success: true, response: choice.message.content, error: null };
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

