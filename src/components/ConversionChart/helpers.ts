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

        let tooltip = `<div style="background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 12px; padding: 16px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.6); color: hsl(220, 9%, 46%); font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; min-width: 240px; position: relative; z-index: 1000;">`;

        // Add date and time header
        tooltip += `<div style="text-align: center; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid rgba(0, 0, 0, 0.1);">`;
        tooltip += `<div style="font-size: 14px; font-weight: 600; color: hsl(220, 15%, 20%);">${date}</div>`;
        tooltip += `<div style="font-size: 12px; color: hsl(220, 9%, 46%); margin-top: 2px;">${time}</div>`;
        tooltip += `</div>`;

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

            tooltip += `<div style="display: flex; align-items: center; justify-content: space-between; margin: 8px 0; padding: 8px 12px; background: rgba(0, 0, 0, 0.04); border-radius: 8px; border-left: 3px solid ${color};">`;
            tooltip += `<div style="display: flex; align-items: center;">`;
            if (icon) {
                tooltip += `<span style="margin-right: 8px; font-size: 16px;">${icon}</span>`;
            }
            tooltip += `<span style="font-size: 13px; color: hsl(220, 15%, 20%); font-weight: 500;">${source}</span>`;
            tooltip += `</div>`;
            tooltip += `<span style="font-size: 14px; font-weight: 700; color: ${color};">$${price.toFixed(4)}</span>`;
            tooltip += `</div>`;
        });

        // Show current Oracle price if needed
        if (binancePrice !== null && oraclePrice === null && currentOraclePrice) {
            oraclePrice = currentOraclePrice;
            tooltip += `<div style="display: flex; align-items: center; justify-content: space-between; margin: 8px 0; padding: 8px 12px; background: rgba(245, 158, 11, 0.1); border-radius: 8px; border-left: 3px solid ${CHART_COLORS.EXECUTION_PRICE};">`;
            tooltip += `<div style="display: flex; align-items: center;">`;
            if (CHART_ICONS.EXECUTION_PRICE) {
                tooltip += `<span style="margin-right: 8px; font-size: 16px;">${CHART_ICONS.EXECUTION_PRICE}</span>`;
            }
            tooltip += `<span style="font-size: 13px; color: hsl(220, 15%, 20%); font-weight: 500;">${CHART_SERIES_NAMES.EXECUTION_PRICE}<span style="color: hsl(220, 9%, 46%); font-size: 11px; font-weight: 400; margin-left: 4px;">(current)</span></span>`;
            tooltip += `</div>`;
            tooltip += `<span style="font-size: 14px; font-weight: 700; color: ${CHART_COLORS.EXECUTION_PRICE};">$${oraclePrice.toFixed(4)}</span>`;
            tooltip += `</div>`;
        }

        // Price difference
        if (binancePrice !== null && oraclePrice !== null) {
            const diffPercent = ((oraclePrice - binancePrice) / binancePrice * 100);
            const diffSign = diffPercent >= 0 ? '+' : '';
            const isPositive = diffPercent >= 0;
            const diffColor = isPositive ? CHART_COLORS.POSITIVE : CHART_COLORS.NEGATIVE;
            const diffBgColor = isPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';
            const diffIcon = isPositive ? CHART_ICONS.POSITIVE_TREND : CHART_ICONS.NEGATIVE_TREND;

            tooltip += `<div style="margin-top: 12px; padding: 12px; background: ${diffBgColor}; border-radius: 8px; text-align: center; border: 1px solid ${diffColor}40;">`;
            tooltip += `<div style="display: flex; align-items: center; justify-content: center; margin-bottom: 4px;">`;
            if (diffIcon) {
                tooltip += `<span style="margin-right: 6px; font-size: 14px; font-weight: 700; color: ${diffColor};">${diffIcon}</span>`;
            }
            tooltip += `<span style="font-size: 12px; color: hsl(220, 15%, 20%); font-weight: 500;">Price Difference</span>`;
            tooltip += `</div>`;
            tooltip += `<div style="font-size: 16px; font-weight: 700; color: ${diffColor};">${diffSign}${Math.abs(diffPercent).toFixed(2)}%</div>`;
            tooltip += `<div style="font-size: 11px; color: hsl(220, 9%, 46%); margin-top: 2px;">Execution ${isPositive ? 'premium' : 'discount'}</div>`;
            tooltip += `</div>`;
        }

        tooltip += '</div>';
        return tooltip;
    };
} 