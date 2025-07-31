/**
 * Dune Analytics API Service
 * 
 * Provides methods to fetch cryptocurrency volatility and volume data from Dune Analytics
 * Uses Next.js API routes to avoid browser compatibility issues
 */

interface DuneVolatilityRow {
    symbol: string;
    max_abs_deviation_pct_last30d: number;
}

interface DuneVolumeRow {
    symbol: string;
    onchain_volume_usd: number;
    binance_volume_usd: number;
    total_volume_usd: number;
}

interface VolatilityApiResponse {
    volatilities: Record<string, number>;
    availableSymbols: string[];
    error?: string;
}

interface VolumeApiResponse {
    volumes: Record<string, number>;
    availableSymbols: string[];
    error?: string;
}

export interface StabilityData {
    symbol: string;
    volatility30d: number; // Raw volatility percentage
}

export interface VolumeData {
    symbol: string;
    volume24h: number; // 24h total volume in USD
}

class DuneService {
    private cachedVolatilityData: DuneVolatilityRow[] | null = null;
    private cachedVolumeData: DuneVolumeRow[] | null = null;
    private lastVolatilityFetchTime = 0;
    private lastVolumeFetchTime = 0;
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    private readonly FALLBACK_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours for fallback data

    /**
     * Fetch all volatility data from Dune via API route with fallback to cached data
     */
    async getAllVolatilityData(): Promise<DuneVolatilityRow[]> {
        const now = Date.now();

        // Return cached data if it's still fresh (5 minutes for live data)
        if (this.cachedVolatilityData && (now - this.lastVolatilityFetchTime) < this.CACHE_DURATION) {
            return this.cachedVolatilityData;
        }

        // If we have cached data but it's stale, we'll try to refresh but fall back to it if needed
        const hasStaleCache = this.cachedVolatilityData && (now - this.lastVolatilityFetchTime) < this.FALLBACK_CACHE_DURATION;

        try {
            const response = await fetch('/api/dune/volatility', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                console.warn(`Dune volatility API returned ${response.status}: ${response.statusText}`);
                if (hasStaleCache && this.cachedVolatilityData) {
                    console.log('🔄 Using cached volatility data (API unavailable)');
                    return this.cachedVolatilityData;
                }
                return [];
            }

            const result: VolatilityApiResponse = await response.json();

            if (result.error) {
                console.warn('Dune volatility API returned error:', result.error);
                if (hasStaleCache && this.cachedVolatilityData) {
                    console.log('🔄 Using cached volatility data (API error)');
                    return this.cachedVolatilityData;
                }
                return [];
            }

            // Convert to the expected format
            const rows: DuneVolatilityRow[] = result.availableSymbols.map(symbol => ({
                symbol,
                max_abs_deviation_pct_last30d: result.volatilities[symbol]
            }));

            // Cache the live results
            this.cachedVolatilityData = rows;
            this.lastVolatilityFetchTime = now;
            console.log('✅ Using live volatility data from Dune API');

            return rows;
        } catch (error) {
            console.warn('Error fetching volatility data from Dune API:', error);
            if (hasStaleCache && this.cachedVolatilityData) {
                console.log('🔄 Using cached volatility data (network error)');
                return this.cachedVolatilityData;
            }
            return [];
        }
    }

    /**
     * Fetch all volume data from Dune via API route with fallback to cached data
     */
    async getAllVolumeData(): Promise<DuneVolumeRow[]> {
        const now = Date.now();

        // Return cached data if it's still fresh (5 minutes for live data)
        if (this.cachedVolumeData && (now - this.lastVolumeFetchTime) < this.CACHE_DURATION) {
            return this.cachedVolumeData;
        }

        // If we have cached data but it's stale, we'll try to refresh but fall back to it if needed
        const hasStaleCache = this.cachedVolumeData && (now - this.lastVolumeFetchTime) < this.FALLBACK_CACHE_DURATION;

        try {
            const response = await fetch('/api/dune/volume', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                console.warn(`Dune volume API returned ${response.status}: ${response.statusText}`);
                if (hasStaleCache && this.cachedVolumeData) {
                    console.log('🔄 Using cached volume data (API unavailable)');
                    return this.cachedVolumeData;
                }
                return [];
            }

            const result: VolumeApiResponse = await response.json();

            if (result.error) {
                console.warn('Dune volume API returned error:', result.error);
                if (hasStaleCache && this.cachedVolumeData) {
                    console.log('🔄 Using cached volume data (API error)');
                    return this.cachedVolumeData;
                }
                return [];
            }

            // Convert to the expected format
            const rows: DuneVolumeRow[] = result.availableSymbols.map(symbol => ({
                symbol,
                onchain_volume_usd: result.volumes[symbol] || 0,
                binance_volume_usd: 0, // Will be populated by API if available
                total_volume_usd: result.volumes[symbol] || 0
            }));

            // Cache the live results
            this.cachedVolumeData = rows;
            this.lastVolumeFetchTime = now;
            console.log('✅ Using live volume data from Dune API');

            return rows;
        } catch (error) {
            console.warn('Error fetching volume data from Dune API:', error);
            if (hasStaleCache && this.cachedVolumeData) {
                console.log('🔄 Using cached volume data (network error)');
                return this.cachedVolumeData;
            }
            return [];
        }
    }

