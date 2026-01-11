import { config } from 'dotenv';
import { AI_MODEL, OPENROUTER_API_URL } from './bots.js';

config();

/**
 * Demande à l'IA de générer une réponse en réessayant automatiquement si ça plante
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
      console.error(`❌ Erreur OpenRouter (${response.status}):`, errorData);
      
      if ((response.status === 429 || response.status >= 500) && retries > 0) {
        const waitTime = response.status === 429 ? 2000 : 1000;
        console.log(`🔄 Nouvelle tentative dans ${waitTime}ms... (${retries} tentatives restantes)`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return generateAIResponse(messages, systemPrompt, retries - 1);
      }
      
      return null;
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('❌ Erreur OpenRouter:', error.message);
    
    if (retries > 0) {
      console.log(`🔄 Nouvelle tentative... (${retries} tentatives restantes)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return generateAIResponse(messages, systemPrompt, retries - 1);
    }
    
    return null;
  }
}

