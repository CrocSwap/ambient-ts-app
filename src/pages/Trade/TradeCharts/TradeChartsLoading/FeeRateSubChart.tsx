/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { FeeChartData } from '../TradeCharts';
import './Subcharts.css';
import { setCanvasResolution } from '../../../Chart/Chart';
interface FreeRateData {
    feeData: FeeChartData[] | undefined;
    period: number | undefined;
    subChartValues: any;
    setZoomAndYdragControl: React.Dispatch<React.SetStateAction<any>>;
    crosshairForSubChart: any;
    xScale: any;
    render: any;
    zoomAndYdragControl: any;
    getNewCandleData: any;
    yAxisWidth: string;
    setCrossHairLocation: any;
    setIsCrosshairActive: React.Dispatch<React.SetStateAction<string>>;
    isCrosshairActive: string;
    setShowTooltip: React.Dispatch<React.SetStateAction<boolean>>;
    isMouseMoveCrosshair: boolean;
    setIsMouseMoveCrosshair: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function FeeRateSubChart(props: FreeRateData) {
    const {
        feeData,
        period,
        xScale,
        crosshairForSubChart,
        zoomAndYdragControl,
        setZoomAndYdragControl,
        getNewCandleData,
        subChartValues,
        yAxisWidth,
        setCrossHairLocation,
        setIsCrosshairActive,
        isMouseMoveCrosshair,
        isCrosshairActive,
        setIsMouseMoveCrosshair,
    } = props;

    const d3Yaxis = useRef<HTMLInputElement | null>(null);

    const d3CanvasArea = useRef(null);
    const d3CanvasCrosshair = useRef(null);

    const [feeRateyScale, setFeeRateyScale] = useState<any>();
    const [lineSeries, setLineSeries] = useState<any>();
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
                .tickValues([0.0005, 0.003, 0.01]);

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
        if (feeData !== undefined) {
            let date: any | undefined = undefined;

            const zoom = d3
                .zoom()
                .scaleExtent([1, 10])
                .on('start', () => {
                    if (date === undefined) {
                        date = feeData[feeData.length - 1].time;
                    }
                })
                .on('zoom', (event: any) => {
                    const domainX = xScale.domain();
                    const linearX = d3
                        .scaleTime()
                        .domain(xScale.range())
                        .range([0, domainX[1] - domainX[0]]);

                    const deltaX = linearX(-event.sourceEvent.movementX);
                    getNewCandleData(
                        new Date(domainX[0].getTime() + deltaX),
                        date,
                    );
                    xScale.domain([
                        new Date(domainX[0].getTime() + deltaX),
                        new Date(domainX[1].getTime() + deltaX),
                    ]);

                    setZoomAndYdragControl(event);
                }) as any;

            setFeeRateZoom(() => {
                return zoom;
            });
        }
    }, [feeData]);

    useEffect(() => {
        if (feeRateyScale !== undefined && xScale !== undefined) {
            const lineSeries = d3fc
                .seriesCanvasLine()
                .xScale(xScale)
                .yScale(feeRateyScale)
                .mainValue((d: any) => d.value)
                .crossValue((d: any) => d.time)
                .decorate((selection: any) => {
                    selection.strokeStyle = '#7371FC';
                    selection.strokeWidth = 1;
                });

            setLineSeries(() => {
                return lineSeries;
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
                context.lineWidth = 0.5;
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
                context.lineWidth = 0.5;
            });

            setCrosshairHorizontalCanvas(() => crosshairHorizontalCanvas);
        }
    }, [feeRateyScale, xScale]);

    useEffect(() => {
        if (feeData !== undefined) {
            const canvas = d3
                .select(d3CanvasArea.current)
                .select('canvas')
                .node() as any;
            const ctx = canvas.getContext('2d');

            if (lineSeries) {
                d3.select(d3CanvasArea.current)
                    .on('draw', () => {
                        setCanvasResolution(canvas);
                        lineSeries(feeData);
                    })
                    .on('measure', (event: any) => {
                        feeRateyScale.range([event.detail.height, 0]);
                        lineSeries.context(ctx);
                    });
            }
        }
    }, [lineSeries, feeData]);

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
                    ctx.setLineDash([0.6, 0.6]);
                    if (isMouseMoveCrosshair) {
                        crosshairVerticalCanvas(crosshairForSubChart);
                        if (isCrosshairActive === 'feeRate') {
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
                    ctx.setLineDash([0.6, 0.6]);
                    crosshairVerticalCanvas.context(ctx);
                    if (isCrosshairActive === 'feeRate') {
                        crosshairHorizontalCanvas.context(ctx);
                    }
                });
        }
    }, [
        feeRateyScale,
        crosshairVerticalCanvas,
        crosshairForSubChart,
        feeRateHorizontalyValue,
        isCrosshairActive,
    ]);

    const renderCanvas = () => {
        if (d3CanvasArea) {
            const container = d3.select(d3CanvasArea.current).node() as any;
            if (container) container.requestRedraw();
        }

        if (d3CanvasCrosshair) {
            const container = d3.select(d3CanvasArea.current).node() as any;
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

            props.render();
        }
    }, [period, feeData, zoomAndYdragControl, feeRateyScale, lineSeries]);

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
                        setCrossHairLocation(event, false);
                        setIsCrosshairActive('feeRate');
                        props.setShowTooltip(true);
                        setIsMouseMoveCrosshair(true);
                    },
                );

                d3.select(d3CanvasCrosshair.current).on('mouseleave', () => {
                    setIsCrosshairActive('none');
                    setIsMouseMoveCrosshair(false);
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
                className='fee-rate-canvas'
            ></d3fc-canvas>

            <d3fc-canvas
                ref={d3CanvasCrosshair}
                className='fee-rate-canvas'
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
                      ).toString() + '%'
                    : '-'}
            </label>
            <d3fc-canvas
                className='y-axis-canvas'
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
