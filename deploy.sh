#!/bin/bash
# Glosmart VPS Quick Deployment & Update Script

set -e

echo "=== Pulling latest changes from Git ==="
git pull origin main

echo "=== Installing root & frontend dependencies ==="
npm install

echo "=== Building React frontend ==="
npm run build

echo "=== Installing backend dependencies ==="
cd server
npm install
cd ..

echo "=== Restarting PM2 backend service ==="
pm2 restart glosmart-backend || pm2 start server/server.js --name "glosmart-backend"

echo "=== Ensuring correct file permissions for Nginx ==="
chmod -R 755 dist

echo "=== Deployment Successfully Completed ==="
