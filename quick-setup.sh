#!/bin/bash

echo "🚀 Nonolet Quick Setup Script"
echo "============================="
echo "Enhanced DEX aggregator based on LlamaSwap"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18.17+ from https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="18.17.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please upgrade to 18.17+ (recommended: 20.x LTS)"
    exit 1
fi

echo "✅ Node.js version: $NODE_VERSION"

# Check if yarn is installed
if ! command -v yarn &> /dev/null; then
    echo "📦 Installing Yarn..."
    npm install -g yarn
else
    echo "✅ Yarn is installed: $(yarn --version)"
fi

# Install dependencies
echo "📦 Installing dependencies..."
yarn install

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Nonolet setup complete!"
    echo ""
    echo "🆕 Additional features included:"
    echo "  • Santiment volatility scores for stablecoins"
    echo "  • Enhanced funding options with balance detection"
    echo "  • Binance price comparison charts"
    echo ""
    echo "To start the development server:"
    echo "  yarn dev"
    echo ""
    echo "Then visit: http://localhost:3000"
    echo ""
    echo "📚 For more details, see SETUP.md"
else
    echo "❌ Installation failed. Please check the error messages above."
    exit 1
fi 