import {
	Text,
	Image
} from '@chakra-ui/react';
import styled from 'styled-components';
import iconConversion from '~/public/icon-conversion.svg';

const ChartWrapper = styled.div`
	display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    width: 100%;
    height: 100%;
    border-radius: 12px;
	color: #3B3B3B;
    `;

const ChartFilters = styled.div`
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

const ChartContent = styled.div`
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

export default function ConversionChart() {
	return <ChartWrapper>
				<Image src={iconConversion.src} alt="Conversion Chart" style={{ marginBottom: '16px' }}/>
				<Text fontSize="48px" fontWeight="bold">Conversion Chart</Text>
				<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
					<p>Oracle prices vs stablecoin market prices.</p>
					<ChartFilters>
						<ButtonFilter>1 Week</ButtonFilter>
						<ButtonFilter>1 Month</ButtonFilter>
						<ButtonFilter>3 Months</ButtonFilter>
					</ChartFilters>
				</div>
				<ChartContent>
					<Text>Enter chart here</Text>
				</ChartContent>
			</ChartWrapper>
}