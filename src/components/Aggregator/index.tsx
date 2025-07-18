import { useRef, useState, Fragment, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAccount, useSignTypedData, useCapabilities, useSwitchChain, useBytecode } from 'wagmi';
import { useAddRecentTransaction, useConnectModal } from '@rainbow-me/rainbowkit';
import BigNumber from 'bignumber.js';
import { ArrowRight, ArrowLeft } from 'react-feather';
import styled from 'styled-components';
import {
	useToast,
	Button,
	Flex,
	Box,
	IconButton,
	Text,
	ToastId,
	Alert,
	AlertIcon,
	useBreakpoint,
	Image
} from '@chakra-ui/react';
import ReactSelect from '~/components/MultiSelect';
import FAQs from '~/components/FAQs';
import SwapRoute from '~/components/SwapRoute';
import { adaptersNames, getAllChains, swap, gaslessApprove, signatureForSwap } from './router';
import { inifiniteApprovalAllowed } from './list';
import Loader from './Loader';
import { useTokenApprove } from './hooks';
import { IRoute, useGetRoutesWithFiatSupport } from '~/queries/useGetRoutes';
import { useGetPrice } from '~/queries/useGetPrice';
import { PRICE_IMPACT_WARNING_THRESHOLD, fiatCurrencyMappings, fallbackStablecoinInfo } from './constants';
import { Tooltip2 } from '../Tooltip';
import type { IToken } from '~/types';
import { sendSwapEvent } from './adapters/utils';
import { useRouter } from 'next/router';
import { TransactionModal } from '../TransactionModal';
import RoutesPreview from './RoutesPreview';
import {
	formatSuccessToast,
	formatErrorToast,
	formatSubmittedToast,
	formatUnknownErrorToast
} from '~/utils/formatToast';
import { useDebounce } from '~/hooks/useDebounce';
import { useGetSavedTokens } from '~/queries/useGetSavedTokens';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useLocalStorage } from '~/hooks/useLocalStorage';
import SwapConfirmation from './SwapConfirmation';
import { getTokenBalance, useBalance } from '~/queries/useBalance';
import { useEstimateGas } from './hooks/useEstimateGas';
import { VolatilityScoreCell } from '~/components/VolatilityScoreCell';
import { PriceImpact } from '../PriceImpact';
import { useQueryParams } from '~/hooks/useQueryParams';
import { useSelectedChainAndTokens } from '~/hooks/useSelectedChainAndTokens';
import { InputAmountAndTokenSelect } from '../InputAmountAndTokenSelect';
import { ArrowBackIcon, ArrowForwardIcon, RepeatIcon, SettingsIcon } from '@chakra-ui/icons';
import { Settings } from './Settings';
import { formatAmount } from '~/utils/formatAmount';
import { RefreshIcon } from '../RefreshIcon';
import { zeroAddress } from 'viem';
import { waitForCallsStatus, waitForTransactionReceipt } from 'wagmi/actions';
import { config } from '../WalletProvider';
import { cowSwapEthFlowSlippagePerChain } from './adapters/cowswap';
import GradientButton from '../GradientButton';
import ConversionChart from '../ConversionChart';
import FundingOptions from '../FundingOptions';

import iconLlamaswap from '~/public/llamaswap.png';
import iconDisclaimer from '~/public/disclaimer.svg';
import iconStablecoinSettlement from '~/public/icon-settlement.svg';
import Footer from '../Footer';

/*
Integrated:
- paraswap
- 0x
- 1inch
- cowswap
- kyberswap
- firebird (https://docs.firebird.finance/developer/api-specification)
- https://openocean.finance/
- airswap
- https://app.unidex.exchange/trading
- https://twitter.com/odosprotocol
- yieldyak
- https://defi.krystal.app/

- rook
- https://rubic.exchange/ - aggregates aggregators
- https://twitter.com/RangoExchange - api key requested, bridge aggregator, aggregates aggregators on same chain
- thorswap - aggregates aggregators that we already have
- lifi
- https://twitter.com/ChainHopDEX - only has 1inch
- https://twitter.com/MayanFinance

no api:
- https://twitter.com/HeraAggregator (no api)
- slingshot (no api)
- orion protocol
- autofarm.network/swap/
- https://swapr.eth.limo/#/swap?chainId=1 - aggregates aggregators + swapr

non evm:
- jupiter (solana)
- openocean (solana)
- https://twitter.com/prism_ag (solana)
- coinhall (terra)
- https://twitter.com/tfm_com (terra)

cant integrate:
- https://twitter.com/UniDexFinance - api broken (seems abandoned)
- https://bebop.xyz/ - not live
- VaporDex - not live
- https://twitter.com/hippolabs__ - not live
- dexguru - no api
- https://wowmax.exchange/alpha/ - still beta + no api
- https://twitter.com/RBXtoken - doesnt work
- https://www.bungee.exchange/ - couldnt use it
- wardenswap - no api + sdk is closed source
- https://twitter.com/DexibleApp - not an aggregator, only supports exotic orders like TWAP, segmented order, stop loss...
*/

enum STATES {
	INPUT,
	ROUTES
}

const Body = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
	padding: 40px;
	width: 100%;
	align-self: flex-start;
	z-index: 1;
	background-color: #FFFFFF;
	position: relative;
	border-radius: 30px;
	text-align: left;
	border-bottom: 15px solid #00203A;

	/* @media screen and (min-width: ${({ theme }) => theme.bpLg}) {
		position: sticky;
		top: 24px;
	}*/
`;

const Wrapper = styled.div`
	width: 100%;
	min-height: 100%;
	text-align: center;
	display: flex;
	flex-direction: column;
	grid-row-gap: 36px;
	margin: 0px auto 40px;
	position: absolute;
	align-items: center;
	top: 43%;
	left: 50%;
	transform: translateX(-50%);

	h1 {
		font-weight: 500;
	}

	@media screen and (max-width: ${({ theme }) => theme.bpMed}) {
		flex-direction: column;
		display: flex;
	}
`;

const Routes = styled.div<{ visible: boolean }>`
	display: flex;
	flex-direction: column;
	padding: 16px;
	border-radius: 16px;
	text-align: left;
	overflow-y: scroll;
	width: 100%;
	min-height: 100%;
	overflow-x: hidden;
	align-self: stretch;
	width: 100%;
	background-color: #FFFFFF;

	& > *:first-child {
		margin-bottom: -6px;
	}

	&::-webkit-scrollbar {
		display: none;
	}

	-ms-overflow-style: none; /* IE and Edge */
	scrollbar-width: none; /* Firefox */

	@media screen and (max-width: ${({ theme }) => theme.bpMed}) {
		z-index: 10;
		background-color: #22242a;
		position: absolute;
		box-shadow: none;
		clip-path: ${({ visible }) => (visible ? 'inset(0 0 0 0);' : 'inset(0 0 0 100%);')};

		transition: all 0.4s;
		overflow: scroll;
		max-height: 100%;
	}
`;

const BodyWrapper = styled.div`
	display: flex;
	justify-content: center;
	gap: 16px;
	width: 80%;
	z-index: 1;
	border-radius: 16px;
	position: relative;
	margin-bottom: 200px;

	& > * {
		margin: 0 auto;
	}

	@media screen and (min-width: ${({ theme }) => theme.bpLg}) {
		flex-direction: column;
		align-items: flex-start;
		justify-content: center;
		gap: 24px;

		& > * {
			flex: 1;
			margin: 0;
		}
	}
`;

const FormHeader = styled.div`
	font-weight: bold;
	font-size: 16px;
	margin-bottom: 16px;
	.chakra-switch,
	.chakra-switch__track,
	.chakra-switch__thumb {
		height: 10px;
	}

	@media screen and (max-width: ${({ theme }) => theme.bpMed}) {
		margin: 0 auto;
		margin-bottom: 6px;
	}
`;

const SwapWrapper = styled.div`
	margin-top: auto;
	min-height: 40px;
	width: max-content;
	display: flex;
	gap: 4px;
	flex-wrap: wrap;
	margin: 0 auto;

	& > button {
		flex: 1;
	}
