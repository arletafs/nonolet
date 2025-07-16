/**
 * Santiment Slug Mappings
 * 
 * Maps stablecoin contract addresses to their corresponding Santiment project slugs
 * Used for fetching volatility data from Santiment API
 */

export interface StablecoinMapping {
    address: string;
    slug: string;
    symbol: string;
    name: string;
    chainId: number;
}

/**
 * Stablecoin contract address to Santiment slug mappings
 * Based on fiatCurrencyMappings from constants.ts and verified Santiment slugs
 */
export const stablecoinSantimentMappings: StablecoinMapping[] = [
    // USDC - Circle USD Coin
    {
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        slug: 'usd-coin',
        symbol: 'USDC',
        name: 'USD Coin',
        chainId: 1, // Ethereum
    },
    {
        address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
        slug: 'usd-coin',
        symbol: 'USDC',
        name: 'USD Coin',
        chainId: 56, // BSC
    },
    {
        address: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
        slug: 'usd-coin',
        symbol: 'USDC',
        name: 'USD Coin',
        chainId: 137, // Polygon
    },
    {
        address: '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
        slug: 'usd-coin',
        symbol: 'USDC',
        name: 'USD Coin',
        chainId: 10, // Optimism
    },
    {
        address: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
        slug: 'usd-coin',
        symbol: 'USDC',
        name: 'USD Coin',
        chainId: 42161, // Arbitrum
    },
    {
        address: '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e',
        slug: 'usd-coin',
        symbol: 'USDC',
        name: 'USD Coin',
        chainId: 43114, // Avalanche
    },
    {
        address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
        slug: 'usd-coin',
        symbol: 'USDC',
        name: 'USD Coin',
        chainId: 8453, // Base
    },

    // USDT - Tether
    {
        address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        slug: 'tether',
        symbol: 'USDT',
        name: 'Tether',
        chainId: 1, // Ethereum
    },
    {
        address: '0x55d398326f99059ff775485246999027b3197955',
        slug: 'tether',
        symbol: 'USDT',
        name: 'Tether',
        chainId: 56, // BSC
    },
    {
        address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
        slug: 'tether',
        symbol: 'USDT',
        name: 'Tether',
        chainId: 137, // Polygon
    },
    {
        address: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
        slug: 'tether',
        symbol: 'USDT',
        name: 'Tether',
        chainId: 10, // Optimism
    },
    {
        address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
        slug: 'tether',
        symbol: 'USDT',
        name: 'Tether',
        chainId: 42161, // Arbitrum
    },
    {
        address: '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7',
        slug: 'tether',
        symbol: 'USDT',
        name: 'Tether',
        chainId: 43114, // Avalanche
    },

    // DAI - MakerDAO
    {
        address: '0x6b175474e89094c44da98b954eedeac495271d0f',
        slug: 'multi-collateral-dai',
        symbol: 'DAI',
        name: 'Dai Stablecoin',
        chainId: 1, // Ethereum
    },
    {
        address: '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3',
        slug: 'multi-collateral-dai',
        symbol: 'DAI',
        name: 'Dai Stablecoin',
        chainId: 56, // BSC
    },
    {
        address: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
        slug: 'multi-collateral-dai',
        symbol: 'DAI',
        name: 'Dai Stablecoin',
        chainId: 137, // Polygon
    },
    {
        address: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
        slug: 'multi-collateral-dai',
        symbol: 'DAI',
        name: 'Dai Stablecoin',
        chainId: 10, // Optimism
    },
    {
        address: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
        slug: 'multi-collateral-dai',
        symbol: 'DAI',
        name: 'Dai Stablecoin',
        chainId: 42161, // Arbitrum
    },
    {
        address: '0xd586e7f844cea2f87f50152665bcbc2c279d8d70',
        slug: 'multi-collateral-dai',
        symbol: 'DAI',
        name: 'Dai Stablecoin',
        chainId: 43114, // Avalanche
    },

    // USDS - Sky Dollar (formerly MakerDAO)
    {
        address: '0xdc035d45d973e3ec169d2276ddab16f1e407384f',
        slug: 'usds',
        symbol: 'USDS',
        name: 'Sky Dollar USDS',
        chainId: 1, // Ethereum
    },
    {
        address: '0x820c137fa70c8691f0e44dc420a5e53c168921dc',
        slug: 'sky-dollar-usds',
        symbol: 'USDS',
        name: 'Sky Dollar',
        chainId: 8453, // Base
    },

    // USDe - Ethena USD
    {
        address: '0x4c9edd5852cd905f086c759e8383e09bff1e68b3',
        slug: 'ethena-usde',
        symbol: 'USDe',
        name: 'Ethena USDe',
        chainId: 1, // Ethereum
    },

    // FRAX - Frax Finance
    {
        address: '0x853d955acef822db058eb8505911ed77f175b99e',
        slug: 'frax',
        symbol: 'FRAX',
        name: 'Frax',
        chainId: 1, // Ethereum - address might need verification
    },

    // TUSD - TrueUSD
    {
        address: '0x0000000000085d4780b73119b644ae5ecd22b376',
        slug: 'trueusd',
        symbol: 'TUSD',
        name: 'TrueUSD',
        chainId: 1, // Ethereum
    },

    // BUSD - Binance USD (deprecated but still in circulation)
    {
        address: '0x4fabb145d64652a948d72533023f6e7a623c7c53',
        slug: 'binance-usd',
        symbol: 'BUSD',
        name: 'Binance USD',
        chainId: 1, // Ethereum
    },
];

/**
 * Get Santiment slug for a given contract address and chain ID
 */
export function getSantimentSlug(address: string, chainId: number): string | null {
    const mapping = stablecoinSantimentMappings.find(
        m => m.address.toLowerCase() === address.toLowerCase() && m.chainId === chainId
    );
    return mapping?.slug || null;
}

/**
 * Get all unique Santiment slugs for volatility fetching
 */
export function getUniqueSantimentSlugs(): string[] {
    const slugs = new Set(stablecoinSantimentMappings.map(m => m.slug));
    const result = Array.from(slugs);
    return result;
}

/**
 * Get stablecoins by Santiment slug
 */
export function getStablecoinsBySlug(slug: string): StablecoinMapping[] {
    return stablecoinSantimentMappings.filter(m => m.slug === slug);
}

/**
 * Check if an address is a mapped stablecoin
 */
export function isMappedStablecoin(address: string, chainId: number): boolean {
    return getSantimentSlug(address, chainId) !== null;
} 