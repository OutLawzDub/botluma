#!/bin/bash

echo "🔧 Configuration PM2 pour les bots Lumbria..."

if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 n'est pas installé. Installation en cours..."
    npm install -g pm2
    echo "✅ PM2 installé !"
else
    echo "✅ PM2 est déjà installé"
fi

echo ""
echo "📝 Configuration PM2..."
pm2 startup
pm2 save

echo ""
echo "✅ Configuration terminée !"
echo "💡 Utilisez './start.sh' pour démarrer les bots"
echo "💡 Les bots redémarreront automatiquement au démarrage du serveur"
