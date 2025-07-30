import type { NextApiRequest, NextApiResponse } from 'next';
import { DuneClient } from '@duneanalytics/client-sdk';

interface DuneVolatilityRow {
    symbol: string;
    max_abs_deviation_pct_last30d: number;
}

interface VolatilityApiResponse {
    volatilities: Record<string, number>;
    availableSymbols: string[];
    error?: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<VolatilityApiResponse>
) {
    // Set CORS headers for cross-origin requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST' && req.method !== 'GET') {
        res.status(405).json({
            volatilities: {},
            availableSymbols: [],
            error: 'Method not allowed'
        });
        return;
    }

    try {
        console.log('Dune API route called:', { method: req.method, body: req.body });

        // Get API key from environment
        const apiKey = process.env.DUNE_API_KEY;
        if (!apiKey) {
            console.error('❌ DUNE_API_KEY not found in environment variables');
            res.status(500).json({
                volatilities: {},
                availableSymbols: [],
                error: 'Dune API key not configured'
            });
            return;
        }

        // Initialize Dune client
        const dune = new DuneClient(apiKey);
        const VOLATILITY_QUERY_ID = 5509168;

        console.log(`📊 Fetching volatility data from Dune query ${VOLATILITY_QUERY_ID}...`);

        // Fetch data from Dune
        const result = await dune.getLatestResult({ queryId: VOLATILITY_QUERY_ID });

        if (!result?.result?.rows) {
            console.warn('❌ No volatility data received from Dune');
            res.status(500).json({
                volatilities: {},
                availableSymbols: [],
                error: 'No data received from Dune'
            });
            return;
        }

        const rows = result.result.rows as unknown as DuneVolatilityRow[];
        console.log(`✅ Received ${rows.length} volatility records from Dune`);

        // Process the data
        const volatilities: Record<string, number> = {};
        const availableSymbols: string[] = [];

        rows.forEach(row => {
            if (row.symbol && typeof row.max_abs_deviation_pct_last30d === 'number') {
                volatilities[row.symbol] = row.max_abs_deviation_pct_last30d;
                availableSymbols.push(row.symbol);
            }
        });

        console.log(`✅ Processed volatility data for ${availableSymbols.length} symbols:`, availableSymbols);

        res.status(200).json({
            volatilities,
            availableSymbols
        });

    } catch (error) {
        console.error('❌ Error in Dune API route:', error);
        res.status(500).json({
            volatilities: {},
            availableSymbols: [],
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
} 