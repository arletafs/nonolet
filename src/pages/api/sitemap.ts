import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    // Extend this list as you add more canonical, content-rich routes.
    return [
        {
            url: "https://nonolet.xyz/",
            changeFrequency: "daily",
            priority: 1.0,
        },
        {
            url: "https://nonolet.xyz/api/binance/health",
            changeFrequency: "hourly",
            priority: 0.3,
        },
    ];
} 