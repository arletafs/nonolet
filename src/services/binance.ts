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

// Comprehensive token symbol mappings for DeFi -> Binance
const TOKEN_MAPPINGS: Record<string, string> = {
    // Wrapped native tokens
    'WETH': 'ETH',
    'WBTC': 'BTC',
    'WMATIC': 'MATIC',
    'WBNB': 'BNB',
    'WAVAX': 'AVAX',
    'WFTM': 'FTM',
    'WONE': 'ONE',
    'WGLMR': 'GLMR',
    'WSOL': 'SOL',
    'WKLAY': 'KLAY',
    'WROSE': 'ROSE',

    // Staking derivatives
    'STETH': 'ETH', // Lido staked ETH - approximate with ETH
    'RETH': 'ETH', // Rocket Pool ETH
    'CBETH': 'ETH', // Coinbase wrapped staked ETH
    'WSTETH': 'ETH', // Wrapped staked ETH
    'SFRXETH': 'ETH', // Staked Frax ETH

    // Bridged tokens
    'USDC.E': 'USDC', // Avalanche/Polygon bridged USDC
    'USDT.E': 'USDT', // Avalanche bridged USDT
    'WETH.E': 'ETH', // Avalanche bridged ETH
    'BTC.B': 'BTC', // Avalanche wrapped BTC

    // Alternative symbols
    'AMPL': 'AMPL', // Keep as is - exists on Binance
    'YFI': 'YFI',
    'SUSHI': 'SUSHI',
    'AAVE': 'AAVE',
    'UNI': 'UNI',
    'COMP': 'COMP',
    'MKR': 'MKR',
    'SNX': 'SNX',
    'CRV': 'CRV',
    'BAL': 'BAL',
    'LINK': 'LINK',
    'GRT': 'GRT',
    'LDO': 'LDO',
    'ENS': 'ENS',
    'OP': 'OP',
    'ARB': 'ARB',
    'MATIC': 'MATIC',
    'AVAX': 'AVAX',
    'FTM': 'FTM',
    'ATOM': 'ATOM',
    'DOT': 'DOT',
    'ADA': 'ADA',
    'SOL': 'SOL',
    'NEAR': 'NEAR',
    'ALGO': 'ALGO',
    'LUNA': 'LUNA',
    'EGLD': 'EGLD',
    'KLAY': 'KLAY',
    'FLOW': 'FLOW',
    'ICP': 'ICP',
    'VET': 'VET',
    'XTZ': 'XTZ',
    'THETA': 'THETA',
    'FIL': 'FIL',
    'TRX': 'TRX',
    'EOS': 'EOS',
    'NEO': 'NEO',
    'IOTA': 'IOTA',
    'XLM': 'XLM',
    'XMR': 'XMR',
    'DASH': 'DASH',
    'ZEC': 'ZEC',
    'ETC': 'ETC',
    'LTC': 'LTC',
    'BCH': 'BCH',
    'BSV': 'BSV',
    'DOGE': 'DOGE',
    'SHIB': 'SHIB',
    '1INCH': '1INCH',
    'BAT': 'BAT',
    'ZRX': 'ZRX',
    'REN': 'REN',
    'KNC': 'KNC',
    'BAND': 'BAND',
    'ALPHA': 'ALPHA',
    'PERP': 'PERP',
    'IMX': 'IMX',
    'SAND': 'SAND',
    'MANA': 'MANA',
    'AXS': 'AXS',
    'GALA': 'GALA',
    'ENJ': 'ENJ',
    'CHZ': 'CHZ'
};

// Cache for validated Binance symbols to avoid repeated API calls
let binanceSymbolsCache: Set<string> | null = null;
let lastCacheUpdate = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get all trading symbols from Binance (cached)
 */
