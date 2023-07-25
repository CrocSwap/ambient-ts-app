import { LiquidityDataLocal } from '../../Trade/TradeCharts/TradeCharts';
import * as d3 from 'd3';
import * as d3fc from 'd3fc';

const liqAskColor = 'rgba(205, 193, 255, 0.3)';
const liqBidColor = 'rgba(115, 113, 252, 0.3)';

export function createAreaSeries(
    xScale: d3.ScaleLinear<number, number>,
    yScale: d3.ScaleLinear<number, number>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    curve: any,
) {
    return d3fc
        .seriesCanvasArea()
        .orient('horizontal')
        .curve(curve)
        .decorate((context: CanvasRenderingContext2D) => {
            context.fillStyle = 'transparent';
        })
        .mainValue((d: LiquidityDataLocal) => d.activeLiq)
        .crossValue((d: LiquidityDataLocal) => d.liqPrices)
        .xScale(xScale)
        .yScale(yScale);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function decorateForLiquidityArea(series: any, threshold: number) {
    series.decorate(
        (context: CanvasRenderingContext2D, d: LiquidityDataLocal[]) => {
            if (d[0]?.liqPrices > threshold) {
                context.fillStyle = liqBidColor;
            } else {
                context.fillStyle = liqAskColor;
            }
        },
    );
}
