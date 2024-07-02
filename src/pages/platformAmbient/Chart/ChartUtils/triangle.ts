/* eslint-disable @typescript-eslint/no-explicit-any */
import * as d3 from 'd3';
import * as d3fc from 'd3fc';

export function createTriangle(xScale: any, yScale: any) {
    return d3fc
        .seriesCanvasPoint()
        .xScale(xScale)
        .yScale(yScale)
        .crossValue(() => {
            return xScale.domain()[0];
        })
        .mainValue((d: number) => d)
        .size(180)
        .type(d3.symbolTriangle)
        .decorate((context: any) => {
            const rotateDegree = 90;
            context.rotate((rotateDegree * Math.PI) / 180);
            context.strokeStyle = 'rgba(235, 235, 255)';
            context.fillStyle = 'rgba(235, 235, 255)';
        });
}
