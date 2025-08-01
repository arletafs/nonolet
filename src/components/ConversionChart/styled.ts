import styled from 'styled-components';

export const ChartWrapper = styled.div`
	display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    width: 80%;
    height: 100%;
    border-radius: 12px;
	color: #3B3B3B;
	font-family: 'Urbanist', sans-serif;
	margin: 0 auto;
`;

export const ChartFilters = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	gap: 10px;
`;

export const ButtonFilter = styled.button<{ $isActive?: boolean }>`
	border-radius: 30px;
	padding: 8px 16px;
	font-size: 14px;
	font-weight: 600;
	border: 1px solid ${({ $isActive }) => $isActive ? '#14b8a6' : '#BCD1DF'};
	background-color: ${({ $isActive }) => $isActive ? '#14b8a6' : 'transparent'};
	color: ${({ $isActive }) => $isActive ? 'white' : '#3B3B3B'};
	width: 100px;
	cursor: pointer;
	transition: all 0.2s ease;
	
	&:hover {
		border-color: #14b8a6;
		background-color: ${({ $isActive }) => $isActive ? '#14b8a6' : 'rgba(20, 184, 166, 0.1)'};
	}
`;

export const ChartContent = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 10px;
	background-color: #FFFFFF;
	border-radius: 30px;
	padding: 16px;
	width: 100%;
	height: 400px;
	margin-top: 16px;
	position: relative;
`; 