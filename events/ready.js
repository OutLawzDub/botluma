import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync } from 'fs';

config();

export default {
  name: 'clientReady',
  once: true,
  async execute(client) {
    const hour = new Date().getHours();
    const isDay = hour >= 6 && hour < 20;
    const botName = client.botConfig.name;
    const botEmoji = client.botConfig.emoji;
    
    console.log(`${botEmoji} ${client.user.tag} (${botName}) est maintenant en ligne!`);
    
    if (botName === 'LUMA') {
      console.log(`${isDay ? '☀️' : '🌙'} Mode actif: ${isDay ? 'JOUR (provoc/drama)' : 'NUIT (soft/chill)'} - ${hour}h${new Date().getMinutes().toString().padStart(2, '0')}`);
    }
    
    if (client.recurringMessages.size > 0) {
      console.log(`${botEmoji} Initialisation des messages récurrents pour ${botName}...`);
    }
  },
};

