import type { TimeFilter, ChartDataPoint } from './types';
import { TIME_FILTER_CONFIG } from './constants';

export function processChartData(
    binanceChartData: any[],
    timeFilter: TimeFilter,
    oraclePrice?: number
): ChartDataPoint[] {
    if (!binanceChartData.length) return [];

    const config = TIME_FILTER_CONFIG[timeFilter];
    const now = Date.now();
    const cutoffTime = now - (config.days * 24 * 60 * 60 * 1000);

    return binanceChartData
        .filter(point => point.timestamp >= cutoffTime)
        .map(point => ({
            timestamp: point.timestamp,
            binancePrice: point.price,
            oraclePrice: oraclePrice || 0,
            volume: point.volume
        }));
}

export function createOracleChartData(
    processedChartData: ChartDataPoint[],
    oraclePrice?: number,
    timeFilter?: TimeFilter
): [number, number][] {
    if (!processedChartData.length || !oraclePrice || !timeFilter) return [];

    const now = Date.now();
    const points: [number, number][] = [];

    // Always show 2 Oracle data points with consistent visual length (5% of total timeframe)
    const numPoints = 2;
    const config = TIME_FILTER_CONFIG[timeFilter];
    const totalTimeMs = config.days * 24 * 60 * 60 * 1000;
    const timeSpacing = totalTimeMs * 0.05; // 5% of total timeframe

    // Create points working backwards from now
    for (let i = 0; i < numPoints; i++) {
        const timestamp = now - (i * timeSpacing);
        // Ensure we don't go before the start of our data
        const minTimestamp = processedChartData[0]?.timestamp || now;
        const finalTimestamp = Math.max(timestamp, minTimestamp);
        points.unshift([finalTimestamp, oraclePrice]);
    }

    return points;
} 