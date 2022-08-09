import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { DetailedHTMLProps, HTMLAttributes, useEffect, useRef, useState } from 'react';
import './Chart.css';

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
    priceData: any[];
    liquidityData: any[];
}

export default function Chart(props: ChartData) {
    const d3Container = useRef(null);
    const d3PlotArea = useRef(null);
    const d3Xaxis = useRef(null);
    const d3Yaxis = useRef(null);

    const [targets, setTargets] = useState([
        {
            name: 'high',
            value: 1700,
        },
        {
            name: 'low',
            value: 1620,
        },
    ]);

    useEffect(() => {
        const chartData: { date: any; open: any; high: any; low: any; close: any }[] = [];
        props.priceData.map((data) => {
            chartData.push({
                date: data.time,
                ...data,
            });
        });
        if (chartData.length > 0) {
            const render = () => {
                nd.requestRedraw();
            };

            const valueFormatter = d3.format('.2f');
            const millisPerDay = 24 * 60 * 60 * 100;

            const priceRange = d3fc
                .extentLinear()
                .accessors([(d: any) => d.high, (d: any) => d.low])
                .pad([0.05, 0.05]);

            const xExtent = d3fc
                .extentDate()
                .accessors([(d: any) => d.date])
                .padUnit('domain')
                // ensure that the scale is padded by one day in either direction
                .pad([millisPerDay, 160000000]);

            const xScale = d3.scaleTime();
            const yScale = d3.scaleLinear();
            const liquidityTickScale = d3.scaleBand();
            const liquidityScale = d3.scaleLinear();
            const barThreshold = 1650;

            const xScaleCopy = xScale.copy();
            const yScaleCopy = yScale.copy();

            // bar chart
            const liquidityExtent = d3fc
                .extentLinear(props.liquidityData)
                .include([0])
                .accessors([(d: any) => d.value]);

            xScale.domain(xExtent(chartData));
            yScale.domain(priceRange(chartData));
            liquidityScale.domain(liquidityExtent(props.liquidityData));

            const liqScale = liquidityScale
                .copy()
                .range([
                    Math.min(...props.liquidityData.map((o) => o.value)) / 2.5,
                    Math.max(...props.liquidityData.map((o) => o.value)) * 2.5,
                ]);

            // axes
            const xAxis = d3fc.axisBottom().scale(xScale);
            const yAxis = d3fc.axisRight().scale(yScale);

            const barSeries = d3fc
                .autoBandwidth(d3fc.seriesSvgBar())
                .widthFraction(1)
                .orient('horizontal')
                .mainValue((d: any) => liqScale.invert(d.value))
                .crossValue((d: any) => d.tick)
                .xScale(liquidityScale)
                .yScale(yScale)
                .decorate((selection: any) => {
                    selection.select('.bar > path').style('fill', (d: any) => {
                        return d.tick < barThreshold
                            ? 'rgba(205, 193, 255, 0.25)'
                            : 'rgba(115, 113, 252, 0.25)';
                    });
                });

            const candlestick = d3fc
                .autoBandwidth(d3fc.seriesSvgCandlestick())
                .decorate((selection: any) => {
                    selection
                        .enter()
                        .style('fill', (d: any) => (d.close > d.open ? '#7371FC' : '#CDC1FF'))
                        .style('stroke', (d: any) => (d.close > d.open ? '#7371FC' : '#CDC1FF'));
                })
                .xScale(xScale)
                .yScale(yScale);

            const horizontalLine = d3fc
                .annotationSvgLine()
                .value((d: any) => d.value)
                .xScale(xScale)
                .yScale(yScale);

            const drag = d3.drag().on('drag', function (event, d: any) {
                const newValue = yScale.invert(d3.pointer(event)[1] - 140);
                setTargets((prevState) => {
                    const newTargets = [...prevState];
                    newTargets.filter((target: any) => target.name === d.name)[0].value = newValue;
                    return newTargets;
                });
            });

            horizontalLine.decorate((selection: any) => {
                selection.enter().select('g.left-handle').append('text').attr('x', 5).attr('y', -5);
                selection.enter().select('line').attr('class', 'redline').attr('stroke', 'red');
                selection
                    .select('g.left-handle text')
                    .text((d: any) => d.name + ' - ' + valueFormatter(d.value));
                selection
                    .enter()
                    .append('line')
                    .attr('class', 'detector')
                    .attr('stroke', 'transparent')
                    .attr('x2', '100%')
                    .attr('stroke-width', 5)
                    .style('pointer-events', 'all')
                    .on('mouseover', (event: any) => {
                        d3.select(event.currentTarget).style('cursor', 'ns-resize');
                    })
                    .on('mouseout', (event: any) => {
                        d3.select(event.currentTarget).style('cursor', 'default');
                    })
                    .call(drag);
            });

            // const zoom = d3
            //     .zoom()
            //     // .scaleExtent([100, 1])
            //     .on('zoom', (event: any) => {
            //         xScale.domain(event.transform.rescaleX(xScaleCopy).domain());
            //         yScale.domain(event.transform.rescaleY(yScaleCopy).domain());
            //         render();
            //     }) as any;

            const candleJoin = d3fc.dataJoin('g', 'candle');
            const targetsJoin = d3fc.dataJoin('g', 'targets');
            const barJoin = d3fc.dataJoin('g', 'bar');

            // handle the plot area measure event in order to compute the scale ranges
            d3.select(d3PlotArea.current).on('measure', function (event: any) {
                xScale.range([0, event.detail.width]);
                yScale.range([event.detail.height, 0]);

                xScaleCopy.range([0, event.detail.width]);
                yScaleCopy.range([event.detail.height, 0]);

                liquidityTickScale.range([event.detail.height, 0]);
                liquidityScale.range([event.detail.width, event.detail.width / 2]);
            });

            d3.select(d3PlotArea.current).on('draw', function (event: any) {
                const svg = d3.select(event.target).select('svg');

                candleJoin(svg, [chartData]).call(candlestick);
                barJoin(svg, [props.liquidityData]).call(barSeries);
                targetsJoin(svg, [targets]).call(horizontalLine);
            });

            d3.select(d3Xaxis.current).on('draw', function (event: any) {
                d3.select(event.target).select('svg').call(xAxis);
            });

            d3.select(d3Yaxis.current).on('draw', function (event: any) {
                d3.select(event.target).select('svg').call(yAxis);
            });

            // d3.select(d3PlotArea.current).on('measure.range', function (event: any) {
            //     const svg = d3.select(event.target).select('svg');
            //     xScaleCopy.range([0, event.detail.width]);
            //     yScaleCopy.range([event.detail.height, 0]);
            //     svg.call(zoom)
            // })

            const nd = d3.select('#group').node() as any;
            render();
        }
    }, [targets, props.priceData, props.liquidityData]);

    return (
        <div ref={d3Container} className='main_layout_chart' data-testid={'chart'}>
            <d3fc-group
                id='group'
                className='hellooo'
                style={{ display: 'flex', height: '100%', width: '100%', flexDirection: 'column' }}
                auto-resize
            >
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'row' }}>
                        <d3fc-svg
                            ref={d3PlotArea}
                            className='plot-area'
                            style={{ flex: 1, overflow: 'hidden' }}
                        ></d3fc-svg>
                        <d3fc-svg ref={d3Yaxis} style={{ width: '3em' }}></d3fc-svg>
                    </div>
                    <d3fc-svg
                        ref={d3Xaxis}
                        className='x-axis'
                        style={{ height: '2em', marginRight: '3em' }}
                    ></d3fc-svg>
                </div>
            </d3fc-group>
        </div>
    );
}
