import { defillamaReferrerAddress } from '../constants';
import { getTxs } from '../utils/getTxs';
import { sendTx } from '../utils/sendTx';
import { zeroAddress } from 'viem';

export const chainToId = {
	ethereum: 'https://api.0x.org/',
	bsc: 'https://bsc.api.0x.org/',
	polygon: 'https://polygon.api.0x.org/',
	optimism: 'https://optimism.api.0x.org/',
	arbitrum: 'https://arbitrum.api.0x.org/',
	avax: 'https://avalanche.api.0x.org/',
	fantom: 'https://fantom.api.0x.org/',
	celo: 'https://celo.api.0x.org/',
	base: 'http://base.api.0x.org/'
};

export const name = 'Matcha/0x';
export const token = 'ZRX';
export const isOutputAvailable = true;

export function approvalAddress() {
	// https://docs.0x.org/0x-api-swap/guides/swap-tokens-with-0x-api
	return '0xdef1c0ded9bec7f1a1670819833240f027b25eff';
}

const nativeToken = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
const feeCollectorAddress = '0xf0E8d52b52008c6f012E24D47db2472d6a3fA356';

export async function getQuote(chain: string, from: string, to: string, amount: string, extra) {
	// amount should include decimals

	const tokenFrom = from === zeroAddress ? nativeToken : from;
	const tokenTo = to === zeroAddress ? nativeToken : to;
	const amountParam =
		extra.amountOut && extra.amountOut !== '0' ? `buyAmount=${extra.amountOut}` : `sellAmount=${amount}`;

	const data = await fetch(
		`${chainToId[chain]}swap/v1/quote?buyToken=${tokenTo}&${amountParam}&sellToken=${tokenFrom}&slippagePercentage=${extra.slippage / 100
		}&affiliateAddress=${defillamaReferrerAddress}&enableSlippageProtection=false&intentOnFilling=true&takerAddress=${extra.userAddress
		}&skipValidation=true&feeRecipientTradeSurplus=${feeCollectorAddress}`,
		{
			headers: {
				'0x-api-key': process.env.OX_API_KEY as string
			}
		}
	).then((r) => r.json());

	return {
		amountReturned: data?.buyAmount || 0,
		amountIn: data?.sellAmount || 0,
		estimatedGas: data.gas,
		tokenApprovalAddress: data.to,
		rawQuote: data,
		logo: 'https://www.gitbook.com/cdn-cgi/image/width=40,height=40,fit=contain,dpr=2,format=auto/https%3A%2F%2F1690203644-files.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FKX9pG8rH3DbKDOvV7di7%252Ficon%252F1nKfBhLbPxd2KuXchHET%252F0x%2520logo.png%3Falt%3Dmedia%26token%3D25a85a3e-7f72-47ea-a8b2-e28c0d24074b'
	};
}

export async function swap({ tokens, fromAmount, fromAddress, rawQuote, eip5792 }) {
	const txs = getTxs({
		fromAddress,
		routerAddress: rawQuote.to,
		data: rawQuote.data,
		value: rawQuote.value,
		fromTokenAddress: tokens.fromToken.address,
		fromAmount,
		eip5792,
		tokenApprovalAddress: rawQuote.to
	});

	const tx = await sendTx(txs);

	return tx;
}

export const getTxData = ({ rawQuote }) => rawQuote?.data;

export const getTx = ({ rawQuote }) => ({
	to: rawQuote.to,
	data: rawQuote.data,
	value: rawQuote.value
});