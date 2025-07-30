import { useQuery } from '@tanstack/react-query';
import { duneService, StabilityData } from '~/services/dune';

export interface StabilityScoresData {
    data: StabilityData[];
    isLoading: boolean;
    error: string | null;
}

/**
 * Hook to fetch stability data for all available stablecoins from Dune
 */
export function useStabilityData() {
    const query = useQuery({
        queryKey: ['stabilityData', 'dune', 'v1'],
        queryFn: async (): Promise<StabilityData[]> => {
            try {
                // Get all stability data (raw volatility percentages)
                const stabilityData = await duneService.getAllStabilityData();
                return stabilityData;
            } catch (error) {
                console.warn('Volatility data unavailable (Dune API not configured):', error);
                // Return empty array instead of throwing to prevent UI crashes
                return [];
            }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });

    return query;
}

/**
 * Hook to get stability data for a specific stablecoin by symbol
 */
export function useStablecoinStability(symbol: string) {
    const { data: allStabilityData, isLoading, error } = useStabilityData();

    const stabilityData = allStabilityData?.find(s =>
        s.symbol.toLowerCase() === symbol.toLowerCase()
    ) || null;

    return {
        data: stabilityData,
        isLoading,
        error,
        hasData: !!stabilityData
    };
}

/**
 * Hook to get stability data for a stablecoin by contract address and chainId
 * This requires a mapping from address/chainId to symbol
 */
export function useStablecoinStabilityByAddress(address: string, chainId: number) {
    // Map common stablecoin addresses to symbols
    const getSymbolFromAddress = (address: string, chainId: number): string | null => {
        const addressLower = address.toLowerCase();

        // Common stablecoin mappings across chains
        const symbolMappings: Record<string, string> = {
            // USDC addresses
            '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'USDC', // Ethereum
            '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d': 'USDC', // BSC
            '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359': 'USDC', // Polygon
            '0x0b2c639c533813f4aa9d7837caf62653d097ff85': 'USDC', // Optimism
            '0xaf88d065e77c8cc2239327c5edb3a432268e5831': 'USDC', // Arbitrum
            '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e': 'USDC', // Avalanche
            '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': 'USDC', // Base

            // USDT addresses
            '0xdac17f958d2ee523a2206206994597c13d831ec7': 'USDT', // Ethereum
            '0x55d398326f99059ff775485246999027b3197955': 'USDT', // BSC
            '0xc2132d05d31c914a87c6611c10748aeb04b58e8f': 'USDT', // Polygon
            '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58': 'USDT', // Optimism
            '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9': 'USDT', // Arbitrum
            '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7': 'USDT', // Avalanche

            // DAI addresses
            '0x6b175474e89094c44da98b954eedeac495271d0f': 'DAI', // Ethereum
            '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3': 'DAI', // BSC
            '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063': 'DAI', // Polygon
            '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1': 'DAI', // Optimism/Arbitrum
            '0xd586e7f844cea2f87f50152665bcbc2c279d8d70': 'DAI', // Avalanche

            // USDS addresses
            '0x820c137fa70c8691f0e44dc420a5e53c168921dc': 'USDS', // Ethereum/Base

            // USDe addresses
            '0x4c9edd5852cd905f086c759e8383e09bff1e68b3': 'USDe', // Ethereum

            // FRAX addresses
            '0x853d955acef822db058eb8505911ed77f175b99e': 'FRAX', // Ethereum

            // TUSD addresses
            '0x0000000000085d4780b73119b644ae5ecd22b376': 'TUSD', // Ethereum
        };

        return symbolMappings[addressLower] || null;
    };

    const symbol = getSymbolFromAddress(address, chainId);
    return useStablecoinStability(symbol || '');
}

/**
 * Hook to get stability data for multiple stablecoins by their addresses
 */
export function useMultipleStablecoinStability(
    tokens: Array<{ address: string; chainId: number }>
) {
    const { data: allStabilityData, isLoading, error } = useStabilityData();

    const stabilityData = tokens.map(token => {
        // Use the same mapping logic as above
        const getSymbolFromAddress = (address: string, chainId: number): string | null => {
            const addressLower = address.toLowerCase();
            const symbolMappings: Record<string, string> = {
                '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'USDC',
                '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d': 'USDC',
                '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359': 'USDC',
                '0x0b2c639c533813f4aa9d7837caf62653d097ff85': 'USDC',
                '0xaf88d065e77c8cc2239327c5edb3a432268e5831': 'USDC',
                '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e': 'USDC',
                '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': 'USDC',
                '0xdac17f958d2ee523a2206206994597c13d831ec7': 'USDT',
                '0x55d398326f99059ff775485246999027b3197955': 'USDT',
                '0xc2132d05d31c914a87c6611c10748aeb04b58e8f': 'USDT',
                '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58': 'USDT',
                '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9': 'USDT',
                '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7': 'USDT',
                '0x6b175474e89094c44da98b954eedeac495271d0f': 'DAI',
                '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3': 'DAI',
                '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063': 'DAI',
                '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1': 'DAI',
                '0xd586e7f844cea2f87f50152665bcbc2c279d8d70': 'DAI',
                '0x820c137fa70c8691f0e44dc420a5e53c168921dc': 'USDS',
                '0x4c9edd5852cd905f086c759e8383e09bff1e68b3': 'USDe',
                '0x853d955acef822db058eb8505911ed77f175b99e': 'FRAX',
                '0x0000000000085d4780b73119b644ae5ecd22b376': 'TUSD',
            };
            return symbolMappings[addressLower] || null;
        };

        const symbol = getSymbolFromAddress(token.address, token.chainId);
        const data = symbol ? allStabilityData?.find(s =>
            s.symbol.toLowerCase() === symbol.toLowerCase()
        ) || null : null;

        return {
            ...token,
            symbol,
            data
        };
    }).filter(item => item.data !== null);

    return {
        data: stabilityData,
        isLoading,
        error,
        hasData: stabilityData.length > 0
    };
}

/**
 * Helper hook to get stability data formatted for display
 */
export function useFormattedStability(address: string, chainId: number) {
    const { data: stabilityData, isLoading, error } = useStablecoinStabilityByAddress(address, chainId);

    const formatVolatility = (data: StabilityData | null): string => {
        if (!data) return '--';
        return `${data.volatility30d.toFixed(2)}%`;
    };

    return {
        volatility: formatVolatility(stabilityData),
        rawData: stabilityData,
        isLoading,
        error
    };
}

// Legacy exports for backward compatibility
export const useVolatilityScores = useStabilityData;
export const useFormattedVolatilityScore = useFormattedStability; 