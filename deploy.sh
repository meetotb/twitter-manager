#!/bin/bash
echo "Deploying Twitter Manager..."

# Pull latest changes
git pull origin production

# Install dependencies
npm install

# Restart PM2
pm2 restart ecosystem.config.js

echo "Deployment completed!" 