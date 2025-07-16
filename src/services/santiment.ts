/**
 * Santiment GraphQL API Service
 * 
 * Provides methods to fetch cryptocurrency volatility data from Santiment's GraphQL API
 * Documentation: https://academy.santiment.net/for-developers/
 */

interface SantimentProject {
    slug: string;
    name: string;
    ticker: string;
    infrastructure: string;
    mainContractAddress: string;
}

interface VolatilityData {
    timeseriesDataJson: string;
}

interface VolatilityDataPoint {
    datetime: string;
    value: number;
}

export interface VolatilityScore {
    slug: string;
    volatility30d: number;
    rank: number;
    score: number; // 0-100 score (lower volatility = higher score)
}

class SantimentService {
    /**
     * Fetch all projects with their slugs and contract addresses
     * Note: This method is deprecated due to CORS restrictions
     */
    async getAllProjects(): Promise<SantimentProject[]> {
        throw new Error('getAllProjects is not supported due to CORS restrictions. Use server-side implementation if needed.');
    }

    /**
     * Fetch 30-day price volatility for a specific project slug
     * Uses our Next.js API proxy to avoid CORS issues
     */
    async getVolatility30d(slug: string): Promise<number | null> {
        try {
            const response = await fetch('/api/santiment/volatility', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ slugs: [slug] }),
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            return result.volatilities[slug] || null;
        } catch (error) {
            console.warn(`Error fetching volatility for ${slug}:`, error);
            return null;
        }
    }

    /**
     * Fetch volatility data for multiple slugs
     * Uses our Next.js API proxy to avoid CORS issues
     */
    async getMultipleVolatilities(slugs: string[]): Promise<Record<string, number>> {
        if (slugs.length === 0) {
            return {};
        }

        try {
            const response = await fetch('/api/santiment/volatility', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ slugs }),
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            return result.volatilities || {};
        } catch (error) {
            console.error('Error fetching multiple volatilities:', error);
            return {};
        }
    }

    /**
     * Calculate volatility scores and rankings for stablecoins
     * Lower volatility gets higher score (0-100 scale)
     */
    calculateVolatilityScores(volatilities: Record<string, number>): VolatilityScore[] {
        const entries = Object.entries(volatilities);

        if (entries.length === 0) {
            return [];
        }

        // Sort by volatility (ascending - lower is better for stablecoins)
        const sortedEntries = entries.sort(([, a], [, b]) => a - b);

        // Calculate scores and ranks
        const maxVolatility = Math.max(...entries.map(([, vol]) => vol));
        const minVolatility = Math.min(...entries.map(([, vol]) => vol));
        const volatilityRange = maxVolatility - minVolatility;

        return sortedEntries.map(([slug, volatility], index) => {
            // Calculate score: lower volatility = higher score
            const normalizedVolatility = volatilityRange > 0
                ? (volatility - minVolatility) / volatilityRange
                : 0;
            const score = Math.round((1 - normalizedVolatility) * 100);

            return {
                slug,
                volatility30d: volatility,
                rank: index + 1,
                score: Math.max(0, Math.min(100, score)) // Ensure score is 0-100
            };
        });
    }
}

// Export singleton instance
export const santimentService = new SantimentService(); 