import type { NextApiRequest, NextApiResponse } from 'next';

interface HealthResponse {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    uptime: number;
    memory: {
        used: number;
        total: number;
        percentage: number;
    };
    rateLimiting: {
        activeIPs: number;
        totalRequests: number;
        blockedRequests: number;
        blockRate: number;
        lastCleanup: string;
    };
    binanceApi: {
        status: 'online' | 'offline';
        latency?: number;
        error?: string;
    };
}

// Cache the last Binance API check to avoid hitting it on every health check
let lastBinanceCheck = { timestamp: 0, status: 'unknown' as 'online' | 'offline', latency: 0, error: '' };
const BINANCE_CHECK_INTERVAL = 30 * 1000; // Check Binance API every 30 seconds

/**
 * Health check endpoint for monitoring
 * GET /api/binance/health
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<HealthResponse>
) {
    if (req.method !== 'GET') {
        return res.status(405).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: { used: 0, total: 0, percentage: 0 },
            rateLimiting: { activeIPs: 0, totalRequests: 0, blockedRequests: 0, blockRate: 0, lastCleanup: '' },
            binanceApi: { status: 'offline', error: 'Method not allowed' }
        });
    }

    try {
        // Memory usage
        const memUsage = process.memoryUsage();
        const totalMemory = memUsage.heapTotal;
        const usedMemory = memUsage.heapUsed;
        const memoryPercentage = (usedMemory / totalMemory) * 100;

        // Import rate limiting stats (requires access to the same variables)
        // Note: This is a simplified version - in practice you'd expose these through a shared module
        const activeIPs = 0; // rateLimitStore.size - would need to import from price.ts
        const totalRequests = 0; // totalRequests - would need to import from price.ts
        const blockedRequests = 0; // blockedRequests - would need to import from price.ts
        const blockRate = totalRequests > 0 ? (blockedRequests / totalRequests) * 100 : 0;

        // Check Binance API health (cached)
        const now = Date.now();
        if (now - lastBinanceCheck.timestamp > BINANCE_CHECK_INTERVAL) {
            try {
                const startTime = Date.now();
                const response = await fetch('https://api.binance.com/api/v3/ping', {
                    signal: AbortSignal.timeout(5000)
                });
                const latency = Date.now() - startTime;

                if (response.ok) {
                    lastBinanceCheck = {
                        timestamp: now,
                        status: 'online',
                        latency,
                        error: ''
                    };
                } else {
                    lastBinanceCheck = {
                        timestamp: now,
                        status: 'offline',
                        latency,
                        error: `HTTP ${response.status}`
                    };
                }
            } catch (error) {
                lastBinanceCheck = {
                    timestamp: now,
                    status: 'offline',
                    latency: 0,
                    error: error instanceof Error ? error.message : 'Unknown error'
                };
            }
        }

        // Determine overall health status
        let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

        if (memoryPercentage > 90) {
            status = 'unhealthy';
        } else if (memoryPercentage > 70 || lastBinanceCheck.status === 'offline') {
            status = 'degraded';
        } else if (blockRate > 50) {
            status = 'degraded';
        }

        const healthResponse: HealthResponse = {
            status,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: {
                used: Math.round(usedMemory / 1024 / 1024), // MB
                total: Math.round(totalMemory / 1024 / 1024), // MB
                percentage: Math.round(memoryPercentage * 100) / 100
            },
            rateLimiting: {
                activeIPs,
                totalRequests,
                blockedRequests,
                blockRate: Math.round(blockRate * 100) / 100,
                lastCleanup: new Date().toISOString() // Simplified
            },
            binanceApi: {
                status: lastBinanceCheck.status,
                latency: lastBinanceCheck.latency,
                error: lastBinanceCheck.error || undefined
            }
        };

        // Set appropriate HTTP status based on health
        const httpStatus = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503;

        return res.status(httpStatus).json(healthResponse);
    } catch (error) {
        console.error('Health check error:', error);

        return res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: { used: 0, total: 0, percentage: 0 },
            rateLimiting: { activeIPs: 0, totalRequests: 0, blockedRequests: 0, blockRate: 0, lastCleanup: '' },
            binanceApi: { status: 'offline', error: 'Health check failed' }
        });
    }
} 