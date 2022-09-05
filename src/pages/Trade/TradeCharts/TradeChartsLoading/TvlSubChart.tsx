import { useEffect } from 'react';
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { formatDollarAmountAxis } from '../../../../utils/numbers';

interface TvlData {
    tvlData: any[];
    crosshairData: any[];
}

export default function TvlSubChart(props: TvlData) {
    const data = props.tvlData;
    const crosshairData = props.crosshairData;

    // Tvl Chart
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
            crosshair: [{ x: 0, y: -1 }],
        };

        const xScale = d3.scaleTime();
        const yScale = d3.scaleLinear();

        xScale.domain(xExtent(chartData.series));
        yScale.domain(yExtent(chartData.series));

        const areaSeries = d3fc
            .seriesSvgArea()
            .mainValue((d: any) => d.value)
            .crossValue((d: any) => d.time)
            .decorate((selection: any) => {
                selection.style('fill', () => {
                    return 'url(#mygrad)';
                });
            });

        const lineSeries = d3fc
            .seriesSvgLine()
            .mainValue((d: any) => d.value)
            .crossValue((d: any) => d.time)
            .decorate((selection: any) => {
                selection.enter().style('stroke', () => '#7371FC');
                selection.attr('stroke-width', '2');
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
            .series([lineSeries, areaSeries, crosshair])
            .mapping((data: any, index: any, series: any) => {
                switch (series[index]) {
                    case crosshair:
                        return crosshairData;
                    default:
                        return data.series;
                }
            });

        const svgmain = d3.select('.chart-tvl').select('svg');

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

        const chart = d3fc
            .chartCartesian(xScale, yScale)
            .xTicks([0])
            .yTicks([2])
            .yTickFormat(formatDollarAmountAxis)
            .decorate((selection: any) => {
                selection.select('.x-axis').style('height', '1px');
            })
            .svgPlotArea(multi);

        function render() {
            d3.select('.chart-tvl').datum(chartData).call(chart);
        }

        render();
    }, [data, crosshairData]);

    return <div style={{ height: '15%', width: '100%' }} className='chart-tvl'></div>;
}
