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

    private isNegativeZero(value: number) {
        return value === 0 && 1 / value === -Infinity;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private isTouchPad(event: any) {
        const wheelDelta = event.wheelDelta || -event.deltaY;
        if (this.isNegativeZero(event.deltaX)) {
            return false;
        }
        return true;
    }
    public zoomWithWheel(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        event: any,
        scaleData: scaleData,
        firstCandleDate: number,
        lastCandleDate: number,
    ) {
        const isTouchPad = this.isTouchPad(event);

        const zoomSpeedFactor = 0.5; // smaller number is faster

        const dx =
            Math.abs(event.deltaX) != 0
                ? -event.deltaX / zoomSpeedFactor
                : event.deltaY / zoomSpeedFactor;

        const domainX = scaleData?.xScale.domain();
        const linearX = d3
            .scaleTime()
            .domain(scaleData?.xScale.range())
            .range([0, domainX[1] - domainX[0]]);

        const mouseX = scaleData?.xScale.invert(event.offsetX);

        const lastTime = domainX[1];

        const firstTime = domainX[0];

        const deltaX = linearX(dx);

        const isPressAltOrShiftKey =
            (event.shiftKey || event.altKey) &&
            !event.ctrlKey &&
            !event.metaKey;

        const isPressCtrlOrMetaKey = !(
            (!event.ctrlKey || event.metaKey) &&
            (event.ctrlKey || !event.metaKey)
        );

        /*   const isZoomingIn = deltaX > 0;
        const isZoomingOut = deltaX < 0; */
        /*   const isZoomingInWithCandleCount =
            isZoomingIn ||
            Math.abs(lastTime - firstTime) >= this.period * 1000 * 2;
        const isZoomingOutCandleCount =
            isZoomingOut ||
            Math.abs(lastTime - firstTime) <=
                this.period * 1000 * maxNumCandlesForZoom; */
        if (isPressAltOrShiftKey) {
            if (isTouchPad) {
                this.wheelWithPressAltKey(
                    deltaX,
                    scaleData,
                    firstTime,
                    firstCandleDate,
                    lastCandleDate,
                    lastTime,
                    mouseX,
                );
            } else {
                this.wheelWithoutPressKey(
                    deltaX,
                    scaleData,
                    firstTime,
                    firstCandleDate,
                    lastCandleDate,
                    lastTime,
                );
            }
        } else {
            if (isPressCtrlOrMetaKey) {
                this.wheelWithPressCtrlKey(
                    deltaX,
                    scaleData,
                    mouseX,
                    firstTime,
                );
            } else {
                if (isTouchPad) {
                    this.wheelWithoutPressKey(
                        deltaX,
                        scaleData,
                        firstTime,
                        firstCandleDate,
                        lastCandleDate,
                        lastTime,
                    );
                } else {
                    this.wheelWithPressAltKey(
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
    }

    public wheelWithPressCtrlKey(
        deltaX: number,
        scaleData: scaleData,
        mouseX: number,
        firstCandleDate: number,
    ) {
        const domainX = scaleData.xScale.domain();
        const domain = this.changeCandleSize(domainX, deltaX, mouseX);

        if (domain) {
            scaleData?.xScale.domain(domain);
        }

        this.getNewCandleDataLeftWithRight(scaleData, firstCandleDate);
    }

    private wheelWithPressAltKey(
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

    private wheelWithoutPressKey(
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
        const snapDiff = nowDate % (this.period * 1000);

        const snappedTime = nowDate + (this.period * 1000 - snapDiff);
        if (lastDomainDate > nowDate) {
            lastDomainDate = nowDate;
        }

        // update candle domainif dont have last data
        if (lastCandleTime < snappedTime) {
            const candleDomain = {
                lastCandleDate: lastDomainDate,
                domainBoundry: lastCandleTime,
            };

            this.setCandleDomains(candleDomain);
        }
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

    public handlePanning(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        event: any,
        scaleData: scaleData,
        firstCandleDate: number,
        lastCandleDate: number,
    ) {
        const domainX = scaleData?.xScale.domain();

        const lastTime = domainX[1];

        const firstTime = domainX[0];
        const linearX = d3
            .scaleTime()
            .domain(scaleData?.xScale.range())
            .range([0, domainX[1] - domainX[0]]);

        const deltaX = linearX(event.movementX);

        this.wheelWithoutPressKey(
            deltaX,
            scaleData,
            firstTime,
            firstCandleDate,
            lastCandleDate,
            lastTime,
        );
    }

    public handlePanningOneTouch(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        event: any,
        scaleData: scaleData,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        previousTouch: any,
        bandwidth: number,
        firstCandleDate: number,
        lastCandleDate: number,
    ) {
        const domainX = scaleData?.xScale.domain();
        const linearX = d3
            .scaleTime()
            .domain(scaleData?.xScale.range())
            .range([0, domainX[1] - domainX[0]]);

        const touch = event.changedTouches[0];
        const currentPageX = touch.pageX;
        const previousTouchPageX = previousTouch.pageX;
        const movement = currentPageX - previousTouchPageX;
        // calculate panning speed based on bandwidth
        const deltaX =
            linearX(movement) * (bandwidth < 1 ? 1 : Math.sqrt(bandwidth));
        const lastTime = domainX[1];

        const firstTime = domainX[0];
        this.wheelWithoutPressKey(
            deltaX,
            scaleData,
            firstTime,
            firstCandleDate,
            lastCandleDate,
            lastTime,
        );
    }

    public handlePanningMultiTouch(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        event: any,
        scaleData: scaleData,
        previousDeltaTouch: number,
        previousDeltaTouchLocation: number,
    ) {
        const domainX = scaleData?.xScale.domain();
        const linearX = d3
            .scaleTime()
            .domain(scaleData?.xScale.range())
            .range([0, domainX[1] - domainX[0]]);

        const touch1 = event.touches[0];
        const touch2 = event.touches[1];

        const deltaTouch = Math.hypot(
            touch1.pageX - touch2.pageX,
            touch1.pageY - touch2.pageY,
        );

        let movement = Math.abs(touch1.pageX - touch2.pageX);

        if (previousDeltaTouch !== deltaTouch) {
            if (previousDeltaTouch > deltaTouch) {
                // zoom out
                movement = movement / 10;
            }
            if (previousDeltaTouch < deltaTouch) {
                // zoom in
                movement = -movement / 10;
            }
            const deltaX = linearX(movement);

            const firstTouch = scaleData?.xScale.invert(
                previousDeltaTouchLocation,
            );

            const secondTouch = scaleData?.xScale.invert(touch1.pageX);

            const point = firstTouch - (firstTouch - secondTouch) / 2;

            const domain = this.changeCandleSize(
                domainX,
                deltaX,
                firstTouch,
                point,
            );

            scaleData?.xScale.domain(domain);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public handlePanningY(event: any, scaleData: scaleData) {
        const domainY = scaleData?.yScale.domain();
        const linearY = d3
            .scaleLinear()
            .domain(scaleData?.yScale.range())
            .range([domainY[1] - domainY[0], 0]);

        const deltaY = linearY(event.movementY);
        const domain = [
            Math.min(domainY[1], domainY[0]) + deltaY,
            Math.max(domainY[1], domainY[0]) + deltaY,
        ];

        return domain;
    }

    public handlePanningX(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        event: any,
        scaleData: scaleData,
        firstCandleDate: number,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        previousTouch: any,
    ) {
        const domainX = scaleData?.xScale.domain();

        let deltaX;
        if (event.type === 'touchmove') {
            deltaX = this.handlePanningXMobile(event, scaleData, previousTouch);
        } else {
            deltaX = this.handlePanningXDesktop(event, scaleData);
        }
        const lastTime = domainX[1];

        const firstTime = domainX[0];
        const isZoomingIn = deltaX > 0;

        const isZoomingOutCandleCount =
            isZoomingIn ||
            Math.abs(lastTime - firstTime) <=
                this.period * 1000 * maxNumCandlesForZoom;

        if (deltaX !== undefined && isZoomingOutCandleCount) {
            this.getNewCandleDataLeft(domainX[0] + deltaX, firstCandleDate);

            scaleData?.xScale.domain([domainX[0] + deltaX, domainX[1]]);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public handlePanningXDesktop(event: any, scaleData: scaleData) {
        const domainX = scaleData?.xScale.domain();

        const linearX = d3
            .scaleTime()
            .domain(scaleData?.xScale.range())
            .range([0, domainX[1] - domainX[0]]);

        const deltaX = linearX(-event.movementX);
        return deltaX;
    }

    public handlePanningXMobile(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        event: any,
        scaleData: scaleData,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        previousTouch: any,
    ) {
        const domainX = scaleData?.xScale.domain();
        const linearX = d3
            .scaleTime()
            .domain(scaleData?.xScale.range())
            .range([0, domainX[1] - domainX[0]]);

        const touch = event.changedTouches[0];
        const currentPageX = touch.pageX;
        const previousTouchPageX = previousTouch.pageX;
        const movement = previousTouchPageX - currentPageX;
        const deltaX = linearX(movement);

        return deltaX;
    }

    public handlePanningYMobile(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        event: any,
        scaleData: scaleData,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        previousTouch: any,
    ) {
        if (event.touches.length === 1) {
            const domainY = scaleData?.yScale.domain();

            const linearY = d3
                .scaleLinear()
                .domain(scaleData?.yScale.range())
                .range([domainY[1] - domainY[0], 0]);

            const touch = event.changedTouches[0];

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
        return undefined;
    }
}
