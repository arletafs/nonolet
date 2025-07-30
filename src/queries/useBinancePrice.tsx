import { useQuery } from '@tanstack/react-query';
import { getBinanceTokenPrice, type BinancePriceData, type BinanceChartData } from '~/services/binance';

interface UseBinancePriceProps {
    tokenSymbol?: string;
    enabled?: boolean;
    refetchInterval?: number;
    interval?: '1d' | '1h' | '4h' | '15m';
    limit?: number;
}

interface BinancePriceResponse {
    bestMarket: string | null;
    price: BinancePriceData | null;
    chartData: BinanceChartData[];
    isLoading: boolean;
    error: Error | null;
}

/**
 * React Query hook for fetching Binance price data
 * Follows the same pattern as useGetPrice for consistency
 */
export function useBinancePrice({
    tokenSymbol,
    enabled = true,
    refetchInterval = 30_000, // 30 seconds, slightly longer than DeFiLlama
    interval = '1d',
    limit = 30
}: UseBinancePriceProps): BinancePriceResponse {
    const query = useQuery({
        queryKey: ['binancePrice', tokenSymbol, interval, limit],
        queryFn: async () => {
            if (!tokenSymbol) {
                return {
                    bestMarket: null,
                    price: null,
                    chartData: []
                };
            }

            try {
                const result = await getBinanceTokenPrice(tokenSymbol, interval, limit);
                return result || {
                    bestMarket: null,
                    price: null,
                    chartData: []
                };
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';

                // Log detailed error for debugging
                console.error(`Error in useBinancePrice for ${tokenSymbol}:`, errorMessage);

                // Don't retry for CORS-related errors as they won't resolve
                if (errorMessage.includes('CORS restrictions') || errorMessage.includes('Unable to connect to Binance API')) {
                    console.warn('Binance API unavailable due to CORS restrictions. Consider implementing a server-side proxy.');

                    // Return empty data instead of throwing to allow app to continue
                    return {
                        bestMarket: null,
                        price: null,
                        chartData: []
                    };
                }

                // For other errors, throw to trigger retry logic
                throw error;
            }
        },
        enabled: enabled && !!tokenSymbol,
        staleTime: 20_000, // 20 seconds
        refetchInterval,
        retry: (failureCount, error) => {
            // Don't retry CORS errors
            const errorMessage = error instanceof Error ? error.message : '';
            if (errorMessage.includes('CORS restrictions') || errorMessage.includes('Unable to connect to Binance API')) {
                return false;
            }
            // Retry up to 2 times for other errors
            return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });

    return {
        bestMarket: query.data?.bestMarket || null,
        price: query.data?.price || null,
        chartData: query.data?.chartData || [],
        isLoading: query.isLoading,
        error: query.error as Error | null,
    };
}

/**
 * Hook for getting simple Binance price comparison data
 * Used when you only need current price vs oracle price
 */
export function useBinancePriceComparison(tokenSymbol?: string) {
    const { price, isLoading, error } = useBinancePrice({
        tokenSymbol,
        refetchInterval: 20_000 // Match DeFiLlama refresh rate
    });

    return {
        binancePrice: price?.price || null,
        binanceChange24h: price?.priceChange24h || null,
        binanceVolume24h: price?.volume24h || null,
        binanceMarket: price?.symbol || null,
        isLoading,
        error
    };
} 