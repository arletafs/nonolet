import { useQueries, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { partial, omit } from 'lodash';
import { useMemo } from 'react';

import { redirectQuoteReq } from '~/components/Aggregator/adapters/utils';
import { chainsWithOpFees, getOptimismFee } from '~/components/Aggregator/utils/optimismFees';
import { adapters, adaptersWithApiKeys } from '~/components/Aggregator/list';
import { fallbackStablecoinInfo } from '~/components/Aggregator/constants';

interface IGetListRoutesProps {
	chain?: string;
	from?: string;
	to?: string;
	amount?: string;
	extra?: any;
	disabledAdapters?: Array<string>;
	customRefetchInterval?: number;
}

interface IPrice {
	amountReturned: any;
	estimatedGas: any;
	tokenApprovalAddress: any;
	logo: string;
	isGaslessApproval?: boolean;
	feeAmount?: number;
	rawQuote?: {};
	isSignatureNeededForSwap?: boolean;
}

interface IAdapterRoute {
	price: IPrice | null;
	name: string;
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
}

export interface IRoute extends Omit<IAdapterRoute, 'price'> {
	price: IPrice;
}

interface IGetAdapterRouteProps extends IGetListRoutesProps {
	adapter: any;
}

export const REFETCH_INTERVAL = 180_000;

const defaultRouteResponse = ({ adapter, amount }) => ({
	price: null,
	name: adapter.name,
	airdrop: !adapter.token,
	fromAmount: amount,
	txData: '',
	l1Gas: 0,
	tx: {},
	isOutputAvailable: false,
	isGasless: adapter.isGasless ?? false
});

export async function getAdapterRoutes({ adapter, chain, from, to, amount, extra = {} }: IGetAdapterRouteProps) {
	if (!chain || !from || !to || (!amount && !extra.amountOut) || (amount === '0' && extra.amountOut === '0')) {
		return defaultRouteResponse({ adapter, amount });
	}

	try {
		const isOutputDefined = extra.amountOut && extra.amountOut !== '0';
		let price;
		let amountIn = amount;

		const quouteFunc =
			extra.isPrivacyEnabled || adaptersWithApiKeys[adapter.name]
				? partial(redirectQuoteReq, adapter.name)
				: adapter.getQuote;
		if (adapter.isOutputAvailable) {
			price = await quouteFunc(chain, from, to, amount, extra);
			if (price) {
				amountIn = price.amountIn;
			}
		} else if (isOutputDefined && !adapter.isOutputAvailable) {
			return defaultRouteResponse({ adapter, amount });
		} else {
			price = await quouteFunc(chain, from, to, amount, extra);
		}

		if (!price) {
			return defaultRouteResponse({ adapter, amount });
		}

		if (!amountIn) throw Error('amountIn is not defined');

		const txData = adapter?.getTxData?.(price) ?? '';
		let l1Gas: number | 'Unknown' = 0;

		if (txData !== '' && chainsWithOpFees.includes(chain) && adapter.isGasless !== true) {
			l1Gas = await getOptimismFee(txData, chain);
		}

		const res = {
			price,
			l1Gas,
			txData,
			tx: adapter?.getTx?.(price),
			name: adapter.name,
			airdrop: !adapter.token,
			fromAmount: amountIn,
			isOutputAvailable: adapter.isOutputAvailable,
			isGasless: adapter.isGasless ?? false
		};

		return res;
	} catch (e) {
		console.error(`Error fetching ${adapter.name} quote`);
		console.error(e);
		return defaultRouteResponse({ adapter, amount });
	}
}

export function useGetRoutes({
	chain,
	from,
	to,
	amount,
	extra = {},
	disabledAdapters = [],
	customRefetchInterval
}: IGetListRoutesProps) {
	const chainAdapters = useMemo(() => {
		return adapters.filter((adap) =>
			chain && adap.chainToId[chain] !== undefined && !disabledAdapters.includes(adap.name) ? true : false
		);
	}, [chain, disabledAdapters]);

	const res = useQueries({
		// @ts-ignore
		queries: chainAdapters.map<UseQueryOptions<IAdapterRoute>>((adapter) => {
			return {
				queryKey: [
					'routes',
					adapter.name,
					chain,
					from,
					to,
					amount,
					JSON.stringify(omit(extra, 'amount', 'gasPriceData'))
				],
				queryFn: () => getAdapterRoutes({ adapter, chain, from, to, amount, extra }),
				staleTime: customRefetchInterval || REFETCH_INTERVAL,
				refetchInterval: customRefetchInterval || REFETCH_INTERVAL
			};
		})
	});

	const { lastFetched, loadingRoutes, data, isLoading } = useMemo(() => {
		const loadingRoutes =
			res
				?.map((r, i) => [chainAdapters[i].name, r] as [string, UseQueryResult<IAdapterRoute>])
				?.filter((r) => r[1].isLoading) ?? [];

		const data =
			res?.filter((r) => r.status === 'success' && !!r.data && r.data.price).map((r) => r.data as IRoute) ?? [];

		return {
			lastFetched:
				res
					.filter((d) => d.isSuccess && !d.isFetching && d.dataUpdatedAt > 0)
					.sort((a, b) => a.dataUpdatedAt - b.dataUpdatedAt)?.[0]?.dataUpdatedAt ?? Date.now(),
			loadingRoutes,
			data,
			isLoading: res.length > 0 && data.length === 0
		};
	}, [res, chainAdapters]);

	return {
		isLoading,
		data,
		refetch: () => res?.forEach((r) => r.refetch()),
		lastFetched,
		loadingRoutes
	};
}

// New hook to support fiat currency routing to multiple stablecoins
export function useGetRoutesWithFiatSupport({
	chain,
	from,
	to,
	amount,
	extra = {},
	disabledAdapters = [],
	customRefetchInterval,
	fiatCurrencyMappings,
	chainTokenList
}: IGetListRoutesProps & { fiatCurrencyMappings?: any; chainTokenList?: Record<string, any> }) {
	const isFiatCurrency = to && fiatCurrencyMappings && fiatCurrencyMappings[to];
	const targetTokens = useMemo(() => {
		if (!isFiatCurrency || !chain) return [to];
		
		// Get the chain ID from chain name
		const chainIds = {
			'ethereum': 1,
			'bsc': 56,
			'polygon': 137,
			'optimism': 10,
			'arbitrum': 42161,
			'avax': 43114,
			'gnosis': 100,
			'fantom': 250,
			'klaytn': 8217,
			'aurora': 1313161554,
			'celo': 42220,
			'cronos': 25,
			'dogechain': 2000,
			'moonriver': 1285,
			'bttc': 199,
			'oasis': 42262,
			'velas': 106,
			'heco': 128,
			'harmony': 1666600000,
			'boba': 288,
			'okexchain': 66,
			'fuse': 122,
			'moonbeam': 1284,
			'canto': 7700,
			'zksync': 324,
			'polygonzkevm': 1101,
			'ontology': 58,
			'kava': 2222,
			'pulse': 369,
			'metis': 1088,
			'base': 8453,
			'linea': 59144,
			'mode': 34443,
			'mantle': 5000,
			'scroll': 534352,
			'sonic': 146,
			'unichain': 130
		};
		
		const chainId = chainIds[chain];
		const stablecoins = fiatCurrencyMappings[to]?.[chainId] || [];
		
		return stablecoins.length > 0 ? stablecoins : [to];
	}, [isFiatCurrency, chain, to, fiatCurrencyMappings]);

	const chainAdapters = useMemo(() => {
		return adapters.filter((adap) =>
			chain && adap.chainToId[chain] !== undefined && !disabledAdapters.includes(adap.name) ? true : false
		);
	}, [chain, disabledAdapters]);

	// Create queries for all target tokens with enhanced metadata
	const allQueries = useMemo(() => {
		const queries = targetTokens.flatMap(targetToken => 
			chainAdapters.map((adapter) => ({
				queryKey: [
					'routes',
					adapter.name,
					chain,
					from,
					targetToken,
					amount,
					JSON.stringify(omit(extra, 'amount', 'gasPriceData', 'toToken'))
				],
				queryFn: async () => {
					// For fiat currencies, try to get the actual stablecoin info from chainTokenList
					let resolvedToToken = extra.toToken;
					if (isFiatCurrency && chainTokenList) {
						const stablecoinInfo = chainTokenList[targetToken.toLowerCase()];
						if (stablecoinInfo) {
							resolvedToToken = stablecoinInfo;
							console.log(`✅ Resolved stablecoin info for ${targetToken}:`, {
								address: stablecoinInfo.address,
								symbol: stablecoinInfo.symbol,
								name: stablecoinInfo.name
							});
						} else {
							// Try fallback stablecoin info
							const fallbackInfo = fallbackStablecoinInfo[targetToken.toLowerCase()];
							if (fallbackInfo) {
								resolvedToToken = fallbackInfo;
								console.log(`✅ Using fallback stablecoin info for ${targetToken}:`, {
									address: fallbackInfo.address,
									symbol: fallbackInfo.symbol,
									name: fallbackInfo.name
								});
							} else {
								console.log(`❌ Stablecoin info not found for ${targetToken} in chainTokenList or fallback`);
								// Fallback to placeholder if not found in chain token list or fallback
								resolvedToToken = {
									address: targetToken,
									symbol: targetToken,
									name: targetToken,
									decimals: 6,
									logoURI: `https://token-icons.llamao.fi/icons/tokens/1/${targetToken}?h=48&w=48`,
									chainId: extra.toToken?.chainId || 1,
									label: targetToken,
									value: targetToken
								};
							}
						}
					}
					
					const stablecoinExtra = {
						...extra,
						toToken: resolvedToToken
					};
					
					const route = await getAdapterRoutes({ 
						adapter, 
						chain, 
						from, 
						to: targetToken, 
						amount, 
						extra: stablecoinExtra 
					});
					
					// Preserve the actual target token information
					return {
						...route,
						targetToken,
						originalToToken: to,
						isFiatCurrencyRoute: isFiatCurrency
					};
				},
				staleTime: customRefetchInterval || REFETCH_INTERVAL,
				refetchInterval: customRefetchInterval || REFETCH_INTERVAL,
				targetToken
			}))
		);
		
		return queries;
	}, [targetTokens, chainAdapters, chain, from, amount, extra, customRefetchInterval, to, isFiatCurrency]);

	const res = useQueries({
		// @ts-ignore
		queries: allQueries
	});

	const { lastFetched, loadingRoutes, data, isLoading } = useMemo(() => {
		const loadingRoutes = res
			?.map((r, i) => [chainAdapters[i % chainAdapters.length].name, r] as [string, UseQueryResult<IAdapterRoute>])
			?.filter((r) => r[1].isLoading) ?? [];

		// Filter successful routes and enhance with target token information
		const successfulRoutes = res?.filter((r) => r.status === 'success' && !!r.data && (r.data as any).price).map((r) => {
			const routeData = r.data as any;
			return {
				...routeData,
				// For fiat currencies, show the actual stablecoin info
				actualTargetToken: routeData.targetToken,
				isFiatCurrencyRoute: isFiatCurrency
			} as IRoute;
		}) ?? [];

		// For fiat currencies, return routes for all stablecoins
		// For regular tokens, return routes as normal
		const finalRoutes = successfulRoutes;
		
		return {
			lastFetched:
				res
					.filter((d) => d.isSuccess && !d.isFetching && d.dataUpdatedAt > 0)
					.sort((a, b) => a.dataUpdatedAt - b.dataUpdatedAt)?.[0]?.dataUpdatedAt ?? Date.now(),
			loadingRoutes,
			data: finalRoutes,
			isLoading: res.length > 0 && finalRoutes.length === 0
		};
	}, [res, allQueries, isFiatCurrency]);

	return {
		isLoading,
		data,
		refetch: () => res?.forEach((r) => r.refetch()),
		lastFetched,
		loadingRoutes,
		isFiatCurrency
	};
}
