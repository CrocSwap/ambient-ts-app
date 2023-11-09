import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { bandLineData, lineData, scaleData } from '../../ChartUtils/chartUtils';

export function createBandArea(
    xScale: d3.ScaleLinear<number, number>,
    yScale: d3.ScaleLinear<number, number>,
    denomInBase: boolean,
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
            context.fillStyle = 'rgba(115, 113, 252, 0.15)';
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
export function createPointsOfDPRangeLine(data: lineData[]) {
    const startX = Math.min(data[0].x, data[1].x);
    const startY = Math.max(data[0].y, data[1].y);
    const endX = Math.max(data[0].x, data[1].x);
    const endY = Math.min(data[0].y, data[1].y);

    const lineOfDPRange = [
        [
            {
                x: startX + (endX - startX) / 2,
                y: startY,
                denomInBase: data[0].denomInBase,
            },
            {
                x: startX + (endX - startX) / 2,
                y: endY,
                denomInBase: data[1].denomInBase,
            },
        ],
        [
            {
                x: startX,
                y: startY - (startY - endY) / 2,
                denomInBase: data[0].denomInBase,
            },
            {
                x: endX,
                y: startY - (startY - endY) / 2,
                denomInBase: data[0].denomInBase,
            },
        ],
    ];

    return lineOfDPRange;
}

export function createArrowPointsOfDPRangeLine(
    data: lineData[],
    scaleData: scaleData,
    denomInBase: boolean,
) {
    const firstCirclePoint =
        denomInBase === data[0].denomInBase ? data[0].y : 1 / data[0].y;
    const lastCirclePoint =
        denomInBase === data[1].denomInBase ? data[1].y : 1 / data[1].y;

    const horizontalArrowDirection =
        firstCirclePoint > lastCirclePoint ? 'down' : 'up';
    const verticalArrowDirection = data[0].x < data[1].x ? 'right' : 'left';

    const fistYData =
        denomInBase === data[0].denomInBase ? data[0].y : 1 / data[0].y;
    const lastYData =
        denomInBase === data[1].denomInBase ? data[1].y : 1 / data[1].y;

    const startX = Math.min(data[0].x, data[1].x);
    const startY =
        denomInBase === data[0].denomInBase
            ? Math.max(fistYData, lastYData)
            : 1 / Math.max(fistYData, lastYData);
    const endX = Math.max(data[0].x, data[1].x);
    const endY =
        denomInBase === data[1].denomInBase
            ? Math.min(fistYData, lastYData)
            : 1 / Math.min(fistYData, lastYData);

    const horizontalArrowYAxisData =
        horizontalArrowDirection === 'down' ? endY : startY;
    const horizontalArrowXAxisData = startX + (endX - startX) / 2;

    const verticalArrowYAxisData = startY + (endY - startY) / 2;
    const verticalArrowXAxisData =
        verticalArrowDirection === 'right' ? endX : startX;

    const horizontalArrowLinePointWithDenom = scaleData.yScale.invert(
        scaleData.yScale(
            denomInBase === data[0].denomInBase
                ? horizontalArrowYAxisData
                : 1 / horizontalArrowYAxisData,
        ) + (horizontalArrowDirection === 'down' ? -20 : 20),
    );

    const veritcalFirstArrowLinePointWithDenom = scaleData.yScale.invert(
        scaleData.yScale(
            denomInBase === data[0].denomInBase
                ? verticalArrowYAxisData
                : 1 / verticalArrowYAxisData,
        ) + 20,
    );
    const veritcalSecondArrowLinePointWithDenom = scaleData.yScale.invert(
        scaleData.yScale(
            denomInBase === data[0].denomInBase
                ? verticalArrowYAxisData
                : 1 / verticalArrowYAxisData,
        ) - 20,
    );

    const horizontalArrow = [
        [
            {
                x: scaleData.xScale.invert(
                    scaleData.xScale(horizontalArrowXAxisData) - 20,
                ),
                y:
                    denomInBase === data[0].denomInBase
                        ? horizontalArrowLinePointWithDenom
                        : 1 / horizontalArrowLinePointWithDenom,
                denomInBase: data[0].denomInBase,
            },
            {
                x: horizontalArrowXAxisData,
                y: horizontalArrowYAxisData,
                denomInBase: data[1].denomInBase,
            },
        ],
        [
            {
                x: horizontalArrowXAxisData,
                y: horizontalArrowYAxisData,
                denomInBase: data[0].denomInBase,
            },
            {
                x: scaleData.xScale.invert(
                    scaleData.xScale(horizontalArrowXAxisData) + 20,
                ),
                y:
                    denomInBase === data[0].denomInBase
                        ? horizontalArrowLinePointWithDenom
                        : 1 / horizontalArrowLinePointWithDenom,
                denomInBase: data[0].denomInBase,
            },
        ],
    ];

    const verticalArrow = [
        [
            {
                x: scaleData.xScale.invert(
                    scaleData.xScale(verticalArrowXAxisData) +
                        (verticalArrowDirection === 'right' ? -20 : 20),
                ),
                y:
                    denomInBase === data[0].denomInBase
                        ? veritcalFirstArrowLinePointWithDenom
                        : 1 / veritcalFirstArrowLinePointWithDenom,
                denomInBase: data[0].denomInBase,
            },
            {
                x: verticalArrowXAxisData,
                y: verticalArrowYAxisData,
                denomInBase: data[1].denomInBase,
            },
        ],
        [
            {
                x: verticalArrowXAxisData,
                y: verticalArrowYAxisData,
                denomInBase: data[0].denomInBase,
            },
            {
                x: scaleData.xScale.invert(
                    scaleData.xScale(verticalArrowXAxisData) +
                        (verticalArrowDirection === 'right' ? -20 : 20),
                ),
                y:
                    denomInBase === data[0].denomInBase
                        ? veritcalSecondArrowLinePointWithDenom
                        : 1 / veritcalSecondArrowLinePointWithDenom,
                denomInBase: data[0].denomInBase,
            },
        ],
    ];

    return [...horizontalArrow, ...verticalArrow];
}
