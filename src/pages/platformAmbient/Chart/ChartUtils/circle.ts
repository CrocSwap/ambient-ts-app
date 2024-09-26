import { drawDataHistory, lineData, scaleData } from './chartUtils';
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as d3 from 'd3';
import * as d3fc from 'd3fc';

export const selectedCircleSize = 80;

const selectedCircleFillColor = 'wheat';

const circleOrderSellFillColor = 'rgba(115, 113, 252, 0.3)';
const circleOrderBuyFillColor = 'rgba(205, 193, 255, 0.3)';
// const howeredCircleFillColor = 'wheat';

export function createCircle(
    xScale: any,
    yScale: any,
    size: number,
    lineWidth: number,
    denomInBase: boolean,
    isSelected = false,
    isTransparent = false,
    isBuy: boolean | undefined = undefined,
    sellColor = '--accent1',
    buyColor = '--accent5',
) {
    return d3fc
        .seriesCanvasPoint()
        .xScale(xScale)
        .yScale(yScale)
        .crossValue((d: lineData) => d.x)
        .mainValue((d: lineData) =>
            denomInBase === d.denomInBase ? d.y : 1 / d.y,
        )
        .size(size)
        .type(d3.symbolCircle)
        .decorate((context: any) => {
            const style = getComputedStyle(context.canvas);

            const circleStrokeColor = style.getPropertyValue(sellColor);
            const circleBuyStrokeColor = style.getPropertyValue(buyColor);

            const circleStrokeColorBackground =
                style.getPropertyValue(sellColor);
            const circleBuyStrokeColorBackground =
                style.getPropertyValue(buyColor);

            const d3BuyStrokeColorBacground = d3.color(
                circleBuyStrokeColorBackground,
            );
            const d3SellStrokeColorBacground = d3.color(
                circleStrokeColorBackground,
            );

            if (d3BuyStrokeColorBacground)
                d3BuyStrokeColorBacground.opacity = 0.3;
            if (d3SellStrokeColorBacground)
                d3SellStrokeColorBacground.opacity = 0.3;

            const buyFill = d3BuyStrokeColorBacground
                ? d3BuyStrokeColorBacground.toString()
                : circleOrderBuyFillColor;
            const sellFill = d3SellStrokeColorBacground
                ? d3SellStrokeColorBacground.toString()
                : circleOrderSellFillColor;

            context.strokeStyle =
                isBuy !== undefined
                    ? isBuy
                        ? circleBuyStrokeColor
                        : circleStrokeColor
                    : circleStrokeColor;

            context.fillStyle = isTransparent
                ? 'transparent'
                : isSelected
                  ? selectedCircleFillColor
                  : isBuy !== undefined
                    ? isBuy
                        ? buyFill
                        : sellFill
                    : circleStrokeColor;

            context.lineWidth = lineWidth;
        });
}

export function checkCircleLocation(
    element: drawDataHistory,
    mouseX: number,
    mouseY: number,
    scaleData: scaleData,
    denomInBase: boolean,
) {
    const circleDiameter = Math.sqrt(selectedCircleSize / Math.PI);
    let result = undefined;

    const data = createCirclePoints(element, denomInBase);

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

function createCirclePoints(element: drawDataHistory, denomInBase: boolean) {
    if (
        element.type === 'Brush' ||
        element.type === 'Angle' ||
        element.type === 'FibRetracement' ||
        element.type === 'DPRange'
    ) {
        const data: lineData[] = [];

        element.data.forEach((item) => {
            data.push({
                x: item.x,
                y: denomInBase === item.denomInBase ? item.y : 1 / item.y,
                denomInBase: item.denomInBase,
            } as lineData);
        });

        return data;
    }

    if (element.type === 'Rect') {
        const startX = element.data[0].x;
        const startY =
            element.data[0].denomInBase === denomInBase
                ? element.data[0].y
                : 1 / element.data[0].y;
        const endX = element.data[1].x;
        const endY =
            element.data[1].denomInBase === denomInBase
                ? element.data[1].y
                : 1 / element.data[1].y;

        const data: lineData[] = [
            { x: startX, y: startY, denomInBase: denomInBase },
            { x: startX, y: endY, denomInBase: denomInBase },
            { x: endX, y: startY, denomInBase: denomInBase },
            { x: endX, y: endY, denomInBase: denomInBase },
        ];

        return data;
    }

    if (element.type === 'Ray') {
        const data: lineData[] = [];

        data.push({
            x: element.data[1].x,
            y:
                denomInBase === element.data[1].denomInBase
                    ? element.data[1].y
                    : 1 / element.data[1].y,
            denomInBase: element.data[1].denomInBase,
        } as lineData);

        return data;
    }
}
