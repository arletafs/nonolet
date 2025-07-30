import * as echarts from 'echarts/core';
import { SVGRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import { DataZoomComponent, GraphicComponent, GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { uniqueId } from 'lodash';
import {
	Text,
	Flex,
	Spinner,
	Alert,
	AlertIcon
} from '@chakra-ui/react';

// Local imports
import type { ConversionChartProps, TimeFilter } from './types';
import { TIME_FILTER_CONFIG, TIME_FILTER_LABELS, CHART_COLORS, CHART_SERIES_NAMES } from './constants';
import { ChartWrapper, ChartFilters, ButtonFilter, ChartContent } from './styled';
import { createTooltipFormatter } from './helpers';
import { processChartData, createOracleChartData } from './chartUtils';

// Assets
import logo from '~/public/defillama-light-neutral.png';

// Hooks
import { useBinancePrice } from '~/queries/useBinancePrice';
import { useGetPrice } from '~/queries/useGetPrice';

// ECharts setup
echarts.use([SVGRenderer, LineChart, GridComponent, TooltipComponent, GraphicComponent, DataZoomComponent, LegendComponent]);

export default function ConversionChart({ fromToken, toToken, chain }: ConversionChartProps) {
	const [timeFilter, setTimeFilter] = useState<TimeFilter>('1W');
	const chartId = useMemo(() => uniqueId('conversion-chart-'), []);

	// Data fetching
	const tokenSymbol = fromToken?.symbol;
	const config = TIME_FILTER_CONFIG[timeFilter];

	const {
		price: binancePrice,
		chartData: binanceChartData,
		isLoading: binanceLoading,
		error: binanceError,
		bestMarket: _bestMarket
	} = useBinancePrice({
		tokenSymbol,
		enabled: !!tokenSymbol,
		interval: config.interval,
		limit: config.days <= 1 ? 96 : config.days <= 7 ? 168 : 30
	});

	const {
		data: oracleData,
		isLoading: oracleLoading
	} = useGetPrice({
		chain,
		fromToken: fromToken?.address,
		toToken: toToken?.address
	});

	// State calculations
	const isLoading = binanceLoading || oracleLoading;
	const hasData = binancePrice && oracleData?.fromTokenPrice;
	const showChart = hasData && binanceChartData.length > 0;
	const currentOraclePrice = oracleData?.fromTokenPrice;

	// Data processing
	const processedChartData = useMemo(() =>
		processChartData(binanceChartData, timeFilter, currentOraclePrice || undefined),
		[binanceChartData, timeFilter, currentOraclePrice]
	);

	const oracleChartData = useMemo(() =>
		createOracleChartData(processedChartData, currentOraclePrice || undefined, timeFilter),
		[processedChartData, currentOraclePrice, timeFilter]
	);

	// Chart setup
	const createInstance = useCallback(() => {
		const el = document.getElementById(chartId);
		if (el) {
			return echarts.getInstanceByDom(el) ?? echarts.init(el);
		}
		return null;
	}, [chartId]);

	// Chart rendering effect
	useEffect(() => {
		if (!showChart || !processedChartData.length) return;

		const chartInstance = createInstance();
		if (!chartInstance) return;

		const binanceData = processedChartData.map(point => [point.timestamp, point.binancePrice]);
		const tooltipFormatter = createTooltipFormatter(currentOraclePrice || undefined);

		chartInstance.setOption({
			grid: {
				left: '3%',
				right: '4%',
				bottom: '10%',
				top: '15%',
				containLabel: true
			},
			graphic: {
				type: 'image',
				z: 0,
				style: {
					image: logo.src,
					height: 30,
					opacity: 0.1
				},
				left: 'center',
				top: 'center'
			},
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'cross'
				},
				formatter: tooltipFormatter
			},
			legend: {
				data: [CHART_SERIES_NAMES.MARKET_PRICE, CHART_SERIES_NAMES.EXECUTION_PRICE],
				top: '5%',
				textStyle: {
					color: '#3B3B3B'
				}
			},
			xAxis: {
				type: 'time',
				axisLabel: {
					formatter: function (value: number) {
						const date = new Date(value);
						return timeFilter === '1W'
							? date.toLocaleDateString([], { month: 'short', day: 'numeric' })
							: date.toLocaleDateString([], { month: 'short', day: 'numeric' });
					}
				},
				axisLine: {
					lineStyle: { color: '#E5E7EB' }
				},
				splitLine: {
					lineStyle: { color: '#F3F4F6', opacity: 0.5 }
				}
			},
			yAxis: {
				type: 'value',
				name: 'Price (USD)',
				nameTextStyle: {
					color: '#6B7280',
					fontSize: 12
				},
				axisLabel: {
					formatter: (value: number) => '$' + value.toFixed(4),
					color: '#6B7280'
				},
				axisLine: {
					lineStyle: { color: '#E5E7EB' }
				},
				splitLine: {
					lineStyle: { color: '#F3F4F6', opacity: 0.5 }
				}
			},
			series: [
				{
					name: CHART_SERIES_NAMES.MARKET_PRICE,
					type: 'line',
					data: binanceData,
					smooth: true,
					symbol: 'none',
					lineStyle: {
						color: CHART_COLORS.MARKET_PRICE,
						width: 2
					},
					areaStyle: {
						color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
							{ offset: 0, color: 'rgba(20, 184, 166, 0.3)' },
							{ offset: 1, color: 'rgba(20, 184, 166, 0.05)' }
						])
					}
				},
				{
					name: CHART_SERIES_NAMES.EXECUTION_PRICE,
					type: 'line',
					data: oracleChartData,
					smooth: false,
					symbol: 'circle',
					symbolSize: 6,
					showSymbol: true,
					lineStyle: {
						color: CHART_COLORS.EXECUTION_PRICE,
						width: 4,
						type: 'solid'
					},
					emphasis: {
						lineStyle: {
							width: 6
						},
						symbolSize: 8
					}
				}
			],
			animation: true,
			animationDuration: 1000
		});

		function resize() {
			chartInstance?.resize();
		}

		window.addEventListener('resize', resize);

		return () => {
			window.removeEventListener('resize', resize);
		};
	}, [createInstance, showChart, processedChartData, timeFilter, chartId, oracleChartData, currentOraclePrice]);

	return (
		<ChartWrapper>
			<Text fontSize="48px" fontWeight="bold" mt="40px">CONVERSION CHART</Text>

			<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
				<Text
					fontSize={{ base: "10px", sm: "11px", md: "14px" }}
					color="gray.500"
					lineHeight="1.4"
					mt="8px"
				>
					{tokenSymbol ? `${tokenSymbol} price: Historical market data vs current execution price` : 'Historical market prices vs current execution prices'}
				</Text>
				<ChartFilters>
					{(['1D', '1W', '1M'] as TimeFilter[]).map(filter => (
						<ButtonFilter
							key={filter}
							$isActive={timeFilter === filter}
							onClick={() => setTimeFilter(filter)}
						>
							{TIME_FILTER_LABELS[filter]}
						</ButtonFilter>
					))}
				</ChartFilters>
			</div>

			<ChartContent>
				{binanceError && (
					<Alert status="warning" borderRadius="md">
						<AlertIcon />
						Unable to fetch market price data. Please check your connection.
					</Alert>
				)}

				{isLoading ? (
					<Flex direction="column" align="center" justify="center" height="100%">
						<Spinner size="lg" color="teal.500" />
						<Text mt={4} color="gray.600">Loading price data...</Text>
					</Flex>
				) : !tokenSymbol ? (
					<Flex direction="column" align="center" justify="center" height="100%">
						<Text fontSize="lg" color="gray.600">Select a token to view price chart</Text>
					</Flex>
				) : !showChart ? (
					<Flex direction="column" align="center" justify="center" height="100%">
						<Text fontSize="lg" color="gray.600">No Data</Text>
						<Text mt={2} color="gray.600">
							{binanceError ? 'Price data unavailable' : 'No chart data available for this token'}
						</Text>
					</Flex>
				) : (
					<div id={chartId} style={{ width: '100%', height: '100%' }} />
				)}
			</ChartContent>

		</ChartWrapper>
	);
}