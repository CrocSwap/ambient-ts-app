import { MutableRefObject, useEffect, useState, useContext, memo } from 'react';
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { useLocation } from 'react-router-dom';
import {
    diffHashSig,
    diffHashSigScaleData,
} from '../../../../ambient-utils/dataLayer';
import {
    crosshair,
    isTimeZoneStart,
    renderCanvasArray,
    scaleData,
    selectedDrawnData,
    setCanvasResolution,
} from '../../ChartUtils/chartUtils';
import { CandleContext } from '../../../../contexts/CandleContext';
import { correctStyleForData, xAxisTick } from './calculateXaxisTicks';
import moment from 'moment';
import { CandleDataIF } from '../../../../ambient-utils/types';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import { RangeContext } from '../../../../contexts/RangeContext';
import { xAxisHeightPixel } from '../../ChartUtils/chartConstants';
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
    unparsedCandleData: CandleDataIF[];
    firstCandleData: CandleDataIF;
    lastCandleData: CandleDataIF;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    changeScale: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    showLatestActive: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    zoomBase: any;
    isChartZoom: boolean;
    isToolbarOpen: boolean;
    selectedDrawnShape: selectedDrawnData | undefined;
    toolbarWidth: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    d3Xaxis: MutableRefObject<any>;
    isUpdatingShape: boolean;
}

