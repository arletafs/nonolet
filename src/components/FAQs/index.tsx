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
					</Accordion>
				</div>
			</FAQComponentWrapper>
		</>
	);
}
