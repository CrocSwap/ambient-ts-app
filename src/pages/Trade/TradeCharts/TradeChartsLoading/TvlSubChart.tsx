/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { formatDollarAmountAxis } from '../../../../utils/numbers';
import { TvlChartData } from '../TradeCharts';

interface TvlData {
    tvlData: TvlChartData[] | undefined;
    period: number | undefined;
    setsubChartValues: React.Dispatch<React.SetStateAction<any>>;
    setZoomAndYdragControl: React.Dispatch<React.SetStateAction<any>>;
    crosshairForSubChart: any;
    xScale: any;
    xScaleCopy: any;
    render: any;
    zoomAndYdragControl: any;
    isMouseMoveForSubChart: any;
    setIsMouseMoveForSubChart: React.Dispatch<React.SetStateAction<boolean>>;
    setMouseMoveEventForSubChart: React.Dispatch<React.SetStateAction<any>>;
    setIsZoomForSubChart: React.Dispatch<React.SetStateAction<boolean>>;
    getNewCandleData: any;
    setMouseMoveChartName: React.Dispatch<React.SetStateAction<string | undefined>>;
    mouseMoveChartName: string | undefined;
}

export default function TvlSubChart(props: TvlData) {
    const {
        tvlData,
        period,
        xScale,
        xScaleCopy,
        crosshairForSubChart,
        zoomAndYdragControl,
        setZoomAndYdragControl,
        setMouseMoveEventForSubChart,
        setIsMouseMoveForSubChart,
        setIsZoomForSubChart,
        setsubChartValues,
        isMouseMoveForSubChart,
        getNewCandleData,
        setMouseMoveChartName,
        mouseMoveChartName,
    } = props;

    const tvlMainDiv = useRef(null);
    const d3PlotTvl = useRef(null);
    const d3Yaxis = useRef(null);

    // Tvl Chart
    useEffect(() => {
        if (tvlData !== undefined) {
            drawChart(tvlData, xScale);

            props.render();
        }
    }, [xScale, crosshairForSubChart, period, tvlData, zoomAndYdragControl]);

    const render = useCallback(() => {
        const nd = d3.select('#d3PlotTvl').node() as any;
        nd.requestRedraw();
    }, []);

    const drawChart = useCallback(
        (tvlData: any, xScale: any) => {
            if (tvlData.length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const yExtent = d3fc.extentLinear().accessors([(d: any) => d.value]);
                const yScale = d3.scaleLinear();
                yScale.domain(yExtent(tvlData));
                const yAxis = d3fc
                    .axisRight()
                    .scale(yScale)
                    .tickFormat(formatDollarAmountAxis)
                    .tickArguments([2]);

                const crosshairDataLocal = [
                    {
                        x: crosshairForSubChart[0].x,
                        y:
                            isMouseMoveForSubChart && mouseMoveChartName === 'tvl'
                                ? crosshairForSubChart[0].y
                                : -1,
                    },
                ];

                const areaJoin = d3fc.dataJoin('g', 'areaJoin');
                const lineJoin = d3fc.dataJoin('g', 'lineJoin');
                const crosshairHorizontalJoin = d3fc.dataJoin('g', 'crosshairHorizontal');
                const crosshairVerticalJoin = d3fc.dataJoin('g', 'crosshairVertical');

                const crosshairHorizontal = d3fc
                    .annotationSvgLine()
                    .orient('vertical')
                    .value((d: any) => d.x)
                    .xScale(xScale)
                    .yScale(yScale)
                    .label('');

                crosshairHorizontal.decorate((selection: any) => {
                    selection.enter().select('line').attr('class', 'crosshair');
                    selection.enter().style('visibility', 'hidden');
                    selection
                        .enter()
                        .append('line')
                        .attr('stroke-width', 1)
                        .style('pointer-events', 'all');
                    selection.enter().select('g.top-handle').remove();
                });

                const crosshairVertical = d3fc
                    .annotationSvgLine()
                    .value((d: any) => yScale.invert(d.y))
                    .xScale(xScale)
                    .yScale(yScale);

                crosshairVertical.decorate((selection: any) => {
                    selection.enter().select('line').attr('class', 'crosshair');
                    selection.enter().style('visibility', 'hidden');
                    selection
                        .enter()
                        .append('line')
                        .attr('stroke-width', 1)
                        .style('pointer-events', 'all');
                    selection.enter().select('g.left-handle').remove();
                    selection.enter().select('g.right-handle').remove();
                });

                const svgmain = d3.select(d3PlotTvl.current).select('svg');

                if (svgmain.select('defs').node() === null) {
                    const lg = svgmain
                        .append('defs')
                        .append('linearGradient')
                        .attr('id', 'mygrad')
                        .attr('x1', '100%')
                        .attr('x2', '100%')
                        .attr('y1', '0%')
                        .attr('y2', '100%');
                    lg.append('stop')
                        .attr('offset', '10%')
                        .style('stop-color', '#7d7cfb')
                        .style('stop-opacity', 0.7);

                    lg.append('stop')
                        .attr('offset', '110%')
                        .style('stop-color', 'black')
                        .style('stop-opacity', 0.7);
                }

                const areaSeries = d3fc
                    .seriesSvgArea()
                    .xScale(xScale)
                    .yScale(yScale)
                    .mainValue((d: any) => d.value)
                    .crossValue((d: any) => d.time)
                    .decorate((selection: any) => {
                        selection.enter().style('fill', () => {
                            return 'url(#mygrad)';
                        });
                    });

                const lineSeries = d3fc
                    .seriesSvgLine()
                    .xScale(xScale)
                    .yScale(yScale)
                    .mainValue((d: any) => d.value)
                    .crossValue((d: any) => d.time)
                    .decorate((selection: any) => {
                        selection.enter().style('stroke', () => '#7371FC');
                        selection.attr('stroke-width', '2');
                    });

                d3.select(d3PlotTvl.current).on('measure', function (event: any) {
                    xScale.range([0, event.detail.width]);
                    yScale.range([event.detail.height, 0]);
                });

                d3.select(d3PlotTvl.current).on('measure.range', function (event: any) {
                    let date: any | undefined = undefined;
                    const svg = d3.select(event.target).select('svg');
                    const zoom = d3
                        .zoom()
                        .scaleExtent([1, 10])
                        .on('start', () => {
                            if (date === undefined) {
                                date = tvlData[tvlData.length - 1].time;
                            }
                        })
                        .on('zoom', (event: any) => {
                            getNewCandleData(event, date, xScale);
                            xScale.domain(event.transform.rescaleX(xScaleCopy).domain());

                            setZoomAndYdragControl(event);
                            setIsMouseMoveForSubChart(false);
                            setIsZoomForSubChart(true);
                            setMouseMoveEventForSubChart(event);
                        }) as any;

                    svg.call(zoom);
                });

                d3.select(d3PlotTvl.current).on('draw', function (event: any) {
                    const svg = d3.select(event.target).select('svg');
                    areaJoin(svg, [tvlData]).call(areaSeries);
                    lineJoin(svg, [tvlData]).call(lineSeries);
                    crosshairHorizontalJoin(svg, [crosshairDataLocal]).call(crosshairHorizontal);
                    crosshairVerticalJoin(svg, [crosshairDataLocal]).call(crosshairVertical);
                });

                d3.select(d3Yaxis.current).on('draw', function (event: any) {
                    d3.select(event.target).select('svg').call(yAxis);
                });

                const minimum = (tvlData: any, accessor: any) => {
                    return tvlData
                        .map(function (dataPoint: any, index: any) {
                            return [accessor(dataPoint, index), dataPoint, index];
                        })
                        .reduce(
                            function (accumulator: any, dataPoint: any) {
                                return accumulator[0] > dataPoint[0] ? dataPoint : accumulator;
                            },
                            [Number.MAX_VALUE, null, -1],
                        );
                };

                const snap = (series: any, tvlData: any, point: any) => {
                    if (point == undefined) return [];
                    const xScale = series.xScale(),
                        xValue = series.crossValue();

                    const filtered =
                        tvlData.length > 1
                            ? tvlData.filter((d: any) => xValue(d) != null)
                            : tvlData;
                    const nearest = minimum(filtered, (d: any) =>
                        Math.abs(point.x - xScale(xValue(d))),
                    )[1];

                    if (nearest) {
                        const newX = new Date(nearest.time.getTime());
                        const value = new Date(newX.setTime(newX.getTime()));
                        return [{ x: xScale(value), y: 0, value: nearest.value }];
                    } else {
                        return [{ x: 0, y: 0, value: 0 }];
                    }
                };

                d3.select(d3PlotTvl.current).on('mousemove', function (event: any) {
                    setMouseMoveChartName('tvl');
                    d3.select(d3PlotTvl.current)
                        .select('svg')
                        .select('.crosshairVertical')
                        .selectChildren()
                        .style('visibility', 'visible');
                    setIsMouseMoveForSubChart(true);
                    setIsZoomForSubChart(false);
                    setMouseMoveEventForSubChart(event);
                    setsubChartValues((prevState: any) => {
                        const newTargets = [...prevState];
                        newTargets.filter((target: any) => target.name === 'tvl')[0].value = snap(
                            areaSeries,
                            tvlData,
                            {
                                x: xScale(crosshairDataLocal[0].x),
                                y: crosshairDataLocal[0].y,
                            },
                        );

                        return newTargets;
                    });
                });

                d3.select(d3PlotTvl.current).on('mouseleave', () => {
                    setMouseMoveChartName(undefined);
                    props.setIsMouseMoveForSubChart(false);
                    props.setIsZoomForSubChart(false);
                    d3.select(d3PlotTvl.current)
                        .select('svg')
                        .select('.crosshairVertical')
                        .style('visibility', 'hidden');

                    render();
                });
            }
        },
        [crosshairForSubChart],
    );

    return (
        <div
            className='main_layout_chart'
            ref={tvlMainDiv}
            id='tvl_chart'
            data-testid={'chart'}
            style={{ display: 'flex', flexDirection: 'row', height: '10%', width: '100%' }}
        >
            <d3fc-svg
                id='d3PlotTvl'
                ref={d3PlotTvl}
                style={{ flex: 1, flexGrow: 20, overflow: 'hidden' }}
            ></d3fc-svg>
            <d3fc-svg className='y-axis' ref={d3Yaxis} style={{ flexGrow: 1 }}></d3fc-svg>
        </div>
    );
}