function XAxisCanvas(props: xAxisIF) {
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
        zoomBase,
        isChartZoom,
        isToolbarOpen,
        selectedDrawnShape,
        toolbarWidth,
        d3Xaxis,
        isUpdatingShape,
    } = props;

    const { timeOfEndCandle } = useContext(CandleContext);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [xAxis, setXaxis] = useState<any>();
    const [xAxisZoom, setXaxisZoom] =
        useState<d3.ZoomBehavior<Element, unknown>>();

    const { advancedMode } = useContext(RangeContext);
    const utcDiff = moment().utcOffset();
    const utcDiffHours = Math.floor(utcDiff / 60);

    const location = useLocation();

    const mobileView = useMediaQuery('(max-width: 600px)');

    useEffect(() => {
        if (scaleData) {
            const _xAxis = d3fc.axisBottom().scale(scaleData?.xScale);

            setXaxis(() => {
                return _xAxis;
            });
        }
    }, [scaleData, location]);

    const formatDateTicks = (value: Date | number, type: string) => {
        let formatValue = undefined;

        if (type === 'tick') {
            if (moment(value).format('HH:mm') === '00:00' || period === 86400) {
                formatValue = moment(value).format('DD');
            } else {
                formatValue = moment(value).format('HH:mm');
            }

            if (
                moment(value)
                    .format('DD')
                    .match(/^(01)$/) &&
                moment(value).format('HH:mm') === '00:00'
            ) {
                formatValue =
                    moment(value).format('MMM') === 'Jan'
                        ? moment(value).format('YYYY')
                        : moment(value).format('MMM');
            }
        }

        if (type === 'cr') {
            if (period === 86400) {
                formatValue = moment(value)
                    .subtract(utcDiffHours, 'hours')
                    .format('MMM DD YYYY');
            } else {
                formatValue = moment(value).format('MMM DD HH:mm');
            }
        }

        return formatValue;
    };

    const drawXaxis = (
        context: CanvasRenderingContext2D,
        xScale: d3.ScaleLinear<number, number>,
        Y: number,
    ) => {
        if (scaleData) {
            const _width = mobileView ? 25 : 65; // magic number of pixels to blur surrounding price
            const tickSize = 6;

            const timeOfEndCandleLocation = timeOfEndCandle
                ? xScale(timeOfEndCandle)
                : undefined;
            const firstCrDateLocation = lastCrDate
                ? xScale(lastCrDate)
                : undefined;
            scaleData.xScaleTime.domain(xScale.domain());

            const canvas = d3
                .select(d3Xaxis.current)
                .select('canvas')
                .node() as HTMLCanvasElement;

            if (canvas !== null) {
                const rectCanvas = canvas.getBoundingClientRect();

                const width = rectCanvas.width;
                const height = rectCanvas.height;

                const factor = width / (width < 500 ? 75 : 100);

                const ticks = scaleData?.xScaleTime.ticks(factor);

                const data = correctStyleForData(
                    scaleData?.xScale.domain()[0],
                    scaleData?.xScale.domain()[1],
                    ticks,
                );

                data.forEach((d: xAxisTick) => {
                    if (d.date instanceof Date) {
                        context.textAlign = 'center';
                        context.textBaseline = 'top';
                        context.fillStyle = 'rgba(240, 240, 248, 0.8)';
                        context.font = '50 11.5px Lexend Deca';
                        context.filter = ' blur(0px)';

                        const formatValue = formatDateTicks(d.date, 'tick');

                        if (
                            crosshairActive !== 'none' &&
                            xScale(d.date) >
                                xScale(crosshairData[0].x) - _width &&
                            xScale(d.date) <
                                xScale(crosshairData[0].x) + _width &&
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
                                        firstCrDateLocation - 65 / 2 &&
                                    xScale(d.date) <
                                        firstCrDateLocation + 65 / 2) ||
                                (timeOfEndCandleLocation &&
                                    xScale(d.date) >
                                        timeOfEndCandleLocation - _width / 2 &&
                                    xScale(d.date) <
                                        timeOfEndCandleLocation + _width / 2)
                            )
                        ) {
                            if (formatValue) {
                                const indexValue = data.findIndex(
                                    (d1: xAxisTick) => d1.date === d.date,
                                );
                                if (!d.style) {
                                    const maxIndex =
                                        indexValue === data.length - 1
                                            ? indexValue
                                            : indexValue + 1;
                                    const minIndex =
                                        indexValue === 0
                                            ? indexValue
                                            : indexValue - 1;
                                    const lastData = data[maxIndex];
                                    const beforeData = data[minIndex];

                                    const lastDataLocation = scaleData.xScale(
                                        lastData.date,
                                    );
                                    const beforeDataLocation = scaleData.xScale(
                                        beforeData.date,
                                    );
                                    const currentDataLocation =
                                        scaleData.xScale(d.date);

                                    const isTimeZoneStartLastData =
                                        isTimeZoneStart(lastData.date);

                                    if (
                                        Math.abs(
                                            currentDataLocation -
                                                beforeDataLocation,
                                        ) > 20
                                    ) {
                                        if (
                                            !isTimeZoneStartLastData ||
                                            Math.abs(
                                                lastDataLocation -
                                                    currentDataLocation,
                                            ) > 20
                                        ) {
                                            context.fillText(
                                                formatValue,
                                                currentDataLocation,
                                                Y + tickSize,
                                            );
                                        }
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

                const dateCrosshair = formatDateTicks(crosshairData[0].x, 'cr');
                context.filter = ' blur(0px)';

                context.font = '800 13px Lexend Deca';

                context.beginPath();

                if (
                    dateCrosshair &&
                    crosshairActive !== 'none' &&
                    !isUpdatingShape
                ) {
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
                    context.fillText(
                        '🥚',
                        timeOfEndCandleLocation,
                        Y + tickSize,
                    );
                }

                if (selectedDrawnShape) {
                    context.filter = ' blur(0px)';

                    const shapeData = selectedDrawnShape.data;

                    const rectWidth =
                        xScale(shapeData.data[1].x) -
                        xScale(shapeData.data[0].x);

                    context.fillStyle = 'rgba(115, 113, 252, 0.1)';
                    context.fillRect(
                        xScale(shapeData.data[0].x),
                        height * 0.175,
                        rectWidth,
                        height * 0.65,
                    );

                    shapeData.data.forEach((data) => {
                        const shapePoint = xScale(data.x);
                        const point = formatDateTicks(data.x, 'cr');

                        if (point) {
                            if (
                                xScale(crosshairData[0].x) >
                                    shapePoint - (_width - 15) &&
                                xScale(crosshairData[0].x) <
                                    shapePoint + (_width - 15) &&
                                crosshairActive !== 'none' &&
                                !isUpdatingShape
                            ) {
                                context.filter = ' blur(7px)';
                                context.fillText(
                                    point,
                                    shapePoint,
                                    height * 0.5375,
                                );
                            } else {
                                const textWidth =
                                    context.measureText(point).width + 10;

                                context.fillStyle = 'rgba(115, 113, 252, 1)';
                                context.fillRect(
                                    shapePoint - textWidth / 2,
                                    height * 0.175,
                                    textWidth,
                                    height * 0.65,
                                );
                                context.fillStyle = 'rgb(214, 214, 214)';
                                context.font = '800 13px Lexend Deca';
                                context.textAlign = 'center';
                                context.textBaseline = 'middle';
                                context.fillText(
                                    point,
                                    shapePoint,
                                    height * 0.5375,
                                );
                            }
                        }
                    });
                }

                context.restore();
            }
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
        advancedMode,
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
        diffHashSig(crosshairData),
        isLineDrag,
        reset,
        location,
        crosshairActive,
        xAxis === undefined,
        isToolbarOpen,
        selectedDrawnShape,
    ]);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        d3.select(d3Xaxis.current).on('mousemove', (event: MouseEvent) => {
            d3.select(d3Xaxis.current).style('cursor', 'col-resize');
            if (scaleData) {
                const mouseLocation = event.offsetX;

                const isEgg =
                    timeOfEndCandle &&
                    mouseLocation > scaleData?.xScale(timeOfEndCandle) - 15 &&
                    mouseLocation < scaleData?.xScale(timeOfEndCandle) + 15;

                const isCroc =
                    lastCrDate &&
                    mouseLocation > scaleData?.xScale(lastCrDate) - 15 &&
                    mouseLocation < scaleData?.xScale(lastCrDate) + 15;

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
        if (!isChartZoom) {
            const lastCandleDate = lastCandleData?.time * 1000;
            const firstCandleDate = firstCandleData?.time * 1000;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let previousTouch: any | undefined = undefined; // event

            const xAxisZoom = d3
                .zoom()
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .on('start', (event: any) => {
                    if (event.sourceEvent.type.includes('touch')) {
                        // mobile
                        previousTouch = event.sourceEvent.touches[0];
                    }
                })
                .on('zoom', async (event) => {
                    async function newDomains() {
                        if (scaleData) {
                            if (event.sourceEvent.type === 'wheel') {
                                zoomBase.zoomWithWheel(
                                    event.sourceEvent,
                                    scaleData,
                                    firstCandleDate,
                                    lastCandleDate,
                                );
                            } else {
                                zoomBase.handlePanningX(
                                    event.sourceEvent,
                                    scaleData,
                                    firstCandleDate,
                                    previousTouch,
                                );
                            }
                            changeScale(true);
                            render();
                        }
                    }

                    newDomains().then(() => {
                        // mobile
                        if (event.sourceEvent.type.includes('touch')) {
                            previousTouch = event.sourceEvent.changedTouches[0];
                        }
                    });
                })
                .on('end', () => {
                    showLatestActive();
                });

            setXaxisZoom(() => {
                return xAxisZoom;
            });
        }
    }, [
        diffHashSigScaleData(scaleData),
        firstCandleData,
        lastCandleData,
        isChartZoom,
    ]);

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
                height: xAxisHeightPixel + 'px',
                width: '100%',
                marginLeft: toolbarWidth + 'px',
            }}
        ></d3fc-canvas>
    );
}
export default memo(XAxisCanvas);
