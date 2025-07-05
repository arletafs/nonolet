import { ConnectButton } from '@rainbow-me/rainbowkit';
import styled from 'styled-components';
import { HistoryModal } from '../HistoryModal';

const Wrapper = styled.div`
	z-index: 100;
	display: flex;
	gap: 8px;
`;

const StyledConnectButton = styled.div`
	/* Style the ConnectButton wrapper */
	> div {
		/* Target the inner button */
		button {
			background: transparent !important;
			border: 1px solid #3793FF !important;
			border-radius: 20px !important;
			font-weight: 600 !important;
			font-size: 14px !important;
			font-family: 'Urbanist' !important;
			color: #3793FF !important;

			&:hover {
				background: #3793FF !important;
				color: #FFFFFF !important;
			}
		}
	}
`;

const Connect = ({ tokenList = null, tokensUrlMap = {}, tokensSymbolsMap = {} }) => {
	return (
		<Wrapper>
			<StyledConnectButton>
				<ConnectButton chainStatus={'none'} />
			</StyledConnectButton>
			{tokenList ? <HistoryModal tokensUrlMap={tokensUrlMap} tokensSymbolsMap={tokensSymbolsMap} /> : null}
		</Wrapper>
	);
};

export default Connect;
