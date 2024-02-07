/* eslint-disable @typescript-eslint/no-explicit-any */
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { lineData } from '../../ChartUtils/chartUtils';
import {
    drawnShapeDefaultColor,
    drawnShapeDefaultLineWidth,
} from '../../ChartUtils/drawConstants';

export function createLinearLineSeries(
    xScale: d3.ScaleLinear<number, number>,
    yScale: d3.ScaleLinear<number, number>,
    denomInBase: boolean,
    options?: any,
) {
    return d3fc
        .seriesCanvasLine()
        .mainValue((d: lineData) =>
            denomInBase === d.denomInBase ? d.y : 1 / d.y,
        )
        .crossValue((d: lineData) => d.x)
        .curve(d3.curveBundle)
        .xScale(xScale)
        .yScale(yScale)
        .decorate((context: CanvasRenderingContext2D) => {
            context.strokeStyle = options.color;
            context.lineWidth = options.lineWidth;
            context.beginPath();
            context.setLineDash(options.dash);
            context.closePath();
        });
}

export function updateSeriesDecorate(series: any, options: any) {
    series.decorate((context: CanvasRenderingContext2D) => {
        context.strokeStyle = options.color;
        context.lineWidth = options.lineWidth;
    });
}

export function createAnnotationLineSeries(
    xScale: d3.ScaleLinear<number, number>,
    yScale: d3.ScaleLinear<number, number>,
    denomInBase: boolean,
) {
    return d3fc
        .annotationCanvasLine()
        .value((d: lineData) => (denomInBase === d.denomInBase ? d.y : 1 / d.y))
        .xScale(xScale)
        .yScale(yScale)
        .label('')
        .decorate((context: CanvasRenderingContext2D) => {
            context.strokeStyle = drawnShapeDefaultColor;
            context.lineWidth = drawnShapeDefaultLineWidth;
        });
}

export function distanceToLine(
    x: number,
    y: number,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
) {
    const A = x - startX;
    const B = y - startY;
    const C = endX - startX;
    const D = endY - startY;
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) {
        param = dot / lenSq;
    }

    let xx, yy;

    if (param < 0) {
        xx = startX;
        yy = startY;
    } else if (param > 1) {
        xx = endX;
        yy = endY;
    } else {
        xx = startX + param * C;
        yy = startY + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
}
