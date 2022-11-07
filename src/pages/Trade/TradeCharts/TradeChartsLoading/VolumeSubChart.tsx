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
    setSelectedVolume: React.Dispatch<React.SetStateAction<any>>;
    selectedVolume: any;
    candlestick: any;
    xScale: any;
    xScaleCopy: any;
    setZoomAndYdragControl: React.Dispatch<React.SetStateAction<any>>;
    render: any;
}

export default function VolumeSubChart(props: VolumeData) {
    const { volumeData, period, xScale, crosshairData, xScaleCopy, candlestick, selectedVolume } =
        props;

    const setsubChartValues = props.setsubChartValues;

    // Volume Chart
    useEffect(() => {
        console.log({ selectedVolume });

        if (
            volumeData !== undefined &&
            period !== undefined &&
            xScale !== undefined &&
            candlestick !== undefined
        ) {
            const chartData = {
                barSeries: volumeData,
                crosshairDataLocal: crosshairData,
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
                        barSeries,
                        chartData.barSeries,
                        crosshairData[0],
                    );

                    return newTargets;
                });

                const pointer = d3fc.pointer().on('point', (event: any) => {
                    if (event[0] !== undefined) {
                        chartData.crosshairDataLocal[0].y = event[0].y;
                        render();
                    }
                });
                d3.select('.chart-volume').call(pointer);
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
                    volumeData.length > 1
                        ? volumeData.filter((d: any) => xValue(d) != null)
                        : volumeData;
                const nearest = minimum(filtered, (d: any) =>
                    Math.abs(point.x - xScale(xValue(d))),
                )[1];

                return nearest !== undefined ? nearest.value : 0;
            };

            const yExtent = d3fc.extentLinear().accessors([(d: any) => d.value]);
            const yScale = d3.scaleLinear();
            yScale.domain(yExtent(chartData.barSeries));

            const barSeries = d3fc
                .seriesSvgBar()
                .align('center')
                .bandwidth(candlestick.bandwidth())
                .crossValue((d: any) => d.time)
                .mainValue((d: any) => d.value)
                .decorate((selection: any) => {
                    selection.style('fill', (d: any) =>
                        selectedVolume !== undefined && selectedVolume === d.time
                            ? '#E480FF'
                            : 'rgba(115,113,252, 0.6)',
                    );
                    selection.style('stroke', (d: any) =>
                        selectedVolume !== undefined && selectedVolume === d.time
                            ? '#E480FF'
                            : 'rgba(115,113,252, 0.6)',
                    );
                    selection.on('mouseover', (event: any) => {
                        d3.select(event.currentTarget).style('cursor', 'pointer');
                    });
                    selection.on('click', (event: any) => {
                        if (
                            selectedVolume === undefined ||
                            selectedVolume !== event.target.__data__.time
                        ) {
                            d3.select(event.currentTarget)
                                .style('fill', '#E480FF')
                                .style('stroke', '#E480FF');

                            props.setSelectedVolume(() => {
                                return event.target.__data__.time;
                            });
                        } else {
                            props.setSelectedVolume(() => {
                                return undefined;
                            });
                        }
                    });
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
                });

            const zoom = d3
                .zoom()
                .scaleExtent([1, 10])
                .on('zoom', (event: any) => {
                    xScale.domain(event.transform.rescaleX(xScaleCopy).domain());
                    props.setZoomAndYdragControl(event);
                    render();
                    props.render();
                });

            const multi = d3fc
                .seriesSvgMulti()
                .series([crosshair, barSeries])
                .mapping((volumeData: any, index: any, series: any) => {
                    switch (series[index]) {
                        case crosshair:
                            return chartData.crosshairDataLocal;
                        default:
                            return volumeData.barSeries;
                    }
                });

            const chart = d3fc
                .chartCartesian({ xScale, yScale })
                .xTicks([0])
                .yTicks([2])
                // .yTickValues([Math.min(...chartData.barSeries.map((o) => o.value)), Math.max(...chartData.barSeries.map((o) => o.value))])
                .yTickFormat(formatDollarAmountAxis)
                .xLabel('')
                .yLabel('')
                .decorate((selection: any) => {
                    selection.enter().select('d3fc-svg.plot-area').call(zoom);
                    selection.select('.x-axis').remove();
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

            d3.select('.chart-volume').on('mouseleave', () => {
                crosshair.decorate((selection: any) => {
                    selection
                        .enter()
                        .select('g.annotation-line.horizontal')
                        .attr('visibility', 'hidden');
                });

                crosshairData[0].y = -1;
                render();
            });

            render();
        }
    }, [xScale, crosshairData, period, selectedVolume, volumeData]);

    return <div style={{ height: '10%', width: '100%' }} className='chart-volume'></div>;
}
