/* eslint-disable @typescript-eslint/no-explicit-any */
import * as d3fc from 'd3fc';

export function createIndicatorLine(xScale: any, yScale: any) {
    return d3fc
        .annotationCanvasLine()
        .orient('vertical')
        .value((d: any) => d)
        .xScale(xScale)
        .yScale(yScale)
        .label('')
        .decorate((context: any) => {
            context.strokeStyle = '#E480FF';
            context.lineWidth = 0.5;
        });
}
