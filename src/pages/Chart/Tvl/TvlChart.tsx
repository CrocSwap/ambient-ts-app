/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { formatDollarAmountAxis } from '../../../utils/numbers';
import '../Chart.css';
import {
    renderCanvasArray,
    setCanvasResolution,
} from '../ChartUtils/chartUtils';
import {
    diffHashSig,
    diffHashSigScaleData,
} from '../../../utils/functions/diffHashSig';
import { CandleData } from '../../../App/functions/fetchCandleSeries';
import { createIndicatorLine } from '../ChartUtils/indicatorLineSeries';

interface TvlData {
    tvlData: Array<CandleData>;
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
    lastCrDate: number | undefined;
    isCrDataIndActive: boolean;
    xAxisActiveTooltip: string;
    zoomBase: any;
    mainZoom: any;
    firstCandleData: CandleData;
    lastCandleData: CandleData;
    isChartZoom: boolean;
    setIsChartZoom: React.Dispatch<React.SetStateAction<boolean>>;
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
        lastCrDate,
        isCrDataIndActive,
        xAxisActiveTooltip,
        mainZoom,
        firstCandleData,
        lastCandleData,
        isChartZoom,
        setIsChartZoom,
        zoomBase,
        render,
    } = props;

    // const tvlMainDiv = useRef(null);
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

            yScale.range([boundingClientRect.height, 0]);
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

                let domain = [0, maxYBoundary + buffer * 2];

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

            if (canvas !== null && buffer && !isNaN(buffer) && resizeHeight) {
                const ctx = canvas.getContext('2d');
                const startPoint =
                    buffer === 0
                        ? 4
                        : (tvlyScale.domain()[1] - tvlyScale.domain()[0]) /
                          (buffer * 2);

                const DFLT_COLOR_STOP = 0.2;
                const calcStop = 1 / (startPoint + 1);
                const colorStop = isFinite(calcStop)
                    ? calcStop
                    : DFLT_COLOR_STOP;

                const tvlGradient = ctx.createLinearGradient(
                    0,
                    0,
                    0,
                    resizeHeight,
                );
                tvlGradient.addColorStop(1, 'rgba(115, 113, 252, 0)');
                tvlGradient.addColorStop(colorStop, 'rgba(115, 113, 252, 0.7)');

                setTvlGradient(() => {
                    return tvlGradient;
                });
            }
        }
    }, [d3CanvasArea, diffHashSig(tvlyScale), buffer, resizeHeight]);

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
            tvlGradient !== undefined
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

            const lineSeries = d3fc
                .seriesCanvasLine()
                .xScale(scaleData?.xScale)
                .yScale(tvlyScale)
                .mainValue((d: any) => d.tvlData.tvl)
                .crossValue((d: any) => d.time * 1000)
                .decorate((selection: any) => {
                    selection.strokeStyle = 'rgba(115, 113, 252, 0.7)';
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
        }
    }, [scaleData, tvlyScale, tvlGradient]);

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

                    if (isCrDataIndActive || xAxisActiveTooltip === 'croc') {
                        ctx.setLineDash([0.6, 0.6]);
                        crDataIndicator([lastCrDate]);
                    }
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
        lastCrDate,
        isCrDataIndActive,
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
    }, [
        tvlyScale,
        tvlData,
        isCrDataIndActive || xAxisActiveTooltip === 'croc',
    ]);
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
            }
        },
        [tvlData],
    );

    useEffect(() => {
        renderCanvasArray([d3CanvasCrosshair]);
    }, [crosshairActive]);

    return (
        <div id='tvl_chart' data-testid={'chart'}>
            <d3fc-canvas
                id='d3PlotTvl'
                ref={d3CanvasArea}
                className='d3CanvasArea'
            ></d3fc-canvas>

            <d3fc-canvas
                id='d3CanvasCrosshair'
                ref={d3CanvasCrosshair}
                className='d3CanvasCrosshair'
            ></d3fc-canvas>

            <label style={{ position: 'absolute', left: '0%' }}>
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
                    gridColumn: 4,
                    gridRow: 3,
                }}
            ></d3fc-canvas>
        </div>
    );
}

export default memo(TvlChart);
