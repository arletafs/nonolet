import type { NextApiRequest, NextApiResponse } from 'next';

interface BluechipGradeResponse {
    name?: string;
    symbol?: string;
    grade?: string;
    url?: string;
    error?: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<BluechipGradeResponse>
) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { symbol } = req.query;

    // Validate symbol parameter
    if (!symbol || typeof symbol !== 'string') {
        return res.status(400).json({ error: 'Symbol parameter is required' });
    }

    // Validate symbol format (should be uppercase letters)
    const symbolUpper = symbol.toUpperCase();
    if (!/^[A-Z]+$/.test(symbolUpper)) {
        return res.status(400).json({ error: 'Invalid symbol format' });
    }

    try {
        // Fetch from Bluechip API
        const bluechipUrl = `https://backend.bluechip.org/api/1.2/coins/${symbolUpper}/grade`;

        const response = await fetch(bluechipUrl, {
            headers: {
                'accept': '*/*',
                'User-Agent': 'Nonolet/1.0'
            }
        });

        if (!response.ok) {
            console.warn(`Bluechip API error for ${symbolUpper}: ${response.status} ${response.statusText}`);
            return res.status(response.status).json({
                error: `Bluechip API error: ${response.status}`
            });
        }

        const data: BluechipGradeResponse = await response.json();

        // Check if the response contains an error
        if (data.error) {
            console.warn(`Bluechip API returned error for ${symbolUpper}:`, data.error);
            return res.status(404).json({ error: data.error });
        }

        // Validate required fields
        if (!data.grade || !data.symbol) {
            console.warn(`Invalid Bluechip response for ${symbolUpper}:`, data);
            return res.status(500).json({ error: 'Invalid response from Bluechip API' });
        }

        // Return the grade data
        return res.status(200).json({
            name: data.name,
            symbol: data.symbol,
            grade: data.grade,
            url: data.url
        });

    } catch (error) {
        console.error(`Error fetching Bluechip grade for ${symbolUpper}:`, error);
        return res.status(500).json({
            error: 'Failed to fetch grade from Bluechip API'
        });
    }
} 