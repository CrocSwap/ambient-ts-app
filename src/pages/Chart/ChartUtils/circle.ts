import { drawDataHistory, lineData, scaleData } from './chartUtils';
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as d3 from 'd3';
import * as d3fc from 'd3fc';

export const circleSize = 60;

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
        .crossValue((d: lineData) => d.x)
        .mainValue((d: lineData) => d.y)
        .size(size)
        .type(d3.symbolCircle)
        .decorate((context: any, d: any) => {
            if (d.isSelected) {
                context.strokeStyle = '#7371fc';
                context.fillStyle = 'white';
            } else {
                context.strokeStyle = '#7371fc';
                context.fillStyle = '#8A8AFF';
            }

            context.lineWidth = lineWidth;
        });
}

export function checkCricleLocation(
    element: drawDataHistory,
    mouseX: number,
    mouseY: number,
    scaleData: scaleData,
) {
    const circleDiameter = Math.sqrt(circleSize / Math.PI);
    let result = undefined;
    const data = element.data;

    if (scaleData) {
        for (let i = 0; i < data.length; i++) {
            if (
                scaleData.xScale(data[i].x) < mouseX + circleDiameter &&
                scaleData.yScale(data[i].y) < mouseY + circleDiameter &&
                scaleData.xScale(data[i].x) > mouseX - circleDiameter &&
                scaleData.yScale(data[i].y) > mouseY - circleDiameter
            ) {
                result = data[i];
                break;
            }
        }
    }
    return result;
}
