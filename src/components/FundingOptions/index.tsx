import {
	Text,
	Image
} from '@chakra-ui/react';
import styled from 'styled-components';
import iconFundingOptions from '~/public/icon-funding-options.svg';

const FundingWrapper = styled.div`
	display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    width: 100%;
    height: 100%;
    border-radius: 12px;
    padding: 16px;
	color: #3B3B3B;
    `;

const FundingFilters = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	gap: 10px;
`;

const ButtonFilter = styled.button`
	border-radius: 30px;
	padding: 8px 16px;
	font-size: 14px;
	font-weight: 600;
	border: 1px solid #BCD1DF;
	width: 100px;
`;

const FundingContent = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 10px;
	background-color: #FFFFFF;
	border-radius: 30px;
	padding: 16px;
	width: 100%;
	height: 100%;
	margin-top: 16px;
`;

export default function FundingOptions() {
	return <FundingWrapper>
				<Image src={iconFundingOptions.src} alt="Funding Options" style={{ marginBottom: '16px' }}/>
				<Text fontSize="24px" fontWeight="bold">Funding Options</Text>
				<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
					<p>View the funding source by comparing your balances and price impact across assets in real time.</p>
					<FundingFilters>
						<ButtonFilter>USD</ButtonFilter>
						<span>to</span>
						<ButtonFilter>EUR</ButtonFilter>
					</FundingFilters>
				</div>
				<FundingContent>
					<Text>Enter table here</Text>
				</FundingContent>
			</FundingWrapper>
}