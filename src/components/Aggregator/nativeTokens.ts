import { zeroAddress } from 'viem';

const ICONS_CDN = 'https://icons.llamao.fi/icons';
export function chainIconUrl(chain) {
	return `${ICONS_CDN}/chains/rsz_${chain.toLowerCase()}?w=48&h=48`;
}

const ethereum = {
	mcap: Number.MAX_SAFE_INTEGER,
	address: zeroAddress,
	chainId: 1,
	name: 'Ethereum',
	symbol: 'ETH',
	logoURI: chainIconUrl('ethereum'),
	decimals: 18
};

const binance = {
	mcap: Number.MAX_SAFE_INTEGER,
	address: zeroAddress,
	chainId: 56,
	name: 'Binance',
	symbol: 'BNB',
	logoURI: chainIconUrl('binance'),
	decimals: 18
};

const arbitrum = {
	mcap: Number.MAX_SAFE_INTEGER,
	address: zeroAddress,
	chainId: 42161,
	name: 'Ethereum',
	symbol: 'ETH',
	logoURI: chainIconUrl('ethereum'),
	decimals: 18
};

const optimism = {
	mcap: Number.MAX_SAFE_INTEGER,
	address: zeroAddress,
	chainId: 10,
	name: 'Ethereum',
	symbol: 'ETH',
	logoURI: chainIconUrl('ethereum'),
	decimals: 18
};

const base = {
	mcap: Number.MAX_SAFE_INTEGER,
	address: zeroAddress,
	chainId: 8453,
	name: 'Ethereum',
	symbol: 'ETH',
	logoURI: chainIconUrl('ethereum'),
	decimals: 18
};

const linea = {
	mcap: Number.MAX_SAFE_INTEGER,
	address: zeroAddress,
	chainId: 59144,
	name: 'Ethereum',
	symbol: 'ETH',
	logoURI: chainIconUrl('ethereum'),
	decimals: 18
};

const scroll = {
	mcap: Number.MAX_SAFE_INTEGER,
	address: zeroAddress,
	chainId: 534352,
	name: 'Ethereum',
	symbol: 'ETH',
	logoURI: chainIconUrl('ethereum'),
	decimals: 18
};

const okx = {
	mcap: Number.MAX_SAFE_INTEGER,
	address: zeroAddress,
	chainId: 66,
	name: 'OKX',
	symbol: 'OKX',
	logoURI: chainIconUrl('okexchain'),
	decimals: 18
};

const boba = {
	mcap: Number.MAX_SAFE_INTEGER,
	address: zeroAddress,
	chainId: 288,
	logoURI: chainIconUrl('ethereum'),
	name: 'Ethereum',
	symbol: 'ETH',
	decimals: 18
};

const harmony = {
	mcap: Number.MAX_SAFE_INTEGER,
	address: zeroAddress,
	chainId: 1666600000,
	logoURI: chainIconUrl('harmony'),
	decimals: 18,
	name: 'Harmony',
	symbol: 'ONE'
};

const heco = {
	mcap: Number.MAX_SAFE_INTEGER,
	address: zeroAddress,
	chainId: 128,
	logoURI: chainIconUrl('heco'),
	name: 'Huobi Token',
	symbol: 'HT',
	decimals: 18
};

const velas = {
	mcap: Number.MAX_SAFE_INTEGER,
	address: zeroAddress,
	chainId: 106,
	logoURI: chainIconUrl('velas'),
	name: 'Velas',
	symbol: 'VLX',
	decimals: 18
};

const oasis = {
	mcap: Number.MAX_SAFE_INTEGER,
	address: zeroAddress,
	chainId: 24462,
	name: 'Oasis',
	symbol: 'ROSE',
	logoURI: chainIconUrl('oasis'),
	decimals: 18
};

const bttc = {
	mcap: Number.MAX_SAFE_INTEGER,
	address: zeroAddress,
	chainId: 199,
	name: 'BitTorrent',
	logoURI: chainIconUrl('bittorrent'),
	symbol: 'BTT',
	decimals: 18
};

const moonriver = {
	mcap: Number.MAX_SAFE_INTEGER,
	address: zeroAddress,
	chainId: 1285,
	name: 'MoonRiver',
	logoURI: chainIconUrl('moonriver'),
	symbol: 'MOVR',
	decimals: 18
};

const moonbeam = {
	mcap: Number.MAX_SAFE_INTEGER,
	address: zeroAddress,
	chainId: 1284,
	name: 'Moonbeam',
	logoURI: chainIconUrl('moonbeam'),
	symbol: 'GLMR',
	decimals: 18
};

const fuse = {
	mcap: Number.MAX_SAFE_INTEGER,
	address: zeroAddress,
	chainId: 122,
	name: 'Fuse',
	logoURI: chainIconUrl('fuse'),
	symbol: 'FUSE',
	decimals: 18
};

const dogechain = {
	mcap: Number.MAX_SAFE_INTEGER,
	address: zeroAddress,
	chainId: 2000,
	name: 'Doge',
	symbol: 'DOGE',
	decimals: 18,
	logoURI: chainIconUrl('dogechain')
};

