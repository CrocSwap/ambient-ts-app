import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { formatDollarAmountAxis } from '../../../../utils/numbers';
import dayjs from 'dayjs';

interface VolumeData {
    data: any[];
    value?: number;
    label?: string;
    setValue?: Dispatch<SetStateAction<number | undefined>>; // used for value on hover
    setLabel?: Dispatch<SetStateAction<string | undefined>>; // used for value label on hover
}

export default function VolumeChart(props: VolumeData) {
    const volumeValue = props.data;

    useEffect(() => {
        const chartData = {
            lineseries: volumeValue,
            crosshair: [{ x: 0 }],
        };

        const render = () => {
            // select and render
            d3.select('#chart-element').datum(chartData).call(chart);

            const pointer = d3fc.pointer().on('point', (event: any) => {
                chartData.crosshair = [
                    {
                        x: event[0].x,
                    },
                ];
                props.setValue?.(getValue(event[0].x));
                props.setLabel?.(getDate(event[0].x));
                render();
            });
            d3.select('#chart-element .plot-area').call(pointer);
        };

        const yExtent = d3fc
            .extentLinear()
            .accessors([(d: any) => d.value])
            .pad([0, 0.1]);

        const millisPerDay = 24 * 60 * 60 * 1000;
        const xExtent = d3fc
            .extentDate()
            .accessors([(d: any) => d.time])
            .padUnit('domain')
            .pad([millisPerDay, millisPerDay]);

        const xScale = d3.scaleTime();
        const yScale = d3.scaleLinear();

        xScale.domain(xExtent(chartData.lineseries));
        yScale.domain(yExtent(chartData.lineseries));

        const xScaleOriginal = xScale.copy();

        const getValue = (data: any) => {
            const lineValue = chartData.lineseries.find((line, index) => {
                if (
                    line.time.toLocaleDateString() ===
                    new Date(xScale.invert(data)).toLocaleDateString()
                )
                    return chartData.lineseries[index];
            });
            return lineValue === undefined ? lineValue : formatDollarAmountAxis(lineValue.value);
        };

        const getDate = (date: any) => {
            return date === undefined ? '-' : dayjs(xScale.invert(date)).format('MMM D, YYYY');
        };

        const zoom = d3
            .zoom()
            .scaleExtent([1, 20])
            .on('zoom', (event: any) => {
                xScale.domain(event.transform.rescaleX(xScaleOriginal).domain());
                render();
            });

        const lineSeries = d3fc
            .autoBandwidth(d3fc.seriesSvgBar())
            .xScale(xScale)
            .yScale(yScale)
            .align('left')
            .crossValue((d: any) => d.time)
            .mainValue((d: any) => d.value)
            .decorate((selection: any) => {
                selection.enter().style('fill', '#4169E1');
            });

        const gridlines = d3fc.annotationSvgGridline().xScale(xScale).yScale(yScale);

        const crosshair = d3fc
            .annotationSvgCrosshair()
            .xLabel('')
            .decorate((sel: any) => {
                sel.selectAll('.point>path').attr('transform', 'scale(0.2)').style('fill', 'white');
            });

        const multi = d3fc
            .seriesSvgMulti()
            .series([gridlines, lineSeries, crosshair])
            .mapping((data: any, index: any, series: any) => {
                if (data.loading) {
                    return [];
                }
                switch (series[index]) {
                    case crosshair:
                        return data.crosshair;
                    default:
                        return data.lineseries;
                }
            });

        const chart = d3fc
            .chartCartesian(xScale, yScale)
            .yOrient('right')
            .svgPlotArea(multi)
            .yTickFormat(formatDollarAmountAxis)
            .yDecorate((sel: any) => sel.select('text').attr('transform', 'translate(20, -6)'))
            .xDecorate((sel: any) =>
                sel
                    .select('text')
                    .attr('dy', undefined)
                    .style('text-anchor', 'start')
                    .style('dominant-baseline', 'central')
                    .attr('transform', 'translate(3, 10)'),
            )
            .decorate((sel: any) => {
                sel.enter()
                    .append('d3fc-svg')
                    .style('grid-column', 4)
                    .style('grid-row', 3)
                    .style('width', '3em');
                sel.enter().append('div').classed('border', true);
                sel.enter()
                    .select('d3fc-svg.plot-area')
                    .on('measure.range', (event: any) => {
                        xScaleOriginal.range([0, event.detail.width]);
                    })
                    .call(zoom);
            });

        render();
    }, [volumeValue]);

    return <div style={{ height: '100%', width: '100%' }} id='chart-element'></div>;
}
