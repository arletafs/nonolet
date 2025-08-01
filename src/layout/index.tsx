import * as React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import styled from 'styled-components';
import ThemeProvider, { GlobalStyle } from '~/Theme';
import ConnectButton from '~/components/Aggregator/ConnectButton';
import { SettingsIcon } from '@chakra-ui/icons';
import NoIndexOnQuery from '~/components/NoIndexOnQuery';

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

const HeroImageContainer = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: -1;
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

				{/* Favicon */}
				<link rel="icon" type="image/x-icon" href="/favicon.ico" />
				<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
				<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
				<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
				<link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />

				{/* Basic SEO */}
				<meta name="description" content="Nonolet - The ultimate DEX aggregator. Compare prices across all major DEXs and swap stablecoins with the best rates. All aggregators. All stablecoins. All at once." />
				<meta name="keywords" content="DEX aggregator, cryptocurrency, DeFi, stablecoin swap, best rates, decentralized exchange, crypto trading" />
				<meta name="author" content="Nonolet" />
				<meta name="robots" content="index, follow" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<meta name="theme-color" content="#131926" />

				{/* Open Graph / Facebook */}
				<meta property="og:type" content="website" />
				<meta property="og:url" content="https://nonolet.xyz/" />
				<meta property="og:title" content="Nonolet - All aggregators. All stablecoins. All at once." />
				<meta property="og:description" content="The ultimate DEX aggregator. Compare prices across all major DEXs and swap stablecoins with the best rates." />
				<meta property="og:image" content="https://nonolet.xyz/android-chrome-512x512.png" />
				<meta property="og:site_name" content="Nonolet" />

				{/* Twitter */}
				<meta property="twitter:card" content="summary_large_image" />
				<meta property="twitter:url" content="https://nonolet.xyz/" />
				<meta property="twitter:title" content="Nonolet - All aggregators. All stablecoins. All at once." />
				<meta property="twitter:description" content="The ultimate DEX aggregator. Compare prices across all major DEXs and swap stablecoins with the best rates." />
				<meta property="twitter:image" content="https://nonolet.xyz/android-chrome-512x512.png" />

				{/* Additional SEO */}
				<meta name="application-name" content="Nonolet" />
				<meta name="apple-mobile-web-app-title" content="Nonolet" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-status-bar-style" content="default" />
				<meta name="format-detection" content="telephone=no" />
				<meta name="mobile-web-app-capable" content="yes" />

				{/* Security */}
				<meta httpEquiv="X-UA-Compatible" content="IE=edge" />
				<meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />

				<NoIndexOnQuery />
			</Head>
			{/* <Phishing /> */}
			<ThemeProvider>
				<GlobalStyle />
				<PageWrapper>
					<Center {...props}>
						<Hero id="hero-section">
							<HeroImageContainer>
								<Image
									src="/hero.png"
									alt="Nonolet DEX Aggregator Hero Background"
									fill
									priority
									sizes="100vw"
									style={{
										objectFit: 'cover',
										objectPosition: 'center',
									}}
								/>
							</HeroImageContainer>
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
						</Hero>
						{children}
					</Center>
				</PageWrapper>
			</ThemeProvider>
		</>
	);
}
