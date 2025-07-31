import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Text } from '@chakra-ui/react';
import styled from 'styled-components';

const FAQComponentWrapper = styled.div`
	display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    width: 100%;
    height: 100%;
    border-radius: 12px;
	color: #3B3B3B;
	font-family: 'Urbanist', sans-serif;
	margin-top: 40px;
    `;

export default function FaqWrapper() {
	return (
		<>
			<FAQComponentWrapper>
				<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start', gap: '16px', width: '100%' }}>
					<Text fontSize="48px" fontWeight="bold" textAlign="left" width="30%" mt="40px">
						FREQUENTLY ASKED QUESTIONS
					</Text>

					<Accordion allowMultiple margin={'0 auto'} style={{ width: '70%', backgroundColor: '#FFFFFF', borderRadius: '30px', padding: '30px', textAlign: 'left' }}>
						<AccordionItem>
							<h2>
								<AccordionButton>
									<Box flex="1" textAlign="left" fontWeight="600">
										What is this?
									</Box>
									<AccordionIcon />
								</AccordionButton>
							</h2>
							<AccordionPanel pb={4} color="#677076">
								It's an aggregator of DEX aggregators that abstracts stablecoins. We query the price of USDC, USDT, DAI ... across 1inch, cowswap, matcha... and then offer you
								the best price among all of them.
							</AccordionPanel>
						</AccordionItem>

						<AccordionItem>
							<h2>
								<AccordionButton>
									<Box flex="1" textAlign="left" fontWeight="600">
										Does Nonolet take any fees?
									</Box>
									<AccordionIcon />
								</AccordionButton>
							</h2>
							<AccordionPanel pb={4} color="#677076">
								Nonolet takes 0 fee on swaps.
								<br />
								<br /> You'll get the exact same price swapping through Nonolet as what you'd get swapping through the
								chosen aggregator directly.
								<br />
								<br />
								We do add our referral code to swaps tho, so, for aggregators with revenue sharing, they will send us part
								of the fee they earn. This is not an extra fee, you'd be charged the same fee anyway, but now a small part
								of it is shared with Nonolet. We also integrate aggregators with no fee sharing the best price, and in
								those cases we don't make any money.
							</AccordionPanel>
						</AccordionItem>
						<AccordionItem>
							<h2>
								<AccordionButton>
									<Box flex="1" textAlign="left" fontWeight="600">
										Is it safe?
									</Box>
									<AccordionIcon />
								</AccordionButton>
							</h2>
							<AccordionPanel pb={4} color="#677076">
								Our aggregator uses the router contract of each aggregator, we don't use any contracts developed by us. Thus
								you inherit the same security you'd get by swapping directly from their UI instead of ours.
							</AccordionPanel>
						</AccordionItem>
						<AccordionItem>
							<h2>
								<AccordionButton>
									<Box flex="1" textAlign="left" fontWeight="600">
										Why do gas fees in MetaMask not match what I see in the UI?
									</Box>
									<AccordionIcon />
								</AccordionButton>
							</h2>
							<AccordionPanel pb={4} color="#677076">
								We inflate gas limit of txs on MetaMask by +40% to ensure that there's nothing unexpected that could trigger out-of-gas reverts. This stacks
								on top of any increase your RPC might apply on gas estimations, along with possible different gas prices between your metamask and our estimation.
								<br />
								<br />
								All this together means that gas number you see on metamask will always be inflated, while in our UI we display the actual gas that the tx will consume.
								The extra gas that is not used is just refunded to the user when tx executes.
							</AccordionPanel>
						</AccordionItem>
						<AccordionItem>
							<h2>
								<AccordionButton>
									<Box flex="1" textAlign="left" fontWeight="600">
										Will I be eligible for aggregator airdrops if I swap through Nonolet?
									</Box>
									<AccordionIcon />
								</AccordionButton>
							</h2>
							<AccordionPanel pb={4} color="#677076">
								We execute swaps directly against the router of each aggregator, so there's no difference between a swap
								executed directly from their UI and a swap executed from DefiLlama.
								<br />
								<br />
								Thus, if any of the aggregators we integrate does an airdrop in the future, all swaps made through them
								would be eligible for their airdrop.
							</AccordionPanel>
						</AccordionItem>
						<AccordionItem>
							<h2>
								<AccordionButton>
									<Box flex="1" textAlign="left" fontWeight="600">
										How does this relate to DefiLlama?
									</Box>
									<AccordionIcon />
								</AccordionButton>
							</h2>
							<AccordionPanel pb={4} color="#677076">
								Nonolet is a fork of DefiLlama's LlamaSwap, but with a few changes.
								<br />
								<br />
								It adds several features, such as a chart showing the historic prices, stablecoin abstraction, several API integrations to display complementary data, and more.
							</AccordionPanel>
						</AccordionItem>

						<AccordionItem>
							<h2>
								<AccordionButton>
									<Box flex="1" textAlign="left" fontWeight="600">
										See More Questions
									</Box>
									<AccordionIcon />
								</AccordionButton>
							</h2>
							<AccordionPanel pb={4} color="#677076">
								<Accordion allowMultiple>
									<AccordionItem>
										<h2>
											<AccordionButton>
												<Box flex="1" textAlign="left" fontWeight="600">
													How do I convert EUR to USDC with the lowest fees?
												</Box>
												<AccordionIcon />
											</AccordionButton>
										</h2>
										<AccordionPanel pb={4} color="#677076">
											Use Nonolet to compare rates across all major DEXs. Select EUR as your "from" token and USDC as your "to" token. The platform will automatically find the best route with the lowest total fees, including gas costs and DEX fees.
										</AccordionPanel>
									</AccordionItem>

									<AccordionItem>
										<h2>
											<AccordionButton>
												<Box flex="1" textAlign="left" fontWeight="600">
													Which network is best for cheap deposits/withdrawals?
												</Box>
												<AccordionIcon />
											</AccordionButton>
										</h2>
										<AccordionPanel pb={4} color="#677076">
											Polygon and Arbitrum typically offer the lowest gas fees for stablecoin operations. However, always check current network conditions as gas prices fluctuate. Nonolet shows gas costs for each route to help you choose the most cost-effective option.
										</AccordionPanel>
									</AccordionItem>

									<AccordionItem>
										<h2>
											<AccordionButton>
												<Box flex="1" textAlign="left" fontWeight="600">
													USDT to USDC: what's the cheapest route right now?
												</Box>
												<AccordionIcon />
											</AccordionButton>
										</h2>
										<AccordionPanel pb={4} color="#677076">
											The cheapest route varies by network and current liquidity conditions. Nonolet automatically compares all available routes and shows you the best option with the highest output amount. Refresh the page to get the latest quotes.
										</AccordionPanel>
									</AccordionItem>

									<AccordionItem>
										<h2>
											<AccordionButton>
												<Box flex="1" textAlign="left" fontWeight="600">
													Is USDC safer than USDT?
												</Box>
												<AccordionIcon />
											</AccordionButton>
										</h2>
										<AccordionPanel pb={4} color="#677076">
											Both are major stablecoins, but USDC is generally considered more transparent with regular attestations. However, both have proven track records. For large amounts, consider diversifying across multiple stablecoins to reduce counterparty risk.
										</AccordionPanel>
									</AccordionItem>

									<AccordionItem>
										<h2>
											<AccordionButton>
												<Box flex="1" textAlign="left" fontWeight="600">
													Best way to consolidate stablecoins across chains?
												</Box>
												<AccordionIcon />
											</AccordionButton>
										</h2>
										<AccordionPanel pb={4} color="#677076">
											Use bridges like Stargate or LayerZero to move stablecoins between chains, then use Nonolet to swap them to your preferred stablecoin. Consider gas fees on both networks when calculating total costs.
										</AccordionPanel>
									</AccordionItem>

									<AccordionItem>
										<h2>
											<AccordionButton>
												<Box flex="1" textAlign="left" fontWeight="600">
													What fees do I pay on a stablecoin swap?
												</Box>
												<AccordionIcon />
											</AccordionButton>
										</h2>
										<AccordionPanel pb={4} color="#677076">
											Network gas + DEX LP fee + any aggregator fee. The UI shows net output after all costs. Nonolet takes 0 fees - you get the exact same price as swapping directly through the chosen aggregator.
										</AccordionPanel>
									</AccordionItem>

									<AccordionItem>
										<h2>
											<AccordionButton>
												<Box flex="1" textAlign="left" fontWeight="600">
													How do I reduce slippage on USDT→USDC?
												</Box>
												<AccordionIcon />
											</AccordionButton>
										</h2>
										<AccordionPanel pb={4} color="#677076">
											For stablecoin pairs, start with low slippage (0.1-0.3%) since they should trade close to 1:1. If trades fail, gradually increase slippage. Larger trades may require higher slippage due to pool depth.
										</AccordionPanel>
									</AccordionItem>

									<AccordionItem>
										<h2>
											<AccordionButton>
												<Box flex="1" textAlign="left" fontWeight="600">
													What slippage tolerance should I use for stablecoins?
												</Box>
												<AccordionIcon />
											</AccordionButton>
										</h2>
										<AccordionPanel pb={4} color="#677076">
											Start low (0.1–0.3%) and adjust if routes fail due to pool depth. Stablecoins should trade close to 1:1, so high slippage usually indicates low liquidity or unusual market conditions.
										</AccordionPanel>
									</AccordionItem>

									<AccordionItem>
										<h2>
											<AccordionButton>
												<Box flex="1" textAlign="left" fontWeight="600">
													Why do I need to approve a token before swapping?
												</Box>
												<AccordionIcon />
											</AccordionButton>
										</h2>
										<AccordionPanel pb={4} color="#677076">
											Approvals grant the router permission to spend your token; required once per token/router. This is a security feature - tokens can't be moved without your explicit permission.
										</AccordionPanel>
									</AccordionItem>

									<AccordionItem>
										<h2>
											<AccordionButton>
												<Box flex="1" textAlign="left" fontWeight="600">
													Should I use infinite approvals?
												</Box>
												<AccordionIcon />
											</AccordionButton>
										</h2>
										<AccordionPanel pb={4} color="#677076">
											Convenience vs risk; set exact allowances if you prefer tighter control. Infinite approvals save gas but grant maximum spending permission. For security, consider setting specific amounts.
										</AccordionPanel>
									</AccordionItem>

									<AccordionItem>
										<h2>
											<AccordionButton>
												<Box flex="1" textAlign="left" fontWeight="600">
													How do I revoke token allowances?
												</Box>
												<AccordionIcon />
											</AccordionButton>
										</h2>
										<AccordionPanel pb={4} color="#677076">
											Use a token allowance tool or your wallet to reduce or revoke approvals. Visit <a href="https://revoke.cash/" target="_blank" rel="noopener noreferrer" style={{ color: '#3793FF', textDecoration: 'underline' }}>revoke.cash</a> to manage all your token approvals in one place.
										</AccordionPanel>
									</AccordionItem>

									<AccordionItem>
										<h2>
											<AccordionButton>
												<Box flex="1" textAlign="left" fontWeight="600">
													How do aggregators choose the best route?
												</Box>
												<AccordionIcon />
											</AccordionButton>
										</h2>
										<AccordionPanel pb={4} color="#677076">
											They simulate across venues, comparing price impact, fees, and gas to maximize output. Nonolet then compares across multiple aggregators to find the absolute best route available.
										</AccordionPanel>
									</AccordionItem>

									<AccordionItem>
										<h2>
											<AccordionButton>
												<Box flex="1" textAlign="left" fontWeight="600">
													Why did the route change after a refresh?
												</Box>
												<AccordionIcon />
											</AccordionButton>
										</h2>
										<AccordionPanel pb={4} color="#677076">
											Liquidity and prices update; quotes are time-sensitive. Market conditions change rapidly, so the best route now might be different from a few minutes ago. Always check the latest quote before executing.
										</AccordionPanel>
									</AccordionItem>

									<AccordionItem>
										<h2>
											<AccordionButton>
												<Box flex="1" textAlign="left" fontWeight="600">
													What off-ramp options exist?
												</Box>
												<AccordionIcon />
											</AccordionButton>
										</h2>
										<AccordionPanel pb={4} color="#677076">
											Use centralized exchanges like Coinbase, Binance, or Kraken to convert stablecoins to fiat. Some services like MoonPay or Ramp also offer direct fiat-to-crypto conversions. Always compare fees across platforms.
										</AccordionPanel>
									</AccordionItem>

									<AccordionItem>
										<h2>
											<AccordionButton>
												<Box flex="1" textAlign="left" fontWeight="600">
													How can I exchange my stablecoins to money in my bank account?
												</Box>
												<AccordionIcon />
											</AccordionButton>
										</h2>
										<AccordionPanel pb={4} color="#677076">
											Transfer stablecoins to a centralized exchange (Coinbase, Binance, etc.), then sell them for fiat currency and withdraw to your bank account. This process typically takes 1-3 business days.
										</AccordionPanel>
									</AccordionItem>

									<AccordionItem>
										<h2>
											<AccordionButton>
												<Box flex="1" textAlign="left" fontWeight="600">
													Do larger trades always get worse prices?
												</Box>
												<AccordionIcon />
											</AccordionButton>
										</h2>
										<AccordionPanel pb={4} color="#677076">
											Larger size increases price impact; splitting into batches can help. For very large trades, consider using multiple smaller transactions or specialized services designed for institutional-sized trades.
										</AccordionPanel>
									</AccordionItem>
								</Accordion>
							</AccordionPanel>
						</AccordionItem>
					</Accordion>
				</div>
			</FAQComponentWrapper>
		</>
	);
}
