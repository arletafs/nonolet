import * as React from 'react';
import Head from 'next/head';
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

const WalletButtonContainer = styled.div`
	position: absolute;
	top: 20px;
	right: 20px;
	z-index: 10;
	display: flex;
	align-items: center;
	gap: 12px;
	margin: 20px;

	@media screen and (min-width: ${({ theme }) => theme.bpMed}) {
		top: 30px;
		right: 30px;
		gap: 16px;
	}
`;

const MobileWarningContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	min-height: 100vh;
	padding: 20px;
	text-align: center;
	background: ${({ theme }) => theme.bg1};
	color: ${({ theme }) => theme.text1};
`;

const MobileWarningContent = styled.div`
	max-width: 400px;
	padding: 40px;
	border-radius: 12px;
	background: ${({ theme }) => theme.bg2};
	border: 1px solid ${({ theme }) => theme.bg3};
`;

const MobileWarningTitle = styled.h1`
	font-size: 24px;
	font-weight: 600;
	margin-bottom: 16px;
	color: ${({ theme }) => theme.text1};
`;

const MobileWarningText = styled.p`
	font-size: 16px;
	line-height: 1.5;
	margin-bottom: 20px;
	color: ${({ theme }) => theme.text2};
`;

const DesktopIcon = styled.div`
	font-size: 48px;
	margin-bottom: 20px;
`;

// Hook to detect mobile devices
const useIsMobile = () => {
	const [isMobile, setIsMobile] = React.useState(false);

	React.useEffect(() => {
		const checkDevice = () => {
			const isSmallScreen = window.innerWidth <= 1024;
			setIsMobile(isSmallScreen);
		};

		checkDevice();
		window.addEventListener('resize', checkDevice);
		
		return () => window.removeEventListener('resize', checkDevice);
	}, []);

	return isMobile;
};

const MobileWarning = () => (
	<MobileWarningContainer>
		<MobileWarningContent>
			<DesktopIcon>🖥️</DesktopIcon>
			<MobileWarningTitle>Desktop Only</MobileWarningTitle>
			<MobileWarningText>
				This application only works on desktop devices. Please visit us from a desktop or laptop computer for the full experience.
			</MobileWarningText>
			<MobileWarningText style={{ fontSize: '14px', opacity: 0.8 }}>
				We're working on mobile support and will be available soon!
			</MobileWarningText>
		</MobileWarningContent>
	</MobileWarningContainer>
);

interface ILayoutProps {
	title: string;
	children: React.ReactNode;
	defaultSEO?: boolean;
	backgroundColor?: string;
	style?: React.CSSProperties;
	onSettingsClick?: () => void;
}

export default function Layout({ title, children, onSettingsClick, ...props }: ILayoutProps) {
	const isMobile = useIsMobile();

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
				{isMobile ? (
					<MobileWarning />
				) : (
					<PageWrapper>
						<Center {...props}>
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
							{children}
						</Center>
					</PageWrapper>
				)}
			</ThemeProvider>
		</>
	);
}
