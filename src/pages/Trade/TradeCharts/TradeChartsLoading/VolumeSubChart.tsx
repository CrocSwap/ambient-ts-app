/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react';
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { formatDollarAmountAxis } from '../../../../utils/numbers';
import { VolumeChartData } from '../TradeCharts';

interface VolumeData {
    volumeData: VolumeChartData[] | undefined;
    period: number | undefined;
    crosshairData: any[];
    setsubChartValues: React.Dispatch<React.SetStateAction<any>>;
    xScale: any;
}

export default function VolumeSubChart(props: VolumeData) {
    const { volumeData, period, xScale, crosshairData } = props;

    const setsubChartValues = props.setsubChartValues;

    // Volume Chart
    useEffect(() => {
        if (volumeData !== undefined && period !== undefined && xScale !== undefined) {
            const chartData = {
                lineseries: volumeData,
            };

            const render = () => {
                d3.select('.chart-volume').datum(chartData).call(chart);

                d3.select('.chart-volume')
                    .select('.cartesian-chart')
                    .select('.bottom-label')
                    .remove();

                d3.select('.chart-volume').select('.cartesian-chart').select('.top-label').remove();

                d3.select('.chart-volume')
                    .select('.cartesian-chart')
                    .select('.right-label')
                    .remove();

                setsubChartValues((prevState: any) => {
                    const newTargets = [...prevState];
                    newTargets.filter((target: any) => target.name === 'volume')[0].value = snap(
                        lineSeries,
                        chartData.lineseries,
                        crosshairData[0],
                    );

                    return newTargets;
                });
            };

            const minimum = (volumeData: any, accessor: any) => {
                return volumeData
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

            const snap = (series: any, volumeData: any, point: any) => {
                if (point == undefined) return [];
                const xScale = series.xScale(),
                    xValue = series.crossValue();

                const filtered =
                    volumeData.lenght > 1
                        ? volumeData.filter((d: any) => xValue(d) != null)
                        : volumeData;
                const nearest = minimum(filtered, (d: any) =>
                    Math.abs(point.x - xScale(xValue(d))),
                )[1];

                return nearest !== undefined ? nearest.value : 0;
            };

            const yExtent = d3fc.extentLinear().accessors([(d: any) => d.value]);
            const yScale = d3.scaleLinear();
            yScale.domain(yExtent(chartData.lineseries));

            const lineSeries = d3fc
                .autoBandwidth(d3fc.seriesSvgBar())
                .align('center')
                .crossValue((d: any) => d.time)
                .mainValue((d: any) => d.value)
                .decorate((selection: any) => {
                    selection.enter().style('fill', '#7371FC');
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
                .mapping((volumeData: any, index: any, series: any) => {
                    switch (series[index]) {
                        case crosshair:
                            return crosshairData;
                        default:
                            return volumeData.lineseries;
                    }
                });

            const chart = d3fc
                .chartCartesian({ xScale, yScale })
                .xTicks([0])
                .yTicks([2])
                // .yTickValues([Math.min(...chartData.lineseries.map((o) => o.value)), Math.max(...chartData.lineseries.map((o) => o.value))])
                .yTickFormat(formatDollarAmountAxis)
                .xLabel('')
                .yLabel('')
                .decorate((selection: any) => {
                    selection.select('.x-axis').style('height', '1px');
                })
                .svgPlotArea(multi);

            d3.select('.chart-volume')
                .select('.cartesian-chart')
                .style(
                    'grid-template-columns',
                    'minmax(1px,max-content) auto 1fr auto minmax(1px,max-content)',
                )
                .style(
                    'grid-template-rows',
                    'minmax(1px,max-content) auto 1fr auto minmax(1px,max-content)',
                );

            render();
        }
    }, [volumeData, crosshairData, period]);

    return <div style={{ height: '10%', width: '100%' }} className='chart-volume'></div>;
}
