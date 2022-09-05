import { useEffect } from 'react';
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { formatDollarAmountAxis } from '../../../../utils/numbers';

interface VolumeData {
    volumeData: any[];
    crosshairData: any[];
}

export default function VolumeSubChart(props: VolumeData) {
    const data = props.volumeData;
    const crosshairData = props.crosshairData;

    // Volume Chart
    useEffect(() => {
        const chartData = {
            lineseries: data,
        };

        const render = () => {
            d3.select('.chart-volume').datum(chartData).call(chart);
        };

        const yExtent = d3fc.extentLinear().accessors([(d: any) => d.value]);

        const millisPerDay = 24 * 60 * 60 * 100;
        const xExtent = d3fc
            .extentDate()
            .accessors([(d: any) => d.time])
            .padUnit('domain')
            .pad([millisPerDay, 9000000000]);

        const xScale = d3.scaleTime();
        const yScale = d3.scaleLinear();

        xScale.domain(xExtent(chartData.lineseries));
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
            .mapping((data: any, index: any, series: any) => {
                switch (series[index]) {
                    case crosshair:
                        return crosshairData;
                    default:
                        return data.lineseries;
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

        render();
    }, [data, crosshairData]);

    return <div style={{ height: '15%', width: '100%' }} className='chart-volume'></div>;
}
