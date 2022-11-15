/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { formatAmountChartData, formatDollarAmountAxis } from '../../../../utils/numbers';
import { FeeChartData } from '../TradeCharts';

interface FreeRateData {
    feeData: FeeChartData[] | undefined;
    period: number | undefined;
    setsubChartValues: React.Dispatch<React.SetStateAction<any>>;
    setZoomAndYdragControl: React.Dispatch<React.SetStateAction<any>>;
    crosshairXForSubChart: number;
    crosshairYForSubChart: number;
    setCrosshairYForSubChart: React.Dispatch<React.SetStateAction<any>>;
    xScale: any;
    xScaleCopy: any;
    render: any;
    zoomAndYdragControl: any;
    setIsMouseMoveForSubChart: React.Dispatch<React.SetStateAction<boolean>>;
    setMouseMoveEventForSubChart: React.Dispatch<React.SetStateAction<any>>;
    setIsZoomForSubChart: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function FeeRateSubChart(props: FreeRateData) {
    const {
        feeData,
        period,
        xScale,
        xScaleCopy,
        crosshairXForSubChart,
        crosshairYForSubChart,
        zoomAndYdragControl,
        setsubChartValues,
        setZoomAndYdragControl,
        setMouseMoveEventForSubChart,
        setIsMouseMoveForSubChart,
        setIsZoomForSubChart,
        setCrosshairYForSubChart,
    } = props;

    const d3PlotFeeRate = useRef(null);
    const d3Yaxis = useRef(null);

    const [yCross, setYcross] = useState(0);
    // Fee Rate Chart
    useEffect(() => {
        if (feeData !== undefined) {
            drawChart(feeData, xScale);

            props.render();
        }
    }, [xScale, crosshairXForSubChart, period, feeData, zoomAndYdragControl]);

    const render = useCallback(() => {
        const nd = d3.select('#d3PlotFeeRate').node() as any;
        nd.requestRedraw();
    }, []);

    const drawChart = useCallback(
        (feeData: any, xScale: any) => {
            const crosshairDataLocal = [{ x: crosshairXForSubChart, y: yCross }];

            if (feeData.length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars

                const result = feeData.filter((v: number, i: number, a: any) => a.indexOf(v) !== i);
                const yExtent = d3fc.extentLinear().accessors([(d: any) => d.value]);

                const yScale = d3.scaleLinear();

                if (result.length > 0) {
                    yScale.domain(yExtent(feeData));
                } else {
                    yScale.domain([0, feeData[0].value]);
                }

                const yAxis = d3fc
                    .axisRight()
                    .scale(yScale)
                    .tickFormat(formatDollarAmountAxis)
                    .tickArguments([1]);

                // if (yDomain[0]===yDomain[1]){
                //     yAxis.tickValues([yDomain[0]-1,yDomain[0]+1])
                // }

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
                    selection
                        .enter()
                        .append('line')
                        .attr('stroke-width', 1)
                        .style('pointer-events', 'all');
                    selection.enter().select('g.top-handle').remove();
                });

                const crosshairVertical = d3fc
                    .annotationSvgLine()
                    .value((d: any) => d.y)
                    .xScale(xScale)
                    .yScale(yScale);

                crosshairVertical.decorate((selection: any) => {
                    selection.enter().select('line').attr('class', 'crosshair');
                    selection
                        .enter()
                        .append('line')
                        .attr('stroke-width', 1)
                        .style('pointer-events', 'all');
                    selection.enter().select('g.left-handle').remove();
                    selection.enter().select('g.right-handle').remove();
                });

                const lineSeries = d3fc
                    .seriesSvgLine()
                    .xScale(xScale)
                    .yScale(yScale)
                    .mainValue((d: any) => d.value)
                    .crossValue((d: any) => d.time)
                    .decorate((selection: any) => {
                        selection.style('stroke', () => '#7371FC');
                        selection.attr('stroke-width', '1');
                    });

                d3.select(d3PlotFeeRate.current).on('measure', function (event: any) {
                    xScale.range([0, event.detail.width]);
                    yScale.range([event.detail.height, 0]);
                });

                d3.select(d3PlotFeeRate.current).on('measure.range', function (event: any) {
                    const svg = d3.select(event.target).select('svg');
                    const zoom = d3
                        .zoom()
                        .scaleExtent([1, 10])
                        .on('zoom', (event: any) => {
                            xScale.domain(event.transform.rescaleX(xScaleCopy).domain());
                            setZoomAndYdragControl(event);
                            setIsMouseMoveForSubChart(false);
                            setIsZoomForSubChart(true);
                            setMouseMoveEventForSubChart(event);
                        }) as any;

                    svg.call(zoom);
                });

                d3.select(d3PlotFeeRate.current).on('draw', function (event: any) {
                    const svg = d3.select(event.target).select('svg');
                    lineJoin(svg, [feeData]).call(lineSeries);
                    crosshairHorizontalJoin(svg, [crosshairDataLocal]).call(crosshairHorizontal);
                    crosshairVerticalJoin(svg, [crosshairDataLocal]).call(crosshairVertical);
                });

                d3.select(d3Yaxis.current).on('draw', function (event: any) {
                    d3.select(event.target).select('svg').call(yAxis);
                });

                const minimum = (data: any, accessor: any) => {
                    return data
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

                const snap = (series: any, data: any, point: any) => {
                    if (point == undefined) return [];
                    const xScale = series.xScale(),
                        xValue = series.crossValue();

                    const filtered =
                        data.length > 1 ? data.filter((d: any) => xValue(d) != null) : data;
                    const nearest = minimum(filtered, (d: any) =>
                        Math.abs(point.x - xScale(xValue(d))),
                    )[1];

                    return nearest !== undefined ? nearest?.value : 0;
                };

                d3.select(d3PlotFeeRate.current).on('mousemove', function (event: any) {
                    setIsMouseMoveForSubChart(true);
                    setIsZoomForSubChart(false);
                    setMouseMoveEventForSubChart(event);
                    setYcross(yScale.invert(event.offsetY));
                    setsubChartValues((prevState: any) => {
                        const newTargets = [...prevState];
                        newTargets.filter((target: any) => target.name === 'feeRate')[0].value =
                            snap(lineSeries, feeData, {
                                x: xScale(crosshairXForSubChart),
                                y: crosshairDataLocal[0].y,
                            });

                        return newTargets;
                    });
                });

                d3.select(d3PlotFeeRate.current).on('mouseleave', () => {
                    setIsMouseMoveForSubChart(false);
                    setIsZoomForSubChart(false);

                    render();
                });
            }
        },
        [crosshairXForSubChart, yCross],
    );

