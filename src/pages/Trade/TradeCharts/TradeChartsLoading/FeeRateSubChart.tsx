/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react';
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { formatDollarAmountAxis } from '../../../../utils/numbers';
import { FeeChartData } from '../TradeCharts';

interface FreeRateData {
    feeData: FeeChartData[] | undefined;
    period: number | undefined;
    setsubChartValues: React.Dispatch<React.SetStateAction<any>>;
    setZoomAndYdragControl: React.Dispatch<React.SetStateAction<any>>;
    xScale: any;
    crosshairXForSubChart: number;
    setIsMouseMoveForSubChart: React.Dispatch<React.SetStateAction<boolean>>;
    setMouseMoveEventForSubChart: React.Dispatch<React.SetStateAction<any>>;
}

export default function FeeRateSubChart(props: FreeRateData) {
    const { feeData, period, xScale, setsubChartValues, crosshairXForSubChart } = props;

    // Fee Rate Chart
    useEffect(() => {
        if (feeData !== undefined && period !== undefined && xScale !== undefined) {
            const yExtent = d3fc.extentLinear().accessors([(d: any) => d.value]);

            const chartData = {
                series: feeData,
                crosshairDataLocal: [{ x: crosshairXForSubChart, y: -1 }],
            };

            const yScale = d3.scaleLinear();
            yScale.domain(yExtent(chartData.series));

            const lineSeries = d3fc
                .seriesSvgLine()
                .mainValue((d: any) => d.value)
                .crossValue((d: any) => d.time)
                .decorate((selection: any) => {
                    selection.enter().style('stroke', () => '#7371FC');
                    selection.attr('stroke-width', '1');
                });

            const crosshair = d3fc
                .annotationSvgCrosshair()
                .xLabel('')
                .yLabel('')
                .decorate((selection: any) => {
                    selection
                        .enter()
                        .attr('stroke-dasharray', '0.6 0.6')
                        .style('pointer-events', 'all');
                    selection
                        .selectAll('.point>path')
                        .attr('transform', 'scale(0.2)')
                        .style('fill', 'white');
                    selection
                        .enter()
                        .select('g.annotation-line.horizontal')
                        .attr('visibility', 'hidden');
                });

            const multi = d3fc
                .seriesSvgMulti()
                .series([lineSeries, crosshair])
                .mapping((data: any, index: any, series: any) => {
                    switch (series[index]) {
                        case crosshair:
                            return chartData.crosshairDataLocal;
                        default:
                            return data.series;
                    }
                });

            const chart = d3fc
                .chartCartesian(xScale, yScale)
                .xTicks([0])
                .yTicks([2])
                .yTickFormat(formatDollarAmountAxis)
                .decorate((selection: any) => {
                    selection.select('.x-axis').remove();
                    d3.select('.y-axis').select('svg').select('path').remove();
                })
                .svgPlotArea(multi);

            d3.select('.chart-fee')
                .select('.cartesian-chart')
                .style(
                    'grid-template-columns',
                    'minmax(1px,max-content) auto 1fr auto minmax(1px,max-content)',
                )
                .style(
                    'grid-template-rows',
                    'minmax(1px,max-content) auto 1fr auto minmax(1px,max-content)',
                );

            const render = () => {
                d3.select('.chart-fee').datum(chartData).call(chart);

                d3.select('.chart-fee').select('.cartesian-chart').select('.top-label').remove();

                d3.select('.chart-fee').select('.cartesian-chart').select('.bottom-label').remove();

                d3.select('.chart-fee').select('.cartesian-chart').select('.right-label').remove();

                setsubChartValues((prevState: any) => {
                    const newTargets = [...prevState];
                    newTargets.filter((target: any) => target.name === 'feeRate')[0].value = snap(
                        lineSeries,
                        chartData.series,
                        chartData.crosshairDataLocal[0],
                    );

                    return newTargets;
                });

                d3.select('.chart-fee').on('mousemove', async function (event: any) {
                    props.setMouseMoveEventForSubChart(event);
                    props.setIsMouseMoveForSubChart(true);
                    // props.setCrosshairXForSubChart(event.offsetX);
                    chartData.crosshairDataLocal[0].y = event.offsetY;
                });

                d3.select('.chart-volume').on('mouseleave', async function (event: any) {
                    props.setMouseMoveEventForSubChart(event);
                    props.setIsMouseMoveForSubChart(false);
                });
            };

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

            render();

            d3.select('.chart-fee').on('mouseleave', () => {
                crosshair.decorate((selection: any) => {
                    selection
                        .enter()
                        .select('g.annotation-line.horizontal')
                        .attr('visibility', 'hidden');
                });

                chartData.crosshairDataLocal[0].y = -1;

                render();
            });
        }
    }, [feeData, period, xScale, crosshairXForSubChart]);

    return <div style={{ height: '10%', width: '100%' }} className='chart-fee'></div>;
}
