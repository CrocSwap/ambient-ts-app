import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { DetailedHTMLProps, HTMLAttributes, useEffect, useRef } from 'react';
import styles from './TokenPageChart.module.css';

interface TokenPageChartProps {
    chartData?: any;
    valueLabel?: string | undefined;
}
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements {
            'd3fc-group': DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
            'd3fc-svg': DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
        }
    }
}

export default function TokenPageChart(props: TokenPageChartProps) {
    const d3Container = useRef(null);
    const d3PlotArea = useRef(null);
    const d3Xaxis = useRef(null);
    const d3Yaxis = useRef(null);

    const data = props.chartData;

    useEffect(() => {
        const priceRange = d3fc.extentLinear().accessors([(d: any) => d.value]);
        const xExtent = d3fc.extentDate().accessors([(d: any) => new Date(d.time)]);

        const xScale = d3.scaleTime();
        const yScale = d3.scaleLinear();

        xScale.domain(xExtent(data));
        yScale.domain(priceRange(data));

        // axes
        const xAxis = d3fc.axisBottom().scale(xScale);
        const yAxis = d3fc.axisRight().scale(yScale);

        const areaSeries = d3fc
            .seriesSvgArea()
            .orient('vertical')
            .mainValue((d: any) => d.value)
            .crossValue((d: any) => new Date(d.time))
            .xScale(xScale)
            .yScale(yScale)
            .decorate((selection: any) => {
                selection.style('fill', (d: any) => {
                    return 'rgba(115, 113, 252, 0.25)';
                });
            });

        const lineSeries = d3fc
            .seriesSvgLine()
            .mainValue((d: any) => d.value)
            .crossValue((d: any) => new Date(d.time))
            .xScale(xScale)
            .yScale(yScale)
            .decorate((selection: any) => {
                selection.enter().style('stroke', (d: any) => '#7371FC');
            });

        const areaJoin = d3fc.dataJoin('g', 'webgl');
        const lineJoin = d3fc.dataJoin('g', 'line');

        d3.select(d3PlotArea.current).on('measure', function (event: any) {
            xScale.range([0, event.detail.width]);
            yScale.range([event.detail.height, 0]);
        });

        d3.select(d3PlotArea.current).on('draw', function (event: any) {
            const svg = d3.select(event.target).select('svg');
            areaJoin(svg, [data]).call(areaSeries);
            lineJoin(svg, [data]).call(lineSeries);
        });

        d3.select(d3Xaxis.current).on('draw', function (event: any) {
            d3.select(event.target).select('svg').call(xAxis);
        });

        d3.select(d3Yaxis.current).on('draw', function (event: any) {
            d3.select(event.target).select('svg').call(yAxis);
        });
        const nd = d3.select('#group').node() as any;
        nd.requestRedraw();
    }, [data]);

    return (
        <div className={styles.cqwlBw}>
            <div ref={d3Container} style={{ height: '100%', width: '100%' }} data-testid={'chart'}>
                <d3fc-group
                    id='group'
                    className='hellooo'
                    style={{
                        display: 'flex',
                        height: '100%',
                        width: '100%',
                        flexDirection: 'column',
                    }}
                    auto-resize
                >
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'row' }}>
                            <d3fc-svg
                                ref={d3PlotArea}
                                className='plot-area'
                                style={{ flex: 1, overflow: 'hidden' }}
                            ></d3fc-svg>
                            {/* <d3fc-svg ref={d3Yaxis} style={{ width: '3em' }}></d3fc-svg> */}
                        </div>
                        <d3fc-svg
                            ref={d3Xaxis}
                            className='x-axis'
                            style={{ height: '2em', marginRight: '3em' }}
                        ></d3fc-svg>
                    </div>
                </d3fc-group>
            </div>
        </div>
    );

    // const chartData=props.chartData;

    // const formattedTvlData = useMemo(() => {
    //     if (chartData) {
    //       return chartData.map((day:any) => {
    //         return {
    //           time: unixToDate(day.date),
    //           value: day.totalValueLockedUSD,
    //         }
    //       })
    //     } else {
    //       return []
    //     }
    //   }, [chartData])
    //   const chartData:any[] = [];

    //   const loadDataIntraday = d3.json('yahoo.json').then((json:any) => {
    //     const chartData = json.chart.result[0];
    //     const quoteData = chartData.indicators.quote[0];
    //     return chartData.timestamp.map((d:any, i:any) => ({
    //       date: new Date(d * 1000 - 5 * 1000 * 60 * 60),
    //       high: quoteData.high[i],
    //       low: quoteData.low[i],
    //       open: quoteData.open[i],
    //       close: quoteData.close[i],
    //       volume: quoteData.volume[i]
    //     }));
    //   });

    //   const loadDataEndOfDay = d3.csv('yahoo.csv', (d:any) => ({
    //     date: new Date(d.Timestamp * 1000),
    //     volume: Number(d.volume),
    //     high: Number(d.high),
    //     low: Number(d.low),
    //     open: Number(d.open),
    //     close: Number(d.close)
    //   }));

    //   const dateFormat = d3.timeFormat('%a %H:%M%p');
    //   const priceFormat = d3.format(',.2f');

    //   const legendData = (datum:any) => [
    //     { name: 'Open', value: priceFormat(datum.open) },
    //     { name: 'High', value: priceFormat(datum.high) },
    //     { name: 'Low', value: priceFormat(datum.low) },
    //     { name: 'Close', value: priceFormat(datum.close) },
    //     { name: 'Volume', value: priceFormat(datum.volume) }
    //   ];

    //   const volumeSeries = d3fc
    //     .seriesSvgBar()
    //     .bandwidth(2)
    //     .crossValue((d:any) => d.date)
    //     .decorate((sel:any) =>
    //       sel
    //         .enter()
    //         .classed('volume', true)
    //         .attr('fill', (d:any) => (d.open > d.close ? 'red' : 'green'))
    //     );

    //     const isWithinOpeningHours = (time:any) => {
    //       const openingHours = exchangeOpeningHours(time);
    //       return time > openingHours[0] && time < openingHours[1];
    //     }

    //     const exchangeOpeningHours = (day:any) => [
    //       new Date(day.getFullYear(), day.getMonth(), day.getDate(), 9, 30, 0),
    //       new Date(day.getFullYear(), day.getMonth(), day.getDate(), 16, 0, 0)
    //     ];

    //   const movingAverageSeries = d3fc
    //     .seriesSvgLine()
    //     .defined((d:any) => isWithinOpeningHours(d.date))
    //     .mainValue((d:any) => d.ma)
    //     .crossValue((d:any) => d.date)
    //     .decorate((sel:any) => sel.enter().classed('ema', true));

    //   const lineSeries = d3fc
    //     .seriesSvgLine()
    //     .mainValue((d:any) => d.high)
    //     .crossValue((d:any) => d.date);

    //   const areaSeries = d3fc
    //     .seriesSvgArea()
    //     .mainValue((d:any) => d.high)
    //     .crossValue((d:any) => d.date);

    //   const gridlines = d3fc
    //     .annotationSvgGridline()
    //     .yTicks(5)
    //     .xTicks(0);

    //   const verticalAnnotation = d3fc
    //     .annotationSvgLine()
    //     .orient('vertical')
    //     .value((d:any) => d.value)
    //     .decorate((sel:any) => {
    //       sel
    //         .enter()
    //         .select('.bottom-handle')
    //         .append('use')
    //         .attr('transform', 'translate(0, -20)')
    //         .attr('xlink:href', (d:any) => d.type);
    //       sel
    //         .enter()
    //         .select('.bottom-handle')
    //         .append('circle')
    //         .attr('r', 3);
    //     });

    //   const bands = d3fc
    //     .annotationSvgBand()
    //     .orient('vertical')
    //     .fromValue((d:any) => d[0][1])
    //     .toValue((d:any) => d[1][0]);

    //     const legend = () => {
    //       const labelJoin = d3fc.dataJoin('text', 'legend-label');
    //       const valueJoin = d3fc.dataJoin('text', 'legend-value');

    //       const instance = (selection:any) => {
    //         selection.each((data:any, selectionIndex:any, nodes:any) => {
    //           labelJoin(d3.select(nodes[selectionIndex]), data)
    //             .attr('transform', (_:any, i:any) => 'translate(50, ' + (i + 1) * 15 + ')')
    //             .text((d:any) => d.name);

    //           valueJoin(d3.select(nodes[selectionIndex]), data)
    //             .attr('transform', (_:any, i:any) => 'translate(60, ' + (i + 1) * 15 + ')')
    //             .text((d:any) => d.value);
    //         });
    //       };

    //       instance.xScale = () => instance;
    //       instance.yScale = () => instance;
    //       return instance;
    //     };

    //   const chartLegend = legend();

    //   const crosshair = d3fc
    //     .annotationSvgCrosshair()
    //     .x((d:any) => xScale(d.date))
    //     .y((d:any) => yScale(d.high));

    //   const markersForDay = (day:any) => {
    //     const openingHours = exchangeOpeningHours(day[0]);
    //     return [
    //       { type: '#pre', value: day[0] },
    //       { type: '#active', value: openingHours[0] },
    //       { type: '#post', value: openingHours[1] }
    //     ];
    //   };
    //   // eslint-disable-next-line prefer-spread
    //   const flatten = (arr:any) => [].concat.apply([], arr);
    //   const multi = d3fc
    //     .seriesSvgMulti()
    //     .series([
    //       gridlines,
    //       areaSeries,
    //       volumeSeries,
    //       movingAverageSeries,
    //       lineSeries,
    //       chartLegend,
    //       bands,
    //       verticalAnnotation,
    //       crosshair
    //     ])
    //     .mapping((data:any, index:any, series:any) => {
    //       if (data.loading) {
    //         return [];
    //       }
    //       switch (series[index]) {
    //         case chartLegend:
    //           // eslint-disable-next-line no-case-declarations
    //           const lastPoint = data[data.length - 1];
    //           // eslint-disable-next-line no-case-declarations
    //           const legendValue = data.crosshair.length
    //             ? data.crosshair[0]
    //             : lastPoint;
    //           return legendData(legendValue);
    //         case crosshair:
    //           return data.crosshair;
    //         case verticalAnnotation:
    //           return flatten(data.tradingHoursArray.map(markersForDay));
    //         case bands:
    //           return d3.pairs(
    //             data.tradingHoursArray.map((d:any) => exchangeOpeningHours(d[0]))
    //           );
    //         default:
    //           return data;
    //       }
    //     });

    //   const ma = d3fc
    //     .indicatorMovingAverage()
    //     .value((d:any) => d.high)
    //     .period(15);

    //   const xExtent = d3fc.extentDate().accessors([(d:any) => d.date]);

    //   const volumeExtent = d3fc
    //     .extentLinear()
    //     .pad([0, 2])
    //     .accessors([(d:any) => d.volume]);

    //   const yExtent = d3fc
    //     .extentLinear()
    //     .pad([0.1, 0.1])
    //     .accessors([(d:any) => d.high, (d:any) => d.low]);

    //   // chartData.loading = true;

    //   const callout = () => {
    //     let scale = d3.scaleIdentity();

    //     const instance = (selection:any) => {
    //       const width = 40,
    //         height = 15,
    //         h2 = height / 2;

    //       const calloutJoin = d3fc.dataJoin('g', 'callout');

    //       selection.each((data:any, selectionIndex:any, nodes:any) => {
    //         // this component is tightly coupled to the shape of the input data, extracting
    //         // this high and moving average values from the last datapoint
    //         const calloutData:any[] = [];
    //         if (data.length) {
    //           const lastPoint = data[data.length - 1];
    //           const calloutData = [lastPoint.high, lastPoint.ma];
    //         }

    //         const element = calloutJoin(
    //           d3.select(nodes[selectionIndex]),
    //           calloutData
    //         ).attr('transform', (d:any) => `translate(7, ${scale(d)})`);

    //         element
    //           .enter()
    //           .append('path')
    //           .attr(
    //             'd',
    //             d3.area()([
    //               [0, 0],
    //               [h2, -h2],
    //               [width, -h2],
    //               [width, h2],
    //               [h2, h2],
    //               [0, 0]
    //             ])
    //           );

    //         element
    //           .enter()
    //           .append('text')
    //           .attr('transform', `translate(${width - 3}, 0)`)
    //           .text((d:any) => d3.format('.2f')(d));
    //       });
    //     };

    //     instance.scale = (...args: any[]) => {
    //       if (!args.length) {
    //         return scale;
    //       }
    //       scale = args[0];
    //       return instance;
    //     };

    //     return instance;
    //   };

    //   const xScale = d3fc.scaleDiscontinuous(d3.scaleTime());

    //   const yScale = d3.scaleLinear();

    //   const yCallout: any = callout().scale(yScale);

    //   const xTickFilter = d3.timeMinute
    //     .every(30)!
    //     .filter((d:any) => d.getHours() === 9 && d.getMinutes() === 30);

    //   const chart = d3fc
    //     .chartCartesian(xScale, yScale)
    //     .yOrient('right')
    //     .svgPlotArea(multi)
    //     .xTicks(xTickFilter)
    //     .xTickFormat(dateFormat)
    //     .xTickSize(20)
    //     .yTickFormat(priceFormat)
    //     .yTicks(5)
    //     // https://github.com/d3/d3-axis/issues/32
    //     .yTickSize(47)
    //     .yDecorate((sel:any) => sel.select('text').attr('transform', 'translate(20, -6)'))
    //     .xDecorate((sel:any) =>
    //       sel
    //         .select('text')
    //         .attr('dy', undefined)
    //         .style('text-anchor', 'start')
    //         .style('dominant-baseline', 'central')
    //         .attr('transform', 'translate(3, 10)')
    //     )
    //     .decorate((sel:any) => {
    //       sel
    //         .enter()
    //         .append('d3fc-svg')
    //         .style('grid-column', 4)
    //         .style('grid-row', 3)
    //         .style('width', '3em')
    //         .on('draw.callout', (data:any, selectionIndex:number, nodes:any) => {
    //           d3.select(nodes[selectionIndex])
    //             .select('svg')
    //             .call(yCallout);
    //         });
    //       sel
    //         .enter()
    //         .append('div')
    //         .classed('border', true);
    //     });

    //     const closest = (arr:any, fn:any) =>
    //         arr.reduce(
    //           (acc:any, value:any, index:number) =>
    //             fn(value) < acc.distance ? { distance: fn(value), index, value } : acc,
    //           {
    //             distance: Number.MAX_VALUE,
    //             index: 0,
    //             value: arr[0]
    //           }
    // ).value;
    //     const render = () => {
    //       // select and render
    //       d3.select('#chart-element')
    //         .datum(chartData)
    //         .call(chart);

    //       const pointer = d3fc.pointer().on('point', (event:any) => {
    //          chartData.crosshair = event.map((pointer:any) =>
    //           closest(chartData, (d:any) =>
    //             Math.abs(xScale.invert(pointer.x).getTime() - d.date.getTime())
    //           )
    //         );
    //         render();
    //       });

    //       d3.select('#chart-element .plot-area').call(pointer);
    //     };

    // }

    // return <div className={styles.cqwlBw}>
    //             <div ref={d3Container} className='main_layout' data-testid={'chart'}>

    //         <d3fc-group
    //             id='group'
    //             className='hellooo'
    //             style={{ display: 'flex', height: '100%', width: '100%', flexDirection: 'column' }}
    //             auto-resize
    //         >

    //         <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
    //                 <div style={{ flex: 1, display: 'flex', flexDirection: 'row' }}>
    //                     <d3fc-svg
    //                         ref={d3PlotArea}
    //                         className='plot-area'
    //                         style={{ flex: 1, overflow: 'hidden' }}
    //                     ></d3fc-svg>
    //                     <d3fc-svg ref={d3Yaxis} style={{ width: '3em' }}></d3fc-svg>
    //                 </div>
    //                 <d3fc-svg
    //                     ref={d3Xaxis}
    //                     className='x-axis'
    //                     style={{ height: '2em', marginRight: '3em' }}
    //                 ></d3fc-svg>
    //             </div>
    //         </d3fc-group>
    {
        /* <div id='chart-element' style={{height: 300}}></div> */
    }

    {
        /* <LineChart
            data={formattedTvlData}
            setLabel={props.valueLabel}
            color={backgroundColor}
            minHeight={340}
            setValue={setLatestValue}
            value={latestValue}
            label={valueLabel}
        /> */
    }
    //         </div>
    //     </div>;
}
