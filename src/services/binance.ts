/**
 * Binance Public API Service
 * Uses Binance's public endpoints directly - no API key required for market data
 */

// Binance API types
interface BinanceTicker24hr {
    symbol: string;
    priceChange: string;
    priceChangePercent: string;
    weightedAvgPrice: string;
    prevClosePrice: string;
    lastPrice: string;
    lastQty: string;
    bidPrice: string;
    bidQty: string;
    askPrice: string;
    askQty: string;
    openPrice: string;
    highPrice: string;
    lowPrice: string;
    volume: string;
    quoteVolume: string;
    openTime: number;
    closeTime: number;
    firstId: number;
    lastId: number;
    count: number;
}

interface BinanceKline {
    0: number; // Open time
    1: string; // Open price
    2: string; // High price
    3: string; // Low price
    4: string; // Close price
    5: string; // Volume
    6: number; // Close time
    7: string; // Quote asset volume
    8: number; // Number of trades
    9: string; // Taker buy base asset volume
    10: string; // Taker buy quote asset volume
    11: string; // Ignore
}

interface BinancePriceData {
    symbol: string;
    price: number;
    volume24h: number;
    priceChange24h: number;
    source: 'binance';
}

interface BinanceChartData {
    timestamp: number;
    price: number;
    volume: number;
}

// USD stablecoins supported on Binance (ordered by typical volume)
const USD_STABLECOINS = ['USDT', 'USDC', 'BUSD', 'FDUSD'] as const;

// Token symbol mappings (common DeFi tokens to Binance symbols)
const TOKEN_MAPPINGS: Record<string, string> = {
    'WETH': 'ETH',
    'WBTC': 'BTC',
    'STETH': 'ETH', // Approximate with ETH
    'WMATIC': 'MATIC',
    'WBNB': 'BNB',
    'WAVAX': 'AVAX',
    'WFTM': 'FTM',
    'WONE': 'ONE',
    'WGLMR': 'GLMR',
    'USDC.E': 'USDC' // Bridged USDC
};

/**
 * Make request to Binance public API (no authentication needed)
 */
async function binanceRequest<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const baseUrl = 'https://api.binance.com/api/v3';

    const queryString = new URLSearchParams(params).toString();
    const url = `${baseUrl}${endpoint}${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Binance API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

/**
 * Normalize token symbol for Binance API
 */
function normalizeBinanceSymbol(symbol: string): string {
    const upperSymbol = symbol.toUpperCase();

    // Check direct mapping first
    if (TOKEN_MAPPINGS[upperSymbol]) {
        return TOKEN_MAPPINGS[upperSymbol];
    }

    // Apply common transformations
    return upperSymbol
        .replace(/^W/, '') // Remove 'W' prefix (WETH -> ETH)
        .replace(/\.E$/, '') // Remove '.e' suffix (USDC.e -> USDC)
        .replace(/^ST/, ''); // Remove 'ST' prefix (STETH -> ETH)
}

/**
 * Find the best USD stablecoin market for a given base asset by 24h volume
 */
export async function findBestUSDMarket(baseSymbol: string): Promise<string | null> {
    try {
        const normalizedBase = normalizeBinanceSymbol(baseSymbol);

        // Get 24hr ticker data for all symbols
        const tickerData = await binanceRequest<BinanceTicker24hr[]>('/ticker/24hr');

        // Find all USD stablecoin markets for this token
        const usdMarkets = USD_STABLECOINS.map(stable => `${normalizedBase}${stable}`);

        const relevantTickers = tickerData
            .filter(ticker => usdMarkets.includes(ticker.symbol))
            .map(ticker => ({
                symbol: ticker.symbol,
                volume: parseFloat(ticker.quoteVolume), // Quote volume in USD stablecoin
                baseVolume: parseFloat(ticker.volume)
            }))
            .sort((a, b) => b.volume - a.volume);

        if (relevantTickers.length === 0) {
            console.warn(`No USD markets found for ${baseSymbol} (normalized: ${normalizedBase}) on Binance`);
            return null;
        }

        const bestMarket = relevantTickers[0];
        console.log(`Best USD market for ${baseSymbol}: ${bestMarket.symbol} (Volume: $${bestMarket.volume.toLocaleString()})`);

        return bestMarket.symbol;
    } catch (error) {
        console.error(`Error finding best USD market for ${baseSymbol}:`, error);
        return null;
    }
}

/**
 * Get current price data for a trading pair
 */
export async function getBinancePrice(symbol: string): Promise<BinancePriceData | null> {
    try {
        const ticker = await binanceRequest<BinanceTicker24hr>('/ticker/24hr', { symbol });

        return {
            symbol,
            price: parseFloat(ticker.lastPrice),
            volume24h: parseFloat(ticker.quoteVolume),
            priceChange24h: parseFloat(ticker.priceChangePercent),
            source: 'binance'
        };
    } catch (error) {
        console.error(`Error fetching Binance price for ${symbol}:`, error);
        return null;
    }
}

/**
 * Get historical price data (klines) for charting
 */
export async function getBinanceKlines(
    symbol: string,
    interval: '1d' | '1h' | '4h' | '15m' = '1d',
    limit: number = 30
): Promise<BinanceChartData[]> {
    try {
        const klines = await binanceRequest<BinanceKline[]>('/klines', {
            symbol,
            interval,
            limit: limit.toString()
        });

        return klines.map(kline => ({
            timestamp: kline[0], // Open time
            price: parseFloat(kline[4]), // Close price
            volume: parseFloat(kline[5]) // Volume
        }));
    } catch (error) {
        console.error(`Error fetching Binance klines for ${symbol}:`, error);
        return [];
    }
}

/**
 * Get comprehensive price data for a token against USD stablecoins
 */
export async function getBinanceTokenPrice(
    tokenSymbol: string,
    interval: '1d' | '1h' | '4h' | '15m' = '1d',
    limit: number = 30
): Promise<{
    bestMarket: string | null;
    price: BinancePriceData | null;
    chartData: BinanceChartData[];
} | null> {
    try {
        // Find the best USD market by volume
        const bestMarket = await findBestUSDMarket(tokenSymbol);
        if (!bestMarket) {
            return null;
        }

        // Get current price and chart data
        const [priceData, chartData] = await Promise.all([
            getBinancePrice(bestMarket),
            getBinanceKlines(bestMarket, interval, limit)
        ]);

        return {
            bestMarket,
            price: priceData,
            chartData
        };
    } catch (error) {
        console.error(`Error fetching Binance token price for ${tokenSymbol}:`, error);
        return null;
    }
}

export type { BinancePriceData, BinanceChartData }; 