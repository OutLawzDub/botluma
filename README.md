# 🌙 Lumbria Trinity Bots

Trois bots Discord IA pour le serveur roleplay Lumbria, développés avec Discord.js et OpenRouter AI.

## 🤖 Les Trois Entités

### 🌙 LUMA - L'Esprit-Lune (Neutre)
- **Personnalité adaptative** : Change selon l'heure
  - **JOUR (6h-20h)** : Dynamique, provocatrice, lance des débats
  - **NUIT (20h-6h)** : Douce, apaisante, bienveillante
- Style naturel et conversationnel
- Animatrice sociale du serveur

### ☀️ ELYRA - La Lumière Apaisante (Bienveillante)
- **Personnalité** : Calme, empathique, rêveuse
- Apaise le chaos intérieur
- Guide avec douceur et poésie
- Style maternel et réconfortant

### 🌑 VELYRA - L'Ombre Lucide (Introspective)
- **Personnalité** : Mystérieuse, intense, lucide
- Révèle les vérités cachées
- Pose des questions introspectives
- Style profond et symbolique

## ✨ Fonctionnalités

Chaque bot dispose des mêmes capacités :

- 💬 **Conversations intelligentes** : Répond aux mentions et aux réponses avec mémoire contextuelle
- 🧠 **Sessions de conversation** : Garde l'historique des discussions (30 min)
- 🔄 **Messages récurrents** : Envoi automatique de messages personnalisés (15min - 24h)
- 🔄 **Retry automatique** : Réessaie automatiquement en cas d'erreur API (jusqu'à 3 fois)
- 🎭 **Personnalité unique** : Chaque bot a son propre caractère et style

## 📋 Prérequis

