/**
 * Bluechip API Service for fetching cryptocurrency risk grades
 */

interface BluechipGradeResponse {
    grade?: string;
    url?: string;
    error?: string;
}

export interface RiskScoreData {
    symbol: string;
    grade: string;
    url: string;
}

// Supported stablecoins with Bluechip coverage
const SUPPORTED_COINS = [
    'RLUSD', 'LUSD', 'GUSD', 'PAXG', 'PYUSD', 'USDP', 'CETES', 'USDC',
    'XSGD', 'DAI', 'RAI', 'USDGLO', 'FDUSD', 'FRAX', 'XAUT', 'USDT',
    'GHO', 'TUSD', 'USDD', 'BEAN', 'sEUR', 'sUSD'
];

class BluechipService {
    /**
     * Check if a symbol is supported by Bluechip
     */
    static isSupported(symbol: string): boolean {
        return SUPPORTED_COINS.includes(symbol);
    }

    /**
     * Fetch risk grade for a specific symbol
     */
    async getRiskGrade(symbol: string): Promise<RiskScoreData | null> {
        if (!BluechipService.isSupported(symbol)) {
            return null;
        }

        try {
            const response = await fetch(`/api/bluechip/grade/${symbol}`);

            if (!response.ok) {
                return null;
            }

            const data: BluechipGradeResponse = await response.json();

            if (data.error || !data.grade) {
                return null;
            }

            return {
                symbol,
                grade: data.grade,
                url: data.url || `https://bluechip.org/coins/${symbol.toLowerCase()}`
            };

        } catch (error) {
            console.error(`Error fetching Bluechip grade for ${symbol}:`, error);
            return null;
        }
    }
}

// Export singleton instance
export const bluechipService = new BluechipService(); 