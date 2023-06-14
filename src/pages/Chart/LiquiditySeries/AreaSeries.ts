import { LiquidityDataLocal } from '../../Trade/TradeCharts/TradeCharts';
import * as d3 from 'd3';
import * as d3fc from 'd3fc';

export function createAreaSeries(
    xScale: d3.ScaleLinear<number, number>,
    yScale: d3.ScaleLinear<number, number>,
    threshold: number,
    liqMode: string,
) {
    const liqAskColor = 'rgba(205, 193, 255, 0.3)';
    const liqBidColor = 'rgba(115, 113, 252, 0.3)';

    return d3fc
        .seriesCanvasArea()
        .decorate(
            (context: CanvasRenderingContext2D, d: LiquidityDataLocal[]) => {
                if (d[0].liqPrices > threshold) {
                    context.fillStyle = liqBidColor;
                } else {
                    context.fillStyle = liqAskColor;
                }
            },
        )
        .orient('horizontal')
        .curve(liqMode === 'curve' ? d3.curveBasis : d3.curveStepBefore)
        .mainValue((d: LiquidityDataLocal) => d.activeLiq)
        .crossValue((d: LiquidityDataLocal) => d.liqPrices)
        .xScale(xScale)
        .yScale(yScale);
}
