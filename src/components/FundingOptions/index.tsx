import React from 'react';
import {
	Text,
	Image
} from '@chakra-ui/react';
import styled from 'styled-components';
import { useAccount } from 'wagmi';
import { useTokenBalances } from '~/queries/useTokenBalances';
import { useSelectedChainAndTokens } from '~/hooks/useSelectedChainAndTokens';
import { PRICE_IMPACT_WARNING_THRESHOLD } from '../Aggregator/constants';
import { formattedNum } from '~/utils';
import iconFundingOptions from '~/public/icon-funding-options.svg';

// Stablecoin symbols for identification
const stablecoins = [
	'USDT',
	'USDC',
	'BUSD',
	'DAI',
	'FRAX',
	'TUSD',
	'USDD',
	'USDP',
	'GUSD',
	'LUSD',
	'sUSD',
	'FPI',
	'MIM',
	'DOLA',
	'USP',
	'USDX',
	'MAI',
	'EURS',
	'EURT',
	'alUSD',
	'PAX'
];

// Enhanced stablecoin detection function
const isStablecoin = (symbol: string): boolean => {
	if (!symbol) return false;

	const upperSymbol = symbol.toUpperCase();

	// Check against hardcoded list
	if (stablecoins.includes(upperSymbol)) {
		return true;
	}

	// Check for common currency codes in the symbol
	const stablecoinPatterns = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'CHF', 'AUD', 'CAD'];
	return stablecoinPatterns.some(pattern => upperSymbol.includes(pattern));
};

const FundingWrapper = styled.div`
	display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    width: 100%;
    height: 100%;
    border-radius: 12px;
	color: #3B3B3B;
	font-family: 'Urbanist', sans-serif;
`;

const FundingHeader = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	margin-bottom: 8px;
`;

const CurrencyIndicator = styled.div`
	font-size: 48px;
	font-weight: bold;
	color: #3B3B3B;
`;

const Subtitle = styled.p`
	margin: 0 0 16px 0;
	color: #677076;
	font-size: 16px;
`;

const FundingTable = styled.table`
	width: 100%;
	background-color: #FFFFFF;
	border-radius: 30px;
	padding: 20px;
	border-collapse: collapse;
	font-family: 'Urbanist', sans-serif;
`;

const TableHeader = styled.thead`
	border-bottom: 1px solid #E5E7EB;
`;

const HeaderCell = styled.th`
	text-align: left;
	padding: 12px 16px;
	font-weight: 600;
	font-size: 16px;
	color: #374151;
	border-bottom: 1px solid #E5E7EB;
	vertical-align: top;
`;

const TableRow = styled.tr<{ clickable?: boolean }>`
	cursor: ${props => props.clickable ? 'pointer' : 'default'};
	transition: background-color 0.2s ease;
	
	${props => props.clickable && `
		&:hover {
			background-color: #F9FAFB;
		}
	`}
`;

const TableCell = styled.td`
	padding: 16px;
	font-size: 14px;
	border-bottom: 1px solid #F3F4F6;
	vertical-align: top;
	
	&:last-child {
		border-bottom: none;
	}
`;

const AssetName = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
`;

const AssetType = styled.span`
	color: #6B7280;
`;

const PriceImpactCell = styled.span<{ impact: number | null }>`
	color: ${props => {
		if (props.impact === null) return '#6B7280';
		if (props.impact > 30) return '#DC2626';
		if (props.impact > PRICE_IMPACT_WARNING_THRESHOLD) return '#F59E0B';
		return '#10B981';
	}};
	font-weight: 500;
`;

interface FundingOptionsProps {
	onTokenSelect?: (token: any) => void;
	selectedRoute?: any;
	normalizedRoutes?: any[];
}

// Helper function to find highest balance stablecoin
const findHighestBalanceStablecoin = (tokenBalances: any, chainTokenList: any): any => {
	if (!tokenBalances || !chainTokenList) return null;

	let highestBalance = 0;
	let highestStablecoin: any = null;

	Object.keys(tokenBalances).forEach(address => {
		const token = chainTokenList[address];
		const balance = tokenBalances[address];

		if (token && balance && isStablecoin(token.symbol)) {
			if (balance.balanceUSD > highestBalance) {
				highestBalance = balance.balanceUSD;
				highestStablecoin = {
					...token,
					balance: balance.amount,
					balanceUSD: balance.balanceUSD,
					price: balance.price
				};
			}
		}
	});

	return highestStablecoin;
};

// Helper function to find highest balance non-stablecoin asset
const findHighestBalanceNonStablecoin = (tokenBalances: any, chainTokenList: any): any => {
	if (!tokenBalances || !chainTokenList) return null;

	let highestBalance = 0;
	let highestCryptoAsset: any = null;

	Object.keys(tokenBalances).forEach(address => {
		const token = chainTokenList[address];
		const balance = tokenBalances[address];

		// Exclude stablecoins from crypto assets
		if (token && balance && !isStablecoin(token.symbol)) {
			if (balance.balanceUSD > highestBalance) {
				highestBalance = balance.balanceUSD;
				highestCryptoAsset = {
					...token,
					balance: balance.amount,
					balanceUSD: balance.balanceUSD,
					price: balance.price
				};
			}
		}
	});

	return highestCryptoAsset;
};