    // useEffect(() => {
    //     if (feeData !== undefined && period !== undefined && xScale !== undefined) {
    //         const yExtent = d3fc.extentLinear().accessors([(d: any) => d.value]);

    //         const chartData = {
    //             series: feeData,
    //             crosshairDataLocal: [{ x: crosshairXForSubChart, y: -1 }],
    //         };

    //         const yScale = d3.scaleLinear();
    //         yScale.domain(yExtent(chartData.series));

    //         const lineSeries = d3fc
    //             .seriesSvgLine()
    //             .mainValue((d: any) => d.value)
    //             .crossValue((d: any) => d.time)
    //             .decorate((selection: any) => {
    //                 selection.enter().style('stroke', () => '#7371FC');
    //                 selection.attr('stroke-width', '1');
    //             });

    //         const crosshair = d3fc
    //             .annotationSvgCrosshair()
    //             .xLabel('')
    //             .yLabel('')
    //             .decorate((selection: any) => {
    //                 selection
    //                     .enter()
    //                     .attr('stroke-dasharray', '0.6 0.6')
    //                     .style('pointer-events', 'all');
    //                 selection
    //                     .selectAll('.point>path')
    //                     .attr('transform', 'scale(0.2)')
    //                     .style('fill', 'white');
    //                 selection
    //                     .enter()
    //                     .select('g.annotation-line.horizontal')
    //                     .attr('visibility', 'hidden');
    //             });

    //         const multi = d3fc
    //             .seriesSvgMulti()
    //             .series([lineSeries, crosshair])
    //             .mapping((data: any, index: any, series: any) => {
    //                 switch (series[index]) {
    //                     case crosshair:
    //                         return chartData.crosshairDataLocal;
    //                     default:
    //                         return data.series;
    //                 }
    //             });

