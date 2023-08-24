import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { bandLineData, lineData } from '../../ChartUtils/chartUtils';

export function createBandArea(
    xScale: d3.ScaleLinear<number, number>,
    yScale: d3.ScaleLinear<number, number>,
) {
    return d3fc
        .annotationCanvasBand()
        .xScale(xScale)
        .yScale(yScale)
        .fromValue((d: bandLineData) => d.fromValue)
        .toValue((d: bandLineData) => d.toValue)
        .decorate((context: CanvasRenderingContext2D) => {
            context.fillStyle = 'rgba(41,98,255,0.15)';
        });
}

export function createPointsOfBandLine(data: lineData[]) {
    const startX = data[0].x;
    const startY = data[0].y;
    const endX = data[1].x;
    const endY = data[1].y;

    const lineOfBand = [
        [
            { x: startX, y: startY },
            { x: startX, y: endY },
        ],
        [
            { x: startX, y: startY },
            { x: endX, y: startY },
        ],
        [
            { x: endX, y: endY },
            { x: endX, y: startY },
        ],
        [
            { x: endX, y: endY },
            { x: startX, y: endY },
        ],
    ];

    return lineOfBand;
}
