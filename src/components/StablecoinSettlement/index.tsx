import {
	Text,
	Image
} from '@chakra-ui/react';
import styled from 'styled-components';
import iconStablecoinSettlement from '~/public/icon-settlement.svg';
import Loader from '~/components/Aggregator/Loader';
import RoutesPreview from '~/components/Aggregator/RoutesPreview';
import { useRouter } from 'next/router';
import { useGetRoutes } from '~/queries/useGetRoutes';
import { ArrowBackIcon, ArrowForwardIcon, RepeatIcon, SettingsIcon } from '@chakra-ui/icons';

const StablecoinSettlementWrapper = styled.div`
	display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    width: 100%;
    height: 100%;
    border-radius: 12px;
	color: #3B3B3B;
	font-family: 'Urbanist', sans-serif;
    `;

const StablecoinSettlementFilters = styled.div`
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

const StablecoinSettlementContent = styled.div`
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
	font-family: 'Urbanist', sans-serif;
`;

export default function FundingOptions() {
	return <StablecoinSettlementWrapper>
				<Image src={iconStablecoinSettlement.src} alt="Stablecoin Settlement" style={{ marginBottom: '16px' }}/>
				<Text fontSize="48px" fontWeight="bold">Stablecoin Settlement</Text>
				<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
					<p>Evaluate each stablecoin's stability, liquidity, and risk to make informed settlement choices.</p>
					<StablecoinSettlementFilters>
						<ButtonFilter>USD</ButtonFilter>
						<span>to</span>
						<ButtonFilter>EUR</ButtonFilter>
					</StablecoinSettlementFilters>
				</div>
				<StablecoinSettlementContent>
					<Text fontSize="24px" fontWeight="bold">
						Settlement Analysis Coming Soon
					</Text>
					<Text fontSize="16px">
						Detailed stablecoin stability and risk metrics will be available here.
					</Text>
				</StablecoinSettlementContent>
			</StablecoinSettlementWrapper>
}