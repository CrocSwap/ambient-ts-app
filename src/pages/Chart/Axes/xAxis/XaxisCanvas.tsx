import { useEffect, useRef, useState, useContext } from 'react';
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { useLocation } from 'react-router-dom';
import {
    diffHashSig,
    diffHashSigScaleData,
} from '../../../../utils/functions/diffHashSig';
import {
    crosshair,
    renderCanvasArray,
    scaleData,
    setCanvasResolution,
} from '../../ChartUtils/chartUtils';
import { CandleContext } from '../../../../contexts/CandleContext';
import { correctStyleForData, xAxisTick } from '../../calcuteAxisDate';
import moment from 'moment';
import { CandleData } from '../../../../App/functions/fetchCandleSeries';
import { Zoom } from '../../ChartUtils/zoom';

interface xAxisIF {
    scaleData: scaleData | undefined;
    lastCrDate: number | undefined;
    period: number;
    crosshairActive: string;
    crosshairData: Array<crosshair>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mouseLeaveCanvas: any;
    reset: boolean | undefined;
    isLineDrag: boolean | undefined;
    xAxisActiveTooltip: string;
    isCrDataIndActive: boolean;
    setXaxisActiveTooltip: React.Dispatch<React.SetStateAction<string>>;
    setCrosshairActive: React.Dispatch<React.SetStateAction<string>>;
    setIsCrDataIndActive: React.Dispatch<React.SetStateAction<boolean>>;
    unparsedCandleData: CandleData[];
    firstCandleData: CandleData;
    lastCandleData: CandleData;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    changeScale: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    showLatestActive: any;
}

