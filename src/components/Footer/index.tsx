import {
	Image
} from '@chakra-ui/react';
import styled from 'styled-components';
import llamaSwapIcon from '~/public/llamaswap.png';

const FooterWrapper = styled.div`
	display: flex;
    flex-direction: column;
	align-items: center;
    width: 100vw;
    border-radius: 30px 30px 0 0;
	background-color: #131926;
	color: #FFFFFF;
	padding: 30px;
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
				<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '80%' }}>
					<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: '10px' }}>
						<span style={{ fontSize: '32px', fontWeight: '600' }}>Nonolet</span>
						<span style={{ fontSize: '14px', fontWeight: '400', color: '#9FACB4' }}>Fast, accurate, and effortless conversions.</span>
					</div>
					<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
						<span style={{ fontSize: '14px', fontWeight: '400' }}>Powered by</span>
						<Image src={llamaSwapIcon.src} alt="LlamaSwap" style={{ height: '20px' }} />
					</div>
				</div>
			</FooterWrapper>
}