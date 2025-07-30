'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Spinner, Flex, Text } from '@chakra-ui/react';
import type { ConversionChartProps } from './types';

// Dynamic import to avoid SSR issues with ECharts ES modules
const ConversionChartComponent = dynamic(
	() => import('./ConversionChartClient'),
	{
		loading: () => (
			<Flex direction="column" align="center" p={8} minH="400px" justify="center">
				<Spinner size="lg" color="blue.500" />
				<Text mt={4} color="gray.600">Loading chart...</Text>
			</Flex>
		),
		ssr: false
	}
);

export default function ConversionChart(props: ConversionChartProps) {
	return <ConversionChartComponent {...props} />;
}