export default function XAxisCanvas(props: xAxisIF) {
    const {
        scaleData,
        lastCrDate,
        period,
        crosshairActive,
        crosshairData,
        reset,
        isLineDrag,
        setCrosshairActive,
        isCrDataIndActive,
        mouseLeaveCanvas,
        setIsCrDataIndActive,
        xAxisActiveTooltip,
        setXaxisActiveTooltip,
        unparsedCandleData,
        firstCandleData,
        lastCandleData,
        changeScale,
        render,
        showLatestActive,
    } = props;

    const d3Xaxis = useRef<HTMLInputElement | null>(null);
    const { timeOfEndCandle } = useContext(CandleContext);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [xAxis, setXaxis] = useState<any>();
    const [xAxisZoom, setXaxisZoom] =
        useState<d3.ZoomBehavior<Element, unknown>>();
    const { setCandleDomains } = useContext(CandleContext);
    const zoomBase = new Zoom(setCandleDomains, period);

    const tradeData = useAppSelector((state) => state.tradeData);

    const utcDiff = moment().utcOffset();
    const utcDiffHours = Math.floor(utcDiff / 60);

    const location = useLocation();

    useEffect(() => {
        if (scaleData) {
            const _xAxis = d3fc.axisBottom().scale(scaleData?.xScale);

            setXaxis(() => {
                return _xAxis;
            });
        }
    }, [scaleData, location]);

    const drawXaxis = (
        context: CanvasRenderingContext2D,
        xScale: d3.ScaleLinear<number, number>,
        Y: number,
    ) => {
        if (scaleData) {
            const _width = 65; // magic number of pixels to blur surrounding price
            const tickSize = 6;

            const timeOfEndCandleLocation = timeOfEndCandle
                ? xScale(timeOfEndCandle)
                : undefined;
            const firstCrDateLocation = lastCrDate
                ? xScale(lastCrDate)
                : undefined;
            scaleData.xScaleTime.domain(xScale.domain());

            const data = correctStyleForData(
                scaleData?.xScale.domain()[0],
                scaleData?.xScale.domain()[1],
                scaleData?.xScaleTime.ticks(),
            );

            const filteredData = data.reduce(
                (acc: xAxisTick[], d: xAxisTick) => {
                    const sameTime = acc.find((d1: xAxisTick) => {
                        return d1.date.getTime() === d.date.getTime();
                    });
                    if (!sameTime) {
                        acc.push(d);
                    }
                    return acc;
                },
                [],
            );

            filteredData.forEach((d: xAxisTick) => {
                if (d.date instanceof Date) {
                    let formatValue = undefined;
                    context.textAlign = 'center';
                    context.textBaseline = 'top';
                    context.fillStyle = 'rgba(189,189,189,0.8)';
                    context.font = '50 11.425px Lexend Deca';
                    context.filter = ' blur(0px)';

                    if (
                        moment(d.date).format('HH:mm') === '00:00' ||
                        period === 86400
                    ) {
                        formatValue = moment(d.date).format('DD');
                    } else {
                        formatValue = moment(d.date).format('HH:mm');
                    }

                    if (
                        moment(d.date)
                            .format('DD')
                            .match(/^(01)$/) &&
                        moment(d.date).format('HH:mm') === '00:00'
                    ) {
                        formatValue =
                            moment(d.date).format('MMM') === 'Jan'
                                ? moment(d.date).format('YYYY')
                                : moment(d.date).format('MMM');
                    }

                    if (
                        crosshairActive !== 'none' &&
                        xScale(d.date) > xScale(crosshairData[0].x) - _width &&
                        xScale(d.date) < xScale(crosshairData[0].x) + _width &&
                        d.date !== crosshairData[0].x
                    ) {
                        context.filter = ' blur(7px)';
                    }

                    if (d.style) {
                        context.font = '900 12px Lexend Deca';
                    }

                    context.beginPath();

                    if (
                        d.date.getTime() !== lastCrDate &&
                        !(
                            (firstCrDateLocation &&
                                xScale(d.date) >
                                    firstCrDateLocation - _width / 2 &&
                                xScale(d.date) <
                                    firstCrDateLocation + _width / 2) ||
                            (timeOfEndCandleLocation &&
                                xScale(d.date) >
                                    timeOfEndCandleLocation - _width / 2 &&
                                xScale(d.date) <
                                    timeOfEndCandleLocation + _width / 2)
                        )
                    ) {
                        if (formatValue) {
                            const indexValue = filteredData.findIndex(
                                (d1: xAxisTick) => d1.date === d.date,
                            );
                            if (!d.style) {
                                const maxIndex =
                                    indexValue === filteredData.length - 1
                                        ? indexValue
                                        : indexValue + 1;
                                const minIndex =
                                    indexValue === 0
                                        ? indexValue
                                        : indexValue - 1;
                                const lastData = filteredData[maxIndex];
                                const beforeData = filteredData[minIndex];

                                if (
                                    beforeData.style ||
                                    (lastData.style && xScale(d.date.getTime()))
                                ) {
                                    if (
                                        Math.abs(
                                            xScale(beforeData.date.getTime()) -
                                                xScale(d.date.getTime()),
                                        ) > _width &&
                                        Math.abs(
                                            xScale(lastData.date.getTime()) -
                                                xScale(d.date.getTime()),
                                        ) > _width
                                    ) {
                                        context.fillText(
                                            formatValue,
                                            xScale(d.date.getTime()),
                                            Y + tickSize,
                                        );
                                    }
                                } else {
                                    context.fillText(
                                        formatValue,
                                        xScale(d.date.getTime()),
                                        Y + tickSize,
                                    );
                                }
                            } else {
                                context.fillText(
                                    formatValue,
                                    xScale(d.date.getTime()),
                                    Y + tickSize,
                                );
                            }
                        }
                    }
                    context.restore();
                }
            });

            let dateCrosshair;
            context.filter = ' blur(0px)';

            context.font = '800 13px Lexend Deca';
            if (period === 86400) {
                dateCrosshair = moment(crosshairData[0].x)
                    .subtract(utcDiffHours, 'hours')
                    .format('MMM DD YYYY');
            } else {
                dateCrosshair = moment(crosshairData[0].x).format(
                    'MMM DD HH:mm',
                );
            }

            context.beginPath();

            if (dateCrosshair && crosshairActive !== 'none') {
                context.fillText(
                    dateCrosshair,
                    xScale(crosshairData[0].x),
                    Y + tickSize,
                );
            }

            if (
                firstCrDateLocation &&
                xScale(crosshairData[0].x) >
                    firstCrDateLocation - (_width - 15) &&
                xScale(crosshairData[0].x) <
                    firstCrDateLocation + (_width - 15) &&
                crosshairActive !== 'none'
            ) {
                context.filter = ' blur(7px)';
            }

            if (firstCrDateLocation) {
                context.fillText('🐊', firstCrDateLocation, Y + tickSize);
            }

            if (timeOfEndCandle && timeOfEndCandleLocation) {
                context.filter = ' blur(0px)';

                if (
                    xScale(crosshairData[0].x) >
                        timeOfEndCandleLocation - (_width - 15) &&
                    xScale(crosshairData[0].x) <
                        timeOfEndCandleLocation + (_width - 15) &&
                    crosshairActive !== 'none'
                ) {
                    context.filter = ' blur(7px)';
                }
                context.fillText('🥚', timeOfEndCandleLocation, Y + tickSize);
            }

            context.restore();
        }
    };

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        d3.select(d3Xaxis.current).on('click', (event: any) => {
            if (scaleData) {
                const isCroc =
                    lastCrDate &&
                    event.layerX > scaleData?.xScale(lastCrDate) - 15 &&
                    event.layerX < scaleData?.xScale(lastCrDate) + 15;

                if (isCroc) {
                    if (!isCrDataIndActive) {
                        setIsCrDataIndActive(true);
                    } else {
                        setIsCrDataIndActive(false);
                    }
                }
            }
        });
    }, [
        location.pathname,
        isLineDrag,
        unparsedCandleData?.length,
        tradeData.advancedMode,
        lastCrDate,
        xAxisActiveTooltip,
        timeOfEndCandle,
        isCrDataIndActive,
    ]);

    // Axis's
    useEffect(() => {
        if (scaleData) {
            const canvas = d3
                .select(d3Xaxis.current)
                .select('canvas')
                .node() as HTMLCanvasElement;
            const context = canvas.getContext('2d') as CanvasRenderingContext2D;

            d3.select(d3Xaxis.current).on('draw', function () {
                if (xAxis && scaleData) {
                    setCanvasResolution(canvas);
                    drawXaxis(context, scaleData?.xScale, 3);
                }
            });

            renderCanvasArray([d3Xaxis]);
        }
    }, [
        timeOfEndCandle,
        diffHashSigScaleData(scaleData, 'x'),
        diffHashSig(crosshairData),
        isLineDrag,
        reset,
        location,
        crosshairActive,
        xAxis,
    ]);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        d3.select(d3Xaxis.current).on('mousemove', (event: MouseEvent) => {
            d3.select(d3Xaxis.current).style('cursor', 'col-resize');
            if (scaleData) {
                const isEgg =
                    timeOfEndCandle &&
                    event.offsetX > scaleData?.xScale(timeOfEndCandle) - 15 &&
                    event.offsetX < scaleData?.xScale(timeOfEndCandle) + 15;

                const isCroc =
                    lastCrDate &&
                    event.offsetX > scaleData?.xScale(lastCrDate) - 15 &&
                    event.offsetX < scaleData?.xScale(lastCrDate) + 15;

                if (isEgg || isCroc) {
                    d3.select(d3Xaxis.current).style('cursor', 'default');

                    setXaxisActiveTooltip(isCroc ? 'croc' : 'egg');
                } else {
                    setXaxisActiveTooltip('');
                }

                setCrosshairActive('none');
            }
        });
    }, [lastCrDate, timeOfEndCandle]);

    // mouseleave
    useEffect(() => {
        d3.select(d3Xaxis.current).on('mouseleave', () => {
            mouseLeaveCanvas();
        });
    }, []);

    useEffect(() => {
        const lastCandleDate = lastCandleData?.time * 1000;
        const firstCandleDate = firstCandleData?.time * 1000;
        const xAxisZoom = d3
            .zoom()
            .on('zoom', async (event) => {
                if (scaleData) {
                    if (event.sourceEvent.type === 'wheel') {
                        zoomBase.zoomWithWheel(
                            event,
                            scaleData,
                            firstCandleDate,
                            lastCandleDate,
                        );
                    }

                    // else if (
                    //     event.sourceEvent.type === 'touchmove' &&
                    //     event.sourceEvent.touches.length > 1 &&
                    //     previousDeltaTouch
                    // ) {
                    //     const domainX = scaleData?.xScale.domain();
                    //     const linearX = d3
                    //         .scaleTime()
                    //         .domain(scaleData?.xScale.range())
                    //         .range([0, domainX[1] - domainX[0]]);

                    //     // mobile
                    //     const touch1 = event.sourceEvent.touches[0];
                    //     const touch2 = event.sourceEvent.touches[1];

                    //     const deltaTouch = Math.hypot(
                    //         touch1.pageX - touch2.pageX,
                    //         touch1.pageY - touch2.pageY,
                    //     );

                    //     let movement = Math.abs(
                    //         touch1.pageX - touch2.pageX,
                    //     );

                    //     if (previousDeltaTouch > deltaTouch) {
                    //         // zoom out
                    //         movement = movement / 10;
                    //     }
                    //     if (previousDeltaTouch < deltaTouch) {
                    //         // zoom in
                    //         movement = -movement / 10;
                    //     }
                    //     const deltaX = linearX(movement);

                    //     zoomBase.changeCandleSize(
                    //         domainX,
                    //         deltaX,
                    //         scaleData?.xScale(touch1.clientX),
                    //     );
                    // }
                    else {
                        const domainX = scaleData?.xScale.domain();

                        const linearX = d3
                            .scaleTime()
                            .domain(scaleData?.xScale.range())
                            .range([0, domainX[1] - domainX[0]]);

                        const deltaX = linearX(-event.sourceEvent.movementX);

                        if (deltaX !== undefined) {
                            zoomBase.getNewCandleDataLeft(
                                domainX[0] + deltaX,
                                firstCandleDate,
                            );

                            if (
                                (deltaX > 0 ||
                                    Math.abs(domainX[1] - domainX[0]) <=
                                        period * 1000 * 2000) &&
                                (deltaX < 0 ||
                                    !(
                                        unparsedCandleData.length <= 2 &&
                                        unparsedCandleData[0].time * 1000 !==
                                            lastCandleDate
                                    ))
                            ) {
                                scaleData?.xScale.domain([
                                    domainX[0] + deltaX,
                                    domainX[1],
                                ]);
                            }
                        }
                    }
                    changeScale();
                    render();
                }
            })
            .on('end', () => {
                showLatestActive();
            });

        setXaxisZoom(() => {
            return xAxisZoom;
        });
    }, [scaleData, firstCandleData, lastCandleData]);

    useEffect(() => {
        if (xAxis && xAxisZoom && d3Xaxis.current) {
            d3.select<Element, unknown>(d3Xaxis.current)
                .call(xAxisZoom)
                .on('dblclick.zoom', null);

            renderCanvasArray([d3Xaxis]);
        }
    }, [xAxisZoom]);

    return (
        <d3fc-canvas
            ref={d3Xaxis}
            id='x-axis'
            className='x-axis'
            style={{
                height: '2em',
                width: '100%',
                gridColumn: 3,
                gridRow: 4,
            }}
        ></d3fc-canvas>
    );
}
