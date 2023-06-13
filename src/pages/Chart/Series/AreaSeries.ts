import * as d3 from 'd3';
import * as d3fc from 'd3fc';

export function createAreaSeries(
    xScale: any,
    yScale: any,
    threshold: number,
    liqMode: string,
) {
    const liqAskColor = 'rgba(205, 193, 255, 0.3)';
    const liqBidColor = 'rgba(115, 113, 252, 0.3)';

    return d3fc
        .seriesCanvasArea()
        .decorate((context: any, d: any) => {
            if (d[0].liqPrices > threshold) {
                context.fillStyle = liqBidColor;
            } else {
                context.fillStyle = liqAskColor;
            }
        })
        .orient('horizontal')
        .curve(liqMode === 'curve' ? d3.curveBasis : d3.curveStepBefore)
        .mainValue((d: any) => d.activeLiq)
        .crossValue((d: any) => d.liqPrices)
        .xScale(xScale)
        .yScale(yScale);
}
