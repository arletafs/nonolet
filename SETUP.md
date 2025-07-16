# 🚀 Nonolet Development Setup Guide

**Nonolet** is an enhanced DEX aggregator interface based on [LlamaSwap](https://swap.defillama.com) with several additional features and improvements.

## 📖 About Nonolet

### Built on LlamaSwap Foundation
Nonolet extends the LlamaSwap interface with enhanced functionality while maintaining the core multi-DEX aggregation capabilities.

### 🆕 Additional Features in Nonolet
- **🔢 Santiment Volatility Scores**: Real-time stablecoin stability ratings in Settlement table
- **💰 Enhanced Funding Options**: Smart asset selection with balance detection and price impact
- **📊 Binance Price Integration**: Real-time price comparison charts (Binance vs Oracle)
- **🎯 Improved UX**: Enhanced stablecoin detection and USD value formatting
- **⚡ Optimized Performance**: React Query caching and rate limiting for external APIs

### Core LlamaSwap Features Included
- **Multi-DEX Aggregation**: Integrates with 15+ DEX aggregators (1inch, Paraswap, etc.)
- **Cross-chain Support**: Ethereum, BSC, Polygon, Arbitrum, Optimism, Avalanche, Base
- **Price Impact Analysis**: Real-time route comparison and slippage protection
- **Wallet Integration**: RainbowKit with support for major wallets
- **Fiat Currency Support**: Direct fiat-to-crypto conversion routing

This guide will help you set up Nonolet locally for development.

## 📋 Prerequisites

### Required Software
- **Node.js**: Version 18.17+ (recommended: 20.x LTS)
- **Yarn**: Package manager (preferred over npm)
- **Git**: For version control

### Check Your Versions
```bash
node --version    # Should be 18.17+
yarn --version    # Should be 1.22+
git --version
```

## 🛠️ Installation Steps

### 1. Clone the Repository
```bash
git clone https://github.com/arletafs/nonolet.git
cd nonolet
```

### 2. Install Dependencies
```bash
yarn install
```

### 3. Environment Setup (Optional)
Create a `.env.local` file in the root directory for any environment variables:
```bash
# .env.local (create if needed)
# NEXT_PUBLIC_ALCHEMY_KEY=your_alchemy_key_here
# Add other environment variables as needed
```

### 4. Start Development Server
```bash
yarn dev
```

Visit: **http://localhost:3000/**

## 🏗️ Project Structure

```
nonolet/
├── src/
│   ├── components/           # React components
│   │   ├── Aggregator/       # Main swap interface (LlamaSwap core)
│   │   ├── VolatilityScoreCell/  # 🆕 Santiment volatility scores (Nonolet feature)
│   │   ├── ConversionChart/  # 🆕 Enhanced with Binance integration (Nonolet feature)
│   │   ├── FundingOptions/   # 🆕 Enhanced funding options table (Nonolet feature)
│   │   └── ...
│   ├── queries/              # React Query hooks
│   │   ├── useVolatilityScores.tsx  # 🆕 Santiment API integration (Nonolet feature)
│   │   ├── useBinancePrice.tsx      # 🆕 Binance price data (Nonolet feature)
│   │   └── ...
│   ├── services/             # API services
│   │   ├── santiment.ts      # 🆕 Santiment GraphQL client (Nonolet feature)
│   │   ├── santimentMappings.ts  # 🆕 Token address mappings (Nonolet feature)
│   │   ├── binance.ts        # 🆕 Binance API service (Nonolet feature)
│   │   └── ...
│   ├── pages/
│   │   ├── api/              # Next.js API routes
│   │   │   └── santiment/    # 🆕 Santiment proxy endpoints (Nonolet feature)
│   │   └── ...
│   └── ...
├── server/                   # Serverless functions (LlamaSwap core)
├── public/                   # Static assets
├── package.json
└── README.md
```

## 🎯 Key Features Overview

### ✅ Nonolet Enhancements (New Features)
- **Santiment Volatility Scoring**: Real-time 30-day volatility analysis for stablecoins
- **Enhanced Funding Options**: Intelligent asset selection with wallet balance integration
- **Binance Price Comparison**: Live market data vs oracle price charts with volume-based selection
- **Improved Stablecoin Detection**: Pattern matching for derivative tokens (aUSDC, cDAI, etc.)
- **USD Value Formatting**: Proper currency display with thousand separators
- **Rate Limited APIs**: Optimized external API calls with caching and delays

### 🔧 LlamaSwap Core Features (Inherited)
- **Multi-DEX Aggregation**: 1inch, Paraswap, Cowswap, KyberSwap, OpenOcean, and 10+ more
- **Cross-chain Support**: Ethereum, BSC, Polygon, Arbitrum, Optimism, Avalanche, Base
- **Fiat Currency Integration**: Direct fiat-to-stablecoin conversion routing
- **Price Impact Protection**: Real-time slippage analysis and warnings
- **Wallet Integration**: RainbowKit with MetaMask, WalletConnect, Coinbase Wallet support

## 🔧 Technical Stack

### Frontend Framework
- **Next.js 15.3.4**: React framework with SSR/SSG capabilities
- **React 19.1.0**: Latest React with improved performance
- **TypeScript 5.4.5**: Type-safe JavaScript for better development experience

### Styling & UI
- **Chakra UI**: Component library for consistent design
- **Styled Components**: CSS-in-JS for custom styling
- **Framer Motion**: Animation library for smooth interactions

### Web3 Integration
- **Wagmi 2.15.6**: React hooks for Ethereum development
- **RainbowKit 2.1.6**: Beautiful wallet connection interface
- **Viem 2.31.3**: Low-level Ethereum utilities and type safety

### Data Management
- **TanStack React Query 5.55.4**: Server state management and caching
- **BigNumber.js**: Precise decimal arithmetic for financial calculations

### Charts & Visualization
- **ECharts 5.4.1**: Interactive charting library for price data visualization

### External APIs (Nonolet Enhancements)
- **Santiment GraphQL**: Cryptocurrency volatility and on-chain data
- **Binance API v3**: Real-time price and market data
- **DeFiLlama**: Token prices and DeFi protocol data (LlamaSwap core)

## 🚀 Development Commands

```bash
# Start development server
yarn dev

# Build for production
yarn build

# Start production server
yarn start

# Run linting
yarn lint

# Format code
yarn format

# Analyze bundle size
yarn analyze
```

## 🔧 Environment Variables

### Optional Configuration
```bash
# .env.local
NEXT_PUBLIC_ALCHEMY_KEY=your_alchemy_key        # For better RPC performance
NEXT_PUBLIC_INFURA_KEY=your_infura_key          # Alternative RPC provider
```

### Notes
- **No API keys required** for Santiment volatility data (uses public tier)
- **No environment variables required** for basic functionality
- All external APIs work without authentication

## 🌐 API Integrations

### 🆕 Nonolet Enhancement APIs

#### Santiment Volatility Scores
- **Endpoint**: Internal proxy at `/api/santiment/volatility`
- **Purpose**: Fetches 30-day price volatility for stablecoins
- **Rate Limiting**: 200ms delays between requests
- **Caching**: 5-minute stale time, 30-minute cache retention
- **Authentication**: Public tier (no API key required)

#### Binance Price Data
- **Endpoint**: Public Binance API v3
- **Purpose**: Real-time price comparison in charts
- **Features**: Volume-based market selection, 24hr ticker data
- **Update Frequency**: 30-second intervals with React Query caching

### 🔧 LlamaSwap Core APIs

#### DeFiLlama APIs
- **Token Lists**: Current token prices and metadata
- **Aggregator Routes**: DEX routing and quote comparison
- **Price Oracle**: Fallback pricing with liquidity-weighted averaging

#### DEX Aggregator APIs
- **Supported Aggregators**: 1inch, Paraswap, Cowswap, KyberSwap, OpenOcean, LiFi, Odos, and more
- **Rate Limiting**: Controlled through serverless functions
- **Failover**: Multiple aggregators for redundancy

## 🐛 Troubleshooting

### Common Issues

**Port 3000 already in use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
# Or use different port
yarn dev -p 3001
```

**Node version issues:**
```bash
# Use Node Version Manager (if installed)
nvm use 20
# Or update Node.js from nodejs.org
```

**Yarn not found:**
```bash
# Install yarn globally
npm install -g yarn
```

**Build errors:**
```bash
# Clear Next.js cache
rm -rf .next
yarn build
```

## 📦 Dependencies Overview

### Core Framework
- **Next.js**: React framework with SSR/SSG
- **React**: UI library
- **TypeScript**: Type-safe JavaScript

### Web3 Integration
- **Wagmi**: React hooks for Ethereum
- **RainbowKit**: Wallet connection UI
- **Viem**: Low-level Ethereum utilities

### UI Components
- **Chakra UI**: Component library
- **Styled Components**: CSS-in-JS styling
- **ECharts**: Charting library

### Data Management
- **TanStack React Query**: Server state management
- **BigNumber.js**: Decimal arithmetic

## 🔒 Security Notes

- No private keys stored in code
- All API calls go through Next.js proxy routes
- CORS properly configured for external APIs
- Rate limiting implemented for external services

## 📝 License

GPL-3.0-or-later - See LICENSE file for details

## 📞 Support

### Nonolet Development
- **GitHub Issues**: Submit bug reports and feature requests
- **Documentation**: See this SETUP.md for comprehensive setup guidance

### LlamaSwap Community (Core Platform)
- **Discord**: [LlamaSwap Discord](https://discord.swap.defillama.com/)
- **Twitter**: [@DefiLlama](https://twitter.com/DefiLlama)
- **Learn More**: [LlamaSwap Twitter Thread](https://twitter.com/DefiLlama/status/1609989799653285888)

## 🤝 Contributing

Contributions to Nonolet are welcome! This project extends LlamaSwap with additional features while maintaining compatibility with the core interface.

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-enhancement`
3. Make your changes following existing patterns
4. Test thoroughly across different chains and scenarios
5. Submit a pull request with clear description

### Code Standards
- Follow existing TypeScript patterns and React Query usage
- Maintain compatibility with LlamaSwap core functionality
- Add proper error handling and loading states for new features
- Document new APIs and external integrations

---

**Happy coding with Nonolet!** 🎉

*Built on the solid foundation of [LlamaSwap](https://swap.defillama.com) with enhanced features for better user experience.* 