import * as d3 from 'd3';
import { Dispatch, SetStateAction } from 'react';
import { findSnapTime, scaleData, timeGapsValue } from './chartUtils';
import { CandleDomainIF } from '../../../../ambient-utils/types';

export class Zoom {
    setCandleDomains: Dispatch<SetStateAction<CandleDomainIF>>;
    period: number;
    isDiscontinuityScaleEnabled: boolean;
    candleDomains: CandleDomainIF;
    timeGaps: timeGapsValue[];
    constructor(
        setCandleDomains: Dispatch<SetStateAction<CandleDomainIF>>,
        period: number,
        isDiscontinuityScaleEnabled: boolean,
        candleDomains: CandleDomainIF,
        timeGaps: timeGapsValue[],
    ) {
        this.setCandleDomains = setCandleDomains;
        this.candleDomains = candleDomains;
        this.period = period;
        this.isDiscontinuityScaleEnabled = isDiscontinuityScaleEnabled;
        this.timeGaps = timeGaps;
    }

    private calculateDrawingDomains(
        deltaX: number,
        scaleData: scaleData,
        isWheel: boolean,
        drawMouseX?: number,
        lastCandleDate?: number,
    ) {
        if (!isWheel) {
            const newMinDomain = scaleData?.drawingLinearxScale.invert(
                scaleData?.drawingLinearxScale.range()[0] - deltaX,
            );
            const newMaxDomain = scaleData?.drawingLinearxScale.invert(
                scaleData?.drawingLinearxScale.range()[1] - deltaX,
            );

            scaleData?.drawingLinearxScale.domain([newMinDomain, newMaxDomain]);
        } else {
            if (drawMouseX && lastCandleDate) {
                const drawDomain = this.changeCandleSize(
                    scaleData.drawingLinearxScale,
                    deltaX,
                    drawMouseX,
                    lastCandleDate,
                );
                if (drawDomain) {
                    const newMaxDomain = scaleData?.drawingLinearxScale.invert(
                        scaleData?.drawingLinearxScale(drawDomain[1]) -
                            deltaX / 10,
                    );

                    if (deltaX > 0) {
                        scaleData?.drawingLinearxScale.domain([
                            drawDomain[0],
                            newMaxDomain < lastCandleDate
                                ? lastCandleDate
                                : newMaxDomain,
                        ]);
                    } else {
                        scaleData?.drawingLinearxScale.domain([
                            drawDomain[0],
                            newMaxDomain,
                        ]);
                    }
                }
            }
        }
    }

