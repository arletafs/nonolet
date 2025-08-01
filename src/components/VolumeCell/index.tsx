import React from 'react';
import { Text, Skeleton } from '@chakra-ui/react';
import { useFormattedVolume } from '~/queries/useVolumeData';
import type { IToken } from '~/types';

interface VolumeCellProps {
    token: Partial<IToken> & { address: string; chainId?: number };
    chainId?: number;
}

/**
 * Component to display 24h volume data for a stablecoin in the Settlement table
 * Shows formatted volume in USD (e.g., $1.2B, $450M, $12K)
 */
export function VolumeCell({ token, chainId }: VolumeCellProps) {
    const { volume, isLoading, error } = useFormattedVolume(
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
    if (error || volume === '--') {
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
                {volume}
            </Text>
        </div>
    );
} 