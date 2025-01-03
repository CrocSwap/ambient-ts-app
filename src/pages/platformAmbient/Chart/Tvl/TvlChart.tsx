/* eslint-disable @typescript-eslint/no-explicit-any */
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
    diffHashSig,
    diffHashSigScaleData,
} from '../../../../ambient-utils/dataLayer';
import { CandleDataIF } from '../../../../ambient-utils/types';
import { ChartThemeIF } from '../../../../contexts/ChartContext';
import { formatDollarAmountAxis } from '../../../../utils/numbers';
import '../Chart.css';
import {
    renderCanvasArray,
    setCanvasResolution,
} from '../ChartUtils/chartUtils';
import { createIndicatorLine } from '../ChartUtils/indicatorLineSeries';

interface TvlData {
    tvlData: Array<CandleDataIF>;
    period: number;
    subChartValues: any;
    crosshairForSubChart: any;
    scaleData: any;
    render: any;
    yAxisWidth: string;
    setCrossHairLocation: any;
    setCrosshairActive: React.Dispatch<React.SetStateAction<string>>;
    crosshairActive: string;
    setShowTooltip: React.Dispatch<React.SetStateAction<boolean>>;
    setCrosshairData: React.Dispatch<React.SetStateAction<any>>;
    xAxisActiveTooltip: string;
    zoomBase: any;
    mainZoom: any;
    firstCandleData: CandleDataIF;
    lastCandleData: CandleDataIF;
    isChartZoom: boolean;
    setIsChartZoom: React.Dispatch<React.SetStateAction<boolean>>;
    chartThemeColors: ChartThemeIF | undefined;
    colorChangeTrigger: boolean;
    setColorChangeTrigger: React.Dispatch<React.SetStateAction<boolean>>;
    setContextmenu: React.Dispatch<React.SetStateAction<boolean>>;
    setContextMenuPlacement: any;
}

