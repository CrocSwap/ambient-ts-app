import { drawDataHistory, lineData, scaleData } from './chartUtils';
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { ChartThemeIF } from '../../../../contexts/ChartContext';

export const selectedCircleSize = 80;

// const howeredCircleFillColor = 'wheat';

export function calculateCircleColor(
    sellFillColor: d3.RGBColor | d3.HSLColor,
    sellStrokeColor: d3.RGBColor | d3.HSLColor,
    buyFillColor: d3.RGBColor | d3.HSLColor,
    buyStrokeColor: d3.RGBColor | d3.HSLColor,
    isHighlighted: boolean,
) {
    const d3BuyStrokeColorBacground = buyStrokeColor;
    const d3SellStrokeColorBacground = sellStrokeColor;

    const d3BuyFillColorBacground = buyFillColor;
    const d3SellFillColorBacground = sellFillColor;

    if (d3BuyStrokeColorBacground)
        d3BuyStrokeColorBacground.opacity = isHighlighted ? 0.6 : 0.3;
    if (d3SellStrokeColorBacground)
        d3SellStrokeColorBacground.opacity = isHighlighted ? 0.6 : 0.3;

    if (d3BuyFillColorBacground)
        d3BuyFillColorBacground.opacity = isHighlighted ? 0.6 : 0.3;
    if (d3SellFillColorBacground)
        d3SellFillColorBacground.opacity = isHighlighted ? 0.6 : 0.3;

    return {
        buyFill: d3BuyFillColorBacground.toString(),
        sellFill: d3SellFillColorBacground.toString(),
        circleBuyStrokeColor: d3BuyStrokeColorBacground.toString(),
        circleSellStrokeColor: d3SellStrokeColorBacground.toString(),
    };
}

export function createCircle(
    xScale: any,
    yScale: any,
    size: number,
    lineWidth: number,
    denomInBase: boolean,
    isBuy: boolean | undefined = undefined,
    chartThemeColors?: ChartThemeIF,
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
        .decorate((context: CanvasRenderingContext2D) => {
            if (chartThemeColors) {
                // const strokeColor = isBuy
                //     ? chartThemeColors.upCandleBorderColor.copy()
                //     : chartThemeColors.downCandleBorderColor.copy();

                // const circleFillColor = isBuy
                //     ? chartThemeColors.upCandleBodyColor.copy()
                //     : chartThemeColors.downCandleBodyColor.copy();

                const colorPalette = calculateCircleColor(
                    chartThemeColors.orderSellColor.copy(),
                    chartThemeColors.orderSellColor.copy(),
                    chartThemeColors.orderBuyColor.copy(),
                    chartThemeColors.orderBuyColor.copy(),
                    false,
                );

                context.strokeStyle = isBuy
                    ? colorPalette.circleBuyStrokeColor
                    : colorPalette.circleSellStrokeColor;

                context.fillStyle = isBuy
                    ? colorPalette.buyFill
                    : colorPalette.sellFill;

                context.lineWidth = lineWidth;
            } else {
                context.strokeStyle = 'white';

                context.fillStyle = 'white';

                context.lineWidth = lineWidth;
            }
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
                scaleData.drawingLinearxScale(data[i].x) <
                    mouseX + circleDiameter &&
                scaleData.yScale(data[i].y) < mouseY + circleDiameter &&
                scaleData.drawingLinearxScale(data[i].x) >
                    mouseX - circleDiameter &&
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
