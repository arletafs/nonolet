export interface IToken {
	address: string;
	label: string;
	value: string;
	logoURI: string;
	logoURI2?: string | null;
	symbol: string;
	decimals: number;
	name: string;
	chainId: number;
	amount?: string | number;
	balanceUSD?: number;
	geckoId: string | null;
	isGeckoToken?: boolean;
	isMultichain?: boolean;
}

export interface IFiatCurrency {
	value: string;
	label: string;
	symbol: string;
	isFiatCurrency?: boolean;
}

export interface IPool {
	apu: number;
	apy: number;
	apyBase: number | null;
	apyBase7d: number | null;
	apyBaseBorrow: number;
	apyBaseInception: number | null;
	apyBorrow: number;
	apyMean30d: number;
	apyPct1D: number;
	apyPct7D: number;
	apyPct30D: number;
	apyReward: number | null;
	apyRewardBorrow: number | null;
	borrowFactor: null;
	borrowable: true;
	category: string;
	chain: string;
	count: number;
	exposure: string;
	il7d: number | null;
	ilRisk: string;
	lsdApy: number;
	ltv: number;
	mintedCoin: string | null;
	mu: number;
	outlier: boolean;
	pool: string;
	poolMeta: null;
	predictions: { predictedClass: string; predictedProbability: number; binnedConfidence: number };
	project: string;
	rewardTokens: null;
	sigma: number;
	stablecoin: boolean;
	symbol: string;
	totalAvailableUsd: number;
	totalBorrowUsd: number;
	totalSupplyUsd: number;
	tvlUsd: number;
	underlyingTokens: Array<string>;
	volumeUsd1d: number | null;
	volumeUsd7d: number | null;
	config: { name: string; category: string };
}

export interface IRoute {
	name: string;
	price: {
		amountReturned: string;
		estimatedGas: string;
		tokenApprovalAddress: string;
		logo: string;
		isGaslessApproval?: boolean;
		rawQuote?: {};
		isMEVSafe?: boolean;
		feeAmount?: number;
		isSignatureNeededForSwap?: boolean;
	};
	airdrop: boolean;
	fromAmount: string;
	txData: string;
	l1Gas: number | 'Unknown';
	tx: {
		from: string;
		to: string;
		data: string;
	};
	isOutputAvailable: boolean;
	isGasless: boolean;

	// Specific properties for fiat currency routing
	actualTargetToken?: string;
	originalToToken?: string;
	isFiatCurrencyRoute?: boolean;
	targetToken?: string;
}
