import * as React from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import ThemeProvider, { GlobalStyle } from '~/Theme';
import { Phishing } from './Phishing';
import ConnectButton from '~/components/Aggregator/ConnectButton';
import { SettingsIcon } from '@chakra-ui/icons';

const PageWrapper = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	isolation: isolate;
	padding: 8px;
	box-sizing: border-box;

	@media screen and (min-width: ${({ theme }) => theme.bpMed}) {
		padding: 16px;
	}

	@media screen and (min-width: ${({ theme }) => theme.bpLg}) {
		padding: 28px;
	}
`;

const Center = styled.main`
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 4px;
	width: 100%;
	min-height: 100%;
	margin: 0 auto;
	color: ${({ theme }) => theme.text1};
	max-width: 100%;
	overflow-x: hidden;

	@media screen and (min-width: ${({ theme }) => theme.bpMed}) {
		gap: 8px;
	}
`;

const Hero = styled.div`
	background-image: url('/hero.png');
	background-position: center;
	background-repeat: no-repeat;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: flex-start;
	padding-top: 30px;
	width: 100%;
	height: 50vh;
	border-radius: 16px;
	position: relative;
	overflow: hidden;
	min-height: 300px;

	@media screen and (min-width: ${({ theme }) => theme.bpMed}) {
		height: 80vh;
		border-radius: 30px;
		padding-top: 80px;
	}
`;

const WalletButtonContainer = styled.div`
	position: absolute;
	top: 20px;
	right: 20px;
	z-index: 10;
	display: flex;
	align-items: center;
	gap: 12px;

	@media screen and (min-width: ${({ theme }) => theme.bpMed}) {
		top: 30px;
		right: 30px;
		gap: 16px;
	}
`;

const MirrorText = styled.div`
	font-size: clamp(24px, 6vw, 64px);
	font-weight: bold;
	background: linear-gradient(180deg, #F1F4F8 0%, #3793FF 100%);
	-webkit-background-clip: text;
	background-clip: text;
	-webkit-text-fill-color: transparent;
	color: transparent;
	position: relative;
	font-family: 'Urbanist';
	text-align: center;
	max-width: 100%;
	white-space: nowrap;
	padding-bottom: 50px;

	@media screen and (max-width: ${({ theme }) => theme.bpMed}) {
		white-space: normal;
		word-break: break-word;
		line-height: 1.1;
		padding-bottom: 40px;
	}

	&::after {
		content: 'All aggregators. All stablecoins. All at once.';
		position: absolute;
		top: 30%;
		left: 0;
		right: 0;
		font-size: clamp(24px, 6vw, 64px);
		font-weight: bold;
		background: linear-gradient(180deg, #F1F4F8 0%, #3793FF 100%);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
		color: transparent;
		transform: scaleY(-1);
		opacity: 0.2;
		mask: linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 70%);
		-webkit-mask: linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 70%);
		white-space: nowrap;
		text-align: center;
		pointer-events: none;

		@media screen and (max-width: ${({ theme }) => theme.bpMed}) {
			white-space: normal;
			word-break: break-word;
		}
	}
`;

interface ILayoutProps {
	title: string;
	children: React.ReactNode;
	defaultSEO?: boolean;
	backgroundColor?: string;
	style?: React.CSSProperties;
	onSettingsClick?: () => void;
}

export default function Layout({ title, children, onSettingsClick, ...props }: ILayoutProps) {
	return (
		<>
			<Head>
				<title>{title}</title>
			</Head>
			{/* <Phishing /> */}
			<ThemeProvider>
				<GlobalStyle />
				<PageWrapper>
					<Center {...props}>
						<Hero>
							<WalletButtonContainer>
								<ConnectButton {...(props as any)} />
								<SettingsIcon
									onClick={onSettingsClick}
									cursor="pointer"
									color="white"
									boxSize={4}
									_hover={{ color: 'gray.200' }}
								/>
							</WalletButtonContainer>
							<MirrorText>All aggregators. All stablecoins. All at once.</MirrorText>
							{/* <p style={{ fontSize: '32px', color: 'white', marginBottom: '10px', fontFamily: 'Urbanist', fontWeight: 'bold' }}>All aggregators. All stablecoins. All at once.</p> */}
							{/* <p style={{ fontSize: '20px', color: 'white', fontFamily: 'Urbanist' }}>All aggregators. All stablecoins. All at once.</p> */}
						</Hero>
						{children}
					</Center>
				</PageWrapper>
			</ThemeProvider>
		</>
	);
}