function TvlChart(props: TvlData) {
    const {
        tvlData,
        period,
        scaleData,
        crosshairForSubChart,
        subChartValues,
        yAxisWidth,
        setCrossHairLocation,
        setCrosshairActive,
        setCrosshairData,
        crosshairActive,
        xAxisActiveTooltip,
        mainZoom,
        firstCandleData,
        lastCandleData,
        isChartZoom,
        setIsChartZoom,
        zoomBase,
        render,
        chartThemeColors,
        colorChangeTrigger,
        setColorChangeTrigger,
        setContextmenu,
        setContextMenuPlacement,
    } = props;

    const d3Yaxis = useRef<HTMLCanvasElement | null>(null);

    const d3CanvasArea = useRef(null);
    const d3CanvasCrosshair = useRef(null);

    const [tvlyScale, setTvlyScale] = useState<any>();
    const [areaSeries, setAreaSeries] = useState<any>();
    const [lineSeries, setLineSeries] = useState<any>();
    const [tvlGradient, setTvlGradient] = useState<any>();
    const [crDataIndicator, setCrDataIndicator] = useState<any>();
    const [crosshairVerticalCanvas, setCrosshairVerticalCanvas] =
        useState<any>();
    const [crosshairHorizontalCanvas, setCrosshairHorizontalCanvas] =
        useState<any>();
    const [tvlHorizontalyValue, setTvlHorizontalyValue] = useState<any>();
    const [buffer, setBuffer] = useState<any>();
    const [resizeHeight, setResizeHeight] = useState<number>();

    useEffect(() => {
        if (tvlyScale === undefined) {
            const yScale = d3.scaleLinear();

            const xmin = scaleData?.xScale.domain()[0];
            const xmax = scaleData?.xScale.domain()[1];

            const filtered = tvlData?.filter(
                (data: any) =>
                    data.time * 1000 >= xmin && data.time * 1000 <= xmax,
            );

            if (filtered !== undefined) {
                const maxYBoundary = d3.max(
                    filtered,
                    (d: any) => d.tvlData.tvl,
                );
                const minYBoundary = 0;

                if (maxYBoundary === minYBoundary) {
                    const domain = [0, maxYBoundary * 2];
                    yScale.domain(domain);
                } else {
                    const buffer = Math.abs(maxYBoundary - minYBoundary) / 4;

                    setBuffer(() => buffer);

                    const domain = [0, maxYBoundary + buffer * 2];
                    yScale.domain(domain);
                }
            }

            const canvas = d3
                .select(d3CanvasArea.current)
                .select('canvas')
                .node() as any;

            const boundingClientRect = canvas.getBoundingClientRect();

            yScale.range([(boundingClientRect.height / 4) * 3, 0]);
            setTvlyScale(() => {
                return yScale;
            });
        }
    }, [diffHashSig(tvlData)]);

    useEffect(() => {
        if (scaleData !== undefined && tvlData !== undefined && !isChartZoom) {
            const lastCandleDate = lastCandleData?.time * 1000;
            const firstCandleDate = firstCandleData?.time * 1000;

            let scrollTimeout: NodeJS.Timeout | null = null; // Declare scrollTimeout

            if (lastCandleDate && firstCandleDate) {
                d3.select(d3CanvasCrosshair.current).on(
                    'wheel',
                    function (event) {
                        if (scrollTimeout === null) {
                            setIsChartZoom(true);
                        }

                        zoomBase.zoomWithWheel(
                            event,
                            scaleData,
                            firstCandleDate,
                            lastCandleDate,
                        );
                        render();

                        if (scrollTimeout) {
                            clearTimeout(scrollTimeout);
                        }
                        // check wheel end
                        scrollTimeout = setTimeout(() => {
                            setIsChartZoom(false);
                        }, 200);
                    },
                    { passive: true },
                );
            }
        }
    }, [
        diffHashSig(tvlData),
        diffHashSigScaleData(scaleData, 'x'),
        isChartZoom,
    ]);

    useEffect(() => {
        if (tvlyScale !== undefined) {
            const yAxis = d3fc.axisRight().scale(tvlyScale);

            if (tvlData !== undefined) {
                const minYBoundary = 0;
                const maxYBoundary = d3.max(tvlData, (d: any) => d.tvlData.tvl);

                const buffer = Math.abs(maxYBoundary - minYBoundary) / 4;

                setBuffer(() => buffer);

                const bufferMultiplier = 2.5; // 2.5 seems to add just enough vertical space for the TVL label in the subchart to not collide with the drawing

                let domain = [0, maxYBoundary + buffer * bufferMultiplier];

                if (maxYBoundary === minYBoundary && maxYBoundary === 0) {
                    domain = [-1, 1];
                }

                yAxis
                    .tickValues([0, maxYBoundary])
                    .tickFormat(formatDollarAmountAxis);

                const d3YaxisCanvas = d3
                    .select(d3Yaxis.current)
                    .select('canvas')
                    .node() as any;

                const d3YaxisContext = d3YaxisCanvas.getContext('2d');

                d3.select(d3Yaxis.current).on('draw', function () {
                    if (yAxis) {
                        setCanvasResolution(d3YaxisCanvas);
                        d3YaxisContext.stroke();
                        d3YaxisContext.textAlign = 'left';
                        d3YaxisContext.textBaseline = 'middle';
                        d3YaxisContext.fillStyle = 'rgba(189,189,189,0.8)';
                        d3YaxisContext.font = '11.425px Lexend Deca';
                        yAxis.tickValues().forEach((d: number) => {
                            d3YaxisContext.beginPath();
                            if (0.0 === d) {
                                d3YaxisContext.fillText(
                                    '$' + 0,
                                    d3YaxisCanvas.width / 6,
                                    tvlyScale(buffer),
                                );
                            } else {
                                d3YaxisContext.fillText(
                                    formatDollarAmountAxis(d),
                                    d3YaxisCanvas.width / 6,
                                    tvlyScale(d),
                                );
                            }
                        });
                    }
                });

                tvlyScale.domain(domain);
            }
        }
    }, [tvlyScale]);

    useEffect(() => {
        if (d3CanvasArea && tvlyScale) {
            const canvas = d3
                .select(d3CanvasArea.current)
                .select('canvas')
                .node() as any;

            if (
                canvas !== null &&
                buffer &&
                !isNaN(buffer) &&
                resizeHeight &&
                chartThemeColors
            ) {
                const ctx = canvas.getContext('2d');
                const startPoint =
                    buffer === 0
                        ? 4
                        : (tvlyScale.domain()[1] - tvlyScale.domain()[0]) /
                          (buffer * 2);

                const DFLT_COLOR_STOP = 0.2;
                const calcStop = 1 / (startPoint + 1);
                const colorStop = isFinite(calcStop)
                    ? Math.min(calcStop, 1)
                    : DFLT_COLOR_STOP;

                const tvlGradient = ctx.createLinearGradient(
                    0,
                    0,
                    0,
                    resizeHeight,
                );

                const d3TvlGradientStart = chartThemeColors.liqBidColor?.copy();
                const d3TvlGradient = chartThemeColors.liqBidColor?.copy();

                if (d3TvlGradientStart) d3TvlGradientStart.opacity = 0;
                if (d3TvlGradient) d3TvlGradient.opacity = 0.7;

                tvlGradient.addColorStop(
                    1,
                    d3TvlGradientStart
                        ? d3TvlGradientStart
                        : 'rgba(115, 113, 252, 0)',
                );
                tvlGradient.addColorStop(
                    colorStop,
                    d3TvlGradient ? d3TvlGradient : 'rgba(115, 113, 252, 0.7)',
                );

                setTvlGradient(() => {
                    return tvlGradient;
                });
            }
        }
    }, [
        d3CanvasArea,
        diffHashSig(tvlyScale),
        buffer,
        resizeHeight,
        colorChangeTrigger,
    ]);

    useEffect(() => {
        if (d3CanvasArea) {
            const canvasDiv = d3.select(d3CanvasArea.current) as any;

            const resizeObserver = new ResizeObserver((event: any) => {
                setResizeHeight(event[0].contentRect?.height);
            });

            resizeObserver.observe(canvasDiv.node());

            return () => resizeObserver.unobserve(canvasDiv.node());
        }
    }, [d3CanvasArea === undefined]);

    useEffect(() => {
        if (
            scaleData !== undefined &&
            tvlyScale !== undefined &&
            tvlGradient !== undefined &&
            chartThemeColors
        ) {
            const areaSeries = d3fc
                .seriesCanvasArea()
                .xScale(scaleData?.xScale)
                .yScale(tvlyScale)
                // .curve(d3.curveBasis)
                .mainValue((d: any) => d.tvlData.tvl)
                .crossValue((d: any) => d.time * 1000)
                .decorate((selection: any) => {
                    selection.fillStyle = tvlGradient;
                });

            setAreaSeries(() => {
                return areaSeries;
            });

            const d3TvlGradient = chartThemeColors.liqBidColor?.copy();

            if (d3TvlGradient) d3TvlGradient.opacity = 0.7;

            const lineSeries = d3fc
                .seriesCanvasLine()
                .xScale(scaleData?.xScale)
                .yScale(tvlyScale)
                .mainValue((d: any) => d.tvlData.tvl)
                .crossValue((d: any) => d.time * 1000)
                .decorate((selection: any) => {
                    selection.strokeStyle = d3TvlGradient
                        ? d3TvlGradient
                        : 'rgba(115, 113, 252, 0.7)';
                    selection.strokeWidth = 2;
                });

            setLineSeries(() => lineSeries);

            const crosshairVerticalCanvas = d3fc
                .annotationCanvasLine()
                .orient('vertical')
                .value((d: any) => d.x)
                .xScale(scaleData?.xScale)
                .yScale(tvlyScale)
                .label('');

            crosshairVerticalCanvas.decorate((context: any) => {
                context.strokeStyle = 'rgb(255, 255, 255)';
                context.pointerEvents = 'none';
                context.lineWidth = 0.3;
                context.fillStyle = 'transparent';
            });

            setCrosshairVerticalCanvas(() => crosshairVerticalCanvas);

            const crosshairHorizontalCanvas = d3fc
                .annotationCanvasLine()
                .value((d: any) => d.y)
                .xScale(scaleData?.xScale)
                .yScale(tvlyScale)
                .label('');

            crosshairHorizontalCanvas.decorate((context: any) => {
                context.visibility = 'hidden';
                context.strokeStyle = 'rgb(255, 255, 255)';
                context.pointerEvents = 'none';
                context.lineWidth = 0.3;
                context.fillStyle = 'transparent';
            });

            const crDataIndicator = createIndicatorLine(
                scaleData?.xScale,
                scaleData?.yScale,
            );

            setCrDataIndicator(() => {
                return crDataIndicator;
            });

            setCrosshairHorizontalCanvas(() => crosshairHorizontalCanvas);

            setColorChangeTrigger(false);
        }
    }, [scaleData, tvlyScale, tvlGradient, colorChangeTrigger]);

    useEffect(() => {
        const canvas = d3
            .select(d3CanvasArea.current)
            .select('canvas')
            .node() as any;
        const ctx = canvas.getContext('2d');

        if (areaSeries && lineSeries) {
            d3.select(d3CanvasArea.current)
                .on('draw', () => {
                    setCanvasResolution(canvas);
                    areaSeries(tvlData);
                    lineSeries(tvlData);
                })
                .on('measure', (event: any) => {
                    tvlyScale.range([event.detail.height, 0]);
                    areaSeries.context(ctx);
                    lineSeries.context(ctx);
                    ctx.setLineDash([0.6, 0.6]);
                    crDataIndicator.context(ctx);
                });
        }

        renderCanvasArray([d3CanvasArea]);
    }, [
        areaSeries,
        lineSeries,
        diffHashSig(tvlData),
        crDataIndicator,
        xAxisActiveTooltip,
    ]);

    useEffect(() => {
        if (d3CanvasCrosshair !== undefined && mainZoom !== undefined) {
            d3.select(d3CanvasCrosshair.current).call(mainZoom);
        }
    }, [mainZoom, d3CanvasCrosshair]);

    useEffect(() => {
        const canvas = d3
            .select(d3CanvasCrosshair.current)
            .select('canvas')
            .node() as any;
        const ctx = canvas.getContext('2d');

        if (crosshairVerticalCanvas) {
            d3.select(d3CanvasCrosshair.current)
                .on('draw', () => {
                    setCanvasResolution(canvas);
                    ctx.setLineDash([4, 2]);
                    if (crosshairActive !== 'none') {
                        crosshairVerticalCanvas(crosshairForSubChart);
                        if (crosshairActive === 'tvl') {
                            crosshairHorizontalCanvas([
                                {
                                    x: crosshairForSubChart[0].x,
                                    y: tvlHorizontalyValue,
                                },
                            ]);
                        }
                    }
                })
                .on('measure', () => {
                    ctx.setLineDash([4, 2]);
                    crosshairVerticalCanvas.context(ctx);
                    if (crosshairActive === 'tvl') {
                        crosshairHorizontalCanvas.context(ctx);
                    }
                });
        }
    }, [
        diffHashSig(tvlyScale),
        crosshairVerticalCanvas,
        crosshairForSubChart,
        crosshairHorizontalCanvas,
        tvlHorizontalyValue,
        crosshairActive,
    ]);

    useEffect(() => {
        renderCanvasArray([d3CanvasArea, d3Yaxis]);
    }, [tvlyScale, tvlData]);
    // Tvl Chart
    useEffect(() => {
        if (
            tvlData !== undefined &&
            scaleData !== undefined &&
            tvlyScale !== undefined
        ) {
            drawChart(tvlData, tvlyScale);
        }
    }, [scaleData, period, tvlData, diffHashSig(tvlyScale)]);

    const drawChart = useCallback(
        (tvlData: any, tvlyScale: any) => {
            if (tvlData.length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars

                d3.select(d3CanvasCrosshair.current).on(
                    'mousemove',
                    function (event: any) {
                        setTvlHorizontalyValue(() => {
                            return tvlyScale.invert(event.layerY);
                        });
                        setCrossHairLocation(event.offsetX, false);
                        setCrosshairActive('tvl');
                        props.setShowTooltip(true);

                        if (period !== undefined) {
                            const snapDiff =
                                scaleData?.xScale.invert(event.offsetX) %
                                (period * 1000);

                            const snappedTime =
                                scaleData?.xScale.invert(event.offsetX) -
                                (snapDiff > period * 1000 - snapDiff
                                    ? -1 * (period * 1000 - snapDiff)
                                    : snapDiff);

                            setCrosshairData([
                                {
                                    x: snappedTime,
                                    y: tvlyScale.invert(event.layerY),
                                },
                            ]);
                        }
                    },
                );

                d3.select(d3CanvasCrosshair.current).on('mouseleave', () => {
                    setCrosshairActive('none');
                });

                d3.select(d3CanvasCrosshair.current).on(
                    'contextmenu',
                    (event: PointerEvent) => {
                        if (!event.shiftKey) {
                            event.preventDefault();

                            const screenHeight = window.innerHeight;

                            const diff = screenHeight - event.clientY;

                            setContextMenuPlacement({
                                top: event.clientY,
                                left: event.clientX,
                                isReversed: diff < 350,
                            });

                            setContextmenu(true);
                        } else {
                            setContextmenu(false);
                        }
                    },
                );
            }
        },
        [tvlData],
    );

    useEffect(() => {
        renderCanvasArray([d3CanvasCrosshair]);
    }, [crosshairActive]);

    return (
        <div
            id='tvl_chart'
            data-testid={'chart'}
            style={{
                gridTemplateColumns: 'auto 1fr auto',
            }}
        >
            <d3fc-canvas
                id='d3PlotTvl'
                ref={d3CanvasArea}
                className='d3CanvasArea'
                style={{
                    display: 'block',
                    gridColumnStart: 1,
                    gridColumnEnd: 3,
                    gridRowStart: 1,
                    gridRowEnd: 3,
                }}
            ></d3fc-canvas>

            <d3fc-canvas
                id='d3CanvasCrosshair'
                ref={d3CanvasCrosshair}
                className='d3CanvasCrosshair'
                style={{
                    display: 'block',
                    gridColumnStart: 1,
                    gridColumnEnd: 3,
                    gridRowStart: 1,
                    gridRowEnd: 3,
                }}
            ></d3fc-canvas>

            <label
                style={{
                    gridColumnStart: 1,
                    gridColumnEnd: 1,
                    gridRow: 1,
                }}
            >
                TVL:{' '}
                {formatDollarAmountAxis(
                    subChartValues.filter(
                        (value: any) => value.name === 'tvl',
                    )[0].value,
                    true,
                )}
            </label>
            <d3fc-canvas
                className='y-axis-canvas_tvl'
                ref={d3Yaxis}
                style={{
                    width: yAxisWidth,
                    gridColumnStart: 3,
                    gridColumnEnd: 4,
                    gridRowStart: 1,
                    gridRowEnd: 3,
                }}
            ></d3fc-canvas>
        </div>
    );
}

export default memo(TvlChart);
