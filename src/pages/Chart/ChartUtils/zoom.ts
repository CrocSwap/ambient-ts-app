import { Dispatch, SetStateAction } from 'react';
import { scaleData } from './chartUtils';
import * as d3 from 'd3';
import { candleDomain } from '../../../utils/state/tradeDataSlice';

const maxNumCandlesForZoom = 2000;

export class Zoom {
    setCandleDomains: Dispatch<SetStateAction<candleDomain>>;
    period: number;

    constructor(
        setCandleDomains: Dispatch<SetStateAction<candleDomain>>,
        period: number,
    ) {
        this.setCandleDomains = setCandleDomains;
        this.period = period;
    }

    public zoomWithWheel(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        event: any,
        scaleData: scaleData,
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
            this.wheelWithPressAltKey(
                deltaX,
                scaleData,
                firstTime,
                firstCandleDate,
                lastCandleDate,
                lastTime,
            );
        } else {
            if (isPressCtrlOrMetaKey) {
                return this.wheelWithPressCtrlKey(
                    deltaX,
                    scaleData,
                    mouseX,
                    firstTime,
                );
            } else {
                return this.wheelWithoutPressKey(
                    deltaX,
                    scaleData,
                    firstTime,
                    firstCandleDate,
                    lastCandleDate,
                    lastTime,
                    mouseX,
                );
            }
        }
    }

    public wheelWithPressCtrlKey(
        deltaX: number,
        scaleData: scaleData,
        mouseX: number,
        lastCandleDate: number,
    ) {
        const domainX = scaleData.xScale.domain();
        const domain = this.changeCandleSize(domainX, deltaX, mouseX);

        if (domain) {
            scaleData?.xScale.domain(domain);
        }

        this.getNewCandleDataLeftWithRight(scaleData, lastCandleDate);
    }

    private wheelWithoutPressKey(
        deltaX: number,
        scaleData: scaleData,
        firstTime: number,
        firstCandleDate: number,
        lastCandleDate: number,
        lastTime: number,
        mouseX: number,
    ) {
        const newBoundary = firstTime - deltaX;
        const isCandleVisible =
            newBoundary > lastCandleDate - this.period * 1000 * 2 && deltaX < 0;
        if (isCandleVisible) {
            return;
        } else {
            this.getNewCandleDataLeft(newBoundary, firstCandleDate);

            if (deltaX > 0) {
                if (lastTime > lastCandleDate) {
                    const domain = this.changeCandleSize(
                        scaleData?.xScale.domain(),
                        deltaX,
                        mouseX,
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
                if (firstCandleDate < lastTime - this.period * 2 * 1000) {
                    if (lastCandleDate <= lastTime && deltaX < 0) {
                        const domain = this.changeCandleSize(
                            scaleData?.xScale.domain(),
                            deltaX,
                            mouseX,
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
        }
    }

    private wheelWithPressAltKey(
        deltaX: number,
        scaleData: scaleData,
        firstTime: number,
        firstCandleDate: number,
        lastCandleDate: number,
        lastTime: number,
    ) {
        if (deltaX > 0) {
            this.getNewCandleDataLeft(firstTime - deltaX, firstCandleDate);
        } else {
            if (lastCandleDate) {
                this.getNewCandleDataRight(scaleData, lastCandleDate);
            }
        }

        scaleData?.xScale.domain([firstTime - deltaX, lastTime - deltaX]);
    }

    public getNewCandleDataRight(scaleData: scaleData, lastCandleTime: number) {
        let lastDomainDate =
            scaleData?.xScale.domain()[1] + this.period * 1000 * 200;
        const nowDate = Date.now();
        if (lastDomainDate > nowDate) {
            lastDomainDate = nowDate;
        }
        const candleDomain = {
            lastCandleDate: lastDomainDate,
            domainBoundry: lastCandleTime,
        };

        this.setCandleDomains(candleDomain);
    }

    public getNewCandleDataLeft(newBoundary: number, firstCandleTime: number) {
        // Implementation for getting new candle data
        if (newBoundary && firstCandleTime && newBoundary < firstCandleTime) {
            const maxBoundary: number | undefined =
                firstCandleTime - 200 * this.period * 1000;

            const newLastCandle = newBoundary - 100 * this.period * 1000;

            const finalData =
                maxBoundary < newLastCandle ? maxBoundary : newLastCandle;

            const candleDomain = {
                lastCandleDate: firstCandleTime,
                domainBoundry: finalData,
            };

            this.setCandleDomains(candleDomain);
        }
    }

    public changeCandleSize(
        domainX: number[],
        deltaX: number,
        mouseX: number,
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
                minX = domainX[0] - this.period * 1000 * maxNumCandlesForZoom;
            }

            if (new Date(maxX * 1000).toString() === 'Invalid Date') {
                maxX = domainX[1] + this.period * 1000;
            }
            return [minX, maxX];
        }
    }

    private getNewCandleDataLeftWithRight(
        scaleData: scaleData,
        lastCandleDate: number,
    ) {
        let lastDomainDate =
            scaleData?.xScale.domain()[1] + this.period * 1000 * 100;
        let firstDomainDate = scaleData?.xScale.domain()[0];
        const nowDate = Date.now();
        const minDate = 1657868400; // 15 July 2022
        const snapDiff = nowDate % (this.period * 1000);

        const snappedTime = nowDate + (this.period * 1000 - snapDiff);
        if (firstDomainDate < minDate) {
            firstDomainDate = minDate;
        }
        if (lastDomainDate > nowDate) {
            lastDomainDate = nowDate;
        }

        const nCandle =
            (lastDomainDate - firstDomainDate) / (1000 * this.period);
        if (nCandle > 2999) {
            if (lastCandleDate >= snappedTime) {
                lastDomainDate = lastCandleDate;
                firstDomainDate = lastCandleDate + 1000 * this.period + 200;
            } else {
                firstDomainDate = lastCandleDate;
            }
        }

        const candleDomain = {
            lastCandleDate: Math.floor(lastDomainDate),
            domainBoundry: Math.floor(firstDomainDate),
        };

        this.setCandleDomains(candleDomain);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public handlePanning(event: any, scaleData: scaleData) {
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

    public handlePanningOneTouch(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        event: any,
        scaleData: scaleData,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
}
