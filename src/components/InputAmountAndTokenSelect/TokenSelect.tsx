import * as Ariakit from 'ariakit/dialog';
import { useMemo, useRef, useState, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { WarningTwoIcon } from '@chakra-ui/icons';
import { Button, Flex, Text, Tooltip } from '@chakra-ui/react';
import { useDebounce } from '~/hooks/useDebounce';
import { useQueryClient } from '@tanstack/react-query';
import { allChains } from '../WalletProvider/chains';
import { ChevronDown, X, Search } from 'react-feather';
import { useToken } from '../Aggregator/hooks/useToken';
import { isAddress } from 'viem';
import { IToken, IFiatCurrency } from '~/types';
import { useSelectedChainAndTokens } from '~/hooks/useSelectedChainAndTokens';
import { useGetSavedTokens } from '~/queries/useGetSavedTokens';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/router';
import { useTokenBalances } from '~/queries/useTokenBalances';
import styled from 'styled-components';
import { formatAddress } from '~/utils/formatAddress';
import { topTokensByChain, fiatCurrencyOptions } from '../Aggregator/constants';

const Row = ({ chain, token, onClick, style }) => {
	const blockExplorer = allChains.find((c) => c.id == chain.id)?.blockExplorers?.default;
	return (
		<PairRow
			key={token.value}
			data-defaultcursor={token.isGeckoToken ? true : false}
			onClick={() => !token.isGeckoToken && onClick(token)}
			style={style}
		>
			<IconImage
				src={token.logoURI}
				onError={(e) => (e.currentTarget.src = token.logoURI2 || '/placeholder.png')}
				height={32}
				width={32}
			/>

			<Flex flexDir="column" whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden">
				{token.isMultichain ? (
					<Tooltip
						label="This token could have been affected by the multichain hack."
						bg="black"
						color="white"
						fontSize="0.75rem"
						padding="8px"
					>
						<Text
							whiteSpace="nowrap"
							textOverflow="ellipsis"
							overflow="hidden"
							color="orange.200"
							display="flex"
							alignItems="center"
							gap="4px"
							fontWeight={500}
						>
							{token.name}
							{token.isMultichain ? <WarningTwoIcon color={'orange.200'} /> : null}
						</Text>
					</Tooltip>
				) : (
					<Text whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden" color="white" fontWeight={500}>
						{token.name}
					</Text>
				)}

				<Flex alignItems="center" gap="8px">
					<Text whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden" color="#9B9B9B">
						{token.symbol}
					</Text>
					{blockExplorer && (
						<LinkToExplorer
							href={`${blockExplorer.url}/address/${token.address}`}
							target="_blank"
							rel="noreferrer noopener"
							onClick={(e) => {
								e.stopPropagation();
							}}
						>
							{formatAddress(token.address, 5)}
						</LinkToExplorer>
					)}
				</Flex>
			</Flex>

			{token.balanceUSD ? (
				<Flex flexDir="column" marginLeft="auto">
					<Text whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden" textAlign="right">
						${token.balanceUSD?.toFixed(3)}
					</Text>
					<Text whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden" color="#A2A2A2" textAlign="right">
						{(token.amount / 10 ** token.decimals).toFixed(3)}
					</Text>
				</Flex>
			) : null}

			{token.isGeckoToken && (
				<Tooltip
					label="This token doesn't appear on active token list(s). Make sure this is the token that you want to trade."
					bg="black"
					color="white"
					fontSize="0.75rem"
					padding="8px"
				>
					<Button
						fontSize={'0.75rem'}
						fontWeight={500}
						ml={token.balanceUSD ? '0px' : 'auto'}
						colorScheme={'orange'}
						onClick={() => {
							saveToken(token);
							onClick(token);
						}}
						leftIcon={<WarningTwoIcon />}
						flexShrink={0}
						height="32px"
					>
						Import Token
					</Button>
				</Tooltip>
			)}
		</PairRow>
	);
};

const saveToken = (token) => {
	const tokens = JSON.parse(localStorage.getItem('savedTokens') || '{}');

	const chainTokens = tokens[token.chainId] || [];

	const newTokens = { ...tokens, [token.chainId]: chainTokens.concat(token) };

	localStorage.setItem('savedTokens', JSON.stringify(newTokens));
};

const AddToken = ({ address, selectedChain, onClick }) => {
	const { data, isLoading, error } = useToken({
		address: address as `0x${string}`,
		chainId: selectedChain.id,
		enabled: typeof address === 'string' && address.length === 42 && selectedChain ? true : false
	});

	const queryClient = useQueryClient();

	const onTokenClick = () => {
		if (error) return;

		saveToken({
			address: address.toLowerCase(),
			...(data || {}),
			label: data?.symbol,
			value: address,
			chainId: selectedChain?.id,
			logoURI: `https://token-icons.llamao.fi/icons/tokens/${selectedChain?.id ?? 1}/${address}?h=48&w=48`
		});

		queryClient.invalidateQueries({ queryKey: ['savedTokens', selectedChain?.id] });

		onClick({ address, label: data?.symbol, value: address });
	};

	return (
		<Flex
			alignItems="center"
			mt="16px"
			p="8px"
			gap="8px"
			justifyContent="space-between"
			flexWrap="wrap"
			borderBottom="1px solid #373944"
			key={address}
		>
			<IconImage
				src={`https://token-icons.llamao.fi/icons/tokens/${selectedChain?.id ?? 1}/${address}?h=48&w=48`}
				onError={(e) => (e.currentTarget.src = '/placeholder.png')}
				height={32}
				width={32}
			/>

			<Text whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden">
				{isLoading ? 'Loading...' : data?.name ? `${data.name} (${data.symbol})` : formatAddress(address)}
			</Text>

			<Button height={38} marginLeft="auto" onClick={onTokenClick} disabled={error ? true : false}>
				Add token
			</Button>

			{error ? (
				<Text
					fontSize="0.75rem"
					color="red"
					w="100%"
					textAlign="center"
				>{`This address is not a contract on ${selectedChain.value}`}</Text>
			) : null}
		</Flex>
	);
};

const FiatCurrencyModal = ({ dialogState, onFiatSelect }) => {
	const filteredCurrencies = fiatCurrencyOptions;

	const FiatCurrencyRow = ({ currency, onClick }) => (
		<PairRow
			key={currency.value}
			onClick={() => onClick(currency)}
			style={{ cursor: 'pointer' }}
		>
			<Flex 
				alignItems="center" 
				justifyContent="center" 
				width="32px" 
				height="32px" 
				bg="#00203A" 
				borderRadius="50%"
				fontSize="14px"
				fontWeight="600"
				color="#FFFFFF"
			>
				{currency.symbol}
			</Flex>

			<Flex flexDir="column" whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden">
				<Text whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden" color="#9B9B9B">
					{currency.value}
				</Text>
			</Flex>
		</PairRow>
	);

	return (
		<>
			<Dialog state={dialogState} backdropProps={{ className: 'dialog-backdrop' }}>
				<DialogHeading>Select a currency</DialogHeading>
				<DialogDismiss>
					<X size={20} />
				</DialogDismiss>

				<div style={{ padding: '16px 0' }}>
					{filteredCurrencies.map((currency) => (
						<FiatCurrencyRow
							key={currency.value}
							currency={currency}
							onClick={onFiatSelect}
						/>
					))}
				</div>
			</Dialog>
		</>
	);
};

const SelectModal = ({ dialogState, data, onTokenSelect, selectedChain, isLoading, topTokens, tokensWithBalances }) => {
	const [input, setInput] = useState('');
	const onInputChange = (e) => {
		setInput(e?.target?.value);
	};

	const debouncedInput = useDebounce(input, 300);

	const { filteredTokenList, filteredBalances } = useMemo(() => {
		const search = debouncedInput.toLowerCase();

		if (search && isAddress(search)) {
			const tokenByaddress = data?.find((token) => token.address === search);
			return {
				filteredTokenList: tokenByaddress ? [tokenByaddress] : [],
				filteredBalances: []
			};
		}

		return debouncedInput
			? {
					filteredTokenList: data.filter((token) =>
						`${token.symbol?.toLowerCase() ?? ''}:${token.name?.toLowerCase() ?? ''}`.includes(search)
					),
					filteredBalances: tokensWithBalances.filter((token) =>
						`${token.symbol?.toLowerCase() ?? ''}:${token.name?.toLowerCase() ?? ''}`.includes(search)
					)
				}
			: {
					filteredTokenList: data,
					filteredBalances: tokensWithBalances
				};
	}, [debouncedInput, data, tokensWithBalances]);

	const parentRef = useRef<HTMLDivElement>(null);

	const rowVirtualizer = useVirtualizer({
		count: filteredTokenList.length,
		getScrollElement: () => parentRef?.current ?? null,
		estimateSize: () => 56,
		overscan: 10
	});

	const topHeight =
		(topTokens.length > 0 ? 80 : 0) + (filteredBalances.length > 0 ? 8 + 36 + filteredBalances.length * 56 : 0) + 36;

	return (
		<>
			<Dialog state={dialogState} backdropProps={{ className: 'dialog-backdrop' }}>
				<DialogHeading>Select a token</DialogHeading>
				<DialogDismiss>
					<X size={20} />
				</DialogDismiss>

				<InputSearchWrapper>
					<Search size={17} color="#9B9B9B" />
					<InputSearch placeholder="Search... (Symbol or Address)" onChange={onInputChange} autoFocus />
				</InputSearchWrapper>

				{isLoading ? (
					<Text textAlign={'center'} marginTop="25%">
						Loading...
					</Text>
				) : isAddress(input) && filteredTokenList.length === 0 ? (
					<AddToken address={input} onClick={onTokenSelect} selectedChain={selectedChain} />
				) : (
					<>
						<VirtualListWrapper ref={parentRef}>
							<div
								style={{
									height: `${rowVirtualizer.getTotalSize() + topHeight}px`,
									width: '100%',
									position: 'relative'
								}}
							>
								{topTokens.length > 0 ? (
									<>
										<TopTokenWrapper>
											{topTokens.map((token) => (
												<TopToken
													key={`top-token-${selectedChain.id}-${token.address}`}
													onClick={() => {
														onTokenSelect(token);
													}}
												>
													<IconImage
														src={token.logoURI}
														onError={(e) => (e.currentTarget.src = token.logoURI2 || '/placeholder.png')}
														height={24}
														width={24}
													/>
													<span>{token.symbol}</span>
												</TopToken>
											))}
										</TopTokenWrapper>
									</>
								) : null}
								{filteredBalances.length > 0 ? (
									<>
										<ListHeader>
											<svg viewBox="0 0 24 24" fill="none" strokeWidth="8" width={16} height={16}>
												<path
													d="M7.5 18.01C7.5 18.74 7.72001 19.4 8.13 19.97C5.45 19.8 3 18.82 3 17.01V16.13C4.05 16.95 5.6 17.5 7.5 17.68V18.01ZM7.53998 13.94C7.52998 13.95 7.53003 13.96 7.53003 13.97C7.51003 14.07 7.5 14.17 7.5 14.27V16.18C5.08 15.9 3 14.94 3 13.27V12.39C4.05 13.22 5.61003 13.77 7.53003 13.94H7.53998ZM11.44 10.28C9.92 10.75 8.73001 11.52 8.07001 12.48C5.41001 12.31 3 11.33 3 9.53003V8.84998C4.31 9.87998 6.41 10.48 9 10.48C9.87 10.48 10.69 10.41 11.44 10.28ZM15 8.84998V9.53003C15 9.62003 14.99 9.70003 14.98 9.78003C14.19 9.78003 13.44 9.84997 12.74 9.96997C13.64 9.69997 14.4 9.31998 15 8.84998ZM9 3C6 3 3 3.99999 3 5.98999C3 7.99999 6 8.97998 9 8.97998C12 8.97998 15 7.99999 15 5.98999C15 3.99999 12 3 9 3ZM15 18.76C12.49 18.76 10.35 18.1 9 17.03V18.01C9 20 12 21 15 21C18 21 21 20 21 18.01V17.03C19.65 18.1 17.51 18.76 15 18.76ZM15 11.28C11.69 11.28 9 12.62 9 14.27C9 15.92 11.69 17.26 15 17.26C18.31 17.26 21 15.92 21 14.27C21 12.62 18.31 11.28 15 11.28Z"
													fill="currentColor"
												></path>
											</svg>
											<span>Your tokens</span>
										</ListHeader>
										{filteredBalances.map((token) => (
											<Row
												token={token}
												onClick={onTokenSelect}
												chain={selectedChain}
												key={`token-with-balnce-${token.address}`}
												style={undefined}
											/>
										))}
									</>
								) : null}
								{rowVirtualizer.getVirtualItems().length > 0 ? (
									<ListHeader>
										<svg viewBox="0 0 18 17" fill="none" strokeWidth="8" width={16} height={16}>
											<path
												d="M8.80054 0.829883L10.4189 4.09404C10.5406 4.33988 10.7756 4.50989 11.0481 4.54906L14.7838 5.08902C15.4688 5.18818 15.7422 6.0282 15.2464 6.50987L12.5456 9.13071C12.3481 9.32238 12.258 9.5982 12.3047 9.86904L12.9221 13.4557C13.0471 14.1832 12.283 14.7382 11.628 14.3957L8.38805 12.6999C8.14471 12.5724 7.85469 12.5724 7.61219 12.6999L4.37468 14.394C3.71885 14.7374 2.95216 14.1815 3.07799 13.4524L3.69556 9.86904C3.74223 9.5982 3.65218 9.32238 3.45468 9.13071L0.753871 6.50987C0.257205 6.0282 0.530481 5.18818 1.21631 5.08902L4.95217 4.54906C5.22384 4.50989 5.45885 4.33988 5.58135 4.09404L7.19969 0.829883C7.52553 0.167383 8.47221 0.167383 8.80054 0.829883Z"
												fill="currentColor"
											></path>
										</svg>
										<span>Tokens by 24H volume</span>
									</ListHeader>
								) : null}
								{rowVirtualizer.getVirtualItems().map((virtualRow) => (
									<Row
										token={filteredTokenList[virtualRow.index]}
										onClick={onTokenSelect}
										chain={selectedChain}
										key={virtualRow.index + filteredTokenList[virtualRow.index].address}
										style={{
											position: 'absolute',
											top: 0,
											left: 0,
											width: '100%',
											height: '56px',
											transform: `translateY(${topHeight + virtualRow.start}px)`
										}}
									/>
								))}
							</div>
						</VirtualListWrapper>
					</>
				)}
			</Dialog>
		</>
	);
};

export const TokenSelect = ({
	onClick,
	type
}: {
	onClick: (token: IToken) => void;
	type: 'amountIn' | 'amountOut';
}) => {
	const { address } = useAccount();
	const router = useRouter();
	const [selectedFiatCurrency, setSelectedFiatCurrency] = useState<IFiatCurrency | null>(null);

	const {
		fetchingFromToken,
		fetchingToToken,
		finalSelectedFromToken,
		finalSelectedToToken,
		chainTokenList,
		selectedChain,
		fetchingTokenList
	} = useSelectedChainAndTokens();

	// Initialize selectedFiatCurrency from URL parameter for amountOut type
	useEffect(() => {
		if (type === 'amountOut' && router.query.to) {
			const fiatCurrencyMappings = {
				'USD': { label: 'USD', value: 'USD', symbol: '$' },
				'EUR': { label: 'EUR', value: 'EUR', symbol: '€' }
			};
			
			const urlParam = router.query.to as string;
			if (fiatCurrencyMappings[urlParam]) {
				setSelectedFiatCurrency(fiatCurrencyMappings[urlParam]);
			} else {
				setSelectedFiatCurrency(null);
			}
		}
	}, [type, router.query.to]);

	// balances of all token's in wallet
	const { data: tokenBalances } = useTokenBalances(address, router.isReady ? selectedChain?.id : null);

	// saved tokens list
	const savedTokens = useGetSavedTokens(selectedChain?.id);

	const { tokensInChain, topTokens, tokensWithBalances, topTokensWithBalances } = useMemo(() => {
		const tokensWithBalances: Record<string, IToken> = {};
		const tokensWithNoprice: Record<string, IToken> = {};
		const topTokensWithBalances = new Set<string>();
		const topHoldingUsd = Math.max(...Object.values(tokenBalances ?? {}).map((curr) => curr.balanceUSD ?? 0), 0);

		for (const token in tokenBalances || {}) {
			const t = chainTokenList[token] || savedTokens[token] || null;
			if (
				t &&
				(type === 'amountIn'
					? t.address !== finalSelectedToToken?.address
					: t.address !== finalSelectedFromToken?.address)
			) {
				const amount = tokenBalances?.[t.address]?.amount ?? 0;
				const balanceUSD = tokenBalances?.[t.address]?.balanceUSD ?? 0;

				if (amount && balanceUSD && (balanceUSD >= 10 || balanceUSD >= topHoldingUsd * 0.01)) {
					topTokensWithBalances.add(t.address);
					tokensWithBalances[t.address] = {
						...t,
						amount: tokenBalances?.[t.address]?.amount ?? 0,
						balanceUSD: tokenBalances?.[t.address]?.balanceUSD ?? 0
					};
				} else {
					tokensWithNoprice[t.address] = {
						...t,
						amount: tokenBalances?.[t.address]?.amount ?? 0,
						balanceUSD: tokenBalances?.[t.address]?.balanceUSD ?? 0
					};
				}
			}
		}

		const tokensInChain = {
			...chainTokenList,
			...savedTokens
		};

		const topTokens =
			selectedChain && topTokensByChain[selectedChain.id]
				? topTokensByChain[selectedChain.id]
						.map((token) => chainTokenList[token.toLowerCase()] ?? null)
						.filter((token) => token !== null)
				: [];

		return {
			tokensInChain: Object.values({ ...tokensInChain, ...tokensWithNoprice }),
			topTokens,
			tokensWithBalances: Object.values(tokensWithBalances).sort((a, b) => (b.balanceUSD ?? 0) - (a.balanceUSD ?? 0)),
			topTokensWithBalances
		};
	}, [chainTokenList, selectedChain?.id, tokenBalances, savedTokens, type]);

	const { tokens, token } = useMemo(() => {
		if (type === 'amountIn') {
			return {
				tokens: tokensInChain.filter(
					({ address }) => address !== finalSelectedToToken?.address && !topTokensWithBalances.has(address)
				),
				token: finalSelectedFromToken
			};
		}

		return {
			tokens: tokensInChain.filter(
				({ address }) => address !== finalSelectedFromToken?.address && !topTokensWithBalances.has(address)
			),
			token: finalSelectedToToken
		};
	}, [tokensInChain, finalSelectedFromToken, finalSelectedToToken]);

	const isLoading = type === 'amountIn' ? fetchingFromToken : fetchingToToken;
	const dialogState = Ariakit.useDialogState();

	const onTokenSelect = (token) => {
		onClick(token);
		dialogState.toggle();
	};

	const onFiatSelect = (fiatCurrency: IFiatCurrency) => {
		setSelectedFiatCurrency(fiatCurrency);
		// Pass the fiat currency value so it can be recognized by the routing system
		const fiatToken = {
			address: fiatCurrency.value, // Use fiat currency code (USD, EUR, etc.)
			label: fiatCurrency.label,
			value: fiatCurrency.value,
			symbol: fiatCurrency.label,
			name: fiatCurrency.label,
			decimals: 6,
			logoURI: '',
			chainId: selectedChain?.id || 1,
			geckoId: null,
			isFiatCurrency: true
		};
		onClick(fiatToken);
		dialogState.toggle();
	};

	// Show fiat currencies for "amountOut" type
	const showFiatCurrencies = type === 'amountOut';

	return (
		<>
			<Trigger onClick={dialogState.toggle}>
				{isLoading ? (
					<Text
						as="span"
						overflow="hidden"
						whiteSpace="nowrap"
						textOverflow="ellipsis"
						fontWeight={400}
						marginRight="auto"
						color="#3B3B3B"
					>
						Loading...
					</Text>
				) : (
					<>
						{showFiatCurrencies && selectedFiatCurrency ? (
							<>
								<Flex 
									alignItems="center" 
									justifyContent="center" 
									width="20px" 
									height="20px" 
									bg="#00203A" 
									borderRadius="50%"
									fontSize="10px"
									fontWeight="600"
									color="#FFFFFF"
								>
									{selectedFiatCurrency.symbol}
								</Flex>
								<Text
									as="span"
									overflow="hidden"
									whiteSpace="nowrap"
									textOverflow="ellipsis"
									fontWeight={400}
									marginRight="auto"
									color="#3B3B3B"
								>
									{selectedFiatCurrency.label}
								</Text>
							</>
						) : !showFiatCurrencies && token ? (
							<>
								<IconImage
									src={token.logoURI}
									onError={(e) => (e.currentTarget.src = token.logoURI2 || '/placeholder.png')}
									height={20}
									width={20}
								/>
								{token?.isMultichain ? (
									<Tooltip
										label="This token could have been affected by the multichain hack."
										bg="black"
										color="white"
										fontSize="0.75rem"
										padding="8px"
									>
										<WarningTwoIcon color={'orange.200'} />
									</Tooltip>
								) : null}
								<Text
									as="span"
									overflow="hidden"
									whiteSpace="nowrap"
									textOverflow="ellipsis"
									fontWeight={400}
									marginRight="auto"
									color="#3B3B3B"
								>
									{token.symbol}
								</Text>
							</>
						) : (
							<Text
								as="span"
								overflow="hidden"
								whiteSpace="nowrap"
								textOverflow="ellipsis"
								fontWeight={400}
								marginRight="auto"
								color="#3B3B3B"
							>
								{showFiatCurrencies ? 'Select Currency' : 'Select Token'}
							</Text>
						)}
					</>
				)}

				<ChevronDown size={16} />
			</Trigger>
			{dialogState.open ? (
				showFiatCurrencies ? (
					<FiatCurrencyModal
						dialogState={dialogState}
						onFiatSelect={onFiatSelect}
					/>
				) : (
					<SelectModal
						dialogState={dialogState}
						data={tokens}
						onTokenSelect={onTokenSelect}
						selectedChain={selectedChain}
						isLoading={fetchingTokenList}
						topTokens={topTokens}
						tokensWithBalances={tokensWithBalances}
					/>
				)
			) : null}
		</>
	);
};

const Trigger = styled.button`
	display: flex;
	gap: 6px;
	flex-wrap: nowrap;
	align-items: center;
	height: 40px;
	padding: 12px;
	width: 100%;
	border-radius: 8px;
	max-width: 128px;
	font-size: 16px;

	:hover {
		cursor: pointer;
	}

	@media (min-width: 768px) {
		max-width: 9rem;
	}
`;

const VirtualListWrapper = styled.div`
	overflow: auto;
	margin-top: 16px;
`;

const DialogHeading = styled(Ariakit.DialogHeading)`
	color: #fafafa;
	font-size: 20px;
	font-weight: 500;
	text-align: center;
	margin-bottom: 8px;
	margin: 16px;
`;

const DialogDismiss = styled(Ariakit.DialogDismiss)`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 24px;
	height: 24px;
	position: absolute;
	top: 20px;
	right: 12px;
`;

const InputSearchWrapper = styled.div`
	position: relative;
	display: flex;
	flex-direction: column;

	& > svg {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 28px;
		margin: auto;
	}
`;

const InputSearch = styled.input`
	border-radius: 8px;
	height: 52px;
	flex-shrink: 0;
	padding: 0 12px 0px 36px;
	margin: 0 16px;
	font-size: 16px;
	font-weight: 500;
	color: #3B3B3B;
	border: 1px solid #3B3B3B;
	&::placeholder {
		color: #9b9b9b;
	}
`;

const Dialog = styled(Ariakit.Dialog)`
	position: fixed;
	inset: var(--inset);
	z-index: 50;
	margin: auto;
	display: flex;
	flex-direction: column;
	max-width: min(95vw, 520px);
	max-height: min(90vh, 600px);
	width: 100%;
	height: 100%;
	border-radius: 16px;
	background: #FFFFFF;
	border: 1px solid rgba(255, 255, 255, 0.12);
	color: white;
	isolation: isolate;
	--inset: 0.75rem;
`;

const PairRow = styled.div`
	display: flex;
	gap: 8px;
	padding: 0 16px;
	align-items: center;
	min-height: 56px;

	cursor: pointer;

	&[data-defaultcursor='true'] {
		cursor: default;
	}

	&:hover {
		background-color: rgba(246, 246, 246, 0.1);
	}
`;

const IconImage = styled.img`
	border-radius: 50%;
	aspect-ratio: 1;
	flex-shrink: 0;
	object-fit: contain;
`;

const LinkToExplorer = styled.a`
	font-size: 12px;
	color: #7e7e7e;

	&:hover {
		text-decoration: underline;
	}
`;

const TopTokenWrapper = styled.div`
	display: flex;
	flex-wrap: nowrap;
	overflow-x: auto;
	gap: 4px;
	padding: 0px 16px 16px 16px;
	flex-shrink: 0;

	& > span {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
`;

const TopToken = styled.button`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 4px;
	font-weight: 500;
	font-size: 14px;
	padding: 4px;
	background: #E4EAF3;
	height: 64px;
	width: 64px;
	border-radius: 8px;
	color: #3B3B3B;

	&:hover {
		background-color: rgba(246, 246, 246, 0.1);
	}
`;

const ListHeader = styled.h2`
	display: flex;
	align-items: center;
	gap: 4px;
	padding: 0 16px;
	height: 36px;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	color: #9b9b9b;
	font-weight: 500;

	&:not(:first-of-type) {
		margin-top: 8px;
	}
`;
