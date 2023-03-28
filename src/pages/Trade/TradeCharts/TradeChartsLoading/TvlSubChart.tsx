/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { formatDollarAmountAxis } from '../../../../utils/numbers';
import { TvlChartData } from '../TradeCharts';
import './Subcharts.css';

interface TvlData {
    tvlData: TvlChartData[] | undefined;
    period: number | undefined;
    subChartValues: any;
    setZoomAndYdragControl: React.Dispatch<React.SetStateAction<any>>;
    crosshairForSubChart: any;
    scaleData: any;
    render: any;
    zoomAndYdragControl: any;
    getNewCandleData: any;
    setMouseMoveChartName: React.Dispatch<
        React.SetStateAction<string | undefined>
    >;
    mouseMoveChartName: string | undefined;
    yAxisWidth: string;
    setTvlAreaSeries: React.Dispatch<React.SetStateAction<any>>;
    setCrossHairLocation: any;
    setIsCrosshairActive: React.Dispatch<React.SetStateAction<string>>;
}

export default function TvlSubChart(props: TvlData) {
    const {
        tvlData,
        period,
        scaleData,
        crosshairForSubChart,
        zoomAndYdragControl,
        setZoomAndYdragControl,
        getNewCandleData,
        setMouseMoveChartName,
        subChartValues,
        yAxisWidth,
        setTvlAreaSeries,
        setCrossHairLocation,
        setIsCrosshairActive,
    } = props;

    const tvlMainDiv = useRef(null);
    const d3PlotTvl = useRef(null);
    const d3Yaxis = useRef(null);

    const d3CanvasArea = useRef(null);
    const d3CanvasCrosshair = useRef(null);

    const [tvlyScale, setTvlyScale] = useState<any>();
    const [yAxis, setyAxis] = useState<any>();
    const [areaSeries, setAreaSeries] = useState<any>();
    const [lineSeries, setLineSeries] = useState<any>();
    const [tvlGradient, setTvlGradient] = useState<any>();
    const [tvlZoom, setTvlZoom] = useState<any>();
    const [crosshairVerticalCanvas, setCrosshairVerticalCanvas] =
        useState<any>();

    useEffect(() => {
        const yScale = d3.scaleLinear();

        const xmin = new Date(Math.floor(scaleData.xScale.domain()[0]));
        const xmax = new Date(Math.floor(scaleData.xScale.domain()[1]));

        const filtered = tvlData?.filter(
            (data: any) => data.time >= xmin && data.time <= xmax,
        );

        if (filtered !== undefined) {
            const maxYBoundary = d3.max(filtered, (d: any) => d.value);
            const domain = [0, maxYBoundary * 1.2];

            yScale.domain(domain);
        }

        const yAxis = d3fc.axisRight().scale(yScale);

        setyAxis(() => {
            return yAxis;
        });

        setTvlyScale(() => {
            return yScale;
        });
    }, [tvlData]);

    useEffect(() => {
        if (tvlData !== undefined) {
            let date: any | undefined = undefined;

            const zoom = d3
                .zoom()
                .on('start', () => {
                    if (date === undefined) {
                        date = tvlData[tvlData.length - 1].time;
                    }
                })
                .on('zoom', (event: any) => {
                    const domainX = scaleData.xScale.domain();
                    const linearX = d3
                        .scaleTime()
                        .domain(scaleData.xScale.range())
                        .range([0, domainX[1] - domainX[0]]);

                    const deltaX = linearX(-event.sourceEvent.movementX);

                    getNewCandleData(
                        new Date(domainX[0].getTime() + deltaX),
                        date,
                    );

                    scaleData.xScale.domain([
                        new Date(domainX[0].getTime() + deltaX),
                        new Date(domainX[1].getTime() + deltaX),
                    ]);

                    setZoomAndYdragControl(event);
                }) as any;

            setTvlZoom(() => {
                return zoom;
            });
        }
    }, [
        tvlData,
        scaleData,
        JSON.stringify(scaleData.xScale.domain()[0]),
        JSON.stringify(scaleData.xScale.domain()[1]),
    ]);

    useEffect(() => {
        if (yAxis !== undefined && tvlyScale !== undefined) {
            const xmin = new Date(Math.floor(scaleData.xScale.domain()[0]));
            const xmax = new Date(Math.floor(scaleData.xScale.domain()[1]));

            const filtered = tvlData?.filter(
                (data: any) => data.time >= xmin && data.time <= xmax,
            );

            if (filtered !== undefined) {
                const minYBoundary = d3.min(filtered, (d: any) => d.value);
                const maxYBoundary = d3.max(filtered, (d: any) => d.value);

                const domain = [0, maxYBoundary * 1.2];

                yAxis
                    .tickValues([
                        minYBoundary + (maxYBoundary - minYBoundary) / 2,
                        maxYBoundary / minYBoundary < 2
                            ? ''
                            : maxYBoundary * 1.5,
                    ])
                    .tickFormat(formatDollarAmountAxis);

                tvlyScale.domain(domain);
            }
        }
    }, [
        tvlyScale,
        JSON.stringify(scaleData.xScale.domain()[0]),
        JSON.stringify(scaleData.xScale.domain()[1]),
    ]);

    useEffect(() => {
        if (d3CanvasArea) {
            const ctx = (
                d3.select(d3CanvasArea.current).select('canvas').node() as any
            ).getContext('2d');

            const tvlGradient = ctx.createLinearGradient(100, 0, 100, 100);
            tvlGradient.addColorStop(0.1, 'rgba(125, 124, 251)');
            tvlGradient.addColorStop(0.55, 'rgba(0, 0, 0, 0.6)');

            setTvlGradient(() => {
                return tvlGradient;
            });
        }
    }, [d3CanvasArea]);

    useEffect(() => {
        if (
            scaleData !== undefined &&
            tvlyScale !== undefined &&
            tvlGradient !== undefined
        ) {
            const areaSeries = d3fc
                .seriesCanvasArea()
                .xScale(scaleData.xScale)
                .yScale(tvlyScale)
                // .curve(d3.curveBasis)
                .mainValue((d: any) => d.value)
                .crossValue((d: any) => d.time)
                .decorate((selection: any) => {
                    selection.fillStyle = tvlGradient;
                });

            setAreaSeries(() => {
                return areaSeries;
            });

            const lineSeries = d3fc
                .seriesCanvasLine()
                .xScale(scaleData.xScale)
                .yScale(tvlyScale)
                .mainValue((d: any) => d.value)
                .crossValue((d: any) => d.time)
                .decorate((selection: any) => {
                    selection.strokeStyle = '#7371FC';
                    selection.strokeWidth = 2;
                });

            setLineSeries(() => lineSeries);

            const crosshairVerticalCanvas = d3fc
                .annotationCanvasLine()
                .orient('vertical')
                .value((d: any) => d.x)
                .xScale(scaleData.xScale)
                .yScale(tvlyScale)
                .label('');

            crosshairVerticalCanvas.decorate((context: any) => {
                context.strokeStyle = 'rgb(255, 255, 255)';
                context.pointerEvents = 'none';
                context.lineWidth = 0.5;
            });

            setTvlAreaSeries(() => areaSeries);

            setCrosshairVerticalCanvas(() => crosshairVerticalCanvas);
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
                    areaSeries(tvlData);
                    lineSeries(tvlData);
                })
                .on('measure', () => {
                    areaSeries.context(ctx);
                    lineSeries.context(ctx);
                });
        }
    }, [areaSeries, lineSeries, tvlyScale]);

    useEffect(() => {
        if (d3CanvasCrosshair !== undefined && tvlZoom !== undefined) {
            d3.select(d3CanvasCrosshair.current).call(tvlZoom);
        }
    }, [tvlZoom, d3CanvasCrosshair]);

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
                })
                .on('measure', () => {
                    ctx.setLineDash([0.6, 0.6]);
                    crosshairVerticalCanvas.context(ctx);
                });
        }
    }, [tvlyScale, crosshairVerticalCanvas, crosshairForSubChart]);

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
    };

    // Tvl Chart
    useEffect(() => {
        if (
            tvlData !== undefined &&
            scaleData !== undefined &&
            yAxis !== undefined &&
            tvlyScale !== undefined
        ) {
            drawChart(tvlData, tvlyScale, yAxis);

            props.render();
        }
    }, [scaleData, period, tvlData, zoomAndYdragControl, tvlyScale, yAxis]);

    const render = useCallback(() => {
        const nd = d3.select('#d3PlotTvl').node() as any;
        nd.requestRedraw();
        renderCanvas();
    }, []);

    const drawChart = useCallback(
        (tvlData: any, tvlyScale: any, yAxis: any) => {
            if (tvlData.length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars

                d3.select(d3PlotTvl.current).on(
                    'measure',
                    function (event: any) {
                        scaleData.xScale.range([0, event.detail.width]);
                        tvlyScale.range([event.detail.height, 0]);
                    },
                );

                d3.select(d3Yaxis.current).on('draw', function (event: any) {
                    d3.select(event.target).select('svg').call(yAxis);
                });

                d3.select(d3CanvasCrosshair.current).on(
                    'mousemove',
                    function (event: any) {
                        setCrossHairLocation(event, false);
                        setIsCrosshairActive('tvl');
                    },
                );

                d3.select(d3CanvasCrosshair.current).on('mouseleave', () => {
                    setMouseMoveChartName(undefined);
                    setIsCrosshairActive('none');
                    render();
                });
            }
        },
        [tvlData],
    );

    return (
        <div ref={tvlMainDiv} id='tvl_chart' data-testid={'chart'}>
            <d3fc-svg
                id='d3PlotTvl'
                ref={d3PlotTvl}
                style={{ overflow: 'hidden' }}
            ></d3fc-svg>

            <d3fc-canvas
                ref={d3CanvasArea}
                className='tvl-canvas'
            ></d3fc-canvas>

            <d3fc-canvas
                ref={d3CanvasCrosshair}
                className='tvl-canvas'
            ></d3fc-canvas>

            <label style={{ position: 'absolute', left: '0%' }}>
                TVL:{' '}
                {formatDollarAmountAxis(
                    subChartValues.filter(
                        (value: any) => value.name === 'tvl',
                    )[0].value,
                )}
            </label>
            <d3fc-svg
                className='y-axis'
                ref={d3Yaxis}
                style={{ width: yAxisWidth, gridColumn: 4, gridRow: 3 }}
            ></d3fc-svg>
        </div>
    );
}
