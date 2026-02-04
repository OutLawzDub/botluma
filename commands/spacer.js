import { SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import { logError } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  data: new SlashCommandBuilder()
    .setName('spacer')
    .setDescription('Envoie une image spacer dans le salon'),

  async execute(interaction) {
    try {
      if (!interaction.channel) {
        await interaction.reply({
          content: '❌ Cette commande ne peut être utilisée que dans un salon de serveur.',
          ephemeral: true
        });
        return;
      }

      const imagePath = join(dirname(dirname(__filename)), 'spacer.png');
      
      if (!existsSync(imagePath)) {
        await interaction.reply({
          content: '❌ L\'image spacer.png n\'a pas été trouvée.',
          ephemeral: true
        });
        return;
      }

      const attachment = new AttachmentBuilder(imagePath, { name: 'spacer.png' });

      await interaction.deferReply({ ephemeral: true });

      await interaction.channel.send({ files: [attachment] });

      await interaction.deleteReply();

    } catch (error) {
      logError('Spacer', 'Envoi spacer', { channelId: interaction.channelId, userId: interaction.user?.id }, error);
      
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ Une erreur est survenue lors de l\'envoi de l\'image.',
          ephemeral: true
        }).catch(() => {});
      } else if (interaction.deferred) {
        await interaction.editReply({
          content: '❌ Une erreur est survenue lors de l\'envoi de l\'image.'
        }).catch(() => {});
      }
    }
  },
};
