import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { bandLineData, lineData, scaleData } from '../../ChartUtils/chartUtils';

export function createBandArea(
    xScale: d3.ScaleLinear<number, number>,
    yScale: d3.ScaleLinear<number, number>,
    denomInBase: boolean,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options?: any,
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
            context.fillStyle = options.background.color;
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createPointsOfDPRangeLine(data: lineData[], xScale: any) {
    const startX = Math.min(xScale(data[0].x), xScale(data[1].x));
    const startY = Math.max(data[0].y, data[1].y);
    const endX = Math.max(xScale(data[0].x), xScale(data[1].x));
    const endY = Math.min(data[0].y, data[1].y);

    const lineOfDPRange = [
        [
            {
                x: xScale.invert(startX + (endX - startX) / 2),
                y: startY,
                denomInBase: data[0].denomInBase,
            },
            {
                x: xScale.invert(startX + (endX - startX) / 2),
                y: endY,
                denomInBase: data[1].denomInBase,
            },
        ],
        [
            {
                x: xScale.invert(startX),
                y: startY - (startY - endY) / 2,
                denomInBase: data[0].denomInBase,
            },
            {
                x: xScale.invert(endX),
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
    arrowSize: number,
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
    const endX = Math.max(data[0].x, data[1].x);

    const startY =
        denomInBase === data[0].denomInBase
            ? Math.max(fistYData, lastYData)
            : 1 / Math.max(fistYData, lastYData);
    const endY =
        denomInBase === data[1].denomInBase
            ? Math.min(fistYData, lastYData)
            : 1 / Math.min(fistYData, lastYData);

    const horizontalArrowYAxisData =
        horizontalArrowDirection === 'down' ? endY : startY;

    const horizontalArrowXAxisData =
        scaleData.drawingLinearxScale(startX) +
        (scaleData.drawingLinearxScale(endX) -
            scaleData.drawingLinearxScale(startX)) /
            2;

    const verticalArrowYAxisData = startY + (endY - startY) / 2;

    const verticalArrowXAxisData =
        verticalArrowDirection === 'right' ? endX : startX;

    const horizontalArrowLinePointWithDenom = scaleData.yScale.invert(
        scaleData.yScale(
            denomInBase === data[0].denomInBase
                ? horizontalArrowYAxisData
                : 1 / horizontalArrowYAxisData,
        ) + (horizontalArrowDirection === 'down' ? -arrowSize : arrowSize),
    );

    const veritcalFirstArrowLinePointWithDenom = scaleData.yScale.invert(
        scaleData.yScale(
            denomInBase === data[0].denomInBase
                ? verticalArrowYAxisData
                : 1 / verticalArrowYAxisData,
        ) + arrowSize,
    );
    const veritcalSecondArrowLinePointWithDenom = scaleData.yScale.invert(
        scaleData.yScale(
            denomInBase === data[0].denomInBase
                ? verticalArrowYAxisData
                : 1 / verticalArrowYAxisData,
        ) - arrowSize,
    );

    const horizontalArrow = [
        [
            {
                x: scaleData.drawingLinearxScale.invert(
                    horizontalArrowXAxisData - arrowSize,
                ),
                y:
                    denomInBase === data[0].denomInBase
                        ? horizontalArrowLinePointWithDenom
                        : 1 / horizontalArrowLinePointWithDenom,
                denomInBase: data[0].denomInBase,
            },
            {
                x: scaleData.drawingLinearxScale.invert(
                    horizontalArrowXAxisData,
                ),
                y: horizontalArrowYAxisData,
                denomInBase: data[1].denomInBase,
            },
        ],
        [
            {
                x: scaleData.drawingLinearxScale.invert(
                    horizontalArrowXAxisData,
                ),
                y: horizontalArrowYAxisData,
                denomInBase: data[0].denomInBase,
            },
            {
                x: scaleData.drawingLinearxScale.invert(
                    horizontalArrowXAxisData + arrowSize,
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
                x: scaleData.drawingLinearxScale.invert(
                    scaleData.drawingLinearxScale(verticalArrowXAxisData) +
                        (verticalArrowDirection === 'right'
                            ? -arrowSize
                            : arrowSize),
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
                x: scaleData.drawingLinearxScale.invert(
                    scaleData.drawingLinearxScale(verticalArrowXAxisData) +
                        (verticalArrowDirection === 'right'
                            ? -arrowSize
                            : arrowSize),
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
