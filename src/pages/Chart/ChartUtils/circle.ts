import { drawDataHistory, lineData, scaleData } from './chartUtils';
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as d3 from 'd3';
import * as d3fc from 'd3fc';

export const circleSize = 60;

const circleStrokeColor = '#7371fc';
const circleFillColor = '#8A8AFF';
const selectedCircleFillColor = 'wheat';

export function createCircle(
    xScale: any,
    yScale: any,
    size: number,
    lineWidth: number,
    isSelected = false,
) {
    return d3fc
        .seriesCanvasPoint()
        .xScale(xScale)
        .yScale(yScale)
        .crossValue((d: lineData) => d.x)
        .mainValue((d: lineData) => d.y)
        .size(size)
        .type(d3.symbolCircle)
        .decorate((context: any) => {
            context.strokeStyle = circleStrokeColor;
            context.fillStyle = isSelected
                ? selectedCircleFillColor
                : circleFillColor;
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

    const data = createCirclePoints(element);

    if (data && scaleData) {
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

function createCirclePoints(element: drawDataHistory) {
    if (element.type === 'Brush') {
        const data: lineData[] = [];

        element.data.forEach((item) => {
            data.push(item);
        });

        return data;
    }

    if (element.type === 'Square') {
        const startX = element.data[0].x;
        const startY = element.data[0].y;
        const endX = element.data[1].x;
        const endY = element.data[1].y;

        const data: lineData[] = [
            { x: startX, y: startY, ctx: undefined },
            { x: startX, y: endY, ctx: undefined },
            { x: endX, y: startY, ctx: undefined },
            { x: endX, y: endY, ctx: undefined },
        ];

        return data;
    }
}