async function getBinanceSymbols(): Promise<Set<string>> {
    const now = Date.now();

    if (binanceSymbolsCache && (now - lastCacheUpdate) < CACHE_DURATION) {
        return binanceSymbolsCache;
    }

    try {
        const exchangeInfo = await binanceRequest<{
            symbols: Array<{ symbol: string; status: string; baseAsset: string; quoteAsset: string; }>
        }>('/exchangeInfo');

        binanceSymbolsCache = new Set(
            exchangeInfo.symbols
                .filter(s => s.status === 'TRADING')
                .map(s => s.baseAsset)
        );

        lastCacheUpdate = now;
        return binanceSymbolsCache;
    } catch (error) {
        console.warn('Failed to fetch Binance symbols directly, using fallback symbol list:', error);

        // Return a fallback set with common symbols including ETH
        // This prevents the ETH chart from failing due to CORS issues
        const fallbackSymbols = new Set([
            'ETH', 'BTC', 'BNB', 'ADA', 'SOL', 'MATIC', 'DOT', 'AVAX', 'LINK',
            'UNI', 'LTC', 'BCH', 'XRP', 'ETC', 'FIL', 'ATOM', 'VET', 'ICP',
            'THETA', 'TRX', 'EOS', 'AAVE', 'MKR', 'COMP', 'SUSHI', 'CRV',
            'YFI', 'SNX', 'BAL', 'LDO', 'ENS', 'OP', 'ARB', 'APE', 'SHIB',
            'DOGE', 'USDC', 'USDT', 'BUSD', 'DAI', 'FRAX', 'TUSD', 'PAXG'
        ]);

        console.log('Using fallback symbol list with', fallbackSymbols.size, 'common symbols');
        return fallbackSymbols;
    }
}

/**
 * Normalize token symbol for Binance API with validation
 */
async function normalizeBinanceSymbol(symbol: string): Promise<string | null> {
    const upperSymbol = symbol.toUpperCase();

    // 1. Check direct mapping first
    if (TOKEN_MAPPINGS[upperSymbol]) {
        const mapped = TOKEN_MAPPINGS[upperSymbol];
        console.log(`Token mapping: ${upperSymbol} -> ${mapped}`);
        return mapped;
    }

    // 2. Try the symbol as-is first
    const binanceSymbols = await getBinanceSymbols();
    if (binanceSymbols.has(upperSymbol)) {
        console.log(`Direct symbol found: ${upperSymbol}`);
        return upperSymbol;
    }

    // 3. Try safe transformations only for known patterns
    const transformations: Array<{ pattern: RegExp; replacement: string; description: string }> = [
        { pattern: /^W(ETH|BTC|MATIC|BNB|AVAX|FTM|SOL)$/, replacement: '$1', description: 'Wrapped token' },
        { pattern: /^(.+)\.E$/, replacement: '$1', description: 'Bridged token (.e suffix)' },
        { pattern: /^ST(ETH)$/, replacement: '$1', description: 'Staked token' }
    ];

    for (const { pattern, replacement, description } of transformations) {
        if (pattern.test(upperSymbol)) {
            const transformed = upperSymbol.replace(pattern, replacement);
            if (binanceSymbols.has(transformed)) {
                console.log(`${description} transformation: ${upperSymbol} -> ${transformed}`);
                return transformed;
            }
        }
    }

    // 4. Log failed normalization for debugging
    console.warn(`Failed to normalize token symbol: ${upperSymbol} (not found on Binance)`);
    return null;
}

/**
 * Make request to Binance public API (no authentication needed)
 * Note: Direct browser requests to Binance API may fail due to CORS restrictions
 */
async function binanceRequest<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const baseUrl = 'https://api.binance.com/api/v3';

    const queryString = new URLSearchParams(params).toString();
    const url = `${baseUrl}${endpoint}${queryString ? `?${queryString}` : ''}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            // Add timeout to prevent hanging requests
            signal: AbortSignal.timeout(10000) // 10 second timeout
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(`Binance API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        return response.json();
    } catch (error) {
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            // This is likely a CORS or network connectivity issue
            throw new Error(
                'Unable to connect to Binance API. This may be due to CORS restrictions or network issues. ' +
                'Consider using a server-side proxy or falling back to alternative price sources.'
            );
        }

        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('Binance API request timed out. Please try again.');
        }

        // Re-throw the original error with additional context
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new Error(`Binance API request failed: ${errorMessage}`);
    }
}

