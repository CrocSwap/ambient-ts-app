import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { lineData } from './DrawCanvas';

export function createLinearLineSeries(
    xScale: d3.ScaleLinear<number, number>,
    yScale: d3.ScaleLinear<number, number>,
) {
    return d3fc
        .seriesCanvasLine()
        .mainValue((d: lineData) => d.y)
        .crossValue((d: lineData) => d.x)
        .curve(d3.curveBundle)
        .xScale(xScale)
        .yScale(yScale)
        .decorate((context: CanvasRenderingContext2D) => {
            context.strokeStyle = '#7371fc';
            context.lineWidth = 2;
        });
}
