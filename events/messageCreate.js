import { generateAIResponse } from '../config/openrouter.js';

const SESSION_TIMEOUT = 30 * 60 * 1000;

export default {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot) return;

    const client = message.client;
    const isMentioned = message.mentions.has(client.user);
    
    let isReplyToBot = false;
    if (message.reference) {
      try {
        const repliedMessage = await message.channel.messages.fetch(message.reference.messageId);
        isReplyToBot = repliedMessage.author.id === client.user.id;
      } catch (error) {
        console.error('Erreur lors de la récupération du message référencé:', error);
      }
    }

    if (!isMentioned && !isReplyToBot) return;

    const sessionKey = `${message.author.id}-${message.channelId}`;
    let session = client.conversations.get(sessionKey);

    if (!session || Date.now() - session.lastActivity > SESSION_TIMEOUT) {
      session = {
        userId: message.author.id,
        channelId: message.channelId,
        history: [],
        lastActivity: Date.now(),
      };
      client.conversations.set(sessionKey, session);
      console.log(`${client.botConfig.emoji} Nouvelle session créée pour ${message.author.tag} (${client.botConfig.name})`);
    }

    try {
      await message.channel.sendTyping();

      let userMessage = message.content
        .replace(new RegExp(`<@!?${client.user.id}>`, 'g'), '')
        .trim();

      session.history.push({
        role: 'user',
        content: userMessage || 'Bonjour!',
      });

      if (session.history.length > 6) {
        session.history = session.history.slice(-6);
      }

      const botConfig = client.botConfig;
      const systemPrompt = botConfig.getPrompt();
      const aiResponse = await generateAIResponse(session.history, systemPrompt);

      if (!aiResponse) {
        console.log('⚠️ Pas de réponse générée, le bot reste silencieux');
        return;
      }

      session.history.push({
        role: 'assistant',
        content: aiResponse,
      });

      session.lastActivity = Date.now();

      await message.reply(aiResponse);

      console.log(`💬 ${message.author.tag}: ${userMessage.substring(0, 50)}...`);
      console.log(`${client.botConfig.emoji} ${client.botConfig.name}: ${aiResponse.substring(0, 50)}...`);

    } catch (error) {
      console.error('❌ Erreur lors de la génération de la réponse:', error);
    }
  },
};

