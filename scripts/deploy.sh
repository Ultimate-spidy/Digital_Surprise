#!/bin/bash

# Deploy script for Digital Surprise application
# This script sets up SSH agent and deploys to GitHub Pages

set -e

echo "🚀 Starting deployment process..."

# Setup SSH Agent and Add Key (as specified in requirements)
echo "🔑 Setting up SSH agent..."
eval $(ssh-agent -s)

# Check if ed25519 key exists, if not use the project's key
if [ -f ~/.ssh/id_ed25519 ]; then
    echo "📋 Adding user's ed25519 key..."
    ssh-add ~/.ssh/id_ed25519
elif [ -f ./digital ]; then
    echo "📋 Adding project's ed25519 key..."
    ssh-add ./digital
else
    echo "❌ No SSH key found. Please ensure ~/.ssh/id_ed25519 exists or run this from the project directory."
    exit 1
fi

echo "🏗️  Building application..."
npm run build

echo "📦 Deploying to GitHub Pages..."
npm run deploy

echo "✅ Deployment completed successfully!"