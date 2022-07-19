import { useEffect, useRef, useState } from 'react';
import styles from './TokenPageChart.module.css';
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { formatDollarAmountAxis } from '../../../utils/numbers';

interface TokenVolume {
    tokenVolumeData: any[];
}

export default function TokenPageChart(props: TokenVolume) {
    const volumeValue = props.tokenVolumeData;

    useEffect(() => {
        const data = {
            lineseries: volumeValue,
            crosshair: [],
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

        xScale.domain(xExtent(volumeValue));
        yScale.domain(yExtent(volumeValue));

        const zoom = d3fc.zoom().on('zoom', render);

        const chart = d3fc
            .chartCartesian({
                xScale: xScale,
                yScale: yScale,
                xAxis: {
                    bottom: (scale: any) => {
                        return d3fc.axisBottom(scale).tickCenterLabel(false);
                    },
                },
                yAxis: {
                    right: (scale: any) => {
                        return d3fc.axisRight(scale).tickFormat(formatDollarAmountAxis);
                    },
                },
            })
            .decorate((selection: any) => {
                selection.enter().selectAll('.plot-area').call(zoom, xScale, yScale);
                selection.enter().selectAll('.x-axis').call(zoom, xScale, null);
                selection.enter().selectAll('.y-axis').call(zoom, null, yScale);
            });

        const lineseries = d3fc
            .autoBandwidth(d3fc.seriesSvgBar())
            .xScale(xScale)
            .yScale(yScale)
            .align('left')
            .crossValue((d: any) => d.time)
            .mainValue((d: any) => d.value)
            .decorate((selection: any) => {
                selection.enter().style('fill', '#6765e2');
            });

        const crosshair = d3fc
            .annotationSvgCrosshair()
            .xLabel((d: any) => {
                return formatDollarAmountAxis(yScale.invert(d.y));
            })
            .yLabel('')
            .decorate((sel: any) => {
                sel.selectAll('.point>path').attr('transform', 'scale(0.2)');
            });

        const gridlines = d3fc.annotationSvgGridline().xScale(xScale).yScale(yScale);

        const multi = d3fc
            .seriesSvgMulti()
            .series([gridlines, lineseries, crosshair])
            .mapping((data: any, index: any, series: any) => {
                switch (series[index]) {
                    case lineseries:
                        return data.lineseries;
                    case crosshair:
                        return data.crosshair;
                }
            });

        chart.svgPlotArea(multi);

        function render() {
            d3.select('#chart').datum(data).call(chart);

            const pointer = d3fc.pointer().on('point', (event: any) => {
                data.crosshair = event;
                render();
            });

            d3.select('#chart .plot-area').call(pointer);
        }

        render();
    }, [volumeValue]);

    return <div id='chart' className='chart'></div>;
}
