import { useQuery } from '@tanstack/react-query';
import { santimentService, VolatilityScore } from '~/services/santiment';
import { getUniqueSantimentSlugs, getSantimentSlug } from '~/services/santimentMappings';

export interface VolatilityScoresData {
    scores: VolatilityScore[];
    isLoading: boolean;
    error: string | null;
}

/**
 * Hook to fetch volatility scores for all mapped stablecoins
 */
export function useVolatilityScores() {
    // Test slugs availability upfront
    const availableSlugs = getUniqueSantimentSlugs();

    const query = useQuery({
        queryKey: ['volatilityScores', 'v4'], // Fixed DAI and USDS slugs
        queryFn: async (): Promise<VolatilityScore[]> => {
            try {
                // Get all unique slugs for stablecoins
                const slugs = getUniqueSantimentSlugs();

                if (slugs.length === 0) {
                    return [];
                }

                // Fetch volatility data for all slugs
                const volatilities = await santimentService.getMultipleVolatilities(slugs);

                // Calculate scores and rankings
                const scores = santimentService.calculateVolatilityScores(volatilities);

                return scores;
            } catch (error) {
                console.error('Error fetching volatility scores:', error);
                throw new Error('Failed to fetch volatility data');
            }
        },
        enabled: availableSlugs.length > 0, // Only run query if we have slugs
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });

    return query;
}

/**
 * Hook to get volatility score for a specific stablecoin
 */
export function useStablecoinVolatilityScore(address: string, chainId: number) {
    const { data: allScores, isLoading, error } = useVolatilityScores();

    const slug = getSantimentSlug(address, chainId);
    const score = allScores?.find(s => s.slug === slug) || null;

    return {
        score,
        isLoading,
        error,
        hasData: !!score
    };
}

/**
 * Hook to get volatility scores for multiple stablecoins by their addresses
 */
export function useMultipleStablecoinVolatilityScores(
    tokens: Array<{ address: string; chainId: number }>
) {
    const { data: allScores, isLoading, error } = useVolatilityScores();

    const scores = tokens.map(token => {
        const slug = getSantimentSlug(token.address, token.chainId);
        const score = allScores?.find(s => s.slug === slug) || null;
        return {
            ...token,
            slug,
            score
        };
    }).filter(item => item.score !== null);

    return {
        scores,
        isLoading,
        error,
        hasData: scores.length > 0
    };
}

/**
 * Helper hook to get volatility score formatted for display
 */
export function useFormattedVolatilityScore(address: string, chainId: number) {
    const { score, isLoading, error } = useStablecoinVolatilityScore(address, chainId);

    const formatScore = (score: VolatilityScore | null): string => {
        if (!score) return '--';
        return `${score.score}/100`;
    };

    const formatRank = (score: VolatilityScore | null): string => {
        if (!score) return '--';
        return `#${score.rank}`;
    };

    const formatVolatility = (score: VolatilityScore | null): string => {
        if (!score) return '--';
        return `${(score.volatility30d * 100).toFixed(2)}%`;
    };

    return {
        score: formatScore(score),
        rank: formatRank(score),
        volatility: formatVolatility(score),
        rawScore: score,
        isLoading,
        error
    };
} 