/**
 * Find the best USD stablecoin market for a given base asset by 24h volume
 */
export async function findBestUSDMarket(baseSymbol: string): Promise<string | null> {
    try {
        const normalizedBase = await normalizeBinanceSymbol(baseSymbol);

        if (!normalizedBase) {
            console.warn(`Cannot find Binance market for token: ${baseSymbol} (normalization failed)`);
            return null;
        }

        // Get 24hr ticker data for all symbols - with CORS safety
        let tickerData: BinanceTicker24hr[] = [];
        try {
            tickerData = await binanceRequest<BinanceTicker24hr[]>('/ticker/24hr');
        } catch (error) {
            // If ticker data fails, fall back to default market pattern
            const defaultMarket = `${normalizedBase}USDT`;
            console.log(`Ticker data failed for ${baseSymbol}, using default market: ${defaultMarket}`);
            return defaultMarket;
        }

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
        // This catch should rarely be reached now due to individual error handling above
        console.log(`Final fallback for ${baseSymbol}:`, error instanceof Error ? error.message : 'Unknown error');
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
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        // Log CORS errors quietly, other errors more prominently  
        if (errorMessage.includes('CORS restrictions') || errorMessage.includes('Unable to connect to Binance API')) {
            console.log(`CORS error fetching price for ${symbol}, returning null`);
        } else {
            console.error(`Error fetching Binance price for ${symbol}:`, error);
        }
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
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        // Log CORS errors quietly, other errors more prominently
        if (errorMessage.includes('CORS restrictions') || errorMessage.includes('Unable to connect to Binance API')) {
            console.log(`CORS error fetching klines for ${symbol}, returning empty chart data`);
        } else {
            console.error(`Error fetching Binance klines for ${symbol}:`, error);
        }
        return [];
    }
}

/**
 * Get comprehensive price data for a token against USD stablecoins
 * Falls back to server-side proxy if direct API calls fail due to CORS
 */
/**
 * Client-side function that uses server proxy to avoid CORS
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
        // Skip direct API calls entirely and use server-side proxy to avoid CORS
        console.log(`Fetching Binance data for ${tokenSymbol} via server proxy`);

        const response = await fetch(`/api/binance/price?symbol=${encodeURIComponent(tokenSymbol)}&interval=${interval}&limit=${limit}`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown server error' }));
            console.log(`Server proxy error for ${tokenSymbol}:`, errorData.error || response.statusText);
            return null;
        }

        const data = await response.json();
        console.log(`Successfully fetched Binance data for ${tokenSymbol} via server proxy`);
        return data;
    } catch (error) {
        // Final safety net - never let any error escape this function
        console.log(`Error fetching Binance data for ${tokenSymbol}:`, error instanceof Error ? error.message : 'Unknown error');
        return null;
    }
}

/**
 * Server-side function that makes direct API calls (used by /api/binance/price)
 * This avoids circular dependency when server proxy imports this file
 */
export async function getBinanceTokenPriceDirect(
    tokenSymbol: string,
    interval: '1d' | '1h' | '4h' | '15m' = '1d',
    limit: number = 30
): Promise<{
    bestMarket: string | null;
    price: BinancePriceData | null;
    chartData: BinanceChartData[];
} | null> {
    try {
        // Direct API calls for server-side use
        const bestMarket = await findBestUSDMarket(tokenSymbol);
        if (!bestMarket) {
            return null;
        }

        // Get current price and chart data using direct API calls
        const [priceData, chartData] = await Promise.all([
            getBinancePrice(bestMarket),
            getBinanceKlines(bestMarket, interval, limit)
        ]);

        return {
            bestMarket,
            price: priceData,
            chartData: chartData || []
        };
    } catch (error) {
        console.error(`Error fetching Binance token price for ${tokenSymbol}:`, error);
        return null;
    }
}

export type { BinancePriceData, BinanceChartData }; 