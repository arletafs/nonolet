import type { TimeFilter } from './types';

export const TIME_FILTER_CONFIG = {
    '1D': { days: 1, interval: '15m' as const },
    '1W': { days: 7, interval: '1h' as const },
    '1M': { days: 30, interval: '1d' as const }
} as const;

export const TIME_FILTER_LABELS: Record<TimeFilter, string> = {
    '1D': '1 Day',
    '1W': '1 Week',
    '1M': '1 Month'
};

export const CHART_COLORS = {
    MARKET_PRICE: '#14b8a6',
    EXECUTION_PRICE: '#F59E0B',
    POSITIVE: '#10B981',
    NEGATIVE: '#EF4444'
};

export const CHART_SERIES_NAMES = {
    MARKET_PRICE: 'Market price',
    EXECUTION_PRICE: 'Execution price'
};

export const CHART_ICONS = {
    MARKET_PRICE: '📈',
    EXECUTION_PRICE: '⚡',
    POSITIVE_TREND: '📈',
    NEGATIVE_TREND: '📉'
}; 