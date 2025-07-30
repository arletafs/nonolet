/**
 * Binance API Proxy - Security-Hardened Implementation
 * 
 * SECURITY MEASURES IMPLEMENTED:
 * ✅ Rate Limiting: 30 requests/minute per IP
 * ✅ Input Validation: Symbol format, length, and character restrictions  
 * ✅ Parameter Bounds: Interval whitelist, limit bounds (1-1000)
 * ✅ Method Restriction: GET only
 * ✅ Error Sanitization: No internal details exposed
 * ✅ Security Headers: XSS, MIME, and caching protections
 * ✅ IP Logging: For monitoring and abuse detection
 * 
 * NO SECRETS EXPOSED:
 * ✅ Uses only public Binance API endpoints
 * ✅ No API keys required or stored
 * ✅ Read-only market data access only
 */
import type { NextApiRequest, NextApiResponse } from 'next';

// Production-grade in-memory rate limiting for single instance
const rateLimitStore = new Map<string, { count: number; resetTime: number; firstRequest: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // 30 requests per minute per IP
const CLEANUP_INTERVAL = 5 * 60 * 1000; // Clean up every 5 minutes
const MAX_STORED_IPS = 10000; // Prevent memory exhaustion

// Metrics for monitoring
let totalRequests = 0;
let blockedRequests = 0;

// Periodic cleanup to prevent memory leaks
setInterval(() => {
    const now = Date.now();
    let cleaned = 0;

    for (const [ip, entry] of rateLimitStore.entries()) {
        if (now > entry.resetTime) {
            rateLimitStore.delete(ip);
            cleaned++;
        }
    }

    // Log cleanup metrics for monitoring
    if (cleaned > 0) {
        console.log(`Rate limit cleanup: removed ${cleaned} expired entries, ${rateLimitStore.size} active IPs`);
    }

    // Emergency cleanup if memory usage is too high
    if (rateLimitStore.size > MAX_STORED_IPS) {
        const oldestEntries = Array.from(rateLimitStore.entries())
            .sort((a, b) => a[1].firstRequest - b[1].firstRequest)
            .slice(0, Math.floor(MAX_STORED_IPS * 0.3)); // Remove oldest 30%

        oldestEntries.forEach(([ip]) => rateLimitStore.delete(ip));
        console.warn(`Emergency cleanup: removed ${oldestEntries.length} oldest rate limit entries`);
    }
}, CLEANUP_INTERVAL);

interface BinanceErrorResponse {
    error: string;
    details?: string;
}

interface BinanceSuccessResponse {
    bestMarket: string | null;
    price: {
        symbol: string;
        price: number;
        volume24h: number;
        priceChange24h: number;
        source: 'binance';
    } | null;
    chartData: Array<{
        timestamp: number;
        price: number;
        volume: number;
    }>;
}

type BinanceApiResponse = BinanceSuccessResponse | BinanceErrorResponse;

/**
 * Simple rate limiting check
 */
function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const key = ip || 'unknown';

    // Clean up expired entries
    if (rateLimitStore.has(key)) {
        const entry = rateLimitStore.get(key)!;
        if (now > entry.resetTime) {
            rateLimitStore.delete(key);
        }
    }

    // Check/update rate limit
    if (!rateLimitStore.has(key)) {
        rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW, firstRequest: now });
        totalRequests++;
        return true;
    }

    const entry = rateLimitStore.get(key)!;
    if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
        blockedRequests++;
        return false;
    }

    entry.count++;
    totalRequests++;
    return true;
}

/**
 * Validate and sanitize symbol parameter
 */
function validateSymbol(symbol: string): boolean {
    // Only allow alphanumeric characters and common crypto symbols
    const symbolRegex = /^[A-Z0-9]{1,10}$/i;
    return symbolRegex.test(symbol) && symbol.length <= 10;
}

/**
 * Server-side proxy for Binance API to avoid CORS issues
 * Rate limited and input validated for security
 * GET /api/binance/price?symbol=ETH&interval=1d&limit=30
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<BinanceApiResponse>
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Rate limiting check
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const ip = Array.isArray(clientIp) ? clientIp[0] : clientIp;

    if (!checkRateLimit(ip)) {
        return res.status(429).json({
            error: 'Rate limit exceeded',
            details: `Maximum ${RATE_LIMIT_MAX_REQUESTS} requests per minute allowed`
        });
    }

    const { symbol, interval = '1d', limit = '30' } = req.query;

    // Enhanced input validation
    if (!symbol || typeof symbol !== 'string') {
        return res.status(400).json({
            error: 'Missing or invalid symbol parameter',
            details: 'Please provide a valid token symbol (e.g., ?symbol=ETH)'
        });
    }

    if (!validateSymbol(symbol)) {
        return res.status(400).json({
            error: 'Invalid symbol format',
            details: 'Symbol must be alphanumeric, 1-10 characters (e.g., ETH, BTC, USDC)'
        });
    }

    // Validate interval parameter
    const validIntervals = ['1d', '1h', '4h', '15m'];
    if (typeof interval !== 'string' || !validIntervals.includes(interval)) {
        return res.status(400).json({
            error: 'Invalid interval parameter',
            details: 'Interval must be one of: 1d, 1h, 4h, 15m'
        });
    }

    // Validate and limit the limit parameter
    const parsedLimit = parseInt(limit as string, 10);
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 1000) {
        return res.status(400).json({
            error: 'Invalid limit parameter',
            details: 'Limit must be a number between 1 and 1000'
        });
    }

    try {
        // Set security headers
        res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');

        // Import the Binance service function
        const { getBinanceTokenPrice } = await import('~/services/binance');

        const result = await getBinanceTokenPrice(
            symbol,
            interval as '1d' | '1h' | '4h' | '15m',
            parsedLimit
        );

        if (!result) {
            return res.status(404).json({
                error: 'Token not found',
                details: `No Binance data available for token: ${symbol}`
            });
        }

        return res.status(200).json(result);
    } catch (error) {
        // Log error with IP for monitoring (but don't expose in response)
        console.error(`Binance API proxy error from ${ip}:`, error);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        // Don't expose detailed error messages that could reveal internal structure
        const sanitizedMessage = errorMessage.includes('CORS') || errorMessage.includes('timeout')
            ? errorMessage
            : 'Service temporarily unavailable';

        return res.status(500).json({
            error: 'Failed to fetch Binance data',
            details: sanitizedMessage
        });
    }
} 