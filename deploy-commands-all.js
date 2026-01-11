import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync } from 'fs';
import { BOTS_CONFIG } from './config/bots.js';

config();

const commands = [];
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = join(commandsPath, file);
  const command = await import(`file://${filePath}`);
  if ('data' in command.default && 'execute' in command.default) {
    commands.push(command.default.data.toJSON());
    console.log(`✅ Commande préparée: ${command.default.data.name}`);
  }
}

console.log(`\n🔄 Déploiement de ${commands.length} commande(s) pour LUMA uniquement...\n`);

const lumaConfig = BOTS_CONFIG.find(bot => bot.name === 'LUMA');

if (!lumaConfig || !lumaConfig.token || !lumaConfig.clientId) {
  console.error('❌ LUMA: Token ou Client ID manquant dans le .env');
  process.exit(1);
}

try {
  const rest = new REST().setToken(lumaConfig.token);
  
  const data = await rest.put(
    Routes.applicationGuildCommands(lumaConfig.clientId, process.env.GUILD_ID),
    { body: commands },
  );

  console.log(`${lumaConfig.emoji} ${lumaConfig.name}: ${data.length} commande(s) déployée(s) avec succès!`);
} catch (error) {
  console.error(`❌ ${lumaConfig.name}: Erreur lors du déploiement:`, error.message);
  process.exit(1);
}

console.log('\n✅ Déploiement terminé!');

