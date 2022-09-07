import { useEffect } from 'react';
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { formatDollarAmountAxis } from '../../../../utils/numbers';

interface FreeRateData {
    feeData: any[];
    crosshairData: any[];
    setsubChartValues: React.Dispatch<React.SetStateAction<any>>;
}

export default function FeeRateSubChart(props: FreeRateData) {
    const data = props.feeData;
    const crosshairData = props.crosshairData;
    const setsubChartValues = props.setsubChartValues;

    // Fee Rate Chart
    useEffect(() => {
        const yExtent = d3fc.extentLinear().accessors([(d: any) => d.value]);

        const millisPerDay = 24 * 60 * 60 * 100;
        const xExtent = d3fc
            .extentDate()
            .accessors([(d: any) => d.time])
            .padUnit('domain')
            .pad([millisPerDay, 9000000000]);

        const chartData = {
            series: data,
        };

        const xScale = d3.scaleTime();
        const yScale = d3.scaleLinear();

        xScale.domain(xExtent(chartData.series));
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
                        return crosshairData;
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
                selection.select('.x-axis').style('height', '3px');
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

        function render() {
            d3.select('.chart-fee').datum(chartData).call(chart);

            d3.select('.chart-fee').select('.cartesian-chart').select('.top-label').remove();

            d3.select('.chart-fee').select('.cartesian-chart').select('.bottom-label').remove();

            d3.select('.chart-fee').select('.cartesian-chart').select('.right-label').remove();

            setsubChartValues((prevState: any) => {
                const newTargets = [...prevState];
                newTargets.filter((target: any) => target.name === 'feeRate')[0].value = snap(
                    lineSeries,
                    chartData.series,
                    crosshairData[0],
                );

                return newTargets;
            });
        }

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

            const filtered = data.lenght > 1 ? data.filter((d: any) => xValue(d) != null) : data;
            const nearest = minimum(filtered, (d: any) => Math.abs(point.x - xScale(xValue(d))))[1];

            return nearest !== undefined ? nearest.value : 0;
        };

        render();
    }, [data, crosshairData]);

    return <div style={{ height: '10%', width: '100%' }} className='chart-fee'></div>;
}
