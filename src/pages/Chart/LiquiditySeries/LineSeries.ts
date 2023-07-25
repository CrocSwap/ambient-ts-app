import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { LiquidityDataLocal } from '../../Trade/TradeCharts/TradeCharts';
const lineSellColor = 'rgba(115, 113, 252)';
const lineBuyColor = 'rgba(205, 193, 255)';

export function createLineSeries(
    xScale: d3.ScaleLinear<number, number>,
    yScale: d3.ScaleLinear<number, number>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    curve: any,
) {
    console.log({ curve });

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function decorateForLiquidityLine(series: any, threshold: number) {
    series.decorate(
        (context: CanvasRenderingContext2D, d: LiquidityDataLocal[]) => {
            if (d[0]?.liqPrices > threshold) {
                context.strokeStyle = lineSellColor;
            } else {
                context.strokeStyle = lineBuyColor;
            }
        },
    );
}
