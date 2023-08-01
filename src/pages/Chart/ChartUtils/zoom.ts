import { scaleData } from './chartUtils';
import * as d3 from 'd3';

const maxNumCandlesForZoom = 2000;

// Helper function to get new candle data
export function getNewCandleDataLeft(
    newBoundary: number,
    firstCandleTime: number,
    period: number,
) {
    // Implementation for getting new candle data
    if (newBoundary && firstCandleTime && newBoundary < firstCandleTime) {
        const maxBoundary: number | undefined =
            firstCandleTime - 200 * period * 1000;

        const newLastCandle = newBoundary - 100 * period * 1000;

        const finalData =
            maxBoundary < newLastCandle ? maxBoundary : newLastCandle;

        const candleDomain = {
            lastCandleDate: firstCandleTime,
            domainBoundry: finalData,
        };

        return candleDomain;
    }
    return undefined;
}

export function getNewCandleDataRight(lastCandleTime: number) {
    const candleDomain = {
        lastCandleDate: new Date().getTime(),
        domainBoundry: lastCandleTime,
    };

    return candleDomain;
}

// Helper function to change the candle size
export function changeCandleSize(
    domainX: number[],
    deltaX: number,
    mouseX: number,
    period: number,
    zoomCandle?: number,
) {
    const point = zoomCandle ? zoomCandle : mouseX;

    const gapTop = domainX[1] - point;
    const gapBot = point - domainX[0];

    const minGap = Math.min(gapTop, gapBot);
    const maxGap = Math.max(gapTop, gapBot);
    let baseMovement = deltaX / (maxGap / minGap + 1);
    baseMovement = baseMovement === 0 ? deltaX : baseMovement;
    if (gapBot < gapTop) {
        return [
            domainX[0] - baseMovement,
            domainX[1] + baseMovement * (maxGap / minGap),
        ];
    } else {
        let minX = domainX[0] - baseMovement * (maxGap / minGap);
        let maxX = domainX[1] + baseMovement;

        if (new Date(minX * 1000).toString() === 'Invalid Date') {
            minX = domainX[0] - period * 1000 * maxNumCandlesForZoom;
        }

        if (new Date(maxX * 1000).toString() === 'Invalid Date') {
            maxX = domainX[1] + period * 1000;
        }
        return [minX, maxX];
    }
}

// Helper function to handle zoom with wheel event
export function zoomWithWheel(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    event: any,
    scaleData: scaleData,
    period: number,
    firstCandleDate: number,
    lastCandleDate: number,
) {
    const dx =
        Math.abs(event.sourceEvent.deltaX) != 0
            ? -event.sourceEvent.deltaX / 3
            : event.sourceEvent.deltaY / 3;

    const domainX = scaleData?.xScale.domain();
    const linearX = d3
        .scaleTime()
        .domain(scaleData?.xScale.range())
        .range([0, domainX[1] - domainX[0]]);

    const mouseX = scaleData?.xScale.invert(event.sourceEvent.offsetX);

    const lastTime = domainX[1];

    const firstTime = domainX[0];

    const deltaX = linearX(dx);

    const isPressAltOrShiftKey =
        (event.sourceEvent.shiftKey || event.sourceEvent.altKey) &&
        !event.sourceEvent.ctrlKey &&
        !event.sourceEvent.metaKey;

    const isPressCtrlOrMetaKey = !(
        (!event.sourceEvent.ctrlKey || event.sourceEvent.metaKey) &&
        (event.sourceEvent.ctrlKey || !event.sourceEvent.metaKey)
    );

    // const isZoomingIn = deltaX > 0;
    // const isZoomingOut = deltaX < 0;
    // const isZoomingInWithCandleCount = isZoomingOut || Math.abs(lastTime - firstTime) >= period * 1000 * 2;
    // const isZoomingOutCandleCount = isZoomingIn || Math.abs(lastTime - firstTime) <= period * 1000 * maxNumCandlesForZoom;
    if (isPressAltOrShiftKey) {
        return wheelWithPressAltKey(
            deltaX,
            scaleData,
            firstTime,
            firstCandleDate,
            period,
            lastCandleDate,
            lastTime,
        );
    } else {
        if (isPressCtrlOrMetaKey) {
            const domain = changeCandleSize(domainX, deltaX, mouseX, period);
            if (domain) {
                scaleData?.xScale.domain(domain);
            }
        } else {
            return wheelWithoutPressKey(
                deltaX,
                scaleData,
                firstTime,
                firstCandleDate,
                period,
                lastCandleDate,
                lastTime,
                mouseX,
            );
        }
    }
}

