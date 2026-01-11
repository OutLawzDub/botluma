import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('clearhistory')
    .setDescription('🌙 Efface ton historique de conversation avec Luma'),

  async execute(interaction) {
    const sessionKey = `${interaction.user.id}-${interaction.channelId}`;
    const session = interaction.client.conversations.get(sessionKey);

    if (session) {
      interaction.client.conversations.delete(sessionKey);
      await interaction.reply({
        content: 'C\'est fait ! Ton historique de conversation a été effacé. On repart de zéro 🌙',
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: 'Tu n\'as pas d\'historique à effacer pour le moment. On peut discuter quand tu veux ! ✨',
        ephemeral: true,
      });
    }
  },
};

