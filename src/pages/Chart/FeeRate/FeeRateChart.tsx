/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import '../Chart.css';
import { setCanvasResolution } from '../ChartUtils/chartUtils';
import { CandleData } from '../../../App/functions/fetchCandleSeries';
import { createIndicatorLine } from '../ChartUtils/indicatorLineSeries';

interface FreeRateData {
    feeData: Array<CandleData>;
    period: number;
    subChartValues: any;
    crosshairForSubChart: any;
    xScale: any;
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
}

function FeeRateChart(props: FreeRateData) {
    const {
        feeData,
        period,
        xScale,
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
        zoomBase,
    } = props;

    const d3Yaxis = useRef<HTMLCanvasElement | null>(null);

    const d3CanvasArea = useRef(null);
    const d3CanvasCrosshair = useRef(null);

    const [feeRateyScale, setFeeRateyScale] = useState<any>();
    const [lineSeries, setLineSeries] = useState<any>();
    const [crDataIndicator, setCrDataIndicator] = useState<any>();
    const [feeRateZoom, setFeeRateZoom] = useState<any>();
    const [crosshairVerticalCanvas, setCrosshairVerticalCanvas] =
        useState<any>();
    const [crosshairHorizontalCanvas, setCrosshairHorizontalCanvas] =
        useState<any>();
    const [feeRateHorizontalyValue, setFeeRateHorizontalyValue] =
        useState<any>();

    useEffect(() => {
        const domain = [-0.002, 0.0125];

        const yScale = d3.scaleSymlog().domain(domain).range([0, 1]);

        setFeeRateyScale(() => {
            return yScale;
        });
    }, []);

    useEffect(() => {
        if (feeRateyScale !== undefined) {
            const yAxis = d3fc
                .axisRight()
                .scale(feeRateyScale)
                .tickValues([0.0005, 0.004, 0.01]);

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
                        d3YaxisContext.fillText(
                            d * 100 + '%',
                            d3YaxisCanvas.width / 6,
                            feeRateyScale(d),
                        );
                    });
                }
            });
        }
    }, [feeRateyScale]);

    useEffect(() => {
        if (feeData !== undefined && period) {
            let date: any | undefined = undefined;

            const zoom = d3
                .zoom()
                .scaleExtent([1, 10])
                .on('start', () => {
                    if (date === undefined) {
                        date = feeData[feeData.length - 1].time * 1000;
                    }
                })
                .on('zoom', (event: any) => {
                    const domainX = xScale.domain();
                    const linearX = d3
                        .scaleTime()
                        .domain(xScale.range())
                        .range([0, domainX[1] - domainX[0]]);

                    const deltaX = linearX(-event.sourceEvent.movementX);
                    zoomBase.getNewCandleDataLeft(domainX[0] + deltaX, date);
                    xScale.domain([domainX[0] + deltaX, domainX[1] + deltaX]);

                    props.render();
                }) as any;

            setFeeRateZoom(() => {
                return zoom;
            });
        }
    }, [feeData, period]);

    useEffect(() => {
        if (feeRateyScale !== undefined && xScale !== undefined) {
            const lineSeries = d3fc
                .seriesCanvasLine()
                .xScale(xScale)
                .yScale(feeRateyScale)
                .mainValue((d: any) => d.averageLiquidityFee)
                .crossValue((d: any) => d.time * 1000)
                .decorate((selection: any) => {
                    selection.strokeStyle = '#7371FC';
                    selection.strokeWidth = 1;
                });

            setLineSeries(() => {
                return lineSeries;
            });

            const crDataIndicator = createIndicatorLine(xScale, feeRateyScale);

            setCrDataIndicator(() => {
                return crDataIndicator;
            });

            const crosshairVerticalCanvas = d3fc
                .annotationCanvasLine()
                .orient('vertical')
                .value((d: any) => d.x)
                .xScale(xScale)
                .yScale(feeRateyScale)
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
                .xScale(xScale)
                .yScale(feeRateyScale)
                .label('');

            crosshairHorizontalCanvas.decorate((context: any) => {
                context.visibility = 'hidden';
                context.strokeStyle = 'rgb(255, 255, 255)';
                context.pointerEvents = 'none';
                context.lineWidth = 0.3;
                context.fillStyle = 'transparent';
            });

            setCrosshairHorizontalCanvas(() => crosshairHorizontalCanvas);
        }
    }, [feeRateyScale, xScale]);

    useEffect(() => {
        if (feeData !== undefined) {
            const _feeData = feeData.filter((item) => item.tvlData.tvl !== 0);

            const canvas = d3
                .select(d3CanvasArea.current)
                .select('canvas')
                .node() as any;
            const ctx = canvas.getContext('2d');

            if (lineSeries) {
                d3.select(d3CanvasArea.current)
                    .on('draw', () => {
                        setCanvasResolution(canvas);
                        lineSeries(_feeData);
                        if (
                            isCrDataIndActive ||
                            xAxisActiveTooltip === 'croc'
                        ) {
                            ctx.setLineDash([0.6, 0.6]);
                            crDataIndicator([lastCrDate]);
                        }
                    })
                    .on('measure', (event: any) => {
                        feeRateyScale.range([event.detail.height, 0]);
                        lineSeries.context(ctx);
                        ctx.setLineDash([0.6, 0.6]);
                        crDataIndicator.context(ctx);
                    });
            }
            renderCanvas();
        }
    }, [
        lineSeries,
        feeData,
        crDataIndicator,
        lastCrDate,
        isCrDataIndActive,
        xAxisActiveTooltip,
    ]);

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
                        if (crosshairActive === 'feeRate') {
                            crosshairHorizontalCanvas([
                                {
                                    x: crosshairForSubChart[0].x,
                                    y: feeRateHorizontalyValue,
                                },
                            ]);
                        }
                    }
                })
                .on('measure', () => {
                    ctx.setLineDash([4, 2]);
                    crosshairVerticalCanvas.context(ctx);
                    if (crosshairActive === 'feeRate') {
                        crosshairHorizontalCanvas.context(ctx);
                    }
                });
        }
    }, [
        feeRateyScale,
        crosshairVerticalCanvas,
        crosshairForSubChart,
        feeRateHorizontalyValue,
        crosshairActive,
    ]);

    const renderCanvas = () => {
        if (d3CanvasArea) {
            const container = d3.select(d3CanvasArea.current).node() as any;
            if (container) container.requestRedraw();
        }

        if (d3CanvasCrosshair) {
            const container = d3
                .select(d3CanvasCrosshair.current)
                .node() as any;
            if (container) container.requestRedraw();
        }

        if (crDataIndicator) {
            const container = d3.select(crDataIndicator.current).node() as any;
            if (container) container.requestRedraw();
        }
    };

    // Fee Rate Chart
    useEffect(() => {
        if (
            feeData !== undefined &&
            feeRateyScale !== undefined &&
            lineSeries !== undefined
        ) {
            drawChart(feeData, feeRateyScale);
        }
    }, [period, feeData, feeRateyScale, lineSeries]);

    useEffect(() => {
        if (d3CanvasCrosshair !== undefined && feeRateZoom !== undefined) {
            d3.select(d3CanvasCrosshair.current).call(feeRateZoom);
        }
    }, [feeRateZoom, d3CanvasCrosshair]);

    const drawChart = useCallback(
        (feeData: any, feeRateyScale: any) => {
            if (feeData.length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars

                d3.select(d3CanvasCrosshair.current).on(
                    'mousemove',
                    function (event: any) {
                        setFeeRateHorizontalyValue(() => {
                            return feeRateyScale.invert(event.layerY);
                        });
                        setCrossHairLocation(event.offsetX, false);
                        setCrosshairActive('feeRate');
                        props.setShowTooltip(true);

                        if (period !== undefined) {
                            const snapDiff =
                                xScale.invert(event.offsetX) % (period * 1000);

                            const snappedTime =
                                xScale.invert(event.offsetX) -
                                (snapDiff > period * 1000 - snapDiff
                                    ? -1 * (period * 1000 - snapDiff)
                                    : snapDiff);

                            setCrosshairData([
                                {
                                    x: snappedTime,
                                    y: feeRateyScale.invert(event.layerY),
                                },
                            ]);
                        }
                        renderCanvas();
                    },
                );

                d3.select(d3CanvasCrosshair.current).on('mouseleave', () => {
                    setCrosshairActive('none');
                    renderCanvas();
                });
            }
        },
        [crosshairForSubChart, feeData],
    );

    return (
        <div id='fee_rate_chart' data-testid={'chart'}>
            <d3fc-canvas
                id='d3PlotFeeRate'
                ref={d3CanvasArea}
                className='d3CanvasArea'
            ></d3fc-canvas>

            <d3fc-canvas
                id='d3CanvasCrosshair'
                ref={d3CanvasCrosshair}
                className='d3CanvasCrosshair'
            ></d3fc-canvas>

            <label style={{ position: 'absolute', left: '0%' }}>
                Fee Rate:{' '}
                {subChartValues.filter(
                    (value: any) => value.name === 'feeRate',
                )[0].value
                    ? (
                          subChartValues.filter(
                              (value: any) => value.name === 'feeRate',
                          )[0].value * 100
                      ).toFixed(2) + '%'
                    : '-'}
            </label>

            <d3fc-canvas
                className='y-axis-canvas'
                ref={d3Yaxis}
                style={{
                    width: yAxisWidth,
                    gridColumn: 5,
                    gridRow: 3,
                }}
            ></d3fc-canvas>
        </div>
    );
}

export default memo(FeeRateChart);
