import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { zeroAddress } from 'viem';
import { useAccount } from 'wagmi';
import { getAllChains } from '~/components/Aggregator/router';
import { fiatCurrencyMappings } from '~/components/Aggregator/constants';

const chains = getAllChains();

export function useQueryParams() {
	const router = useRouter();
	const { isConnected, chain: chainOnWallet } = useAccount();

	const urlParams = new URLSearchParams(window.location.search);
	const toToken = urlParams.get('to');
	const fromToken = urlParams.get('from');
	const chainOnURL = urlParams.get('chain');

	const { ...query } = router.query;

	const chainName = typeof chainOnURL === 'string' ? chainOnURL.toLowerCase() : 'ethereum';
	const fromTokenAddress = typeof fromToken === 'string' ? fromToken.toLowerCase() : null;
	
	// Preserve case for fiat currencies, convert to lowercase for regular tokens
	const toTokenAddress = typeof toToken === 'string' 
		? (fiatCurrencyMappings[toToken.toUpperCase()] ? toToken.toUpperCase() : toToken.toLowerCase())
		: null;

	useEffect(() => {
		if (router.isReady && !chainOnURL) {
			const chain = chainOnWallet ? chains.find((c) => c.chainId === chainOnWallet.id) : null;

			// redirects to chain on wallet if supported
			if (isConnected && chainOnWallet && chain) {
				router.push(
					{
						pathname: '/',
						query: { ...query, chain: chain.value, from: zeroAddress, tab: 'swap' }
					},
					undefined,
					{ shallow: true }
				);
			} else {
				// redirects to ethereum, when there is no chain query param in URl or if chain on wallet is not supported
				router.push(
					{
						pathname: '/',
						query: { ...query, chain: 'ethereum', from: zeroAddress, tab: 'swap' }
					},
					undefined,
					{ shallow: true }
				);
			}
		}
	}, [chainOnURL, chainOnWallet, isConnected, router]);

	return { chainName, fromTokenAddress, toTokenAddress };
}
