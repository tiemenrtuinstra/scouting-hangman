#!/bin/bash
# Scouting Hangman Installer
# Usage: curl -fsSL https://raw.githubusercontent.com/tiemenrtuinstra/scouting-hangman/main/scripts/install.sh | bash

set -e

echo "⚜️ Scouting Hangman installeren..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is niet geinstalleerd. Installeer Node.js 20+ eerst."
    echo "   Ga naar: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js 20+ is vereist. Je hebt v$(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) gevonden"

# Install globally
npm install -g scouting-hangman@latest

echo ""
echo "✅ Scouting Hangman is geinstalleerd!"
echo "   Start het spel met: scouting-hangman"
echo ""
