import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { bandLineData, lineData } from '../../ChartUtils/chartUtils';

export function createBandArea(
    xScale: d3.ScaleLinear<number, number>,
    yScale: d3.ScaleLinear<number, number>,
    denomInBase: boolean,
    color = 'rgba(41,98,255,0.15)',
) {
    return d3fc
        .annotationCanvasBand()
        .xScale(xScale)
        .yScale(yScale)
        .fromValue((d: bandLineData) =>
            denomInBase === d.denomInBase ? d.fromValue : 1 / d.fromValue,
        )
        .toValue((d: bandLineData) =>
            denomInBase === d.denomInBase ? d.toValue : 1 / d.toValue,
        )
        .decorate((context: CanvasRenderingContext2D) => {
            context.fillStyle = color;
        });
}

export function createPointsOfBandLine(data: lineData[]) {
    const startX = data[0].x;
    const startY = data[0].y;
    const endX = data[1].x;
    const endY = data[1].y;

    const lineOfBand = [
        [
            { x: startX, y: startY, denomInBase: data[0].denomInBase },
            { x: startX, y: endY, denomInBase: data[1].denomInBase },
        ],
        [
            { x: startX, y: startY, denomInBase: data[0].denomInBase },
            { x: endX, y: startY, denomInBase: data[0].denomInBase },
        ],
        [
            { x: endX, y: endY, denomInBase: data[1].denomInBase },
            { x: endX, y: startY, denomInBase: data[0].denomInBase },
        ],
        [
            { x: endX, y: endY, denomInBase: data[1].denomInBase },
            { x: startX, y: endY, denomInBase: data[1].denomInBase },
        ],
    ];

    return lineOfBand;
}

export function isPointInRect(
    x: number,
    y: number,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
) {
    const rightLineBorder = Math.max(startX, endX);
    const leftLineBorder = Math.min(startX, endX);

    const toptLineBorder = Math.max(startY, endY);
    const bottLineBorder = Math.min(startY, endY);

    if (
        x > leftLineBorder &&
        x < rightLineBorder &&
        y < toptLineBorder &&
        y > bottLineBorder
    ) {
        return true;
    }

    return false;
}
