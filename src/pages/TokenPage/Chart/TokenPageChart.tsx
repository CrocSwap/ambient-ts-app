import { useEffect, useRef, useState } from 'react';
import styles from './TokenPageChart.module.css';
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { formatDollarAmountAxis } from '../../../utils/numbers';
import { getValue } from '@testing-library/user-event/dist/types/utils';
import dayjs from 'dayjs';

interface TokenVolume {
    tokenVolumeData: any[];
}

export default function TokenPageChart(props: TokenVolume) {
    const volumeValue = props.tokenVolumeData;

    useEffect(() => {
        const chartData = {
            lineseries: volumeValue,
            crosshair: [{ x: 0, y: 0 }],
        };

        const render = () => {
            // select and render
            d3.select('#chart-element').datum(chartData).call(chart);

            const pointer = d3fc.pointer().on('point', (event: any) => {
                chartData.crosshair = event;
                render();
            });
            d3.select('#chart-element .plot-area').call(pointer);
        };

        const legend = () => {
            const labelJoin = d3fc.dataJoin('text', 'legend-label');
            const valueJoin = d3fc.dataJoin('text', 'legend-value');

            const instance = (selection: any) => {
                selection.each((data: any, selectionIndex: any, nodes: any) => {
                    labelJoin(d3.select(nodes[selectionIndex]), data)
                        .attr(
                            'transform',
                            (_: any, i: any) => 'translate(50, ' + (i + 1) * 15 + ')',
                        )
                        .style('alignment-baseline', 'middle')
                        .text((d: any) => d.name);

                    valueJoin(d3.select(nodes[selectionIndex]), data)
                        .attr(
                            'transform',
                            (_: any, i: any) => 'translate(60, ' + (i + 1) * 15 + ')',
                        )
                        .style('fill', 'white')
                        .style('alignment-baseline', 'middle')
                        .text((d: any) => d.value);
                });
            };

            instance.xScale = () => instance;
            instance.yScale = () => instance;
            return instance;
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

        const getValue = (data: any) => {
            const lineValue = chartData.lineseries.find((line, index) => {
                if (
                    line.time.toLocaleDateString() ===
                    new Date(xScale.invert(data)).toLocaleDateString()
                )
                    return chartData.lineseries[index];
            });
            return (
                'Volume: ' +
                (lineValue === undefined ? '-' : formatDollarAmountAxis(lineValue.value))
            );
        };

        const getDate = (date: any) => {
            return (
                'Date: ' +
                (date === undefined ? '-' : dayjs(xScale.invert(date)).format('MMM D, YYYY'))
            );
        };

        const legendData = (datum: any) => [
            { name: '', value: getDate(datum.x) },
            { name: '', value: getValue(datum.x) },
        ];

        const zoom = d3fc.zoom().on('zoom', render);

        const lineSeries = d3fc
            .autoBandwidth(d3fc.seriesSvgBar())
            .xScale(xScale)
            .yScale(yScale)
            .align('left')
            .crossValue((d: any) => d.time)
            .mainValue((d: any) => d.value)
            .decorate((selection: any) => {
                selection.enter().style('fill', '#6765e2');
            });

        const gridlines = d3fc.annotationSvgGridline().xScale(xScale).yScale(yScale);

        const crosshair = d3fc
            .annotationSvgCrosshair()
            .xLabel('')
            .yLabel('')
            .decorate((sel: any) => {
                sel.selectAll('.point>path').attr('transform', 'scale(0.2)');
            });

        const chartLegend = legend();

        const multi = d3fc
            .seriesSvgMulti()
            .series([gridlines, lineSeries, chartLegend, crosshair])
            .mapping((data: any, index: any, series: any) => {
                if (data.loading) {
                    return [];
                }
                switch (series[index]) {
                    case chartLegend: {
                        const lastPoint = data.lineseries[data.lineseries.length - 1];
                        const legendValue = data.crosshair.length ? data.crosshair[0] : lastPoint;
                        return legendData(legendValue);
                    }
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
                sel.enter().selectAll('.plot-area').call(zoom, xScale, yScale);
                sel.enter().selectAll('.x-axis').call(zoom, xScale, null);
                sel.enter().selectAll('.y-axis').call(zoom, null, yScale);
            });

        render();
    }, [volumeValue]);

    return <div id='chart-element'></div>;
}