    /**
     * Fetch 30-day volatility for a specific symbol
     */
    async getVolatility30d(symbol: string): Promise<number | null> {
        try {
            const allData = await this.getAllVolatilityData();
            const tokenData = allData.find(row =>
                row.symbol.toLowerCase() === symbol.toLowerCase()
            );

            return tokenData?.max_abs_deviation_pct_last30d || null;
        } catch (error) {
            console.warn(`Error fetching volatility for ${symbol}:`, error);
            return null;
        }
    }

    /**
     * Fetch 24h volume for a specific symbol
     */
    async getVolume24h(symbol: string): Promise<number | null> {
        try {
            const allData = await this.getAllVolumeData();
            const tokenData = allData.find(row =>
                row.symbol.toLowerCase() === symbol.toLowerCase()
            );

            return tokenData?.total_volume_usd || null;
        } catch (error) {
            console.warn(`Error fetching volume for ${symbol}:`, error);
            return null;
        }
    }

    /**
     * Fetch volatility data for multiple symbols
     */
    async getMultipleVolatilities(symbols: string[]): Promise<Record<string, number>> {
        if (symbols.length === 0) {
            return {};
        }

        try {
            const allData = await this.getAllVolatilityData();
            const result: Record<string, number> = {};

            // Create a map for case-insensitive lookup
            const symbolMap = new Map(
                symbols.map(symbol => [symbol.toLowerCase(), symbol])
            );

            allData.forEach(row => {
                const originalSymbol = symbolMap.get(row.symbol.toLowerCase());
                if (originalSymbol) {
                    result[originalSymbol] = row.max_abs_deviation_pct_last30d;
                }
            });

            return result;
        } catch (error) {
            console.error('Error fetching multiple volatilities:', error);
            return {};
        }
    }

    /**
     * Fetch volume data for multiple symbols
     */
    async getMultipleVolumes(symbols: string[]): Promise<Record<string, number>> {
        if (symbols.length === 0) {
            return {};
        }

        try {
            const allData = await this.getAllVolumeData();
            const result: Record<string, number> = {};

            // Create a map for case-insensitive lookup
            const symbolMap = new Map(
                symbols.map(symbol => [symbol.toLowerCase(), symbol])
            );

            allData.forEach(row => {
                const originalSymbol = symbolMap.get(row.symbol.toLowerCase());
                if (originalSymbol) {
                    result[originalSymbol] = row.total_volume_usd;
                }
            });

            return result;
        } catch (error) {
            console.error('Error fetching multiple volumes:', error);
            return {};
        }
    }

    /**
     * Get stability data for all available symbols (raw volatility percentages)
     */
    async getAllStabilityData(): Promise<StabilityData[]> {
        try {
            const allData = await this.getAllVolatilityData();
            return allData.map(row => ({
                symbol: row.symbol,
                volatility30d: row.max_abs_deviation_pct_last30d
            }));
        } catch (error) {
            console.error('Error fetching stability data:', error);
            return [];
        }
    }

    /**
     * Get volume data for all available symbols (24h volume in USD)
     */
    async getAllVolumeDataFormatted(): Promise<VolumeData[]> {
        try {
            const allData = await this.getAllVolumeData();
            return allData.map(row => ({
                symbol: row.symbol,
                volume24h: row.total_volume_usd
            }));
        } catch (error) {
            console.error('Error fetching volume data:', error);
            return [];
        }
    }

    /**
     * Get all available stablecoin symbols from volatility data
     */
    async getAvailableSymbols(): Promise<string[]> {
        try {
            const allData = await this.getAllVolatilityData();
            return allData.map(row => row.symbol);
        } catch (error) {
            console.error('Error fetching available symbols:', error);
            return [];
        }
    }

    /**
     * Get all available symbols from volume data
     */
    async getAvailableVolumeSymbols(): Promise<string[]> {
        try {
            const allData = await this.getAllVolumeData();
            return allData.map(row => row.symbol);
        } catch (error) {
            console.error('Error fetching available volume symbols:', error);
            return [];
        }
    }

    /**
     * Clear cached data (useful for forced refreshes)
     */
    clearCache(): void {
        this.cachedVolatilityData = null;
        this.cachedVolumeData = null;
        this.lastVolatilityFetchTime = 0;
        this.lastVolumeFetchTime = 0;
    }
}

// Export singleton instance
export const duneService = new DuneService(); 