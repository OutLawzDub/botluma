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
      console.error(`❌ Commande ${interaction.commandName} non trouvée.`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`❌ Erreur lors de l'exécution de ${interaction.commandName}:`, error.message);
      
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

