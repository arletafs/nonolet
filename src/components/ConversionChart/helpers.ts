import type { TooltipFormatterParams } from './types';
import { CHART_ICONS, CHART_COLORS, CHART_SERIES_NAMES } from './constants';

export function createTooltipFormatter(currentOraclePrice?: number) {
    return function (params: TooltipFormatterParams[]) {
        const date = new Date(params[0].value[0]).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
        const time = new Date(params[0].value[0]).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });

        let tooltip = `<div style="background: linear-gradient(135deg, #1F2937 0%, #374151 100%); border: none; border-radius: 12px; padding: 16px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15); color: white; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; min-width: 240px;"><div style="text-align: center; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);"><div style="font-size: 14px; font-weight: 600; color: #F3F4F6;">${date}</div><div style="font-size: 12px; color: #9CA3AF; margin-top: 2px;">${time}</div></div>`;

        // Find prices
        let binancePrice: number | null = null;
        let oraclePrice: number | null = null;

        params.forEach((param) => {
            const price = Number(param.value[1]);
            const source = param.seriesName;
            const color = param.color;

            if (source === CHART_SERIES_NAMES.MARKET_PRICE) {
                binancePrice = price;
            } else if (source === CHART_SERIES_NAMES.EXECUTION_PRICE) {
                oraclePrice = price;
            }

            const icon = source === CHART_SERIES_NAMES.MARKET_PRICE ? CHART_ICONS.MARKET_PRICE : CHART_ICONS.EXECUTION_PRICE;

            tooltip += `<div style="display: flex; align-items: center; justify-content: space-between; margin: 8px 0; padding: 8px 12px; background: rgba(255, 255, 255, 0.08); border-radius: 8px; border-left: 3px solid ${color};"><div style="display: flex; align-items: center;"><span style="margin-right: 8px; font-size: 16px;">${icon}</span><span style="font-size: 13px; color: #E5E7EB; font-weight: 500;">${source}</span></div><span style="font-size: 14px; font-weight: 700; color: ${color};">$${price.toFixed(4)}</span></div>`;
        });

        // Show current Oracle price if needed
        if (binancePrice !== null && oraclePrice === null && currentOraclePrice) {
            oraclePrice = currentOraclePrice;
            tooltip += `<div style="display: flex; align-items: center; justify-content: space-between; margin: 8px 0; padding: 8px 12px; background: rgba(245, 158, 11, 0.15); border-radius: 8px; border-left: 3px solid ${CHART_COLORS.EXECUTION_PRICE};"><div style="display: flex; align-items: center;"><span style="margin-right: 8px; font-size: 16px;">${CHART_ICONS.EXECUTION_PRICE}</span><span style="font-size: 13px; color: #E5E7EB; font-weight: 500;">${CHART_SERIES_NAMES.EXECUTION_PRICE}<span style="color: #9CA3AF; font-size: 11px; font-weight: 400; margin-left: 4px;">(current)</span></span></div><span style="font-size: 14px; font-weight: 700; color: ${CHART_COLORS.EXECUTION_PRICE};">$${oraclePrice.toFixed(4)}</span></div>`;
        }

        // Price difference
        if (binancePrice !== null && oraclePrice !== null) {
            const diffPercent = ((oraclePrice - binancePrice) / binancePrice * 100);
            const diffSign = diffPercent >= 0 ? '+' : '';
            const isPositive = diffPercent >= 0;
            const diffColor = isPositive ? CHART_COLORS.POSITIVE : CHART_COLORS.NEGATIVE;
            const diffBgColor = isPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';
            const diffIcon = isPositive ? CHART_ICONS.POSITIVE_TREND : CHART_ICONS.NEGATIVE_TREND;

            tooltip += `<div style="margin-top: 12px; padding: 12px; background: ${diffBgColor}; border-radius: 8px; text-align: center; border: 1px solid ${diffColor}40;"><div style="display: flex; align-items: center; justify-content: center; margin-bottom: 4px;"><span style="margin-right: 6px; font-size: 14px;">${diffIcon}</span><span style="font-size: 12px; color: #D1D5DB; font-weight: 500;">Price Difference</span></div><div style="font-size: 16px; font-weight: 700; color: ${diffColor};">${diffSign}${Math.abs(diffPercent).toFixed(2)}%</div><div style="font-size: 11px; color: #9CA3AF; margin-top: 2px;">Execution ${isPositive ? 'premium' : 'discount'}</div></div>`;
        }

        tooltip += '</div>';
        return tooltip;
    };
} 