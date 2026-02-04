import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync } from 'fs';
import { BOTS_CONFIG } from './config/bots.js';
import { botClients } from './config/clients.js';
import { logError } from './utils/logger.js';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

process.on('unhandledRejection', (error) => {
  logError('Process', 'Unhandled rejection', {}, error);
});

process.on('uncaughtException', (error) => {
  logError('Process', 'Uncaught exception', {}, error);
});

/**
 * Crée un bot Discord avec toutes ses commandes et événements
 */
async function createBot(botConfig) {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers
    ]
  });

  client.commands = new Collection();
  client.conversations = new Collection();
  client.recurringMessages = new Collection();
  client.botConfig = botConfig;

  const commandsPath = join(__dirname, 'commands');
  const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    const command = await import(`file://${filePath}`);
    if ('data' in command.default && 'execute' in command.default) {
      client.commands.set(command.default.data.name, command.default);
    }
  }

  const eventsPath = join(__dirname, 'events');
  const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith('.js'));

  for (const file of eventFiles) {
    const filePath = join(eventsPath, file);
    const event = await import(`file://${filePath}`);
    if (event.default.once) {
      client.once(event.default.name, (...args) => event.default.execute(...args));
    } else {
      client.on(event.default.name, (...args) => event.default.execute(...args));
    }
  }

  await client.login(botConfig.token);
  
  botClients.set(botConfig.name, client);
  
  return client;
}

console.log('🚀 Lancement des bots...\n');

for (const botConfig of BOTS_CONFIG) {
  if (botConfig.token && botConfig.clientId) {
    createBot(botConfig).catch(error => {
      logError('Bootstrap', `Lancement bot ${botConfig.name}`, { bot: botConfig.name }, error);
    });
  } else {
    console.log(`⚠️ ${botConfig.name}: Token ou Client ID manquant dans le .env`);
  }
}