function wheelWithPressAltKey(
    deltaX: number,
    scaleData: scaleData,
    firstTime: number,
    firstCandleDate: number,
    period: number,
    lastCandleDate: number,
    lastTime: number,
) {
    let candleDomain = undefined;
    if (deltaX > 0) {
        candleDomain = getNewCandleDataLeft(
            firstTime - deltaX,
            firstCandleDate,
            period,
        );
    } else {
        if (lastCandleDate) {
            candleDomain = getNewCandleDataRight(lastCandleDate);
        }
    }

    scaleData?.xScale.domain([firstTime - deltaX, lastTime - deltaX]);

    return candleDomain;
}

function wheelWithoutPressKey(
    deltaX: number,
    scaleData: scaleData,
    firstTime: number,
    firstCandleDate: number,
    period: number,
    lastCandleDate: number,
    lastTime: number,
    mouseX: number,
) {
    const newBoundary = firstTime - deltaX;
    const isCandleVisible =
        newBoundary > lastCandleDate - period * 1000 * 2 && deltaX < 0;
    if (isCandleVisible) {
        return;
    } else {
        const candleDomain = getNewCandleDataLeft(
            newBoundary,
            firstCandleDate,
            period,
        );

        if (deltaX > 0) {
            if (lastTime > lastCandleDate) {
                const domain = changeCandleSize(
                    scaleData?.xScale.domain(),
                    deltaX,
                    mouseX,
                    period,
                    lastCandleDate,
                );
                if (domain) {
                    scaleData?.xScale.domain(domain);
                }
            } else {
                scaleData?.xScale.domain([newBoundary, lastTime]);
            }
        } else {
            // if the first candle stays to the left of the chart
            if (firstCandleDate < lastTime - period * 2 * 1000) {
                if (lastCandleDate <= lastTime && deltaX < 0) {
                    const domain = changeCandleSize(
                        scaleData?.xScale.domain(),
                        deltaX,
                        mouseX,
                        period,
                        lastCandleDate,
                    );
                    if (domain) {
                        scaleData?.xScale.domain(domain);
                    }
                } else {
                    scaleData?.xScale.domain([
                        firstTime - deltaX * 1.3,
                        lastTime,
                    ]);
                }
            } else {
                scaleData?.xScale.domain([firstTime, lastTime - deltaX]);
            }
        }

        return candleDomain;
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function handlePanning(event: any, scaleData: scaleData) {
    const domainY = scaleData?.yScale.domain();
    const linearY = d3
        .scaleLinear()
        .domain(scaleData?.yScale.range())
        .range([domainY[1] - domainY[0], 0]);

    const deltaY = linearY(event.sourceEvent.movementY);
    const domain = [
        Math.min(domainY[1], domainY[0]) + deltaY,
        Math.max(domainY[1], domainY[0]) + deltaY,
    ];

    return domain;
}

export function handlePanningOneTouch(
    event: any,
    scaleData: scaleData,
    previousTouch: any,
) {
    const domainY = scaleData?.yScale.domain();

    const linearY = d3
        .scaleLinear()
        .domain(scaleData?.yScale.range())
        .range([domainY[1] - domainY[0], 0]);

    const touch = event.sourceEvent.changedTouches[0];

    const _currentPageY = touch.pageY;
    const previousTouchPageY = previousTouch.pageY;
    const _movementY = _currentPageY - previousTouchPageY;

    const deltaY = linearY(_movementY);

    const domain = [
        Math.min(domainY[1], domainY[0]) + deltaY,
        Math.max(domainY[1], domainY[0]) + deltaY,
    ];

    return domain;
}

export function handlePanningMultiTouch() {
    return undefined;
}
