import { config } from 'dotenv';
import { getLumaPrompt, getLumaRecurringMessages } from '../prompts/luma.js';
import { getElyraPrompt, getElyraRecurringMessages } from '../prompts/elyra.js';
import { getVelyraPrompt, getVelyraRecurringMessages } from '../prompts/velyra.js';

config();

/**
 * Vérifie si on est en journée (entre 6h et 20h)
 */
function isDaytime() {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 20;
}

/**
 * Récupère l'heure actuelle au format "14h30"
 */
function getTimeString() {
  const now = new Date();
  const hour = now.getHours();
  const minutes = now.getMinutes();
  return `${hour}h${minutes.toString().padStart(2, '0')}`;
}

export const BOTS_CONFIG = [
  {
    name: 'LUMA',
    token: process.env.LUMA_TOKEN,
    clientId: process.env.LUMA_CLIENT_ID,
    color: '#9b87d4',
    emoji: '🌙',
    getPrompt: () => {
      const isDay = isDaytime();
      const timeString = getTimeString();
      return getLumaPrompt(isDay, timeString);
    },
    getRecurringMessages: () => {
      const isDay = isDaytime();
      return getLumaRecurringMessages(isDay);
    }
  },
  {
    name: 'ELYRA',
    token: process.env.ANGE_TOKEN,
    clientId: process.env.ANGE_CLIENT_ID,
    color: '#F0E68C',
    emoji: '☀️',
    getPrompt: () => {
      const timeString = getTimeString();
      return getElyraPrompt(timeString);
    },
    getRecurringMessages: () => getElyraRecurringMessages()
  },
  {
    name: 'VELYRA',
    token: process.env.DEMONE_TOKEN,
    clientId: process.env.DEMONE_CLIENT_ID,
    color: '#2C1B47',
    emoji: '🌑',
    getPrompt: () => {
      const timeString = getTimeString();
      return getVelyraPrompt(timeString);
    },
    getRecurringMessages: () => getVelyraRecurringMessages()
  }
];

export const AI_MODEL = process.env.AI_MODEL || 'meta-llama/llama-3.2-3b-instruct:free';
export const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

