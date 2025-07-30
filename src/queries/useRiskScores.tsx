import { useQuery } from '@tanstack/react-query';
import { bluechipService, RiskScoreData } from '~/services/bluechip';

/**
 * Hook to get risk score data for a specific stablecoin by symbol
 */
export function useStablecoinRiskScore(symbol: string) {
    return useQuery({
        queryKey: ['riskScore', symbol],
        queryFn: () => bluechipService.getRiskGrade(symbol),
        enabled: !!symbol,
        staleTime: 30 * 60 * 1000, // 30 minutes
        retry: 1
    });
}