// Helper function to format balance with 3 decimal places
const formatBalance = (amount: string | number, decimals: number = 18) => {
	if (!amount) return '0.000';
	const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
	const formatted = numericAmount / Math.pow(10, decimals);
	return formatted.toFixed(3);
};

// Helper function to format USD balance with dollar sign and space-separated thousands
const formatUSDBalance = (balanceUSD: number) => {
	if (!balanceUSD) return '$0.000';

	const formatted = balanceUSD.toFixed(3);
	const parts = formatted.split('.');
	const integerPart = parts[0];
	const decimalPart = parts[1];

	// Add space every 3 digits from right to left
	const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

	return `$${formattedInteger}.${decimalPart}`;
};

// Helper function to calculate price impact
const calculatePriceImpact = (selectedRoute: any, normalizedRoutes: any[] | undefined) => {
	if (!selectedRoute || !normalizedRoutes || normalizedRoutes.length === 0) return null;

	const bestRoute = normalizedRoutes[0];
	if (!bestRoute || !bestRoute.netOut || !selectedRoute.netOut) return null;

	return ((selectedRoute.netOut / bestRoute.netOut) - 1) * 100;
};

export default function FundingOptions({ onTokenSelect, selectedRoute, normalizedRoutes }: FundingOptionsProps) {
	const { address } = useAccount();
	const {
		finalSelectedFromToken,
		selectedChain,
		chainTokenList
	} = useSelectedChainAndTokens();
	const { data: tokenBalances } = useTokenBalances(address, selectedChain?.id);

	// Get funding options data
	const highestStablecoin = findHighestBalanceStablecoin(tokenBalances, chainTokenList);
	const highestCryptoAsset = findHighestBalanceNonStablecoin(tokenBalances, chainTokenList);

	// Check which assets match the currently selected input token
	const isStablecoinSelected = highestStablecoin && finalSelectedFromToken &&
		highestStablecoin.address?.toLowerCase() === finalSelectedFromToken.address?.toLowerCase();
	const isCryptoAssetSelected = highestCryptoAsset && finalSelectedFromToken &&
		highestCryptoAsset.address?.toLowerCase() === finalSelectedFromToken.address?.toLowerCase();

	// Calculate price impact only for non-selected assets  
	// TODO: Implement proper multi-route fetching like Stablecoin Settlement to get accurate price impact
	// For now, show "--" since we don't have routes FROM funding assets TO current output token
	const stablecoinPriceImpact = isStablecoinSelected ? null : null; // Always null until proper implementation
	const cryptoAssetPriceImpact = isCryptoAssetSelected ? null : null; // Always null until proper implementation

	const handleRowClick = (token: any) => {
		if (onTokenSelect && token) {
			onTokenSelect(token);
		}
	};

	return (
		<FundingWrapper>
			<Image src={iconFundingOptions.src} alt="Funding Options" style={{ marginBottom: '16px' }} />

			<FundingHeader>
				<Text fontSize="48px" fontWeight="bold">Funding options</Text>
				<CurrencyIndicator>USD</CurrencyIndicator>
			</FundingHeader>

			<Subtitle>Best quote from selected asset</Subtitle>

			<FundingTable>
				<TableHeader>
					<tr>
						<HeaderCell>Funding asset</HeaderCell>
						<HeaderCell>Balance Value</HeaderCell>
						<HeaderCell>Price Impact</HeaderCell>
					</tr>
				</TableHeader>
				<tbody>
					{/* Row 1: Highest balance stablecoin */}
					<TableRow
						clickable={!!highestStablecoin}
						onClick={() => highestStablecoin && handleRowClick(highestStablecoin)}
					>
						<TableCell>
							<AssetName>
								Stablecoin / <AssetType>{highestStablecoin?.symbol || 'USDC'}</AssetType>
							</AssetName>
						</TableCell>
						<TableCell>
							{highestStablecoin
								? formatUSDBalance(highestStablecoin.balanceUSD)
								: '0.000'
							}
						</TableCell>
						<TableCell>
							<PriceImpactCell impact={stablecoinPriceImpact}>--</PriceImpactCell>
						</TableCell>
					</TableRow>

					{/* Row 2: Highest balance crypto asset */}
					<TableRow
						clickable={!!highestCryptoAsset}
						onClick={() => highestCryptoAsset && handleRowClick(highestCryptoAsset)}
					>
						<TableCell>
							<AssetName>
								Crypto assets / <AssetType>{highestCryptoAsset?.symbol || 'ETH'}</AssetType>
							</AssetName>
						</TableCell>
						<TableCell>
							{highestCryptoAsset
								? formatUSDBalance(highestCryptoAsset.balanceUSD)
								: '0.000'
							}
						</TableCell>
						<TableCell>
							<PriceImpactCell impact={cryptoAssetPriceImpact}>--</PriceImpactCell>
						</TableCell>
					</TableRow>

					{/* Row 3: Placeholder */}
					<TableRow>
						<TableCell>
							<AssetName>
								Debit/ Credit Card / <AssetType>Moonpay<sup style={{ fontSize: '10px', marginLeft: '4px' }}> soon</sup></AssetType>
							</AssetName>
						</TableCell>
						<TableCell>--</TableCell>
						<TableCell>
							<PriceImpactCell impact={null}>--</PriceImpactCell>
						</TableCell>
					</TableRow>
				</tbody>
			</FundingTable>
		</FundingWrapper>
	);
}