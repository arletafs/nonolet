import {
	Image,
	Link
} from '@chakra-ui/react';
import styled from 'styled-components';
import llamaSwapIcon from '~/public/loader.png';

const FooterWrapper = styled.div`
	display: flex;
    flex-direction: column;
	align-items: center;
    width: 100vw;
    border-radius: 20px 20px 0 0;
	background-color: #131926;
	color: #FFFFFF;
	padding: 16px;
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	z-index: 9999;
	font-family: 'Urbanist', sans-serif;
	box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06);
    `;

export default function Footer() {
	return <FooterWrapper>
		<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '85%' }}>
			<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: '4px' }}>
				<span style={{ fontSize: '24px', fontWeight: '600' }}>Nonolet</span>
				<span style={{ fontSize: '12px', fontWeight: '400', color: '#9FACB4' }}>All aggregators. All stablecoins. All at once.</span>
			</div>
			<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
				<span style={{ fontSize: '12px', fontWeight: '400' }}>Powered by</span>
				<Link
					href="https://swap.defillama.com/?chain=ethereum&from=0x0000000000000000000000000000000000000000&tab=swap"
					isExternal
					style={{ display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
				>
					<Image src={llamaSwapIcon.src} alt="LlamaSwap" style={{ height: '16px' }} />
					<span style={{ fontSize: '12px', fontWeight: '400' }}>LlamaSwap</span>
				</Link>
			</div>
		</div>
	</FooterWrapper>
}