import * as d3 from 'd3';
import * as d3fc from 'd3fc';

export function createLineSeries(
    xScale: any,
    yScale: any,
    threshold: number,
    liqMode: string,
) {
    const lineSellColor = 'rgba(115, 113, 252)';
    const lineBuyColor = 'rgba(205, 193, 255)';

    return d3fc
        .seriesCanvasLine()
        .orient('horizontal')
        .curve(liqMode === 'curve' ? d3.curveBasis : d3.curveStepBefore)
        .mainValue((d: any) => d.activeLiq)
        .crossValue((d: any) => d.liqPrices)
        .xScale(xScale)
        .yScale(yScale)
        .decorate((selection: any, d: any) => {
            if (d[0].liqPrices > threshold) {
                selection.strokeStyle = lineSellColor;
            } else {
                selection.strokeStyle = lineBuyColor;
            }
            selection.strokeWidth = 4;
        });
}
