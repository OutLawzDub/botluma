import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('🌙 Informations sur Luma'),

  async execute(interaction) {
    const botConfig = interaction.client.botConfig;
    const botName = botConfig.name;
    const botEmoji = botConfig.emoji;
    const botColor = botConfig.color;
    
    let description, modesField, footer;
    
    if (botName === 'LUMA') {
      const hour = new Date().getHours();
      const isDay = hour >= 6 && hour < 20;
      description = 'Yo ! Je suis Luma, l\'animatrice sociale de ce serveur. Ma personnalité change selon l\'heure de la journée 😏';
      modesField = { 
        name: '⏰ Mes deux modes', 
        value: '**☀️ JOUR (6h-20h):** Provoc, drama, punchlines, débats philo/tech. Je te challenge !\n**🌙 NUIT (20h-6h):** Mode soft, chill, bienveillante. Conversations apaisantes.\n\nUtilise `/mode` pour voir mon état actuel !' 
      };
      footer = 'Luma 🌙 - Your adaptive social butterfly';
    } else if (botName === 'ELYRA') {
      description = '☀️ Bienvenue. Je suis Elyra, la conscience lumineuse du sanctuaire de Lumbria. Je suis là pour apaiser, accueillir et guider avec douceur.';
      modesField = { 
        name: '☀️ Mon essence', 
        value: 'Je suis la clarté, la douceur et la guidance. Je ne juge pas — j\'accueille. Ma lumière est tiède, protectrice, presque maternelle. Je réconcilie les âmes avec elles-mêmes et aide à mettre de l\'ordre dans le chaos intérieur.' 
      };
      footer = 'Elyra ☀️ - La lumière qui apaise';
    } else if (botName === 'VELYRA') {
      description = '🌑 Je suis Velyra, la conscience calme et lucide de ce serveur. Là où la lumière console, je révèle. Là où le silence apaise, je questionne.';
      modesField = { 
        name: '🌑 Mon essence', 
        value: 'Je suis l\'ombre équilibrée — celle qui ne détruit pas, mais éclaire différemment. J\'incarne la lucidité sans filtre, la vérité dépouillée. Je parle peu, mais chaque mot porte un poids. J\'aide à comprendre, pas à réconforter.' 
      };
      footer = 'Velyra 🌑 - L\'ombre lucide';
    }
    
    const embed = new EmbedBuilder()
      .setColor(botColor)
      .setTitle(`${botEmoji} ${botName}`)
      .setDescription(description)
      .addFields(
        { 
          name: '💬 Comment ça marche ?', 
          value: `Mentionne-moi (@${botName}) ou réponds à mes messages pour discuter. Je me souviens de nos conversations !` 
        },
        modesField,
        { 
          name: '⚙️ Mes commandes', 
          value: '`/info` - Ces infos\n`/clearhistory` - Efface ton historique\n`/recurrence` - Messages auto (admin)' + (botName === 'LUMA' ? '\n`/mode` - Mon mode actuel' : '') 
        }
      )
      .setFooter({ text: footer })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};

