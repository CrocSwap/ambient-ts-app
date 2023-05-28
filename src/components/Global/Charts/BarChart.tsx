import { Dispatch, SetStateAction, useEffect } from 'react';
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import dayjs from 'dayjs';
import { formatDollarAmountAxis } from '../../../utils/numbers';
/* eslint-disable @typescript-eslint/no-explicit-any */

interface BarData {
    data: any[];
    valueVolume?: number;
    valueVolumeDate?: string;
    setValueVolume?: Dispatch<SetStateAction<number | undefined>>; // used for value on hover
    setValueVolumeDate?: Dispatch<SetStateAction<string | undefined>>; // used for value label on hover
    snapType?: string;
}

export default function BarChart(props: BarData) {
    const barValue = props.data;
    const snapType = props.snapType;

    useEffect(() => {
        const chartData = {
            lineseries: barValue,
            crosshair: [{ x: 0, y: -1 }],
            snapType: snapType,
        };

        const render = () => {
            d3.select('#chart-element').datum(chartData).call(chart);

            const pointer = d3fc.pointer().on('point', (event: any) => {
                if (event[0] !== undefined) {
                    chartData.crosshair = snap(
                        lineSeries,
                        chartData.lineseries,
                        event[0],
                    );

                    props.setValueVolume?.(getValue(chartData.crosshair[0].x));
                    props.setValueVolumeDate?.(
                        getDate(chartData.crosshair[0].x),
                    );
                    render();
                }
            });
            d3.select('#chart-element .plot-area').call(pointer);
        };

        const minimum = (data: any, accessor: any) => {
            return data
                .map(function (dataPoint: any, index: any) {
                    return [accessor(dataPoint, index), dataPoint, index];
                })
                .reduce(
                    function (accumulator: any, dataPoint: any) {
                        return accumulator[0] > dataPoint[0]
                            ? dataPoint
                            : accumulator;
                    },
                    [Number.MAX_VALUE, null, -1],
                );
        };

        const snap = (series: any, data: any, point: any) => {
            if (point == undefined) return [];
            const xScale = series.xScale(),
                xValue = series.crossValue();

            const filtered =
                data.length > 1
                    ? data.filter((d: any) => xValue(d) != null)
                    : data;
            const nearest = minimum(filtered, (d: any) =>
                Math.abs(point.x - xScale(xValue(d))),
            )[1];
            const newX = new Date(nearest?.time.getTime());
            const value = new Date(newX.setTime(newX.getTime()));

            return [
                {
                    x: xScale(value),
                    y: point.y,
                },
            ];
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
            return lineValue === undefined
                ? lineValue
                : formatDollarAmountAxis(lineValue.value);
        };

        const getDate = (date: any) => {
            return date === undefined
                ? '-'
                : dayjs(xScale.invert(date)).format('MMM D, YYYY');
        };

        const zoom = d3
            .zoom()
            .scaleExtent([1, 20])
            .on('zoom', (event: any) => {
                xScale.domain(
                    event.transform.rescaleX(xScaleOriginal).domain(),
                );
                render();
            });

        const lineSeries = d3fc
            .autoBandwidth(d3fc.seriesSvgBar())
            .xScale(xScale)
            .yScale(yScale)
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
                    .attr('stroke-dasharray', '6 6')
                    .style('pointer-events', 'all');
                selection
                    .selectAll('.point>path')
                    .attr('transform', 'scale(0.2)')
                    .style('fill', 'white');
            });

        const multi = d3fc
            .seriesSvgMulti()
            .series([lineSeries, crosshair])
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

        const xFormat = d3.timeFormat('%b %Y ');

        const chart = d3fc
            .chartCartesian({
                xScale: xScale,
                yScale: yScale,
                xAxis: {
                    bottom: (d: any) =>
                        d3fc.axisLabelRotate(d3fc.axisOrdinalBottom(d)),
                },
            })
            .yOrient('right')
            .svgPlotArea(multi)
            .xTickFormat(xFormat)
            .yTickFormat(formatDollarAmountAxis)
            .yDecorate((sel: any) =>
                sel.select('text').attr('transform', 'translate(20, -6)'),
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
                sel.enter().style('min-height', '300px');
            });

        render();
    }, [barValue, snapType]);

    return (
        <div style={{ height: '100%', width: '100%' }} id='chart-element'></div>
    );
}
