import React from 'react';
import { Text, Skeleton } from '@chakra-ui/react';
import { useFormattedVolatilityScore } from '~/queries/useVolatilityScores';
import type { IToken } from '~/types';

interface VolatilityScoreCellProps {
    token: Partial<IToken> & { address: string; chainId?: number };
    chainId?: number;
}

/**
 * Component to display volatility score for a stablecoin in the Settlement table
 */
export function VolatilityScoreCell({ token, chainId }: VolatilityScoreCellProps) {
    const { score, rank, volatility, isLoading, error } = useFormattedVolatilityScore(
        token.address,
        chainId || token.chainId || 1
    );

    // Loading state
    if (isLoading) {
        return (
            <Skeleton height="20px" width="60px" />
        );
    }

    // Error or no data state
    if (error || score === '--') {
        return (
            <Text color="gray.400" fontSize={14}>
                --
            </Text>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Text
                fontSize={14}
                fontWeight={600}
                lineHeight="1.2"
            >
                {score}
            </Text>
        </div>
    );
} 