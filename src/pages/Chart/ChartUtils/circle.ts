/* eslint-disable @typescript-eslint/no-explicit-any */
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { lineData } from './chartUtils';

export function createCircle(
    xScale: any,
    yScale: any,
    size: number,
    lineWidth: number,
) {
    return d3fc
        .seriesCanvasPoint()
        .xScale(xScale)
        .yScale(yScale)
        .crossValue((d: lineData) => xScale.invert(d.x))
        .mainValue((d: lineData) => yScale.invert(d.y))
        .size(size)
        .type(d3.symbolCircle)
        .decorate((context: any) => {
            context.strokeStyle = '#7371fc';
            context.fillStyle = '#0d1117';
            context.lineWidth = lineWidth;
        });
}
