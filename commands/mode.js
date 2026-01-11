import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('mode')
    .setDescription('🌙 Affiche le mode actuel de Luma (jour/nuit)'),

  async execute(interaction) {
    const hour = new Date().getHours();
    const isDay = hour >= 6 && hour < 20;
    
    const embed = new EmbedBuilder()
      .setColor(isDay ? '#FFD700' : '#9b87d4')
      .setTitle(isDay ? '☀️ Mode JOUR actif' : '🌙 Mode NUIT actif')
      .setDescription(isDay ? 
        'Luma est en mode énergique ! Provoc, drama, punchlines et débats philo/tech au programme.' :
        'Luma est en mode doux. Ambiance chill, conversations apaisantes et bienveillance.')
      .addFields(
        { 
          name: '⏰ Horaires', 
          value: `**Jour:** 6h00 - 20h00 (provoc, drama, débats)\n**Nuit:** 20h00 - 6h00 (soft, chill, bienveillant)\n\n**Heure actuelle:** ${hour}h${new Date().getMinutes().toString().padStart(2, '0')}` 
        },
        { 
          name: isDay ? '🔥 Comportement JOUR' : '✨ Comportement NUIT', 
          value: isDay ? 
            'Provocatrice, lance des débats, crée du drama gentil, balance des punchlines, challenge les gens, questions philo/tech.' :
            'Apaisée, bienveillante, écoute et réconforte, conversations calmes, ambiance cosy, moins de provoc.'
        }
      )
      .setFooter({ text: 'Le mode change automatiquement selon l\'heure' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};

