import { StylesProvider } from '@material-ui/core';
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { DetailedHTMLProps, HTMLAttributes, useEffect, useState } from 'react';
import Chart from '../../Chart/Chart';
import styles from './TradeCandleStickChart.module.css';

/* eslint-disable @typescript-eslint/no-explicit-any */

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements {
            'd3fc-group': DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
            'd3fc-svg': DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
        }
    }
}

interface ChartData {
    tvlData: any[];
    volumeData: any[];
    feeData: any[];
    priceData: any[];
    chartItems: chartItem[];
}

type chartItem = {
    slug: string;
    name: string;
    checked: boolean;
};

export default function TradeCandleStickChart(props: ChartData) {
    const { chartItems } = props;
    console.log(chartItems);
    const data = {
        tvlData: props.tvlData,
        volumeData: props.volumeData,
        feeData: props.feeData,
        priceData: props.priceData,
    };

    const [liquidityData] = useState([
        {
            tick: 1500,
            value: 650,
        },
        {
            tick: 1550,
            value: 550,
        },
        {
            tick: 1600,
            value: 500,
        },
        {
            tick: 1650,
            value: 550,
        },
        {
            tick: 1700,
            value: 600,
        },
        {
            tick: 1750,
            value: 650,
        },
    ]);

    // CandleStick Chart
    // useEffect(() => {
    //     if (data.priceData.length > 0) {
    //         const chartData = {
    //             ...data,
    //             crosshair: [{ x: data.priceData.length / 2, y: data.priceData.length / 2 }],
    //         };

    //         const render = () => {
    //             console.log('Draw Trade Chart');

    //             d3.select('#chart-element').datum(chartData).call(chart);

    //             const pointer = d3fc.pointer().on('point', (event: any) => {
    //                 if (event[0] !== undefined) {
    //                     chartData.crosshair = snap(candlestick, chartData.priceData, event[0]);
    //                     render();
    //                 }
    //             });

    //             d3.select('#chart-element .plot-area').call(pointer);
    //         };

    //         const minimum = (data: any, accessor: any) => {
    //             return data
    //                 .map(function (dataPoint: any, index: any) {
    //                     return [accessor(dataPoint, index), dataPoint, index];
    //                 })
    //                 .reduce(
    //                     function (accumulator: any, dataPoint: any) {
    //                         return accumulator[0] > dataPoint[0] ? dataPoint : accumulator;
    //                     },
    //                     [Number.MAX_VALUE, null, -1],
    //                 );
    //         };

    //         const snap = (series: any, data: any, point: any) => {
    //             if (point == undefined) return [];
    //             const xScale = series.xScale(),
    //                 xValue = series.crossValue();

    //             const filtered = data.filter((d: any) => xValue(d) != null);
    //             const nearest = minimum(filtered, (d: any) =>
    //                 Math.abs(point.x - xScale(xValue(d))),
    //             )[1];
    //             return [
    //                 {
    //                     x: xScale(xValue(nearest)),
    //                     y: point.y,
    //                 },
    //             ];
    //         };

    //         const yExtent = d3fc
    //             .extentLinear()
    //             .accessors([(d: any) => d.high, (d: any) => d.low])
    //             .pad([0.05, 0.05]);

    //         const millisPerDay = 24 * 60 * 60 * 100;
    //         const xExtent = d3fc
    //             .extentDate()
    //             .accessors([(d: any) => d.time])
    //             .padUnit('domain')
    //             .pad([millisPerDay, 160000000]);

    //         const liquidityExtent = d3fc.extentDate().accessors([(d: any) => d.time]);

    //         const liquidityScale = d3.scaleLinear();
    //         const xScale = d3.scaleTime();
    //         const yScale = d3.scaleLinear();

    //         liquidityScale.domain([liquidityExtent(chartData.priceData), 0]);
    //         xScale.domain(xExtent(chartData.priceData));
    //         yScale.domain(yExtent(chartData.priceData));

    //         const xScaleCopy = xScale.copy();
    //         const yScaleCopy = yScale.copy();

    //         const barSeries = d3fc
    //             .autoBandwidth(d3fc.seriesSvgBar())
    //             .xScale(xScale)
    //             .yScale(yScale)
    //             .widthFraction(1)
    //             .orient('horizontal')
    //             .crossValue((d: any) => d.tick)
    //             .mainValue((d: any) => xScale.invert(d.value))
    //             .decorate((selection: any) => {
    //                 selection.enter().style('fill', (d: any) => {
    //                     return d.tick < 1650
    //                         ? 'rgba(205, 193, 255, 0.25)'
    //                         : 'rgba(115, 113, 252, 0.25)';
    //                 });
    //             });

    //         const crossHair = d3fc
    //             .annotationSvgCrosshair()
    //             .xLabel('')
    //             .yLabel('')
    //             .decorate((selection: any) => {
    //                 selection
    //                     .enter()
    //                     .attr('stroke-dasharray', '6 6')
    //                     .style('pointer-events', 'all');
    //                 selection
    //                     .selectAll('.point>path')
    //                     .attr('visibility', 'hidden');
    //                 selection
    //                     .enter()
    //                     .select('g.annotation-line.horizontal')
    //                     .attr('visibility', 'hidden');
    //             });

    //         const candlestick = d3fc
    //             .autoBandwidth(d3fc.seriesSvgCandlestick())
    //             .crossValue((d: any) => d.time)
    //             .align('center')
    //             .decorate((selection: any) => {
    //                 selection
    //                     .enter()
    //                     .style('fill', (d: any) => (d.close > d.open ? '#7371FC' : '#CDC1FF'))
    //                     .style('stroke', (d: any) => (d.close > d.open ? '#7371FC' : '#CDC1FF'));
    //             });

    //         const zoom = d3
    //             .zoom()
    //             .scaleExtent([1, 20])
    //             .on('zoom', (event: any) => {
    //                 xScale.domain(event.transform.rescaleX(xScaleCopy).domain());
    //                 yScale.domain(event.transform.rescaleY(yScaleCopy).domain());
    //                 render();
    //             });

    //         const horizontalLine = d3fc
    //             .annotationSvgLine()
    //             .value((d: any) => d.value)
    //             .xScale(xScale)
    //             .yScale(yScale)
    //             .decorate((selection: any) => {
    //                 selection
    //                     .enter()
    //                     .select('g.left-handle')
    //                     .append('text')
    //                     .attr('x', 5)
    //                     .attr('y', -5);
    //                 selection
    //                     .enter()
    //                     .select('line')
    //                     .attr('class', 'redline')
    //                     .attr('stroke', 'rgba(204, 204, 204, 0.452)');
    //                 selection
    //                     .select('g.left-handle text')
    //                     .text((d: any) => d.name + ' - ' + formatDollarAmountAxis(d.value));
    //                 selection
    //                     .enter()
    //                     .append('line')
    //                     .attr('class', 'detector')
    //                     .attr('stroke', 'transparent')
    //                     .attr('x2', '100%')
    //                     .attr('stroke-width', 5)
    //                     .style('pointer-events', 'all')
    //                     .on('mouseover', (event: any) => {
    //                         d3.select(event.currentTarget).style('cursor', 'ns-resize');

    //                         d3.select('g.annotation-line.vertical').attr('visibility', 'hidden');
    //                     })
    //                     .on('mouseout', (event: any) => {
    //                         d3.select(event.currentTarget).style('cursor', 'default');

    //                         d3.select('g.annotation-line.vertical').attr('visibility', 'visible');
    //                     })
    //                     .call(drag);
    //             });

    //         const drag = d3.drag().on('drag', function (event, d: any) {
    //             const newValue = yScale.invert(d3.pointer(event)[1] - 180);

    //             d3.select('g.annotation-line.vertical').attr('visibility', 'hidden');

    //             setTargets((prevState) => {
    //                 const newTargets = [...prevState];
    //                 newTargets.filter((target: any) => target.name === d.name)[0].value = newValue;
    //                 return newTargets;
    //             });

    //         });

    //         const multi = d3fc
    //             .seriesSvgMulti()
    //             .series([candlestick, crossHair, horizontalLine])
    //             .mapping((data: any, index: number, series: any) => {
    //                 switch (series[index]) {
    //                     case crossHair:
    //                         return data.crosshair;
    //                     case barSeries:
    //                         return liquidityData;
    //                     case horizontalLine:
    //                         return targets;
    //                     default:
    //                         return data.priceData;
    //                 }
    //             });

    //         const chart = d3fc
    //             .chartCartesian({
    //                 xScale: xScale,
    //                 yScale: yScale,
    //             })
    //             .yOrient('right')
    //             .svgPlotArea(multi)
    //             .decorate((sel: any) => {
    //                 sel.enter()
    //                     .select('d3fc-svg.plot-area')
    //                     .on('measure.range', (event: any) => {
    //                         xScaleCopy.range([0, event.detail.width]);
    //                         yScaleCopy.range([event.detail.height, 0]);
    //                     })
    //                     .call(zoom);
    //             });

    //         render();
    //     }
    // }, [targets, liquidityData]);

    // Volume Chart

    useEffect(() => {
        const chartData = {
            lineseries: data.volumeData,
        };

        const render = () => {
            // console.log('Draw Volume Chart');

            d3.select('#chart-volume').datum(chartData).call(chart);
        };

        const yExtent = d3fc.extentLinear().accessors([(d: any) => d.value]);

        const xExtent = d3fc.extentDate().accessors([(d: any) => d.time]);

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

        const multi = d3fc
            .seriesSvgMulti()
            .series([lineSeries])
            .mapping((data: any) => {
                if (data.loading) {
                    return [];
                }
                return data.lineseries;
            });

        const chart = d3fc
            .chartCartesian({ xScale, yScale })
            .xTicks([0])
            .yTicks([0])
            .decorate((selection: any) => {
                selection.select('.x-axis').style('height', '3px');
                selection.select('.y-axis').style('width', '1px');
            })
            .svgPlotArea(multi);

        render();
    }, [data]);

    // Tvl Chart
    useEffect(() => {
        const yExtent = d3fc.extentLinear().accessors([(d: any) => d.value]);
        const xExtent = d3fc.extentDate().accessors([(d: any) => d.time]);

        const chartData = {
            series: data.tvlData,
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

        const multi = d3fc
            .seriesSvgMulti()
            .series([lineSeries, areaSeries])
            .mapping((data: any) => {
                return data.series;
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
            .yTicks([0])
            .decorate((selection: any) => {
                selection.select('.x-axis').style('height', '3px');
                selection.select('.y-axis').style('width', '1px');
            })
            .svgPlotArea(multi);

        function render() {
            // console.log('Draw Tvl Chart');

            d3.select('.chart-tvl').datum(chartData).call(chart);
        }

        render();
    }, [data]);

    // Fee Rate Chart
    useEffect(() => {
        const yExtent = d3fc.extentLinear().accessors([(d: any) => d.value]);
        const xExtent = d3fc.extentDate().accessors([(d: any) => d.time]);

        const chartData = {
            series: data.feeData,
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

        const multi = d3fc
            .seriesSvgMulti()
            .series([lineSeries])
            .mapping((data: any) => {
                return data.series;
            });

        const chart = d3fc
            .chartCartesian(xScale, yScale)
            .xTicks([0])
            .yTicks([0])
            .decorate((selection: any) => {
                selection.select('.x-axis').style('height', '3px');
                selection.select('.y-axis').style('width', '1px');
            })
            .svgPlotArea(multi);

        function render() {
            // console.log('Draw fee Chart');

            d3.select('.chart-fee').datum(chartData).call(chart);
        }

        render();
    }, [data]);

    console.log(chartItems[1].checked);
    return (
        <>
            {chartItems[0].checked === true && (
                <Chart priceData={data.priceData} liquidityData={liquidityData} />
            )}
            {chartItems[1].checked === true && (
                <>
                    <hr />
                    <label>Fee Rate</label>
                    <div style={{ height: '15%', width: '100%' }} className='chart-fee'></div>
                </>
            )}
            {chartItems[2].checked === true && (
                <>
                    <hr />
                    <label>Tvl</label>
                    <div style={{ height: '15%', width: '100%' }} className='chart-tvl'></div>
                </>
            )}
            {chartItems[3].checked === true && (
                <>
                    <hr />
                    <label>Volume</label>
                    <div style={{ height: '15%', width: '100%' }} id='chart-volume'></div>
                </>
            )}
        </>
    );
}
