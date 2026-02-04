import { logError } from '../utils/logger.js';

export default {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const botName = interaction.client.botConfig?.name;
    
    if (botName !== 'LUMA') {
      return;
    }

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      logError('Interaction', 'Commande non trouvée', { commandName: interaction.commandName, bot: botName });
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      logError('Interaction', `Exécution ${interaction.commandName}`, { commandName: interaction.commandName, bot: botName, userId: interaction.user?.id }, error);
      
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ 
            content: 'Oups, un problème est survenu avec cette commande... 💫', 
            ephemeral: true 
          }).catch(() => {
            console.log('⚠️ Impossible de répondre à l\'interaction (probablement expirée)');
          });
        }
      } catch (err) {
        console.log('⚠️ Erreur ignorée lors de la tentative de réponse');
      }
    }
  },
};

