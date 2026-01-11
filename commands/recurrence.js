import { SlashCommandBuilder, ChannelType, PermissionFlagsBits } from 'discord.js';

const activeIntervals = new Map();

export default {
  data: new SlashCommandBuilder()
    .setName('recurrence')
    .setDescription('🌙 Configure les messages récurrents de Luma')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(subcommand =>
      subcommand
        .setName('activer')
        .setDescription('Active les messages récurrents')
        .addChannelOption(option =>
          option
            .setName('salon')
            .setDescription('Le salon où envoyer les messages')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true))
        .addIntegerOption(option =>
          option
            .setName('intervalle')
            .setDescription('Intervalle en minutes (15 min - 1440 min/24h)')
            .setMinValue(15)
            .setMaxValue(1440)
            .setRequired(true))
        .addStringOption(option =>
          option
            .setName('message')
            .setDescription('Le message à envoyer (optionnel, sinon message aléatoire de Luma)')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('desactiver')
        .setDescription('Désactive les messages récurrents'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('statut')
        .setDescription('Affiche la configuration actuelle')),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'activer') {
      const channel = interaction.options.getChannel('salon');
      const intervalMinutes = interaction.options.getInteger('intervalle');
      const customMessage = interaction.options.getString('message');

      if (activeIntervals.has(interaction.guildId)) {
        clearInterval(activeIntervals.get(interaction.guildId));
      }

      const botMessages = interaction.client.botConfig.getRecurringMessages();

      const intervalId = setInterval(async () => {
        try {
          const messageToSend = customMessage || botMessages[Math.floor(Math.random() * botMessages.length)];
          await channel.send(messageToSend);
          const botEmoji = interaction.client.botConfig.emoji;
          const botName = interaction.client.botConfig.name;
          console.log(`${botEmoji} ${botName}: Message récurrent envoyé dans ${channel.name}`);
        } catch (error) {
          console.error('❌ Erreur lors de l\'envoi du message récurrent:', error);
        }
      }, intervalMinutes * 60 * 1000);

      activeIntervals.set(interaction.guildId, intervalId);
      
      interaction.client.recurringMessages.set(interaction.guildId, {
        channelId: channel.id,
        intervalMinutes,
        customMessage,
        active: true,
      });

      const botName = interaction.client.botConfig.name;
      await interaction.reply({
        content: `✅ Messages récurrents activés pour ${botName} !\n📍 **Salon:** ${channel}\n⏰ **Intervalle:** ${intervalMinutes} minute(s)\n💬 **Message:** ${customMessage ? 'Personnalisé' : `Messages variés de ${botName}`}`,
        ephemeral: true,
      });

    } else if (subcommand === 'desactiver') {
      if (activeIntervals.has(interaction.guildId)) {
        clearInterval(activeIntervals.get(interaction.guildId));
        activeIntervals.delete(interaction.guildId);
        interaction.client.recurringMessages.delete(interaction.guildId);

        await interaction.reply({
          content: '✅ Messages récurrents désactivés !',
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: 'Aucun message récurrent n\'est actif pour le moment.',
          ephemeral: true,
        });
      }

    } else if (subcommand === 'statut') {
      const config = interaction.client.recurringMessages.get(interaction.guildId);

      if (!config || !config.active) {
        await interaction.reply({
          content: 'Aucun message récurrent configuré pour le moment.',
          ephemeral: true,
        });
      } else {
        const channel = await interaction.guild.channels.fetch(config.channelId);
        const botName = interaction.client.botConfig.name;
        await interaction.reply({
          content: `📊 **Configuration actuelle pour ${botName}:**\n📍 **Salon:** ${channel}\n⏰ **Intervalle:** ${config.intervalMinutes} minute(s)\n💬 **Message:** ${config.customMessage ? config.customMessage : `Messages variés de ${botName}`}\n✅ **Statut:** Actif`,
          ephemeral: true,
        });
      }
    }
  },
};