`;

const SwapUnderRoute = styled(SwapWrapper)`
	margin-top: 16px;
	min-height: initial;
	@media screen and (min-width: ${({ theme }) => theme.bpMed}) {
		display: none;
	}
`;

const ConnectButtonWrapper = styled.div`
	min-height: 40px;
	width: 100%;
	display: flex;
	flex-wrap: wrap;

	& button {
		width: 100%;
		text-align: center !important;
	}

	& > div {
		width: 100%;
	}
`;

const Disclaimer = styled.div`
	position: relative;
	flex-direction: row;
	align-items: center;
	justify-content: flex-end;
	width: 100%;
	background-color: #E4EAF3;
	border-radius: 20px;
	display: flex;
	gap: 16px;
	padding: 30px;
`;

const Table = styled.table`
	table-layout: fixed;
	width: 100%;
	font-family: 'Urbanist', sans-serif;
	color: #9FACB4;

	th,
	td,
	caption {
		padding: 4px;
		font-size: 14px;
		font-weight: 400;
		text-align: center;
	}

	caption {
		border-bottom: none;
	}
`;

export const SwapInputArrow = (props) => (
	<IconButton
		icon={
			<Box display="flex" flexDirection="column" alignItems="center" gap={0}>
				<ArrowRight size={18} />
				<ArrowLeft size={18} />
			</Box>
		}
		aria-label="Switch Tokens"
		w="5rem"
		h="5rem"
		borderRadius="50%"
		bg="#00203A"
		_hover={{ transform: 'translate(-50%, -50%) scale(1.05)', transition: 'all 0.2s ease-in-out' }}
		color="white"
		zIndex={1}
		position="absolute"
		left="50%"
		top="50%"
		transform="translate(-50%, -50%)"
		boxShadow="0px 0px 10px 0px rgba(0, 0, 0, 0.1)"
		{...props}
	/>
);

const StablecoinSettlementWrapper = styled.div`
	display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    width: 100%;
    height: 100%;
    border-radius: 12px;
	color: #3B3B3B;
    `;

interface IFinalRoute extends IRoute {
	isFailed: boolean;
	route: IRoute;
	gasUsd: string | number;
	amountUsd: string | null;
	amount: number;
	netOut: number;
	amountIn: string;
	amountInUsd: string | null;
	actualToToken?: IToken; // Add actual stablecoin information
}

const chains = getAllChains();

export function AggregatorContainer() {
	// wallet stuff
	const { address, isConnected, chain: chainOnWallet } = useAccount();
	const { openConnectModal } = useConnectModal();
	const { switchChain } = useSwitchChain();
	const addRecentTransaction = useAddRecentTransaction();
	const { signTypedDataAsync } = useSignTypedData();

	// swap input fields and selected aggregator states
	const [aggregator, setAggregator] = useState<string | null>(null);
	const [isPrivacyEnabled, setIsPrivacyEnabled] = useLocalStorage('llamaswap-isprivacyenabled', false);
	const [[amount, amountOut], setAmount] = useState<[number | string, number | string]>(['', '']);

	const [slippage, setSlippage] = useLocalStorage('llamaswap-slippage', '0.3');
	const [lastOutputValue, setLastOutputValue] = useState<{ aggregator: string; amount: number } | null>(null);
	const [disabledAdapters, setDisabledAdapters] = useLocalStorage('llamaswap-disabledadapters', []);
	const [isDegenModeEnabled, _] = useLocalStorage('llamaswap-degenmode', false);
	const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);

	// mobile states
	const [uiState, setUiState] = useState(STATES.INPUT);
	const breakpoint = useBreakpoint();
	const isSmallScreen = breakpoint === 'sm' || breakpoint === 'base';
	const toggleUi = () => setUiState((state) => (state === STATES.INPUT ? STATES.ROUTES : STATES.INPUT));

	// post swap states
	const [txModalOpen, setTxModalOpen] = useState(false);
	const [txUrl, setTxUrl] = useState('');
	const confirmingTxToastRef = useRef<ToastId>();
	const toast = useToast();

	// debounce input amount and limit no of queries made to aggregators api, to avoid CORS errors
	const debouncedAmountInAndOut = useDebounce(`${formatAmount(amount)}&&${formatAmount(amountOut)}`, 300);
	const [debouncedAmount, debouncedAmountOut] = debouncedAmountInAndOut.split('&&');

	// get selected chain and tokens from URL query params
	const routesRef = useRef<HTMLDivElement>(null);
	const router = useRouter();

	const { toTokenAddress } = useQueryParams();
	const {
		fetchingFromToken,
		fetchingToToken,
		finalSelectedFromToken,
		finalSelectedToToken,
		selectedChain,
		selectedToToken,
		chainTokenList
	} = useSelectedChainAndTokens();
	const isValidSelectedChain = selectedChain && chainOnWallet ? selectedChain.id === chainOnWallet.id : false;
	const isOutputTrade = amountOut && amountOut !== '';

	// format input amount of selected from token
	const amountWithDecimals = BigNumber(debouncedAmount && debouncedAmount !== '' ? debouncedAmount : '0')
		.times(BigNumber(10).pow(finalSelectedFromToken?.decimals || 18))
		.toFixed(0);
	const amountOutWithDecimals = BigNumber(debouncedAmountOut && debouncedAmountOut !== '' ? debouncedAmountOut : '0')
		.times(BigNumber(10).pow(finalSelectedToToken?.decimals || 18))
		.toFixed(0);

	// saved tokens list
	const savedTokens = useGetSavedTokens(selectedChain?.id);

	// selected from token's balances
	const balance = useBalance({ address, token: finalSelectedFromToken?.address, chainId: selectedChain?.id });

	// selected from token's balances
	const toTokenBalance = useBalance({ address, token: finalSelectedToToken?.address, chainId: selectedChain?.id });

	const { data: tokenPrices, isLoading: fetchingTokenPrices } = useGetPrice({
		chain: selectedChain?.value,
		toToken: finalSelectedToToken?.address || (() => {
			const isCurrentlyFiatCurrency = toTokenAddress && fiatCurrencyMappings && fiatCurrencyMappings[toTokenAddress];
			if (isCurrentlyFiatCurrency && toTokenAddress && selectedChain) {
				// Get the first stablecoin for this fiat currency as representative price
				const chainId = {
					'ethereum': 1, 'bsc': 56, 'polygon': 137, 'optimism': 10, 'arbitrum': 42161, 'avax': 43114,
					'gnosis': 100, 'fantom': 250, 'klaytn': 8217, 'aurora': 1313161554, 'celo': 42220
				}[selectedChain.value];
				const stablecoins = fiatCurrencyMappings[toTokenAddress]?.[chainId];
				return stablecoins?.[0]; // Use first stablecoin as representative
			}
			return undefined;
		})(),
		fromToken: finalSelectedFromToken?.address
	});

	const { gasTokenPrice, toTokenPrice, fromTokenPrice, gasPriceData } = tokenPrices || {};

	// Create a placeholder token object for fiat currencies when finalSelectedToToken is null
	const effectiveToToken = finalSelectedToToken || (toTokenAddress && fiatCurrencyMappings[toTokenAddress] ? {
		address: toTokenAddress,
		symbol: toTokenAddress,
		name: toTokenAddress,
		decimals: 6,
		logoURI: '',
		chainId: selectedChain?.id || 1,
		label: toTokenAddress,
		value: toTokenAddress
	} : {
		// Default fallback token when neither finalSelectedToToken nor fiat currency is available
		address: '',
		symbol: 'Unknown',
		name: 'Unknown Token',
		decimals: 18,
		logoURI: '',
		chainId: selectedChain?.id || 1,
		label: 'Unknown',
		value: ''
	});

	const {
		data: routes = [],
		isLoading,
		refetch,
		lastFetched,
		loadingRoutes,
		isFiatCurrency
	} = useGetRoutesWithFiatSupport({
		chain: selectedChain?.value,
		from: finalSelectedFromToken?.value,
		to: toTokenAddress || finalSelectedToToken?.value, // Use URL parameter for fiat currency detection
		amount: amountWithDecimals,
		disabledAdapters,
		extra: {
			gasPriceData,
			userAddress: address || zeroAddress,
			amount: debouncedAmount,
			fromToken: finalSelectedFromToken,
			toToken: effectiveToToken,
			slippage,
			isPrivacyEnabled,
			amountOut: amountOutWithDecimals
		},
		fiatCurrencyMappings,
		chainTokenList
	});

	const { data: gasData } = useEstimateGas({
		routes,
		token: finalSelectedFromToken?.address,
		userAddress: address,
		chain: selectedChain?.value,
		balance: balance?.data?.value ? Number(balance.data.value) : null,
		isOutput: amountOut && amountOut !== '' ? true : false
	});

	// format routes
	const fillRoute = (route: IRoute) => {
		// For fiat currency routes, use effectiveToToken instead of finalSelectedToToken
		const targetToken = finalSelectedToToken || effectiveToToken;

		if (!route.price || !finalSelectedFromToken || !targetToken) return null;

		const gasEstimation = gasData?.[route.name]?.gas ?? route.price.estimatedGas;

		let gasUsd: number | string = gasPriceData?.gasPrice
			? ((gasTokenPrice ?? 0) * gasEstimation * gasPriceData.gasPrice) / 1e18 || 0
			: 0;

		// CowSwap native token swap
		gasUsd =
			route.price.feeAmount && finalSelectedFromToken.address === zeroAddress
				? (route.price.feeAmount / 1e18) * (gasTokenPrice ?? 0) + gasUsd
				: gasUsd;

		gasUsd = route.l1Gas !== 'Unknown' && route.l1Gas ? route.l1Gas * (gasTokenPrice ?? 0) + gasUsd : gasUsd;

		gasUsd = route.l1Gas === 'Unknown' ? 'Unknown' : gasUsd;

		// For fiat currency routes, resolve the actual stablecoin information
		let actualToToken = targetToken;
		const enhancedRoute = route as any;
		if (enhancedRoute.isFiatCurrencyRoute && enhancedRoute.targetToken) {
			const stablecoinInfo = chainTokenList?.[enhancedRoute.targetToken.toLowerCase()];
			if (stablecoinInfo) {
				actualToToken = stablecoinInfo;
			} else {
				// Try fallback stablecoin info
				const fallbackInfo = fallbackStablecoinInfo[enhancedRoute.targetToken.toLowerCase()];
				if (fallbackInfo) {
					actualToToken = fallbackInfo;
				}
			}
		}

		const amount = +route.price.amountReturned / 10 ** +actualToToken?.decimals;
		const amountIn = (+route.fromAmount / 10 ** +finalSelectedFromToken?.decimals).toFixed(
			finalSelectedFromToken?.decimals
		);

		const amountUsd = toTokenPrice ? (amount * toTokenPrice).toFixed(2) : null;
		const amountInUsd = fromTokenPrice ? (+amountIn * fromTokenPrice).toFixed(6) : null;

		const netOut = amountUsd ? (route.l1Gas !== 'Unknown' ? +amountUsd - +gasUsd : +amountUsd) : amount;

		return {
			...route,
			isFailed: gasData?.[route.name]?.isFailed || false,
			route,
			gasUsd: gasUsd === 0 && route.name !== 'CowSwap' && !route.isGasless ? 'Unknown' : gasUsd,
			amountUsd,
			amount,
			netOut,
			amountIn,
			amountInUsd,
			actualToToken
		} as IFinalRoute;
	};

	const allRoutes = [...(routes || [])].map(fillRoute).filter((r) => (r ? true : false)) as Array<IFinalRoute>;
	const failedRoutes = allRoutes.filter((r) => r!.isFailed === true);

	let normalizedRoutes = allRoutes
		.filter(
			({ fromAmount, amount: toAmount, isFailed }) =>
				(amountOutWithDecimals === '0' ? Number(toAmount) && amountWithDecimals === fromAmount : true) &&
				isFailed !== true
		)
		.sort((a, b) => {
			if (a.gasUsd === 'Unknown') {
				return 1;
			} else if (b.gasUsd === 'Unknown') {
				return -1;
			}
			return isOutputTrade
				? typeof a.amountInUsd === 'number' &&
					typeof a.gasUsd === 'number' &&
					typeof b.amountInUsd === 'number' &&
					typeof b.gasUsd === 'number'
					? a.amountInUsd + a.gasUsd - (b.amountInUsd + b.gasUsd)
					: Number(a.amountIn) - Number(b.amountIn)
				: b.netOut - a.netOut; // Sort by netOut (amount after gas fees) in descending order
		})
		.map((route, i, arr) => ({ ...route, lossPercent: route.netOut / arr[0].netOut }));

	const selecteRouteIndex =
		aggregator && normalizedRoutes && normalizedRoutes.length > 0
			? normalizedRoutes.findIndex((r) => r.name === aggregator)
			: -1;

	// store selected aggregators route
	const selectedRoute =
		selecteRouteIndex >= 0 ? { ...normalizedRoutes[selecteRouteIndex], index: selecteRouteIndex } : null;

	const diffBetweenSelectedRouteAndTopRoute =
		selectedRoute?.amount && normalizedRoutes?.[0]?.amount
			? Number((100 - (selectedRoute.amount / normalizedRoutes[0].amount) * 100).toFixed(2))
			: 0;

	// functions to handle change in swap input fields
	const onMaxClick = () => {
		if (balance.data && balance.data.formatted && !Number.isNaN(Number(balance.data.formatted))) {
			if (
				selectedRoute?.price?.estimatedGas &&
				gasPriceData?.gasPrice &&
				finalSelectedFromToken?.address === zeroAddress
			) {
				const gas = (+selectedRoute.price!.estimatedGas * gasPriceData.gasPrice * 2) / 1e18;

				const amountWithoutGas = +balance.data.formatted - gas;

				setAmount([amountWithoutGas, '']);
			} else {
				setAmount([balance.data.formatted === '0.0' ? 0 : balance.data.formatted, '']);
			}
		}
	};
	const onChainChange = (newChain) => {
		setAggregator(null);
		setAmount(['10', '']);

		// Preserve fiat currency selection when switching chains
		const currentTo = router.query.to;
		const isFiatCurrency = currentTo && (currentTo === 'USD' || currentTo === 'EUR');

		router
			.push(
				{
					pathname: '/',
					query: {
						...router.query,
						chain: newChain.value,
						from: zeroAddress,
						to: isFiatCurrency ? currentTo : undefined
					}
				},
				undefined,
				{ shallow: true }
			)
			.then(() => {
				if (switchChain) switchChain({ chainId: newChain.chainId });
			});
	};
	const onFromTokenChange = (token) => {
		setAggregator(null);
		router.push({ pathname: router.pathname, query: { ...router.query, from: token.address } }, undefined, {
			shallow: true
		});
	};
	const onToTokenChange = (token) => {
		setAggregator(null);
		router.push({ pathname: router.pathname, query: { ...router.query, to: token?.address || undefined } }, undefined, {
			shallow: true
		});
	};

	useEffect(() => {
		const isUnknown =
			selectedToToken === null &&
			finalSelectedToToken !== null &&
			savedTokens &&
			toTokenAddress &&
			!savedTokens[toTokenAddress.toLowerCase()];

		if (isUnknown && toTokenAddress && savedTokens?.length > 1) {
			onToTokenChange(undefined);
		}
	}, [router?.query, savedTokens]);

	useEffect(() => {
		if (selectedRoute?.amount && aggregator) {
			if (
				lastOutputValue !== null &&
				aggregator === lastOutputValue.aggregator &&
				selectedRoute.amount / lastOutputValue.amount <= 0.94 // >=6% drop
			) {
				setAggregator(null);
			}
			setLastOutputValue({
				aggregator,
				amount: selectedRoute.amount
			});
		}
	}, [selectedRoute?.amount, aggregator]);

	// Calculate price impact for the best route (for TO input display)
	const bestRoutesPriceImpact =
		normalizedRoutes[0] &&
			normalizedRoutes[0].netOut &&
			(debouncedAmount || debouncedAmountOut)
			? 0 // Best route has 0% price impact by definition
			: null;

	const selectedRoutesPriceImpact =
		normalizedRoutes[0] &&
			normalizedRoutes[0].netOut &&
			selectedRoute &&
			selectedRoute.netOut &&
			(debouncedAmount || debouncedAmountOut) &&
			selectedRoute.netOut > 0
			? ((selectedRoute.netOut / normalizedRoutes[0].netOut) - 1) * 100
			: null;

	const hasPriceImapct =
		selectedRoutesPriceImpact === null || Number(selectedRoutesPriceImpact) > PRICE_IMPACT_WARNING_THRESHOLD;
	const hasMaxPriceImpact = selectedRoutesPriceImpact !== null && Number(selectedRoutesPriceImpact) > 30;

	const insufficientBalance =
		balance.isSuccess &&
			balance.data &&
			!Number.isNaN(Number(balance.data.formatted)) &&
			balance.data.value &&
			selectedRoute?.fromAmount
			? +selectedRoute.fromAmount > Number(balance.data.value)
			: false;

	const slippageIsWorng = Number.isNaN(Number(slippage)) || slippage === '';

	const forceRefreshTokenBalance = () => {
		if (chainOnWallet && address) {
			balance?.refetch();
			toTokenBalance?.refetch();
		}
	};

	// approve/swap tokens
	const amountToApprove =
		amountOut && amountOut !== '' && selectedRoute?.fromAmount
			? BigNumber(selectedRoute.fromAmount)
				.times(100 + Number(slippage) * 2)
				.div(100)
				.toFixed(0)
			: selectedRoute?.fromAmount;

	const isGaslessApproval = selectedRoute?.price?.isGaslessApproval ?? false;

	const {
		isApproved: isTokenApproved,
		approve,
		approveInfinite,
		approveReset,
		isLoading: isApproveLoading,
		isInfiniteLoading: isApproveInfiniteLoading,
		isResetLoading: isApproveResetLoading,
		isConfirmingApproval,
		isConfirmingInfiniteApproval,
		isConfirmingResetApproval,
		shouldRemoveApproval,
		allowance,
		errorFetchingAllowance,
		refetch: refetchTokenAllowance
	} = useTokenApprove({
		token: finalSelectedFromToken?.address as `0x${string}`,
		spender:
			selectedRoute && selectedRoute.price && !isGaslessApproval ? selectedRoute.price.tokenApprovalAddress : null,
		amount: amountToApprove,
		chain: selectedChain?.value
	});

	const { data: capabilities } = useCapabilities();

	const isEip5792 =
		selectedRoute &&
			!['CowSwap', '0x Gasless'].includes(selectedRoute.name) &&
			selectedChain &&
			capabilities?.[selectedChain.id]?.atomic?.status
			? capabilities[selectedChain.id].atomic!.status === 'supported'
			: false;

	const gaslessApprovalMutation = useMutation({
		mutationFn: (params: { adapter: string; rawQuote: any; isInfiniteApproval: boolean }) => gaslessApprove(params)
	});

	const isApproved = selectedRoute?.price
		? selectedRoute.isGasless
			? (selectedRoute.price.rawQuote as any).approval.isRequired
				? (selectedRoute.price.rawQuote as any).approval.isGaslessAvailable
					? gaslessApprovalMutation.data
						? true
						: false
					: isTokenApproved
				: true
			: selectedRoute.price.tokenApprovalAddress === null
				? true
				: isEip5792
					? true
					: isTokenApproved
		: false;

	const isUSDTNotApprovedOnEthereum =
		selectedChain && finalSelectedFromToken && selectedChain.id === 1 && shouldRemoveApproval ? true : false;

	const signatureForSwapMutation = useMutation({
		mutationFn: (params: { adapter: string; signTypedDataAsync: typeof signTypedDataAsync; rawQuote: any }) =>
			signatureForSwap(params)
	});

	const handleSignatureForMutation = () => {
		if (selectedRoute) {
			signatureForSwapMutation.mutate({
				signTypedDataAsync,
				adapter: selectedRoute.name,
				rawQuote: selectedRoute.price.rawQuote
			});
		}
	};

	const { data: bytecode } = useBytecode({
		address,
		chainId: selectedChain?.id
	});

	const swapMutation = useMutation({
		mutationFn: (params: {
			chain: string;
			from: string;
			to: string;
			amount: string | number;
			fromAmount: string | number;
			amountIn: string;
			adapter: string;
			fromAddress: string;
			slippage: string;
			rawQuote: any;
			tokens: { toToken: IToken; fromToken: IToken };
			index: number;
			route: any;
			approvalData: any;
			eip5792: { shouldRemoveApproval: boolean; isTokenApproved: boolean } | null;
			signature: any;
			isSmartContractWallet: boolean;
		}) => swap(params),
		onSuccess: (data, variables) => {
			let txUrl;
			if (typeof data !== 'string' && data.gaslessTxReceipt) {
				gaslessApprovalMutation.reset();
				const isSuccess =
					data.gaslessTxReceipt.status === 'confirmed' ||
					data.gaslessTxReceipt.status === 'submitted' ||
					data.gaslessTxReceipt.status === 'succeeded';
				if (isSuccess) {
					toast(formatSuccessToast(variables));
					const transactions = data.gaslessTxReceipt.transactions;
					const hash = transactions[transactions.length - 1]?.hash;
					if (hash) {
						addRecentTransaction({
							hash: hash,
							description: `Swap transaction using ${variables.adapter} is sent.`
						});
						if (chainOnWallet?.blockExplorers) {
							const explorerUrl = chainOnWallet.blockExplorers.default.url;
							setTxModalOpen(true);
							txUrl = `${explorerUrl}/tx/${hash}`;
							setTxUrl(txUrl);
						}
					}
				} else if (data.gaslessTxReceipt.status === 'pending') {
					toast(formatSubmittedToast(variables));
				} else {
					toast(formatErrorToast({ reason: data.gaslessTxReceipt.reason }, false));
				}
				forceRefreshTokenBalance();

				sendSwapEvent({
					chain: selectedChain?.value ?? 'unknown',
					user: address ?? 'unknown',
					from: variables.from,
					to: variables.to,
					aggregator: variables.adapter,
					isError: isSuccess || data.gaslessTxReceipt.status === 'pending',
					quote: variables.rawQuote,
					txUrl,
					amount: String(variables.amountIn),
					amountUsd: fromTokenPrice ? +fromTokenPrice * +variables.amountIn || 0 : null,
					errorData: data,
					slippage,
					routePlace: String(variables?.index),
					route: variables.route
				});

				return;
			}

			if (typeof data === 'string') {
				addRecentTransaction({
					hash: data,
					description: `Swap transaction using ${variables.adapter} is sent.`
				});

				if (chainOnWallet?.blockExplorers) {
					const explorerUrl = chainOnWallet.blockExplorers.default.url;
					setTxModalOpen(true);
					txUrl = `${explorerUrl}/tx/${data}`;
					setTxUrl(txUrl);
				}

				confirmingTxToastRef.current = toast({
					title: 'Confirming Transaction',
					description: '',
					status: 'loading',
					isClosable: true,
					position: 'top-right'
				});

				let isError = false;
				const balanceBefore = toTokenBalance?.data?.formatted;

				waitForTransactionReceipt(config, {
					hash: data as `0x${string}`
				})
					.then((final) => {
						if (final.status === 'success') {
							forceRefreshTokenBalance();

							if (confirmingTxToastRef.current) {
								toast.close(confirmingTxToastRef.current);
							}

							toast(formatSuccessToast(variables));

							setAmount(['', '']);
						} else {
							isError = true;
							toast(formatErrorToast({}, true));
						}
					})
					?.catch((err) => {
						console.log(err);
						isError = true;
						toast(formatErrorToast({}, true));
					})
					?.finally(() => {
						if (selectedChain && finalSelectedToToken && address) {
							getTokenBalance({ address, chainId: selectedChain.id, token: finalSelectedToToken.address }).then(
								(balanceAfter) =>
									sendSwapEvent({
										chain: selectedChain.value,
										user: address,
										from: variables.from,
										to: variables.to,
										aggregator: variables.adapter,
										isError,
										quote: variables.rawQuote,
										txUrl,
										amount: String(variables.amountIn),
										amountUsd: fromTokenPrice ? +fromTokenPrice * +variables.amountIn || 0 : null,
										errorData: {},
										slippage,
										routePlace: String(variables?.index),
										route: variables.route,
										reportedOutput: Number(variables.amount) || 0,
										realOutput: Number(balanceAfter?.formatted) - Number(balanceBefore) || 0
									})
							);
						}
					});

				return;
			}

			if (data.id && data.waitForOrder) {
				setTxModalOpen(true);
				txUrl = `https://explorer.cow.fi/orders/${data.id}`;
				setTxUrl(txUrl);
				data.waitForOrder(() => {
					forceRefreshTokenBalance();

					toast(formatSuccessToast(variables));

					sendSwapEvent({
						chain: selectedChain?.value ?? 'unknown',
						user: address ?? 'unknown',
						from: variables.from,
						to: variables.to,
						aggregator: variables.adapter,
						isError: false,
						quote: variables.rawQuote,
						txUrl,
						amount: String(variables.amountIn),
						amountUsd: fromTokenPrice ? +fromTokenPrice * +variables.amountIn || 0 : null,
						errorData: {},
						slippage,
						routePlace: String(variables?.index),
						route: variables.route
					});
				});

				setAmount(['', '']);

				return;
			}

			if (typeof data === 'object' && data.id) {
				//eip5792
				confirmingTxToastRef.current = toast({
					title: 'Confirming Transaction',
					description: '',
					status: 'loading',
					isClosable: true,
					position: 'top-right'
				});

				let isError = false;
				const balanceBefore = toTokenBalance?.data?.formatted;

				waitForCallsStatus(config, {
					id: data.id as `0x${string}`
				})
					.then((final) => {
						if (final.status === 'success') {
							forceRefreshTokenBalance();

							if (confirmingTxToastRef.current) {
								toast.close(confirmingTxToastRef.current);
							}

							toast(formatSuccessToast(variables));

							setAmount(['', '']);
						} else {
							isError = true;
							toast(formatErrorToast({}, true));
						}

						if (final.receipts && final.receipts.length > 0) {
							const txHashRegex = /^0x[a-fA-F0-9]{64}$/;
							const hash = final.receipts.find((r) => txHashRegex.test(r.transactionHash))?.transactionHash ?? null;
							if (chainOnWallet?.blockExplorers && hash) {
								const explorerUrl = chainOnWallet.blockExplorers.default.url;
								setTxModalOpen(true);
								txUrl = `${explorerUrl}/tx/${hash}`;
								setTxUrl(txUrl);
								addRecentTransaction({
									hash,
									description: `Swap transaction using ${variables.adapter} is sent.`
								});
							}
						}
					})
					?.catch((err) => {
						console.log(err);
						isError = true;
						toast(formatErrorToast({}, true));
					})
					?.finally(() => {
						if (selectedChain && finalSelectedToToken && address) {
							getTokenBalance({ address, chainId: selectedChain.id, token: finalSelectedToToken.address }).then(
								(balanceAfter) =>
									sendSwapEvent({
										chain: selectedChain.value,
										user: address,
										from: variables.from,
										to: variables.to,
										aggregator: variables.adapter,
										isError,
										quote: variables.rawQuote,
										txUrl,
										amount: String(variables.amountIn),
										amountUsd: fromTokenPrice ? +fromTokenPrice * +variables.amountIn || 0 : null,
										errorData: {},
										slippage,
										routePlace: String(variables?.index),
										route: variables.route,
										reportedOutput: Number(variables.amount) || 0,
										realOutput: Number(balanceAfter?.formatted) - Number(balanceBefore) || 0
									})
							);
						}
					});

				return;
			}

			signatureForSwapMutation.reset();
		},
		onError: (err: { reason: string; code: string }, variables) => {
			console.log(err)
			if (err.code !== 'ACTION_REJECTED' || err.code.toString() === '-32603') {
				toast(formatErrorToast(err, false));

				sendSwapEvent({
					chain: selectedChain?.value ?? 'unknown',
					user: address ?? 'unknown',
					from: variables.from,
					to: variables.to,
					aggregator: variables.adapter,
					isError: true,
					quote: variables.rawQuote,
					txUrl: '',
					amount: String(variables.amountIn),
					amountUsd: fromTokenPrice ? +fromTokenPrice * +variables.amountIn || 0 : null,
					errorData: err,
					slippage,
					routePlace: String(variables?.index),
					route: variables.route
				});
			}
		}
	});

	const handleSwap = () => {
		if (
			selectedRoute &&
			selectedRoute.price &&
			!slippageIsWorng &&
			selectedChain &&
			finalSelectedFromToken &&
			finalSelectedToToken &&
			address
		) {
			if (hasMaxPriceImpact && !isDegenModeEnabled) {
				toast({
					title: 'Price impact is too high!',
					description: 'Swap is blocked, please try another route.',
					status: 'error'
				});
				return;
			}

			if (
				selectedRoute.price.isSignatureNeededForSwap
					? (selectedRoute.price.rawQuote as any).permit2
						? signatureForSwapMutation.data
							? false
							: true
						: false
					: false
			) {
				toast({
					title: 'Signature needed for swap',
					description: 'Swap is blocked, please try another route.',
					status: 'error'
				});
				return;
			}

			swapMutation.mutate({
				chain: selectedChain.value,
				from: finalSelectedFromToken.value,
				to: finalSelectedToToken.value,
				fromAddress: address,
				slippage,
				adapter: selectedRoute.name,
				rawQuote: selectedRoute.price.rawQuote,
				tokens: { fromToken: finalSelectedFromToken, toToken: finalSelectedToToken },
				index: selectedRoute.index,
				route: selectedRoute,
				amount: selectedRoute.amount,
				amountIn: selectedRoute.amountIn,
				fromAmount: selectedRoute.fromAmount,
				approvalData: gaslessApprovalMutation?.data ?? {},
				eip5792: isEip5792 ? { shouldRemoveApproval: shouldRemoveApproval ? true : false, isTokenApproved } : null,
				signature: signatureForSwapMutation?.data,
				isSmartContractWallet: (bytecode && bytecode !== '0x') ? true : false
			});
		}
	};

	const handleGaslessApproval = ({ isInfiniteApproval }: { isInfiniteApproval: boolean }) => {
		if (selectedRoute?.price) {
			gaslessApprovalMutation.mutate({
				adapter: selectedRoute.name,
				rawQuote: selectedRoute.price.rawQuote,
				isInfiniteApproval
			});
		}
	};

	const isAmountSynced = debouncedAmount === formatAmount(amount) && formatAmount(amountOut) === debouncedAmountOut;
	const isUnknownPrice = !fromTokenPrice || !toTokenPrice;
	const isPriceImpactNotKnown = !bestRoutesPriceImpact && bestRoutesPriceImpact !== 0;

	const warnings = [
		aggregator === 'CowSwap' ? (
			<>
				{finalSelectedFromToken?.value === zeroAddress && Number(slippage) < 2 ? (
					<Alert status="warning" borderRadius="0.375rem" py="8px" key="cow1">
						<AlertIcon />
						Swaps from {finalSelectedFromToken.symbol} on CoW Swap need to have slippage higher than{' '}
						{selectedChain?.value ? cowSwapEthFlowSlippagePerChain[selectedChain?.value] : 2}%.
					</Alert>
				) : null}
				<Alert status="warning" borderRadius="0.375rem" py="8px" key="cow2">
					<AlertIcon />
					CoW Swap orders are fill-or-kill, so they may not execute if price moves quickly against you.
					{finalSelectedFromToken?.value === zeroAddress ? (
						<>
							<br /> For ETH orders, if it doesn't get executed the ETH will be returned to your wallet in 30 minutes.
						</>
					) : null}
				</Alert>
			</>
		) : null,
		diffBetweenSelectedRouteAndTopRoute > 5 && (
			<Alert status="warning" borderRadius="0.375rem" py="8px" key="diff">
				<AlertIcon />
				{`There is ${diffBetweenSelectedRouteAndTopRoute}% difference between selected route and top route.`}
			</Alert>
		),
		!isLoading && !isPriceImpactNotKnown && selectedRoutesPriceImpact !== null && selectedRoutesPriceImpact >= PRICE_IMPACT_WARNING_THRESHOLD ? (
			<Alert status="warning" borderRadius="0.375rem" py="8px" key="impact">
				<AlertIcon />
				High price impact! More than {selectedRoutesPriceImpact.toFixed(2)}% drop.
			</Alert>
		) : null,
		!isLoading && toTokenPrice && Number(selectedRoute?.amount) * toTokenPrice > 100e3 ? (
			<Alert status="warning" borderRadius="0.375rem" py="8px" key="size">
				<AlertIcon />
				Your size is size. Please be mindful of slippage
			</Alert>
		) : null
	].filter(Boolean);

	return (
		<>
			<Wrapper>
				{isSettingsModalOpen ? (
					<Settings
						adapters={adaptersNames}
						disabledAdapters={disabledAdapters}
						setDisabledAdapters={setDisabledAdapters}
						onClose={() => setSettingsModalOpen(false)}
						slippage={slippage}
						setSlippage={setSlippage}
						finalSelectedFromToken={finalSelectedFromToken}
						finalSelectedToToken={finalSelectedToToken}
					/>
				) : null}

				<BodyWrapper>
					<Body>
						<div>
							<FormHeader>
								<Flex width="100%" justifyContent="flex-end">
									<SettingsIcon onClick={() => setSettingsModalOpen((open) => !open)} ml={4} mt={1} cursor="pointer" />
									{isSmallScreen && finalSelectedFromToken && finalSelectedToToken ? (
										<ArrowForwardIcon
											width={'24px'}
											height={'24px'}
											ml="16px"
											cursor={'pointer'}
											onClick={() => setUiState(STATES.ROUTES)}
										/>
									) : null}
								</Flex>
							</FormHeader>

							<ReactSelect options={chains} value={selectedChain} onChange={onChainChange} />
						</div>

						<Flex flexDir="row" gap="40px" pos="relative">
							<InputAmountAndTokenSelect
								placeholder={normalizedRoutes[0]?.amountIn}
								setAmount={setAmount}
								type="amountIn"
								amount={selectedRoute?.amountIn && amountOut !== '' ? selectedRoute.amountIn : amount}
								onSelectTokenChange={onFromTokenChange}
								balance={balance.data?.formatted}
								onMaxClick={onMaxClick}
								tokenPrice={fromTokenPrice}
							/>

							<SwapInputArrow
								onClick={() =>
									router.push(
										{
											pathname: router.pathname,
											query: { ...router.query, to: finalSelectedFromToken?.address, from: finalSelectedToToken?.address }
										},
										undefined,
										{ shallow: true }
									)
								}
							/>

							<InputAmountAndTokenSelect
								placeholder={normalizedRoutes[0]?.amount}
								setAmount={setAmount}
								type="amountOut"
								amount={normalizedRoutes[0]?.amount && amount !== '' ? normalizedRoutes[0].amount : amountOut}
								onSelectTokenChange={onToTokenChange}
								balance={toTokenBalance.data?.formatted}
								tokenPrice={toTokenPrice}
								priceImpact={bestRoutesPriceImpact}
							/>
						</Flex>

						<PriceImpact
							isLoading={isLoading || fetchingTokenPrices}
							fromTokenPrice={fromTokenPrice}
							fromToken={finalSelectedFromToken}
							toTokenPrice={toTokenPrice}
							toToken={finalSelectedToToken}
							amountReturnedInSelectedRoute={normalizedRoutes[0] && normalizedRoutes[0].price && normalizedRoutes[0].price.amountReturned}
							selectedRoutesPriceImpact={bestRoutesPriceImpact}
							amount={normalizedRoutes[0]?.amountIn}
							slippage={slippage}
							isPriceImpactNotKnown={isPriceImpactNotKnown}
						/>
						<Box display={['none', 'none', 'flex', 'flex']} flexDirection="column" gap="4px">
							{warnings}
						</Box>

						<SwapWrapper>
							<>
								{failedRoutes.length > 0 ? (
									<Alert status="warning" borderRadius="0.375rem" py="8px" mt="-14px" mb="16px">
										<AlertIcon />
										{`Routes for aggregators ${failedRoutes
											.map((r) => r.name)
											.join(', ')} have been hidden since they could not be executed`}
									</Alert>
								) : null}
							</>

							{!isConnected ? (
								<GradientButton onClick={openConnectModal}>
									CONNECT WALLET
								</GradientButton>
							) : !isValidSelectedChain ? (
								<GradientButton
									onClick={() => {
										if (selectedChain) {
											switchChain({ chainId: selectedChain.id });
										} else {
											toast(
												formatUnknownErrorToast({
													title: 'Failed to switch network',
													message: 'Selected chain is invalid'
												})
											);
										}
									}}
								>
									Switch Network
								</GradientButton>
							) : insufficientBalance ? (
								<GradientButton aria-disabled>
									Insufficient Balance
								</GradientButton>
							) : !selectedRoute && isSmallScreen && finalSelectedFromToken && finalSelectedToToken ? (
								<GradientButton onClick={() => setUiState(STATES.ROUTES)}>
									Select Aggregator
								</GradientButton>
							) : hasMaxPriceImpact && !isDegenModeEnabled ? (
								<GradientButton aria-disabled>
									Price impact is too large
								</GradientButton>
							) : (
								<>
									{router && address && (
										<>
											<>
												{isUSDTNotApprovedOnEthereum && finalSelectedFromToken && (
													<Flex flexDir="column" gap="4px" w="100%">
														<Text fontSize="0.75rem" fontWeight={400}>
															{`${finalSelectedFromToken.symbol
																} uses an old token implementation that requires resetting approvals if there's a
																previous approval, and you currently have an approval for ${(
																	Number(allowance) /
																	10 ** finalSelectedFromToken.decimals
																).toFixed(2)} ${finalSelectedFromToken?.symbol} for this contract, you
																need to reset your approval and approve again`}
														</Text>
														<Button
															isLoading={isApproveResetLoading}
															loadingText={isConfirmingResetApproval ? 'Confirming' : 'Preparing transaction'}
															colorScheme={'messenger'}
															onClick={() => {
																if (approveReset) approveReset();
															}}
															aria-disabled={isApproveResetLoading || !selectedRoute}
														>
															Reset Approval
														</Button>
													</Flex>
												)}

												{selectedRoute &&
													isApproved &&
													!isGaslessApproval &&
													selectedRoute.price.isSignatureNeededForSwap &&
													(selectedRoute.price.rawQuote as any).permit2 ? (
													<Button
														isLoading={signatureForSwapMutation.isPending}
														loadingText={'Confirming'}
														colorScheme={'messenger'}
														onClick={() => {
															handleSignatureForMutation();
														}}
														disabled={signatureForSwapMutation.isPending || signatureForSwapMutation.data}
													>
														Sign
													</Button>
												) : null}

												{(hasPriceImapct || isUnknownPrice) && !isLoading && selectedRoute && isApproved ? (
													<SwapConfirmation
														isUnknownPrice={isUnknownPrice}
														handleSwap={handleSwap}
														isMaxPriceImpact={hasMaxPriceImpact}
													/>
												) : (
													<Button
														isLoading={
															swapMutation.isPending ||
															isApproveLoading ||
															(gaslessApprovalMutation.isPending &&
																!gaslessApprovalMutation.variables.isInfiniteApproval)
														}
														loadingText={
															isConfirmingApproval ||
																(gaslessApprovalMutation.isPending &&
																	!gaslessApprovalMutation.variables.isInfiniteApproval)
																? 'Confirming'
																: 'Preparing transaction'
														}
														colorScheme={'messenger'}
														onClick={() => {
															if (!isApproved && isGaslessApproval) {
																handleGaslessApproval({ isInfiniteApproval: false });
																return;
															}

															if (!isEip5792 && approve) approve();

															if (
																balance.data &&
																!Number.isNaN(Number(balance.data.formatted)) &&
																selectedRoute &&
																+selectedRoute.amountIn > +balance.data.formatted
															)
																return;

															if (isApproved) handleSwap();
														}}
														aria-disabled={
															isUSDTNotApprovedOnEthereum ||
															swapMutation.isPending ||
															gaslessApprovalMutation.isPending ||
															isApproveLoading ||
															isApproveResetLoading ||
															!selectedRoute ||
															slippageIsWorng ||
															!isAmountSynced ||
															signatureForSwapMutation.isPending ||
															(selectedRoute.price.isSignatureNeededForSwap
																? (selectedRoute.price.rawQuote as any).permit2
																	? isApproved
																		? signatureForSwapMutation.data
																			? false
																			: true
																		: false
																	: false
																: false)
														}
													>
														{!selectedRoute
															? 'Select Aggregator'
															: isApproved
																? `Swap via ${selectedRoute?.name}`
																: slippageIsWorng
																	? 'Set Slippage'
																	: 'Approve'}
													</Button>
												)}

												{!isApproved && selectedRoute && inifiniteApprovalAllowed.includes(selectedRoute.name) && (
													<Button
														colorScheme={'messenger'}
														loadingText={
															isConfirmingInfiniteApproval ||
																(gaslessApprovalMutation.isPending &&
																	gaslessApprovalMutation.variables.isInfiniteApproval)
																? 'Confirming'
																: 'Preparing transaction'
														}
														isLoading={
															isApproveInfiniteLoading ||
															(gaslessApprovalMutation.isPending &&
																gaslessApprovalMutation.variables.isInfiniteApproval)
														}
														onClick={() => {
															if (!isApproved && isGaslessApproval) {
																handleGaslessApproval({ isInfiniteApproval: true });
																return;
															}

															if (approveInfinite) approveInfinite();
														}}
														aria-disabled={
															isUSDTNotApprovedOnEthereum ||
															swapMutation.isPending ||
															gaslessApprovalMutation.isPending ||
															isApproveLoading ||
															isApproveResetLoading ||
															isApproveInfiniteLoading ||
															!selectedRoute
														}
													>
														{'Approve Infinite'}
													</Button>
												)}

												{!isApproved && selectedRoute ? (
													<Tooltip2 content="Already approved? Click to refetch token allowance">
														<Button
															colorScheme={'messenger'}
															width={'24px'}
															padding={'4px'}
															onClick={() => refetchTokenAllowance?.()}
														>
															<RepeatIcon w="16px	" h="16px" />
														</Button>
													</Tooltip2>
												) : null}
											</>
										</>
									)}
								</>
							)}
						</SwapWrapper>
						{errorFetchingAllowance ? (
							<Text textAlign={'center'} color="red.500">
								{errorFetchingAllowance instanceof Error ? errorFetchingAllowance.message : 'Failed to fetch allowance'}
							</Text>
						) : null}

						<Disclaimer>
							<p>Powered by</p>
							<Image src={iconLlamaswap.src} alt="Llamaswap" />
							<div style={{
								display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '16px', position: 'absolute', top: '0', left: '0', width: '60%',
								height: '100%', backgroundColor: '#F1F4F8', borderRadius: '20px', padding: '30px'
							}}>
								<Image src={iconDisclaimer.src} alt="Disclaimer" />
								<p>Our converter uses the mid-market rate for reference only. It's provided for informational purposes — actual rates may vary when you make a transaction.</p>
							</div>
						</Disclaimer>
					</Body>

					<ConversionChart
						fromToken={finalSelectedFromToken}
						toToken={finalSelectedToToken || (effectiveToToken ? { ...effectiveToToken, geckoId: null } : null)}
						chain={selectedChain?.value}
					/>
					<FundingOptions
						onTokenSelect={onFromTokenChange}
						selectedRoute={selectedRoute}
						normalizedRoutes={normalizedRoutes}
					/>

					<StablecoinSettlementWrapper>
						<Image src={iconStablecoinSettlement.src} alt="Stablecoin Settlement" style={{ marginBottom: '16px' }} />
						<Text fontSize="48px" fontWeight="bold">Stablecoin Settlement</Text>
					</StablecoinSettlementWrapper>

					<Routes ref={routesRef} visible={uiState === STATES.ROUTES}>
						<ArrowBackIcon
							width={'24px'}
							height="24px"
							position={'absolute'}
							mb="4px"
							onClick={() => setUiState(STATES.INPUT)}
							display={['flex', 'flex', 'none', 'none']}
							cursor="pointer"
						/>
						{isLoading &&
							(debouncedAmount || debouncedAmountOut) &&
							finalSelectedFromToken &&
							(finalSelectedToToken || effectiveToToken) &&
							!(disabledAdapters.length === adaptersNames.length) ? (
							<Loader />
						) : (!debouncedAmount && !debouncedAmountOut) ||
							!finalSelectedFromToken ||
							(!finalSelectedToToken && !effectiveToToken) ||
							!router.isReady ||
							disabledAdapters.length === adaptersNames.length ? (
							<RoutesPreview />
						) : null}

						{normalizedRoutes?.length ? (
							<Flex as="h1" alignItems="center" justifyContent="space-between">
								<FormHeader as="span"> Select a route to perform a swap </FormHeader>

								<RefreshIcon refetch={refetch} lastFetched={lastFetched} />
							</Flex>
						) : !isLoading &&
							amount &&
							debouncedAmount &&
							amount === debouncedAmount &&
							finalSelectedFromToken &&
							finalSelectedToToken &&
							routes.length === 0 ? (
							<FormHeader>No available routes found</FormHeader>
						) : null}

						{failedRoutes.length > 0 ? (
							<p style={{ fontSize: '12px', color: '#999999', marginLeft: '4px', marginTop: '4px', display: 'flex' }}>
								{`Routes for aggregators ${failedRoutes
									.map((r) => r.name)
									.join(', ')} have been hidden since they could not be executed`}
							</p>
						) : null}

						{normalizedRoutes?.length ? (
							<Table>
								<thead>
									<tr>
										<th>Stablecoin</th>
										<th>
											<div style={{ textAlign: 'left' }}>
												Volatility Score
												<div style={{ fontSize: '10px', fontWeight: 'normal', textAlign: 'left' }}>via Santiment</div>
											</div>
										</th>
										<th>Liquidity Score</th>
										<th>Risk Score</th>
										<th>Price Impact</th>
									</tr>
								</thead>
								<tbody>
									{normalizedRoutes
										.filter((route, index, array) => {
											// For fiat currencies, group by stablecoin and show only the best route for each
											if (isFiatCurrency) {
												const enhancedRoute = route as any;
												const targetToken = route.actualToToken?.address || enhancedRoute.targetToken;
												const firstIndexForThisToken = array.findIndex(r => {
													const enhancedR = r as any;
													return (r.actualToToken?.address || enhancedR.targetToken) === targetToken;
												});
												return index === firstIndexForThisToken;
											}
											// For regular swaps, show only the best route (index 0)
											return index === 0;
										})
										.map((r, i) => (
											<Fragment
												key={`${selectedChain!.value}-${finalSelectedFromToken!.address}-${r.actualToToken?.address || r.name}-${r.name}`}
											>
												<tr style={{ backgroundColor: i === 0 ? '#f0f9ff' : 'transparent' }}>
													<td>
														<SwapRoute
															{...r}
															index={i}
															selected={aggregator === r.name}
															setRoute={() => {
																if (isSmallScreen) toggleUi();
																setAggregator(r.name);
															}}
															toToken={r.actualToToken || finalSelectedToToken || effectiveToToken!}
															amountFrom={r?.fromAmount}
															fromToken={finalSelectedFromToken!}
															selectedChain={selectedChain!.value}
															gasTokenPrice={gasTokenPrice}
															toTokenPrice={toTokenPrice}
															isFetchingGasPrice={fetchingTokenPrices}
															amountOut={amountOutWithDecimals}
															amountIn={r?.amountIn}
															isGasless={r?.isGasless}
														/>
													</td>
													<td>
														<VolatilityScoreCell
															token={r.actualToToken || finalSelectedToToken || effectiveToToken!}
															chainId={selectedChain?.id}
														/>
													</td>
													<td>TBU</td>
													<td>TBU</td>
													<td>
														{(() => {
															// Calculate price impact for this route using the new formula
															if (normalizedRoutes[0] && normalizedRoutes[0].netOut && r.netOut && r.netOut > 0) {
																const priceImpact = ((r.netOut / normalizedRoutes[0].netOut) - 1) * 100;
																if (Number.isFinite(priceImpact)) {
																	const color = priceImpact === 0 ? "#059669" : "#dc2626"; // Green for best route, red for others
																	return (
																		<Text as="span" color={color} fontSize={14} fontWeight={700}>
																			{priceImpact > 0 ? '+' : ''}{priceImpact.toFixed(2)}%
																		</Text>
																	);
																}
															}
															// Fallback to "Unknown" if price impact can't be calculated
															return (
																<Text as="span" color="gray.400" fontSize={12}>
																	Unknown
																</Text>
															);
														})()}
													</td>
												</tr>

												{aggregator === r.name && (
													<tr>
														<td colSpan={5}>
															<SwapUnderRoute>
																{!isConnected ? (
																	<ConnectButtonWrapper>
																		<ConnectButton />
																	</ConnectButtonWrapper>
																) : !isValidSelectedChain ? (
																	<Button
																		colorScheme={'messenger'}
																		onClick={() => {
																			if (selectedChain) {
																				switchChain({ chainId: selectedChain.id });
																			} else {
																				toast(
																					formatUnknownErrorToast({
																						title: 'Failed to switch network',
																						message: 'Selected chain is invalid'
																					})
																				);
																			}
																		}}
																	>
																		Switch Network
																	</Button>
																) : (
																	<>
																		{router && address && (
																			<>
																				<>
																					{isUSDTNotApprovedOnEthereum && finalSelectedFromToken && (
																						<Flex flexDir="column" gap="4px" w="100%">
																							<Text fontSize="0.75rem" fontWeight={400}>
																								{`${finalSelectedFromToken.symbol
																									} uses an old token implementation that requires resetting approvals if there's a
																								previous approval, and you currently have an approval for ${(
																										Number(allowance) /
																										10 ** finalSelectedFromToken.decimals
																									).toFixed(2)} ${finalSelectedFromToken?.symbol} for this contract, you
																	need to reset your approval and approve again`}
																							</Text>
																							<Button
																								isLoading={isApproveResetLoading}
																								loadingText={isConfirmingResetApproval ? 'Confirming' : 'Preparing transaction'}
																								colorScheme={'messenger'}
																								onClick={() => {
																									if (approveReset) approveReset();
																								}}
																								aria-disabled={isApproveResetLoading || !selectedRoute}
																							>
																								Reset Approval
																							</Button>
																						</Flex>
																					)}

																					{selectedRoute &&
																						isApproved &&
																						!isGaslessApproval &&
																						selectedRoute.price.isSignatureNeededForSwap &&
																						(selectedRoute.price.rawQuote as any).permit2 ? (
																						<Button
																							isLoading={signatureForSwapMutation.isPending}
																							loadingText={'Confirming'}
																							colorScheme={'messenger'}
																							onClick={() => {
																								handleSignatureForMutation();
																							}}
																							disabled={signatureForSwapMutation.isPending || signatureForSwapMutation.data}
																						>
																							Sign
																						</Button>
																					) : null}

																					{(hasPriceImapct || isUnknownPrice) && !isLoading && selectedRoute && isApproved ? (
																						<SwapConfirmation
																							isUnknownPrice={isUnknownPrice}
																							handleSwap={handleSwap}
																							isMaxPriceImpact={hasMaxPriceImpact}
																						/>
																					) : (
																						<Button
																							isLoading={
																								swapMutation.isPending ||
																								isApproveLoading ||
																								(gaslessApprovalMutation.isPending &&
																									!gaslessApprovalMutation.variables.isInfiniteApproval)
																							}
																							loadingText={
																								isConfirmingApproval ||
																									(gaslessApprovalMutation.isPending &&
																										!gaslessApprovalMutation.variables.isInfiniteApproval)
																									? 'Confirming'
																									: 'Preparing transaction'
																							}
																							colorScheme={'messenger'}
																							onClick={() => {
																								if (!isApproved && isGaslessApproval) {
																									handleGaslessApproval({ isInfiniteApproval: false });
																									return;
																								}

																								if (!isEip5792 && approve) approve();

																								if (
																									balance.data &&
																									!Number.isNaN(Number(balance.data.formatted)) &&
																									selectedRoute &&
																									+selectedRoute.amountIn > +balance.data.formatted
																								)
																									return;

																								if (isApproved) handleSwap();
																							}}
																							aria-disabled={
																								isUSDTNotApprovedOnEthereum ||
																								swapMutation.isPending ||
																								gaslessApprovalMutation.isPending ||
																								isApproveLoading ||
																								isApproveResetLoading ||
																								!selectedRoute ||
																								slippageIsWorng ||
																								!isAmountSynced ||
																								signatureForSwapMutation.isPending ||
																								(selectedRoute.price.isSignatureNeededForSwap
																									? (selectedRoute.price.rawQuote as any).permit2
																										? isApproved
																											? signatureForSwapMutation.data
																												? false
																												: true
																											: false
																										: false
																									: false)
																							}
																						>
																							{!selectedRoute
																								? 'Select Aggregator'
																								: isApproved
																									? `Swap via ${selectedRoute?.name}`
																									: slippageIsWorng
																										? 'Set Slippage'
																										: 'Approve'}
																						</Button>
																					)}

																					{!isApproved && selectedRoute && inifiniteApprovalAllowed.includes(selectedRoute.name) && (
																						<Button
																							colorScheme={'messenger'}
																							loadingText={
																								isConfirmingInfiniteApproval ||
																									(gaslessApprovalMutation.isPending &&
																										gaslessApprovalMutation.variables.isInfiniteApproval)
																									? 'Confirming'
																									: 'Preparing transaction'
																							}
																							isLoading={
																								isApproveInfiniteLoading ||
																								(gaslessApprovalMutation.isPending &&
																									gaslessApprovalMutation.variables.isInfiniteApproval)
																							}
																							onClick={() => {
																								if (!isApproved && isGaslessApproval) {
																									handleGaslessApproval({ isInfiniteApproval: true });
																									return;
																								}

																								if (approveInfinite) approveInfinite();
																							}}
																							aria-disabled={
																								isUSDTNotApprovedOnEthereum ||
																								swapMutation.isPending ||
																								gaslessApprovalMutation.isPending ||
																								isApproveLoading ||
																								isApproveResetLoading ||
																								isApproveInfiniteLoading ||
																								!selectedRoute
																							}
																						>
																							{'Approve Infinite'}
																						</Button>
																					)}

																					{!isApproved && selectedRoute ? (
																						<Tooltip2 content="Already approved? Click to refetch token allowance">
																							<Button
																								colorScheme={'messenger'}
																								width={'24px'}
																								padding={'4px'}
																								onClick={() => refetchTokenAllowance?.()}
																							>
																								<RepeatIcon w="16px	" h="16px" />
																							</Button>
																						</Tooltip2>
																					) : null}
																				</>
																			</>
																		)}
																	</>
																)}

																{errorFetchingAllowance ? (
																	<Text textAlign={'center'} color="red.500" width="100%">
																		{errorFetchingAllowance instanceof Error
																			? errorFetchingAllowance.message
																			: 'Failed to fetch allowance'}
																	</Text>
																) : null}
															</SwapUnderRoute>
														</td>
													</tr>
												)}
											</Fragment>
										))}
								</tbody>
							</Table>
						) : null}
					</Routes>

					{window === parent ? <FAQs /> : null}
				</BodyWrapper>
			</Wrapper>
			<TransactionModal open={txModalOpen} setOpen={setTxModalOpen} link={txUrl} />
			<Footer />
		</>
	);
}
