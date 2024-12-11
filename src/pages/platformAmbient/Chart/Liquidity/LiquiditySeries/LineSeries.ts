import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { LiquidityRangeIF } from '../../../../../ambient-utils/types';
import {
    ChartThemeIF,
    LiquidityDataLocal,
} from '../../../../../ambient-utils/types/contextTypes';
import { getActiveLiqDepth } from './AreaSeries';
const lineSellColor = 'rgba(115, 113, 252)';
const lineBuyColor = 'rgba(205, 193, 255)';

export function createLineSeries(
    xScale: d3.ScaleLinear<number, number>,
    yScale: d3.ScaleLinear<number, number>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    curve: any,
) {
    return d3fc
        .seriesCanvasLine()
        .orient('horizontal')
        .curve(curve)
        .mainValue((d: LiquidityDataLocal) => d.activeLiq)
        .crossValue((d: LiquidityDataLocal) => d.liqPrices)
        .xScale(xScale)
        .yScale(yScale)
        .decorate((context: CanvasRenderingContext2D) => {
            context.strokeStyle = 'transparent';
        });
}

export function decorateForLiquidityLine(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    series: any,
    chartThemeColors: ChartThemeIF,
    liqType: 'bid' | 'ask',
) {
    const d3BidColor = chartThemeColors.liqBidColor;
    const d3AskColor = chartThemeColors.liqAskColor;

    series.decorate((context: CanvasRenderingContext2D) => {
        if (liqType === 'bid') {
            context.strokeStyle = d3BidColor
                ? d3BidColor.toString()
                : lineSellColor;
        } else {
            context.strokeStyle = d3AskColor
                ? d3AskColor.toString()
                : lineBuyColor;
        }
    });
}

export function createLiquidityLineSeries(
    liqScale: d3.ScaleLinear<number, number>,
    xScale: d3.ScaleLinear<number, number>,
    yScale: d3.ScaleLinear<number, number>,
    liqType: 'bid' | 'ask',
    isDenomBase: boolean,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    curve: any,
    curveType: 'curve' | 'depth',
    chartThemeColors?: ChartThemeIF | undefined,
) {
    return d3fc
        .seriesCanvasLine()
        .orient('horizontal')
        .curve(curve)
        .mainValue((d: LiquidityRangeIF) =>
            liqScale(getActiveLiqDepth(d, curveType, isDenomBase)),
        )
        .crossValue((d: LiquidityRangeIF) => {
            if (liqType === 'bid') {
                return !isDenomBase
                    ? d.upperBoundInvPriceDecimalCorrected
                    : d.lowerBoundPriceDecimalCorrected;
            }
            if (liqType === 'ask') {
                return !isDenomBase
                    ? d.lowerBoundInvPriceDecimalCorrected
                    : d.upperBoundPriceDecimalCorrected;
            }
        })
        .xScale(xScale)
        .yScale(yScale)
        .decorate((context: CanvasRenderingContext2D) => {
            context.lineWidth = 1.5;
            if (liqType === 'bid') {
                context.strokeStyle =
                    chartThemeColors && chartThemeColors.downCandleBorderColor
                        ? chartThemeColors.downCandleBorderColor.toString()
                        : lineSellColor;
            }
            if (liqType === 'ask') {
                context.strokeStyle =
                    chartThemeColors && chartThemeColors.upCandleBorderColor
                        ? chartThemeColors.upCandleBorderColor.toString()
                        : lineBuyColor;
            }
        });
}
