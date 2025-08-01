import React from 'react';
import { Text, Skeleton } from '@chakra-ui/react';
import { useFormattedStability } from '~/queries/useVolatilityScores';
import type { IToken } from '~/types';

interface VolatilityScoreCellProps {
    token: Partial<IToken> & { address: string; chainId?: number };
    chainId?: number;
}

/**
 * Component to display stability data for a stablecoin in the Settlement table
 * Shows raw volatility percentage (lower = more stable)
 */
export function VolatilityScoreCell({ token, chainId }: VolatilityScoreCellProps) {
    const { volatility, isLoading, error } = useFormattedStability(
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
    if (error || volatility === '--') {
        return (
            <Text color="gray.400" fontSize={14}>
                --
            </Text>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Text
                fontSize={14}
                fontWeight={600}
                lineHeight="1.2"
                textAlign="center"
            >
                {volatility}
            </Text>
        </div>
    );
} 