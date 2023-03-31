/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { FeeChartData } from '../TradeCharts';
import './Subcharts.css';
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
        isCrosshairActive,
    } = props;

    const d3PlotFeeRate = useRef(null);
    const d3Yaxis = useRef(null);

    const d3CanvasArea = useRef(null);
    const d3CanvasCrosshair = useRef(null);

    const [feeRateyScale, setFeeRateyScale] = useState<any>();
    const [yAxis, setyAxis] = useState<any>();
    const [lineSeries, setLineSeries] = useState<any>();
    const [feeRateZoom, setFeeRateZoom] = useState<any>();
    const [crosshairVerticalCanvas, setCrosshairVerticalCanvas] =
        useState<any>();
    const [crosshairHorizontalCanvas, setCrosshairHorizontalCanvas] =
        useState<any>();
    const [feeRateHorizontalyValue, setFeeRateHorizontalyValue] =
        useState<any>();

    useEffect(() => {
        const yScale = d3.scaleLinear();
        yScale.domain([0.5, 4]);

        const yAxis = d3fc
            .axisRight()
            .scale(yScale)
            .tickValues([1, 2.2, 3])
            .tickFormat((d: any) => {
                switch (d) {
                    case 1:
                        return 0.05 + '%';
                    case 2.2:
                        return 0.3 + '%';
                    case 3:
                        return 1 + '%';
                    default:
                        return d + '%';
                }
            });

        setyAxis(() => {
            return yAxis;
        });

        setFeeRateyScale(() => {
            return yScale;
        });
    }, []);

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

            const feeRateLogScale = d3
                .scaleLog()
                .domain([0.0005, 0.01])
                .range([1, 3]);

            const feeDataTemp: any[] = [];

            feeData.map((data: any) => {
                feeDataTemp.push({
                    time: data.time,
                    value: feeRateLogScale(data.value),
                });
            });

            if (lineSeries) {
                d3.select(d3CanvasArea.current)
                    .on('draw', () => {
                        lineSeries(feeDataTemp);
                    })
                    .on('measure', () => {
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
                    crosshairVerticalCanvas(crosshairForSubChart);
                    if (isCrosshairActive === 'feeRate') {
                        crosshairHorizontalCanvas([
                            {
                                x: crosshairForSubChart[0].x,
                                y: feeRateHorizontalyValue,
                            },
                        ]);
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
            yAxis !== undefined &&
            lineSeries !== undefined
        ) {
            drawChart(feeData, xScale, feeRateyScale, yAxis);

            props.render();
        }
    }, [
        xScale,
        period,
        feeData,
        zoomAndYdragControl,
        feeRateyScale,
        lineSeries,
        yAxis,
    ]);

    useEffect(() => {
        if (d3CanvasCrosshair !== undefined && feeRateZoom !== undefined) {
            d3.select(d3CanvasCrosshair.current).call(feeRateZoom);
        }
    }, [feeRateZoom, d3CanvasCrosshair]);

    const render = useCallback(() => {
        const nd = d3.select('#d3PlotFeeRate').node() as any;
        nd.requestRedraw();
        renderCanvas();
    }, []);

    const drawChart = useCallback(
        (feeData: any, xScale: any, feeRateyScale: any, yAxis: any) => {
            if (feeData.length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars

                const feeRateLogScale = d3
                    .scaleLog()
                    .domain([0.0005, 0.01])
                    .range([1, 3]);

                const feeDataTemp: any[] = [];

                feeData.map((data: any) => {
                    feeDataTemp.push({
                        time: data.time,
                        value: feeRateLogScale(data.value),
                    });
                });

                d3.select(d3PlotFeeRate.current).on(
                    'measure',
                    function (event: any) {
                        xScale.range([0, event.detail.width]);
                        feeRateyScale.range([event.detail.height, 0]);
                    },
                );

                d3.select(d3Yaxis.current).on('draw', function (event: any) {
                    d3.select(event.target).select('svg').call(yAxis);
                });

                d3.select(d3CanvasCrosshair.current).on(
                    'mousemove',
                    function (event: any) {
                        setFeeRateHorizontalyValue(() => {
                            return feeRateyScale.invert(event.layerY);
                        });
                        setCrossHairLocation(event, false);
                        setIsCrosshairActive('feeRate');
                        props.setShowTooltip(true);
                    },
                );

                d3.select(d3CanvasCrosshair.current).on('mouseleave', () => {
                    setIsCrosshairActive('none');
                    render();
                });
            }
        },
        [crosshairForSubChart, feeData],
    );

    return (
        <div id='fee_rate_chart' data-testid={'chart'}>
            <d3fc-svg
                id='d3PlotFeeRate'
                ref={d3PlotFeeRate}
                style={{ overflow: 'hidden' }}
            ></d3fc-svg>

            <d3fc-canvas
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
            <d3fc-svg
                className='y-axis'
                ref={d3Yaxis}
                style={{ width: yAxisWidth, gridColumn: 4, gridRow: 3 }}
            ></d3fc-svg>
        </div>
    );
}