    private isNegativeZero(value: number) {
        return Object.is(value, -0);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private isTouchPad(event: any) {
        const wheelDelta = event.wheelDelta || -event.deltaY;
        if (Math.abs(wheelDelta) >= 120 && this.isNegativeZero(event.deltaX)) {
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
        const eventDeltaX = event.deltaX;
        const isTouchPad = this.isTouchPad(event);
        const isZeroNegative = this.isNegativeZero(eventDeltaX);
        const zoomSpeedFactor = 0.5; // smaller number is faster

        const checkTouchPadZeroNegative = isZeroNegative && isTouchPad;

        const dx =
            Math.abs(eventDeltaX) != 0
                ? -eventDeltaX / zoomSpeedFactor
                : event.deltaY / zoomSpeedFactor;

        const mouseX = scaleData?.xScale.invert(event.offsetX);
        const drawMouseX = scaleData?.drawingLinearxScale.invert(event.offsetX);

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
                    dx,
                    scaleData,
                    firstCandleDate,
                    lastCandleDate,
                    mouseX,
                    drawMouseX,
                );
            } else {
                this.wheelWithoutPressKey(
                    dx,
                    scaleData,
                    firstCandleDate,
                    lastCandleDate,
                    checkTouchPadZeroNegative,
                );
            }
        } else {
            if (isPressCtrlOrMetaKey) {
                this.wheelWithPressCtrlKey(dx, scaleData, mouseX, drawMouseX);
            } else {
                if (isTouchPad) {
                    this.wheelWithoutPressKey(
                        dx,
                        scaleData,
                        firstCandleDate,
                        lastCandleDate,
                        checkTouchPadZeroNegative,
                    );
                } else {
                    this.wheelWithPressAltKey(
                        dx,
                        scaleData,
                        firstCandleDate,
                        lastCandleDate,
                        mouseX,
                        drawMouseX,
                    );
                }
            }
        }
    }

    public wheelWithPressCtrlKey(
        deltaX: number,
        scaleData: scaleData,
        mouseX: number,
        drawMouseX?: number,
    ) {
        const beforeMinDomain = scaleData.xScale.domain()[0];
        const domain = this.changeCandleSize(scaleData.xScale, deltaX, mouseX);

        if (domain) {
            scaleData?.xScale.domain(domain);
        }

        if (drawMouseX) {
            const drawDomain = this.changeCandleSize(
                scaleData.drawingLinearxScale,
                deltaX,
                drawMouseX,
            );

            if (drawDomain) {
                scaleData?.drawingLinearxScale.domain(drawDomain);
            }
        }

        this.getNewCandleDataLeftWithRight(scaleData, beforeMinDomain);
    }

    private wheelWithPressAltKey(
        deltaX: number,
        scaleData: scaleData,
        firstCandleDate: number,
        lastCandleDate: number,
        mouseX: number,
        drawMouseX?: number,
    ) {
        const newMinDomain = scaleData?.xScale.invert(
            scaleData?.xScale.range()[0] - deltaX,
        );
        const isCandleVisible =
            newMinDomain > lastCandleDate - this.period * 1000 * 2 &&
            deltaX < 0;
        if (isCandleVisible) {
            return;
        } else {
            this.getNewCandleDataLeft(newMinDomain, firstCandleDate);

            const domain = this.changeCandleSize(
                scaleData.xScale,
                deltaX,
                mouseX,
                lastCandleDate,
            );
            if (domain) {
                const newMaxDomain = scaleData?.xScale.invert(
                    scaleData?.xScale(domain[1]) - deltaX / 10,
                );

                if (deltaX > 0) {
                    scaleData?.xScale.domain([
                        domain[0],
                        newMaxDomain < lastCandleDate
                            ? lastCandleDate
                            : newMaxDomain,
                    ]);
                } else {
                    scaleData?.xScale.domain([domain[0], newMaxDomain]);
                }
            }

            if (drawMouseX) {
                this.calculateDrawingDomains(
                    deltaX,
                    scaleData,
                    true,
                    drawMouseX,
                    lastCandleDate,
                );
            }
        }
    }

    private wheelWithoutPressKey(
        deltaX: number,
        scaleData: scaleData,
        firstCandleDate: number,
        lastCandleDate: number,
        checkTouchPadZeroNegative: boolean,
    ) {
        const newMinDomain = scaleData?.xScale.invert(
            scaleData?.xScale.range()[0] - deltaX,
        );
        const newMaxDomain = scaleData?.xScale.invert(
            scaleData?.xScale.range()[1] - deltaX,
        );

        if (deltaX > 0 || checkTouchPadZeroNegative) {
            this.getNewCandleDataLeft(newMinDomain, firstCandleDate);
        } else {
            if (lastCandleDate) {
                this.getNewCandleDataRight(scaleData, lastCandleDate);
            }
        }

        this.calculateDrawingDomains(deltaX, scaleData, false);

        scaleData?.xScale.domain([newMinDomain, newMaxDomain]);
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

        // update candle domain if dont have last data
        if (lastCandleTime < snappedTime) {
            const candleDomain = {
                lastCandleDate: lastDomainDate,
                domainBoundry: lastCandleTime,
                isAbortedRequest: false,
                isResetRequest: false,
                isCondensedFetching: this.candleDomains.isCondensedFetching,
            };

            this.setCandleDomains(candleDomain);
        }
    }

    public getNewCandleDataLeft(newBoundary: number, firstCandleTime: number) {
        // Implementation for getting new candle data
        if (newBoundary && firstCandleTime && newBoundary < firstCandleTime) {
            const newCandleCount = this.isDiscontinuityScaleEnabled ? 500 : 100;
            const newLastCandle =
                newBoundary - newCandleCount * this.period * 1000;

            const candleDomain = {
                lastCandleDate: firstCandleTime,
                domainBoundry: newLastCandle,
                isAbortedRequest: false,
                isResetRequest: false,
                isCondensedFetching: this.candleDomains.isCondensedFetching,
            };

            this.setCandleDomains(candleDomain);
        }
    }

    public changeCandleSize(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        scale: any,
        deltaX: number,
        mouseX: number,
        zoomCandle?: number | Date,
    ) {
        const point = zoomCandle
            ? zoomCandle
            : findSnapTime(mouseX, this.period);

        const domain = scale.domain();
        const pixelPoint = scale(point);
        const maxDomainPixel = scale(domain[1]);
        const minDomainPixel = scale(domain[0]);
        const gapRight = maxDomainPixel - pixelPoint;
        const gapLeft = pixelPoint - minDomainPixel;

        const zoomPixelMax = (deltaX * gapRight) / (gapLeft + gapRight);
        const zoomPixelMin = (deltaX * gapLeft) / (gapLeft + gapRight);

        const newMinDomain = scale.invert(scale.range()[0] - zoomPixelMin);
        const newMaxDomain = scale.invert(scale.range()[1] + zoomPixelMax);

        return [newMinDomain, newMaxDomain];
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
            isAbortedRequest: false,
            isResetRequest: false,
            isCondensedFetching: this.candleDomains.isCondensedFetching,
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
        const dx = event.movementX;

        this.wheelWithoutPressKey(
            dx,
            scaleData,
            firstCandleDate,
            lastCandleDate,
            false,
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
        const touch = event.changedTouches[0];
        const currentPageX = touch.pageX;
        const previousTouchPageX = previousTouch.pageX;
        const movement = currentPageX - previousTouchPageX;
        // calculate panning speed based on bandwidth
        const deltaX = movement * (bandwidth < 1 ? 1 : Math.sqrt(bandwidth));

        this.wheelWithoutPressKey(
            deltaX,
            scaleData,
            firstCandleDate,
            lastCandleDate,
            false,
        );
    }

    public handlePanningMultiTouch(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        event: any,
        scaleData: scaleData,
        previousDeltaTouch: number,
        previousDeltaTouchLocation: number,
    ) {
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
            const deltaX = movement;

            const firstTouch = scaleData?.xScale.invert(
                previousDeltaTouchLocation,
            );

            const secondTouch = scaleData?.xScale.invert(touch1.pageX);

            const point = firstTouch - (firstTouch - secondTouch) / 2;

            const domain = this.changeCandleSize(
                scaleData.xScale,
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
        bandwidth: number,
    ) {
        const domainX = scaleData?.xScale.domain();
        const drawDomain = scaleData?.drawingLinearxScale.domain();

        let dx = event.movementX;

        if (event.type === 'touchmove') {
            const touch = event.changedTouches[0];
            const currentPageX = touch.pageX;
            const previousTouchPageX = previousTouch.pageX;
            const movement = currentPageX - previousTouchPageX;
            // calculate panning speed based on bandwidth
            dx = movement * (bandwidth < 1 ? 1 : Math.sqrt(bandwidth));
        }

        const newMinDomainDrawScale = scaleData?.drawingLinearxScale.invert(
            scaleData?.drawingLinearxScale.range()[0] - dx,
        );

        scaleData?.drawingLinearxScale.domain([
            newMinDomainDrawScale,
            drawDomain[1],
        ]);

        const newMinDomain = scaleData?.xScale.invert(
            scaleData?.xScale.range()[0] - dx,
        );

        this.getNewCandleDataLeft(newMinDomain, firstCandleDate);

        scaleData?.xScale.domain([newMinDomain, domainX[1]]);
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
