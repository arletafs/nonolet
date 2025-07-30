import type { NextApiRequest, NextApiResponse } from 'next';
import { DuneClient } from '@duneanalytics/client-sdk';

interface DuneVolumeRow {
    symbol: string;
    onchain_volume_usd: number;
    binance_volume_usd: number;
    total_volume_usd: number;
}

interface VolumeApiResponse {
    volumes: Record<string, number>;
    availableSymbols: string[];
    error?: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<VolumeApiResponse>
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
            volumes: {},
            availableSymbols: [],
            error: 'Method not allowed'
        });
        return;
    }

    try {
        console.log('Dune Volume API route called:', { method: req.method, body: req.body });

        // Get API key from environment
        const apiKey = process.env.DUNE_API_KEY;
        if (!apiKey) {
            console.error('❌ DUNE_API_KEY not found in environment variables');
            res.status(500).json({
                volumes: {},
                availableSymbols: [],
                error: 'Dune API key not configured'
            });
            return;
        }

        // Initialize Dune client
        const dune = new DuneClient(apiKey);
        const VOLUME_QUERY_ID = 5512114;

        console.log(`📊 Fetching volume data from Dune query ${VOLUME_QUERY_ID}...`);

        // Fetch data from Dune
        const result = await dune.getLatestResult({ queryId: VOLUME_QUERY_ID });

        if (!result?.result?.rows) {
            console.warn('❌ No volume data received from Dune');
            res.status(500).json({
                volumes: {},
                availableSymbols: [],
                error: 'No data received from Dune'
            });
            return;
        }

        const rows = result.result.rows as unknown as DuneVolumeRow[];
        console.log(`✅ Received ${rows.length} volume records from Dune`);

        // Process the data
        const volumes: Record<string, number> = {};
        const availableSymbols: string[] = [];

        rows.forEach(row => {
            if (row.symbol && typeof row.total_volume_usd === 'number') {
                volumes[row.symbol] = row.total_volume_usd;
                availableSymbols.push(row.symbol);
            }
        });

        console.log(`✅ Processed volume data for ${availableSymbols.length} symbols:`, availableSymbols);

        res.status(200).json({
            volumes,
            availableSymbols
        });

    } catch (error) {
        console.error('❌ Error in Dune Volume API route:', error);
        res.status(500).json({
            volumes: {},
            availableSymbols: [],
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
} 