- Node.js 18.x ou supérieur
- 3 bots Discord configurés sur [Discord Developer Portal](https://discord.com/developers/applications)
- Une clé API OpenRouter de [OpenRouter.ai](https://openrouter.ai/)

## 🚀 Installation

1. **Cloner et installer les dépendances**
```bash
npm install
```

2. **Configurer les variables d'environnement**

Créez un fichier `.env` à la racine du projet :

```env
# Configuration du serveur Discord
GUILD_ID=votre_guild_id

# Configuration OpenRouter (partagée par les 3 bots)
OPENROUTER_API_KEY=votre_api_key_openrouter

# Bot 1 : LUMA (esprit-lune neutre)
LUMA_TOKEN=token_discord_luma
LUMA_CLIENT_ID=client_id_luma

# Bot 2 : ELYRA (lumière apaisante)
ANGE_TOKEN=token_discord_elyra
ANGE_CLIENT_ID=client_id_elyra

# Bot 3 : VELYRA (ombre lucide)
DEMONE_TOKEN=token_discord_velyra
DEMONE_CLIENT_ID=client_id_velyra
```

3. **Déployer les commandes pour les 3 bots**
```bash
npm run deploy:commands
```

4. **Démarrer les bots**
```bash
npm start
```

Les 3 bots se lanceront simultanément !

## 📝 Commandes disponibles

### Commandes utilisateur (tous les bots)
- `/info` - Affiche les informations sur le bot
- `/clearhistory` - Efface l'historique de conversation
- `/mode` - Affiche le mode actuel (LUMA uniquement)

### Commandes administrateur
- `/recurrence activer` - Active les messages récurrents
  - `salon` : Le salon où envoyer les messages
  - `intervalle` : Intervalle en minutes (15-1440)
  - `message` : Message personnalisé (optionnel)
- `/recurrence desactiver` - Désactive les messages récurrents
- `/recurrence statut` - Affiche la configuration actuelle

## 💬 Utilisation

### Parler avec les bots

1. **Mentionnez le bot** : `@LUMA Bonjour!` / `@ANGE Salut!` / `@DEMONE Hey!`
2. **Répondez à ses messages** : Créez une conversation suivie avec historique

Chaque bot se souviendra de vos échanges pendant 30 minutes d'inactivité.

### Messages récurrents

Les administrateurs peuvent configurer des messages automatiques pour chaque bot :

```
/recurrence activer salon:#général intervalle:60
```

Chaque bot enverra des messages adaptés à sa personnalité !

## 🛠️ Scripts disponibles

### Scripts npm
- `npm start` - Démarre les 3 bots
- `npm run deploy:commands` - Déploie les commandes pour les 3 bots
- `npm run dev` - Mode développement avec nodemon (**⚠️ NE PAS UTILISER en production**)

### Scripts PM2 (Recommandé pour la production)

**Installation de PM2 :**
```bash
npm install -g pm2
```

**Première configuration :**
```bash
chmod +x *.sh
./pm2-setup.sh
```

**Gestion des bots avec PM2 :**
```bash
chmod +x *.sh                    # Rendre les scripts exécutables (première fois)
./start.sh      # Démarrer les bots
./stop.sh       # Arrêter les bots
./restart.sh    # Redémarrer les bots
./logs.sh       # Voir les logs en temps réel
./status.sh     # Voir l'état des bots
```

**Avantages de PM2 :**
- ✅ Redémarrage automatique en cas de crash
- ✅ Redémarrage au démarrage du serveur
- ✅ Gestion des logs
- ✅ Monitoring en temps réel
- ✅ Pas de réponses en double

## 🏗️ Structure du projet

```
botluma/
├── commands/              # Commandes slash (partagées)
│   ├── clearhistory.js
│   ├── info.js
│   ├── mode.js
│   └── recurrence.js
├── events/               # Gestionnaires d'événements (partagés)
│   ├── ready.js
│   ├── interactionCreate.js
│   └── messageCreate.js
├── config/               # Configuration
│   ├── bots.js          # Config des 3 bots et leurs prompts
│   └── openrouter.js    # Config OpenRouter AI
├── index.js              # Point d'entrée (lance les 3 bots)
├── deploy-commands-all.js # Script de déploiement pour tous
└── package.json
```

## 🤖 Modèle IA

Les 3 bots utilisent le modèle gratuit `meta-llama/llama-3.2-3b-instruct:free` via OpenRouter.

## 🔒 Intents Discord requis

Les bots nécessitent les intents suivants :
- `Guilds` - Accès aux informations du serveur
- `GuildMessages` - Lecture des messages
- `MessageContent` - Accès au contenu des messages (Intent privilégié)
- `GuildMembers` - Accès aux informations des membres

⚠️ **Important** : Vous devez activer l'intent "Message Content" pour les 3 bots dans le Discord Developer Portal :
1. Allez sur [Discord Developer Portal](https://discord.com/developers/applications)
2. Pour chaque bot, allez dans "Bot"
3. Activez "MESSAGE CONTENT INTENT" sous "Privileged Gateway Intents"

## 🎭 Personnalités des Bots

### 🌙 LUMA
**Jour** : Provocatrice, dynamique, lance des débats, punchlines, questions philo/tech
**Nuit** : Douce, apaisante, empathique, conversations calmes

### ☀️ ELYRA
Apaise, accueille, guide, réconforte, réconcilie les âmes avec elles-mêmes

### 🌑 VELYRA
Mystérieuse, lucide, introspective, révèle les vérités, questions profondes

## ⚠️ Important

**Recommandation pour la production :**
- ✅ **Utilisez PM2** avec les scripts fournis (`start.sh` / `start.bat`)
- ✅ PM2 gère automatiquement les redémarrages et évite les doublons
- ❌ **Ne PAS utiliser `npm run dev`** en production (nodemon peut créer des instances multiples)
- ⚠️ Si vous utilisez `npm start`, assurez-vous qu'une seule instance tourne

## 📄 Licence

ISC

## 🌙 À propos

Trois entités complémentaires veillent sur Lumbria : la lune neutre (Luma), la lumière apaisante (Elyra) et l'ombre lucide (Velyra). Ensemble, elles créent un équilibre parfait ! 🌙☀️🌑