    //         const chart = d3fc
    //             .chartCartesian(xScale, yScale)
    //             .xTicks([0])
    //             .yTicks([2])
    //             .yTickFormat(formatDollarAmountAxis)
    //             .decorate((selection: any) => {
    //                 selection.select('.x-axis').remove();
    //                 d3.select('.y-axis').select('svg').select('path').remove();
    //             })
    //             .svgPlotArea(multi);

    //         d3.select('.chart-fee')
    //             .select('.cartesian-chart')
    //             .style(
    //                 'grid-template-columns',
    //                 'minmax(1px,max-content) auto 1fr auto minmax(1px,max-content)',
    //             )
    //             .style(
    //                 'grid-template-rows',
    //                 'minmax(1px,max-content) auto 1fr auto minmax(1px,max-content)',
    //             );

    //         const render = () => {
    //             d3.select('.chart-fee').datum(chartData).call(chart);

    //             d3.select('.chart-fee').select('.cartesian-chart').select('.top-label').remove();

    //             d3.select('.chart-fee').select('.cartesian-chart').select('.bottom-label').remove();

    //             d3.select('.chart-fee').select('.cartesian-chart').select('.right-label').remove();

    //             setsubChartValues((prevState: any) => {
    //                 const newTargets = [...prevState];
    //                 newTargets.filter((target: any) => target.name === 'feeRate')[0].value = snap(
    //                     lineSeries,
    //                     chartData.series,
    //                     chartData.crosshairDataLocal[0],
    //                 );

    //                 return newTargets;
    //             });

    //             d3.select('.chart-fee').on('mousemove', async function (event: any) {
    //                 props.setMouseMoveEventForSubChart(event);
    //                 props.setIsMouseMoveForSubChart(true);
    //                 // props.setCrosshairXForSubChart(event.offsetX);
    //                 chartData.crosshairDataLocal[0].y = event.offsetY;
    //             });

    //             d3.select('.chart-volume').on('mouseleave', async function (event: any) {
    //                 props.setMouseMoveEventForSubChart(event);
    //                 props.setIsMouseMoveForSubChart(false);
    //             });
    //         };

    //         const minimum = (data: any, accessor: any) => {
    //             return data
    //                 .map(function (dataPoint: any, index: any) {
    //                     return [accessor(dataPoint, index), dataPoint, index];
    //                 })
    //                 .reduce(
    //                     function (accumulator: any, dataPoint: any) {
    //                         return accumulator[0] > dataPoint[0] ? dataPoint : accumulator;
    //                     },
    //                     [Number.MAX_VALUE, null, -1],
    //                 );
    //         };

    //         const snap = (series: any, data: any, point: any) => {
    //             if (point == undefined) return [];
    //             const xScale = series.xScale(),
    //                 xValue = series.crossValue();

    //             const filtered =
    //                 data.length > 1 ? data.filter((d: any) => xValue(d) != null) : data;
    //             const nearest = minimum(filtered, (d: any) =>
    //                 Math.abs(point.x - xScale(xValue(d))),
    //             )[1];

    //             return nearest !== undefined ? nearest?.value : 0;
    //         };

    //         render();

    //         d3.select('.chart-fee').on('mouseleave', () => {
    //             crosshair.decorate((selection: any) => {
    //                 selection
    //                     .enter()
    //                     .select('g.annotation-line.horizontal')
    //                     .attr('visibility', 'hidden');
    //             });

    //             chartData.crosshairDataLocal[0].y = -1;

    //             render();
    //         });
    //     }
    // }, [feeData, period, xScale, crosshairXForSubChart]);

    return (
        <div
            className='main_layout_chart'
            id='fee_rate_chart'
            data-testid={'chart'}
            style={{ display: 'flex', flexDirection: 'row', height: '10%', width: '100%' }}
        >
            <d3fc-svg
                id='d3PlotFeeRate'
                ref={d3PlotFeeRate}
                style={{ flex: 1, flexGrow: 20, overflow: 'hidden' }}
            ></d3fc-svg>
            <d3fc-svg className='y-axis' ref={d3Yaxis} style={{ flexGrow: 1 }}></d3fc-svg>
        </div>
    );
}
