import type { IToken } from '~/types';

export interface ConversionChartProps {
    fromToken?: IToken | null;
    toToken?: IToken | null;
    chain?: string;
}

export type TimeFilter = '1D' | '1W' | '1M';

export interface ChartDataPoint {
    timestamp: number;
    binancePrice: number;
    oraclePrice: number;
    volume: number;
}

export interface TooltipFormatterParams {
    value: [number, number];
    seriesName: string;
    color: string;
} 