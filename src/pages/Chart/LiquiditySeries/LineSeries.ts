import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { LiquidityDataLocal } from '../../Trade/TradeCharts/TradeCharts';

export function createLineSeries(
    xScale: d3.ScaleLinear<number, number>,
    yScale: d3.ScaleLinear<number, number>,
    threshold: number,
    liqMode: string,
) {
    const lineSellColor = 'rgba(115, 113, 252)';
    const lineBuyColor = 'rgba(205, 193, 255)';

    return d3fc
        .seriesCanvasLine()
        .orient('horizontal')
        .curve(liqMode === 'curve' ? d3.curveBasis : d3.curveStepBefore)
        .mainValue((d: LiquidityDataLocal) => d.activeLiq)
        .crossValue((d: LiquidityDataLocal) => d.liqPrices)
        .xScale(xScale)
        .yScale(yScale)
        .decorate(
            (context: CanvasRenderingContext2D, d: LiquidityDataLocal[]) => {
                if (d[0].liqPrices > threshold) {
                    context.strokeStyle = lineSellColor;
                } else {
                    context.strokeStyle = lineBuyColor;
                }
            },
        );
}
