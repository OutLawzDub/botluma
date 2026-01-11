#!/bin/bash

echo "🚀 Démarrage des bots avec PM2..."

cd "$(dirname "$0")"

if [ -f "ecosystem.config.js" ]; then
    pm2 start ecosystem.config.js
else
    pm2 start index.js --name "lumbria-bots" --env production
fi

pm2 save

echo "✅ Bots démarrés !"
echo "📊 Utilisez './status.sh' ou 'pm2 status' pour voir l'état"
echo "📝 Utilisez './logs.sh' ou 'pm2 logs lumbria-bots' pour voir les logs"
