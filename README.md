# 🚀 Nonolet

**Enhanced DEX aggregator interface based on [LlamaSwap](https://swap.defillama.com)**

Nonolet extends LlamaSwap with additional features including Santiment volatility scores, enhanced funding options, and Binance price integration.

## 🆕 Additional Features

- **🔢 Santiment Volatility Scores**: Real-time stablecoin stability ratings
- **💰 Enhanced Funding Options**: Smart asset selection with balance detection  
- **📊 Binance Price Integration**: Live market data vs oracle price comparison
- **🎯 Improved UX**: Better stablecoin detection and USD formatting

## 🚀 Quick Start

```bash
# Clone and setup
git clone https://github.com/arletafs/nonolet.git
cd nonolet

# Automated setup
chmod +x quick-setup.sh && ./quick-setup.sh

# Or manual setup
yarn install
yarn dev
```

Visit: **http://localhost:3000/**

## 🏥 Monitoring & Health Checks

Nonolet includes built-in health monitoring for production deployments:

### Health Endpoint

**GET** `/api/binance/health` - Comprehensive service health status

```json
{
  "status": "healthy",           // healthy | degraded | unhealthy
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,               // seconds since startup
  "memory": {
    "used": 45,                 // MB used
    "total": 128,               // MB total heap
    "percentage": 35.16         // % memory utilization
  },
  "rateLimiting": {
    "activeIPs": 23,            // currently tracked IPs
    "totalRequests": 1543,      // total requests served
    "blockedRequests": 12,      // requests blocked by rate limiting
    "blockRate": 0.78           // percentage of requests blocked
  },
  "binanceApi": {
    "status": "online",         // online | offline
    "latency": 145              // ms response time
  }
}
```

### Health Status Codes

- **200** - `healthy` or `degraded` (service operational)
- **503** - `unhealthy` (service unavailable)

### Monitoring Integration

The health endpoint is perfect for:
- **Load Balancer Health Checks**: Configure your LB to check `/api/binance/health`
- **Uptime Monitoring**: Services like UptimeRobot, Pingdom, or DataDog
- **Custom Dashboards**: Parse JSON response for Grafana/Prometheus metrics
- **CI/CD Pipeline Checks**: Verify deployment health before traffic routing

The health endpoint gives you all the monitoring you need to ensure everything is running smoothly.

## 📚 Documentation

For comprehensive setup instructions, troubleshooting, and development guide, see **[SETUP.md](./SETUP.md)**

---

## Original LlamaSwap Information

### Join the community & report bugs

If you wish to report an issue, please join our [Discord](https://discord.swap.defillama.com/)

If you want to learn about LlamaSwap, read the [Twitter Thread](https://twitter.com/DefiLlama/status/1609989799653285888)

### Integration

The best way to integrate is through an iframe of our page, like this:

```html
<iframe
	title="LlamaSwap Widget"
	name="LlamaSwap Widget"
	src="https://swap.defillama.com?chain=ethereum"
	width="450px"
	height="565px"
	allow="fullscreen"
	marginwidth="0"
	marginheight="0"
	frameborder="0"
	scrolling="no"
	loading="eager"
></iframe>
```

The widget is responsive, so you can change the width and height in any way you want and the widget will adjust to fit the space. On top of that, you can customize the widget by adding the following params to the query url:

- chain: default chain (eg `chain=ethereum`). This parameter is required
- from: token to sell, to use the gas token for the chain use 0x0000000000000000000000000000000000000000 (eg `from=0x0000000000000000000000000000000000000000`)
- to: token to buy, to use the gas token for the chain use 0x0000000000000000000000000000000000000000 (eg `to=0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48`)
- background: color of the background (eg `background=rgb(10,20,30)`)

Note: only tokens that are part of our token lists are accepted in `from` and `to`, this is to prevent scammers linking to llamaswap with fake tokens loaded (eg a fake USDC)

#### API integration

Widget integrations are preferred cause:

- Our widget handles all different dex integrations, which are quite different (cowswap requires signing a message while most others send a tx onchain)
- Our widget shows warnings for price impact and other things that could impact negatively your users
- In case there's any issue we can push a fix to everybody by just updating the site behind the iframe

But if you'd prefer to instead integrate through our API please contact @0xngmi on discord through defillama's discord and ask for an api key. We are forced to use api keys because many of the underlying aggregators have rate limits, so we have to control the volume of requests we send to them.

### Running the app locally

```
yarn install
yarn dev
```

Visit: http://localhost:3000/
