import React from 'react';
import { Text, Skeleton } from '@chakra-ui/react';
import { useStablecoinRiskScore } from '~/queries/useRiskScores';
import type { IToken } from '~/types';

interface RiskScoreCellProps {
    token: Partial<IToken> & { symbol?: string; address: string; chainId?: number };
    chainId?: number;
}

/**
 * Component to display Bluechip risk score for a stablecoin in the Settlement table
 * Shows risk grade with subtle hover link to Bluechip rating page
 */
export function RiskScoreCell({ token, chainId }: RiskScoreCellProps) {
    const { data: riskData, isLoading, error } = useStablecoinRiskScore(token.symbol || '');

    // Loading state
    if (isLoading) {
        return (
            <Skeleton height="20px" width="40px" />
        );
    }

    // Error or no data state
    if (error || !riskData || !riskData.grade) {
        return (
            <Text color="gray.400" fontSize={14}>
                --
            </Text>
        );
    }

    // If we have a grade and URL, make it a subtle clickable link
    if (riskData.url) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <a
                    href={riskData.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        textDecoration: 'none',
                        color: 'inherit',
                        transition: 'all 0.2s ease',
                        borderRadius: '3px',
                        padding: '2px 4px',
                        margin: '-2px -4px',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f0f9ff';
                        e.currentTarget.style.textDecoration = 'underline';
                        e.currentTarget.style.color = '#0ea5e9';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.textDecoration = 'none';
                        e.currentTarget.style.color = 'inherit';
                    }}
                >
                    <Text
                        fontSize={14}
                        fontWeight={600}
                        lineHeight="1.2"
                        textAlign="center"
                    >
                        {riskData.grade}
                    </Text>
                </a>
            </div>
        );
    }

    // Fallback for grades without URLs
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Text
                fontSize={14}
                fontWeight={600}
                lineHeight="1.2"
            >
                {riskData.grade}
            </Text>
        </div>
    );
} 