const cronos = {
	mcap: Number.MAX_SAFE_INTEGER,
	address: zeroAddress,
	chainId: 25,
	name: 'Cronos',
	symbol: 'CRO',
	logoURI: chainIconUrl('cronos'),
	decimals: 18
};
const celo = {
	mcap: Number.MAX_SAFE_INTEGER,
	address: zeroAddress,
	chainId: 42220,
	name: 'Celo',
	symbol: 'CELO',
	logoURI: chainIconUrl('celo'),
	decimals: 18
};
const aurora = {
	mcap: Number.MAX_SAFE_INTEGER,
	address: zeroAddress,
	chainId: 1313161554,
	name: 'Ethereum',
	symbol: 'ETH',
	logoURI: chainIconUrl('ethereum'),
	decimals: 18
};
const avax = {
	mcap: Number.MAX_SAFE_INTEGER,
	address: zeroAddress,
	chainId: 43114,
	logoURI: chainIconUrl('avax'),
	name: 'Avalanche',
	symbol: 'AVAX',
	decimals: 18
};

const klaytn = {
	mcap: Number.MAX_SAFE_INTEGER,
	address: zeroAddress,
	chainId: 8217,
	name: 'Klaytn',
	symbol: 'KLAY',
	logoURI: chainIconUrl('klaytn'),
	decimals: 18
};
const fantom = {
	mcap: Number.MAX_SAFE_INTEGER,
	address: zeroAddress,
	chainId: 250,
	logoURI: chainIconUrl('fantom'),
	name: 'Fantom',
	symbol: 'FTM',
	decimals: 18
};

const gnosis = {
	mcap: Number.MAX_SAFE_INTEGER,
	address: zeroAddress,
	chainId: 100,
	name: 'xDai',
	symbol: 'xDai',
	logoURI: chainIconUrl('gnosis'),
	decimals: 18
};
const polygon = {
	mcap: Number.MAX_SAFE_INTEGER,
	address: zeroAddress,
	chainId: 137,
	name: 'Polygon',
	symbol: 'POL',
	logoURI: chainIconUrl('polygon'),
	decimals: 18
};

const canto = {
	mcap: Number.MAX_SAFE_INTEGER,
	address: zeroAddress,
	chainId: 7700,
	name: 'Canto',
	symbol: 'CANTO',
	logoURI: chainIconUrl('canto'),
	decimals: 18
};

const metis = {
	mcap: Number.MAX_SAFE_INTEGER,
	address: zeroAddress,
	chainId: 1088,
	name: 'Metis',
	symbol: 'METIS',
	logoURI: chainIconUrl('metis'),
	decimals: 18
};

const polygonzkevm = {
	mcap: Number.MAX_SAFE_INTEGER,
	address: zeroAddress,
	chainId: 1101,
	name: 'Polygon zkEVM',
	symbol: 'ETH',
	logoURI: chainIconUrl('polygon zkevm'),
	decimals: 18
};

const kava = {
	mcap: Number.MAX_SAFE_INTEGER,
	address: zeroAddress,
	chainId: 2222,
	name: 'Kava',
	symbol: 'KAVA',
	logoURI: chainIconUrl('kava'),
	decimals: 18
};

const zksync = {
	mcap: Number.MAX_SAFE_INTEGER,
	address: zeroAddress,
	chainId: 324,
	name: 'zkSync Era',
	symbol: 'ETH',
	logoURI: chainIconUrl('zksync era'),
	decimals: 18
};

const ontology = {
	mcap: Number.MAX_SAFE_INTEGER,
	address: zeroAddress,
	chainId: 58,
	name: 'Ontology',
	symbol: 'ONT',
	logoURI: chainIconUrl('ontologyevm'),
	decimals: 18
};

const pulse = {
	mcap: Number.MAX_SAFE_INTEGER,
	address: zeroAddress,
	chainId: 369,
	name: 'Pulse',
	symbol: 'PLS',
	logoURI: chainIconUrl('pulse'),
	decimals: 18
};

const sonic = {
	mcap: Number.MAX_SAFE_INTEGER,
	address: zeroAddress,
	chainId: 146,
	name: 'SONIC',
	symbol: 's',
	logoURI: chainIconUrl('sonic'),
	decimals: 18
};

const unichain = {
	mcap: Number.MAX_SAFE_INTEGER,
	address: zeroAddress,
	chainId: 130,
	name: 'Ethereum',
	symbol: 'ETH',
	logoURI: chainIconUrl('ethereum'),
	decimals: 18
};

export const nativeTokens = [
	ethereum,
	arbitrum,
	binance,
	optimism,
	polygon,
	oasis,
	fantom,
	velas,
	harmony,
	gnosis,
	klaytn,
	avax,
	aurora,
	cronos,
	celo,
	dogechain,
	moonriver,
	bttc,
	heco,
	boba,
	okx,
	moonbeam,
	fuse,
	canto,
	metis,
	polygonzkevm,
	kava,
	zksync,
	ontology,
	pulse,
	base,
	linea,
	scroll,
	sonic,
	unichain
];
