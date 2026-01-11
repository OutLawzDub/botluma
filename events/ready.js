import { ActivityType } from 'discord.js';

/**
 * Change l'activité du bot selon sa personnalité
 */
function setBotActivity(client) {
  const botName = client.botConfig.name;
  const hour = new Date().getHours();
  const isDay = hour >= 6 && hour < 20;
  
  let activities = [];
  
  if (botName === 'LUMA') {
    activities = isDay ? [
      { name: 'des débats enflammés', type: ActivityType.Playing },
      { name: 'lancer des hot takes', type: ActivityType.Playing },
      { name: 'créer du drama gentil', type: ActivityType.Playing },
      { name: 'challenger les opinions', type: ActivityType.Playing },
      { name: 'des questions philo', type: ActivityType.Playing },
    ] : [
      { name: 'les conversations nocturnes', type: ActivityType.Listening },
      { name: 'les étoiles de Lumbria', type: ActivityType.Watching },
      { name: 'apaiser les âmes', type: ActivityType.Playing },
      { name: 'la lune se lever', type: ActivityType.Watching },
      { name: 'les murmures doux', type: ActivityType.Listening },
    ];
  } else if (botName === 'ELYRA') {
    activities = [
      { name: 'la lumière du sanctuaire', type: ActivityType.Watching },
      { name: 'guider les âmes', type: ActivityType.Playing },
      { name: 'apaiser le chaos intérieur', type: ActivityType.Playing },
      { name: 'les murmures bienveillants', type: ActivityType.Listening },
      { name: 'réconcilier les cœurs', type: ActivityType.Playing },
      { name: 'les rayons de lumière', type: ActivityType.Watching },
    ];
  } else if (botName === 'VELYRA') {
    activities = [
      { name: 'révéler les vérités cachées', type: ActivityType.Playing },
      { name: 'les ombres de Lumbria', type: ActivityType.Watching },
      { name: 'questionner les certitudes', type: ActivityType.Playing },
      { name: 'les silences révélateurs', type: ActivityType.Listening },
      { name: 'éclairer différemment', type: ActivityType.Playing },
      { name: 'les vérités brutes', type: ActivityType.Watching },
    ];
  }
  
  if (activities.length > 0) {
    const activity = activities[Math.floor(Math.random() * activities.length)];
    client.user.setActivity(activity.name, { type: activity.type });
  }
}

export default {
  name: 'clientReady',
  once: true,
  async execute(client) {
    const hour = new Date().getHours();
    const isDay = hour >= 6 && hour < 20;
    const botName = client.botConfig.name;
    const botEmoji = client.botConfig.emoji;
    
    console.log(`${botEmoji} ${client.user.tag} (${botName}) est maintenant en ligne!`);
    
    setBotActivity(client);
    
    if (botName === 'LUMA') {
      console.log(`${isDay ? '☀️' : '🌙'} Mode actif: ${isDay ? 'JOUR (provoc/drama)' : 'NUIT (soft/chill)'} - ${hour}h${new Date().getMinutes().toString().padStart(2, '0')}`);
    }
    
    setInterval(() => {
      setBotActivity(client);
    }, 30 * 60 * 1000);
    
    if (client.recurringMessages.size > 0) {
      console.log(`${botEmoji} Initialisation des messages récurrents pour ${botName}...`);
    }
  },
};

