import { useEffect, useRef, useState, useContext, memo } from 'react';
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
    selectedDrawnData,
    setCanvasResolution,
} from '../../ChartUtils/chartUtils';
import { CandleContext } from '../../../../contexts/CandleContext';
import { correctStyleForData, xAxisTick } from './calculateXaxisTicks';
import moment from 'moment';
import { CandleData } from '../../../../App/functions/fetchCandleSeries';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    zoomBase: any;
    isChartZoom: boolean;
    isToolbarOpen: boolean;
    isShapeSelected: boolean;
    selectedDrawnShape: selectedDrawnData | undefined;
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
        isShapeSelected,
        selectedDrawnShape,
    } = props;

    const d3Xaxis = useRef<HTMLInputElement | null>(null);
    const { timeOfEndCandle } = useContext(CandleContext);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [xAxis, setXaxis] = useState<any>();
    const [xAxisZoom, setXaxisZoom] =
        useState<d3.ZoomBehavior<Element, unknown>>();

    const tradeData = useAppSelector((state) => state.tradeData);

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

            const toolbar = document.getElementById('toolbar_container');

            const column = toolbar ? toolbar.getClientRects()[0].width : 9;

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
                        context.textAlign = 'center';
                        context.textBaseline = 'top';
                        context.fillStyle = 'rgba(189,189,189,0.8)';
                        context.font = '50 11.425px Lexend Deca';
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
                                        (lastData.style &&
                                            xScale(d.date.getTime()))
                                    ) {
                                        if (
                                            Math.abs(
                                                xScale(
                                                    beforeData.date.getTime(),
                                                ) - xScale(d.date.getTime()),
                                            ) > _width &&
                                            Math.abs(
                                                xScale(
                                                    lastData.date.getTime(),
                                                ) - xScale(d.date.getTime()),
                                            ) > _width
                                        ) {
                                            context.fillText(
                                                formatValue,
                                                xScale(d.date.getTime()) +
                                                    column,
                                                Y + tickSize,
                                            );
                                        }
                                    } else {
                                        context.fillText(
                                            formatValue,
                                            xScale(d.date.getTime()) + column,
                                            Y + tickSize,
                                        );
                                    }
                                } else {
                                    context.fillText(
                                        formatValue,
                                        xScale(d.date.getTime()) + column,
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

                if (dateCrosshair && crosshairActive !== 'none') {
                    context.fillText(
                        dateCrosshair,
                        xScale(crosshairData[0].x) + column,
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
                    context.fillText(
                        '🐊',
                        firstCrDateLocation + column,
                        Y + tickSize,
                    );
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
                        timeOfEndCandleLocation + column,
                        Y + tickSize,
                    );
                }

                if (isShapeSelected) {
                    if (selectedDrawnShape) {
                        context.filter = ' blur(0px)';

                        const shapeData = selectedDrawnShape.data;

                        const rectWidth =
                            xScale(shapeData.data[1].x) -
                            xScale(shapeData.data[0].x);

                        context.fillStyle = '#7674ff3f';
                        context.fillRect(
                            xScale(shapeData.data[0].x) + column,
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
                                    crosshairActive !== 'none'
                                ) {
                                    context.filter = ' blur(7px)';
                                    context.fillText(
                                        point,
                                        shapePoint + column,
                                        height * 0.5375,
                                    );
                                } else {
                                    const textWidth =
                                        context.measureText(point).width + 10;

                                    context.fillStyle = '#5553be';
                                    context.fillRect(
                                        shapePoint + column - textWidth / 2,
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
                                        shapePoint + column,
                                        height * 0.5375,
                                    );
                                }
                            }
                        });
                    }
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
        diffHashSig(crosshairData),
        isLineDrag,
        reset,
        location,
        crosshairActive,
        xAxis === undefined,
        isToolbarOpen,
        isShapeSelected,
        selectedDrawnShape,
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
                            changeScale();
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
                height: '2em',
                width: '100%',
                gridColumn: 3,
                gridRow: 4,
            }}
        ></d3fc-canvas>
    );
}
export default memo(XAxisCanvas);
