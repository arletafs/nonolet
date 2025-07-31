import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: ["/", "/api/binance/health"],
            },
            {
                userAgent: "*",
                // Prevent indexing of interactive surfaces and infinite URL combinations
                disallow: [
                    "/api/", // Prevent indexing of API endpoints
                    "/_next/", // Prevent indexing of Next.js internal files
                    "/static/", // Prevent indexing of static assets
                ],
            },
        ],
        sitemap: "https://nonolet.xyz/sitemap.xml",
    };
} 