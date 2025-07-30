import type { NextApiRequest, NextApiResponse } from 'next';

interface VolatilityDataPoint {
    datetime: string;
    value: number;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    console.log('Santiment API route called:', { method: req.method, body: req.body });

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { slugs } = req.body;

        if (!Array.isArray(slugs)) {
            return res.status(400).json({ message: 'slugs must be an array' });
        }

        console.log('Processing slugs:', slugs);

        const volatilities: Record<string, number> = {};

        // Test with all slugs now that we've fixed the JSON.parse issue
        const testSlugs = slugs; // Test with all slugs
        console.log('Testing with all slugs:', testSlugs.length, 'slugs');

        // Fetch volatilities sequentially to avoid rate limiting
        for (const slug of testSlugs) {
            try {
                const query = `
                    {
                        getMetric(metric: "price_volatility_1d") {
                            timeseriesDataJson(
                                slug: "${slug}"
                                from: "utc_now-30d"
                                to: "utc_now"
                                interval: "30d"
                            )
                        }
                    }
                `;

                console.log(`🔍 Fetching volatility for ${slug}...`);

                const response = await fetch('https://api.santiment.net/graphql', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ query }),
                });

                if (!response.ok) {
                    console.warn(`❌ Santiment API error for ${slug}: ${response.status}`);
                    continue;
                }

                const result = await response.json();

                if (result.errors) {
                    console.warn(`❌ GraphQL errors for ${slug}:`, result.errors);
                    continue;
                }

                const timeseriesData = result.data?.getMetric?.timeseriesDataJson;
                if (!timeseriesData || timeseriesData.length === 0) {
                    console.warn(`❌ No timeseries data for ${slug}`);
                    continue;
                }

                // timeseriesDataJson returns an object/array, not a string that needs parsing
                const dataPoints: VolatilityDataPoint[] = timeseriesData;

                if (dataPoints.length > 0) {
                    const volatility = dataPoints[dataPoints.length - 1]?.value;
                    if (volatility !== undefined && volatility !== null) {
                        volatilities[slug] = volatility;
                        console.log(`✅ Added volatility for ${slug}:`, volatility);
                    }
                }
            } catch (error) {
                console.error(`💥 Error fetching volatility for ${slug}:`, error);
            }

            // Add delay between requests to be respectful to the API
            await new Promise(resolve => setTimeout(resolve, 200)); // Reduced delay
        }

        console.log('✨ Final volatilities result:', Object.keys(volatilities).length, 'successful out of', testSlugs.length, 'requested');

        res.status(200).json({ volatilities });
    } catch (error) {
        console.error('💥 Error in volatility API route:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
} 