import { SlashCommandBuilder, ChannelType, PermissionFlagsBits } from 'discord.js';
import { BOTS_CONFIG } from '../config/bots.js';
import { botClients } from '../config/clients.js';
import { logError } from '../utils/logger.js';

const activeIntervals = new Map();

export default {
  data: new SlashCommandBuilder()
    .setName('recurrence')
    .setDescription('Configure les messages récurrents pour un bot')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(subcommand =>
      subcommand
        .setName('activer')
        .setDescription('Active les messages récurrents pour un bot')
        .addStringOption(option =>
          option
            .setName('bot')
            .setDescription('Le bot pour lequel configurer')
            .addChoices(
              { name: '🌙 LUMA', value: 'LUMA' },
              { name: '☀️ ELYRA', value: 'ELYRA' },
              { name: '🌑 VELYRA', value: 'VELYRA' }
            )
            .setRequired(true))
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
            .setDescription('Le message à envoyer (optionnel, sinon message aléatoire du bot)')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('desactiver')
        .setDescription('Désactive les messages récurrents pour un bot')
        .addStringOption(option =>
          option
            .setName('bot')
            .setDescription('Le bot pour lequel désactiver')
            .addChoices(
              { name: '🌙 LUMA', value: 'LUMA' },
              { name: '☀️ ELYRA', value: 'ELYRA' },
              { name: '🌑 VELYRA', value: 'VELYRA' }
            )
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('statut')
        .setDescription('Affiche la configuration actuelle pour un bot')
        .addStringOption(option =>
          option
            .setName('bot')
            .setDescription('Le bot à vérifier')
            .addChoices(
              { name: '🌙 LUMA', value: 'LUMA' },
              { name: '☀️ ELYRA', value: 'ELYRA' },
              { name: '🌑 VELYRA', value: 'VELYRA' }
            )
            .setRequired(true))),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const selectedBotName = interaction.options.getString('bot');
    const botConfig = BOTS_CONFIG.find(bot => bot.name === selectedBotName);
    
    if (!botConfig) {
      await interaction.reply({
        content: '❌ Bot introuvable.',
        ephemeral: true,
      });
      return;
    }

    const intervalKey = `${interaction.guildId}-${selectedBotName}`;

    if (subcommand === 'activer') {
      const channel = interaction.options.getChannel('salon');
      const intervalMinutes = interaction.options.getInteger('intervalle');
      const customMessage = interaction.options.getString('message');

      const targetClient = botClients.get(selectedBotName);
      if (!targetClient) {
        await interaction.reply({
          content: `❌ Le bot ${botConfig.emoji} **${selectedBotName}** n'est pas en ligne.`,
          ephemeral: true,
        });
        return;
      }

      if (activeIntervals.has(intervalKey)) {
        clearInterval(activeIntervals.get(intervalKey));
      }

      const botMessages = botConfig.getRecurringMessages();

      const intervalId = setInterval(async () => {
        try {
          const channelToSend = await targetClient.channels.fetch(channel.id);
          if (!channelToSend) return;
          
          const messageToSend = customMessage || botMessages[Math.floor(Math.random() * botMessages.length)];
          await channelToSend.send(messageToSend);
          console.log(`${botConfig.emoji} ${selectedBotName}: Message récurrent envoyé dans ${channelToSend.name}`);
        } catch (error) {
          logError('Recurrence', 'Envoi message récurrent', { bot: selectedBotName, channelId: channel.id, channelName: channelToSend?.name }, error);
        }
      }, intervalMinutes * 60 * 1000);

      activeIntervals.set(intervalKey, intervalId);
      
      if (!interaction.client.recurringMessages) {
        interaction.client.recurringMessages = new Map();
      }
      
      interaction.client.recurringMessages.set(intervalKey, {
        botName: selectedBotName,
        channelId: channel.id,
        intervalMinutes,
        customMessage,
        active: true,
      });

      await interaction.reply({
        content: `✅ Messages récurrents activés pour ${botConfig.emoji} **${selectedBotName}** !\n📍 **Salon:** ${channel}\n⏰ **Intervalle:** ${intervalMinutes} minute(s)\n💬 **Message:** ${customMessage ? 'Personnalisé' : `Messages variés de ${selectedBotName}`}`,
        ephemeral: true,
      });

    } else if (subcommand === 'desactiver') {
      if (activeIntervals.has(intervalKey)) {
        clearInterval(activeIntervals.get(intervalKey));
        activeIntervals.delete(intervalKey);
        
        if (interaction.client.recurringMessages) {
          interaction.client.recurringMessages.delete(intervalKey);
        }

        await interaction.reply({
          content: `✅ Messages récurrents désactivés pour ${botConfig.emoji} **${selectedBotName}** !`,
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: `Aucun message récurrent n'est actif pour ${botConfig.emoji} **${selectedBotName}** pour le moment.`,
          ephemeral: true,
        });
      }

    } else if (subcommand === 'statut') {
      if (!interaction.client.recurringMessages) {
        interaction.client.recurringMessages = new Map();
      }
      
      const config = interaction.client.recurringMessages.get(intervalKey);

      if (!config || !config.active) {
        await interaction.reply({
          content: `Aucun message récurrent configuré pour ${botConfig.emoji} **${selectedBotName}** pour le moment.`,
          ephemeral: true,
        });
      } else {
        const channel = await interaction.guild.channels.fetch(config.channelId);
        await interaction.reply({
          content: `📊 **Configuration actuelle pour ${botConfig.emoji} ${selectedBotName}:**\n📍 **Salon:** ${channel}\n⏰ **Intervalle:** ${config.intervalMinutes} minute(s)\n💬 **Message:** ${config.customMessage ? config.customMessage : `Messages variés de ${selectedBotName}`}\n✅ **Statut:** Actif`,
          ephemeral: true,
        });
      }
    }
  },
};

