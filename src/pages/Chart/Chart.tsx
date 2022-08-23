import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import moment from 'moment';
import {
    DetailedHTMLProps,
    HTMLAttributes,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDispatch } from '../../utils/hooks/reduxToolkit';
import { CandleData, CandlesByPoolAndDuration } from '../../utils/state/graphDataSlice';
import { setLimitPrice, setTargetData, targetData } from '../../utils/state/tradeDataSlice';
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
    priceData: CandlesByPoolAndDuration | undefined;
    liquidityData: any[];
    changeState: (isOpen: boolean | undefined, candleData: CandleData | undefined) => void;
    targetData: targetData[] | undefined;
    limitPrice: string | undefined;
    setLimitRate: React.Dispatch<React.SetStateAction<string>>;
    limitRate: string;
}

interface CandleChartData {
    date: any;
    open: any;
    high: any;
    low: any;
    close: any;
    time: any;
    allSwaps: any;
}

interface ChartUtils {
    period: any;
    chartData: CandleChartData[];
}

export default function Chart(props: ChartData) {
    const d3Container = useRef(null);
    const d3PlotArea = useRef(null);
    const d3Xaxis = useRef(null);
    const d3Yaxis = useRef(null);

    const dispatch = useAppDispatch();

    const location = useLocation();

    const [ranges, setRanges] = useState([
        {
            name: 'high',
            value: 0,
        },
        {
            name: 'low',
            value: 0,
        },
    ]);

    const [limit, setLimit] = useState([
        {
            name: 'Limit',
            value: 0,
        },
    ]);

    const [market, setMarket] = useState([
        {
            name: 'Market Value',
            value: 0,
        },
    ]);

    const [isChartSelected, setIsChartSelected] = useState<boolean>(false);
    const [transactionFilter, setTransactionFilter] = useState<CandleData>();
    const [scaleData, setScaleData] = useState<any>();
    const [tooltip, setTooltip] = useState<any>();

    // Parse price data
    const parsedChartData = useMemo(() => {
        const chartData: CandleChartData[] = [];
        let period = 1;
        props.priceData?.candles.map((data) => {
            if (data.period !== undefined) {
                period = data.period;
            }
            chartData.push({
                date: new Date(data.time * 1000),
                open: data.priceOpen,
                close: data.priceClose,
                high: data.maxPrice,
                low: data.minPrice,
                time: data.time,
                allSwaps: data.allSwaps,
            });
        });

        const chartUtils: ChartUtils = {
            period: period,
            chartData: chartData,
        };
        return chartUtils;
    }, [props.priceData]);

    // Set Scale
    useEffect(() => {
        if (parsedChartData !== undefined) {
            const priceRange = d3fc
                .extentLinear()
                .accessors([(d: any) => d.high, (d: any) => d.low])
                .pad([0.05, 0.05]);

            const xExtent = d3fc
                .extentDate()
                .accessors([(d: any) => d.date])
                .padUnit('domain')
                // ensure that the scale is padded by one day in either direction
                .pad([parsedChartData.period * 5000, (parsedChartData.period / 2) * 100000]);

            const xScale = d3.scaleTime();
            const yScale = d3.scaleLinear();

            xScale.domain(xExtent(parsedChartData.chartData));
            yScale.domain(priceRange(parsedChartData.chartData));

            const xScaleCopy = xScale.copy();
            const yScaleCopy = yScale.copy();

            const liquidityTickScale = d3.scaleBand();
            const liquidityScale = d3.scaleLinear();
            const barThreshold = 1650;

            // bar chart
            const liquidityExtent = d3fc
                .extentLinear(props.liquidityData)
                .include([0])
                .accessors([(d: any) => d.value]);

            liquidityScale.domain(liquidityExtent(props.liquidityData));

            const liqScale = liquidityScale
                .copy()
                .range([
                    Math.min(...props.liquidityData.map((o) => o.value)) / 2.5,
                    Math.max(...props.liquidityData.map((o) => o.value)) * 2.5,
                ]);

            setScaleData(() => {
                return {
                    xScale: xScale,
                    yScale: yScale,
                    liquidityTickScale: liquidityTickScale,
                    liquidityScale: liquidityScale,
                    liqScale: liqScale,
                    xScaleCopy: xScaleCopy,
                    yScaleCopy: yScaleCopy,
                    barThreshold: barThreshold,
                };
            });
        }
    }, [parsedChartData.period]);

    // Set Targets
    useEffect(() => {
        const reustls: boolean[] = [];

        if (location.pathname.includes('market')) {
            const lastCandlePrice = props.priceData?.candles[0].priceClose;
            setMarket(() => {
                return [
                    {
                        name: 'Current Market Price',
                        value: lastCandlePrice !== undefined ? lastCandlePrice : 0,
                    },
                ];
            });
        } else if (location.pathname.includes('limit')) {
            if (props.limitPrice === undefined || parseFloat(props.limitPrice) === 0) {
                setLimit((prevState) => {
                    const newTargets = [...prevState];
                    newTargets[0].value === 3000;
                    return newTargets;
                });
            } else {
                setLimit(() => {
                    return [
                        {
                            name: 'Limit',
                            value: parseFloat(
                                props.limitPrice !== undefined ? props.limitPrice : '0',
                            ),
                        },
                    ];
                });
            }
        } else if (location.pathname.includes('range')) {
            ranges.map((mapData) => {
                props.targetData?.map((data) => {
                    if (mapData.name === data.name && mapData.value == data.value) {
                        reustls.push(true);
                    }
                });
            });

            if (
                props.targetData === undefined ||
                (props.targetData[0].value === 0 && props.targetData[1].value === 0)
            ) {
                setRanges((prevState) => {
                    const newTargets = [...prevState];
                    newTargets.filter((target: any) => target.name === 'high')[0].value =
                        props.priceData !== undefined
                            ? Math.max(
                                  ...props.priceData.candles.map((o) => {
                                      return o.priceOpen !== undefined ? o.priceOpen : 0;
                                  }),
                              )
                            : 0;
                    newTargets.filter((target: any) => target.name === 'low')[0].value =
                        props.priceData !== undefined
                            ? Math.min(
                                  ...props.priceData.candles.map((o) => {
                                      return o.priceClose !== undefined ? o.priceClose : Infinity;
                                  }),
                              )
                            : 0;

                    return newTargets;
                });
            } else if (reustls.length < 2) {
                setRanges(() => {
                    let high = props.targetData?.filter((target: any) => target.name === 'high')[0]
                        .value;
                    const low = props.targetData?.filter((target: any) => target.name === 'low')[0]
                        .value;

                    if (high !== undefined && low !== undefined) {
                        if (high !== 0 && high < low) {
                            high = low + low / 100;
                        }

                        const chartTargets = [
                            {
                                name: 'high',
                                value:
                                    high !== undefined && high !== 0
                                        ? high
                                        : props.priceData !== undefined
                                        ? Math.max(
                                              ...props.priceData.candles.map((o) => {
                                                  return o.priceOpen !== undefined
                                                      ? o.priceOpen
                                                      : 0;
                                              }),
                                          )
                                        : 0,
                            },
                            {
                                name: 'low',
                                value:
                                    low !== undefined && low !== 0
                                        ? low
                                        : props.priceData !== undefined
                                        ? Math.min(
                                              ...props.priceData.candles.map((o) => {
                                                  return o.priceClose !== undefined
                                                      ? o.priceClose
                                                      : Infinity;
                                              }),
                                          )
                                        : 0,
                            },
                        ];
                        return chartTargets;
                    }
                    return [
                        { name: 'low', value: 0 },
                        { name: 'high', value: 0 },
                    ];
                });
            }
        }
    }, [location, props.limitPrice, props.targetData]);

    // Set Tooltip
    useEffect(() => {
        const tooltip = d3
            .select(d3Container.current)
            .append('div')
            .attr('class', 'tooltip')
            .style('width', '18%')
            .style('visibility', 'hidden');

        setTooltip(tooltip);
    }, []);

    // Call drawChart()
    useEffect(() => {
        if (parsedChartData !== undefined && scaleData !== undefined) {
            const targetData = location.pathname.includes('limit')
                ? limit
                : location.pathname.includes('range')
                ? ranges
                : location.pathname.includes('market')
                ? market
                : undefined;
            drawChart(parsedChartData.chartData, targetData, scaleData, tooltip);
        }
    }, [parsedChartData, scaleData, location, ranges, limit, market]);

    // Draw Chart
    const drawChart = useCallback((chartData: any, targets: any, scaleData: any, tooltip: any) => {
        if (chartData.length > 0) {
            let selectedCandle: any;
            let nearestCandleData: any;
            const crosshairData = [{ x: 0, y: -1 }];

            const render = () => {
                nd.requestRedraw();
            };

            const minimum = (data: any, accessor: any) => {
                return data
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

            const snap = (series: any, data: any, point: any) => {
                if (point == undefined) return [];
                const xScale = series.xScale(),
                    xValue = series.crossValue();

                const filtered =
                    data.lenght > 1 ? data.filter((d: any) => xValue(d) != null) : data;
                const nearest = minimum(filtered, (d: any) =>
                    Math.abs(point.offsetX - xScale(xValue(d))),
                )[1];

                nearestCandleData = nearest;
                return [
                    {
                        x: nearest?.date,
                        y: -1,
                    },
                ];
            };

            const valueFormatter = d3.format('.5f');
            const priceFormatter = d3.format('5.5f');

            // axes
            const xAxis = d3fc.axisBottom().scale(scaleData.xScale);
            const yAxis = d3fc.axisRight().scale(scaleData.yScale);

            const barSeries = d3fc
                .autoBandwidth(d3fc.seriesSvgBar())
                .widthFraction(1)
                .orient('horizontal')
                .mainValue((d: any) => scaleData.liqScale.invert(d.value))
                .crossValue((d: any) => d.tick)
                .xScale(scaleData.liquidityScale)
                .yScale(scaleData.yScale)
                .decorate((selection: any) => {
                    selection.select('.bar > path').style('fill', (d: any) => {
                        return d.tick < scaleData.barThreshold
                            ? 'rgba(205, 193, 255, 0.25)'
                            : 'rgba(115, 113, 252, 0.25)';
                    });
                });

            const popup = d3
                .select(d3Container.current)
                .append('div')
                .attr('class', 'popup')
                .style('visibility', 'hidden');

            const crosshair = d3fc
                .annotationSvgLine()
                .orient('vertical')
                .value((d: any) => d.x)
                .xScale(scaleData.xScale)
                .yScale(scaleData.yScale)
                .label('');

            crosshair.decorate((selection: any) => {
                selection.enter().select('line').attr('class', 'crosshair');
                selection
                    .enter()
                    .append('line')
                    .attr('stroke-width', 1)
                    .style('pointer-events', 'all');
            });

            const candlestick = d3fc
                .autoBandwidth(d3fc.seriesSvgCandlestick())
                .decorate((selection: any) => {
                    selection
                        .enter()
                        .style('fill', (d: any) => (d.close > d.open ? '#7371FC' : '#CDC1FF'))
                        .style('stroke', (d: any) => (d.close > d.open ? '#7371FC' : '#CDC1FF'));
                    selection
                        .enter()
                        .on('mouseover', (event: any) => {
                            d3.select(event.currentTarget).style('cursor', 'pointer');
                        })
                        .on('mouseout', (event: any) => {
                            d3.select(event.currentTarget).style('cursor', 'default');
                        })
                        .on('click', (event: any) => {
                            if (
                                selectedCandle !== undefined &&
                                event.currentTarget !== selectedCandle
                            ) {
                                d3.select(selectedCandle)
                                    .style('fill', (d: any) =>
                                        d.close > d.open ? '#7371FC' : '#CDC1FF',
                                    )
                                    .style('stroke', (d: any) =>
                                        d.close > d.open ? '#7371FC' : '#CDC1FF',
                                    );
                            }
                            if (event.currentTarget === selectedCandle) {
                                popup.style('visibility', 'hidden');
                                d3.select(event.currentTarget)
                                    .style('fill', (d: any) =>
                                        d.close > d.open ? '#7371FC' : '#CDC1FF',
                                    )
                                    .style('stroke', (d: any) =>
                                        d.close > d.open ? '#7371FC' : '#CDC1FF',
                                    );
                                setIsChartSelected(false);
                                selectedCandle = undefined;
                            } else {
                                selectedCandle = event.currentTarget;
                                setIsChartSelected(true);
                                setTransactionFilter(() => {
                                    return event.target.__data__;
                                });

                                d3.select(event.currentTarget)
                                    .style('fill', '#F7385B')
                                    .style('stroke', '#F7385B');

                                popup
                                    .style('visibility', 'visible')
                                    .html(
                                        '<p>Showing Transactions for <span style="color: #E6274A">' +
                                            moment(event.target.__data__.date).format(
                                                'DD MMM  HH:mm',
                                            ) +
                                            '</span> Candle</p>',
                                    )
                                    .style('left', '34%')
                                    .style('top', 500 + 'px');
                            }
                        });
                })
                .xScale(scaleData.xScale)
                .yScale(scaleData.yScale);

            const horizontalLine = d3fc
                .annotationSvgLine()
                .value((d: any) => d.value)
                .xScale(scaleData.xScale)
                .yScale(scaleData.yScale);

            // const dragRange = d3.drag().on('drag', function (event, d: any) {
            //     const newValue = scaleData.yScale.invert(d3.pointer(event)[1] - 182);
            //     setRanges((prevState) => {
            //         const newTargets = [...prevState];
            //         if (
            //             d.name === 'high' &&
            //             newValue >
            //                 newTargets.filter((target: any) => target.name === 'low')[0].value
            //         ) {
            //             newTargets.filter((target: any) => target.name === d.name)[0].value =
            //                 newValue;
            //         } else if (
            //             d.name === 'low' &&
            //             newValue <
            //                 newTargets.filter((target: any) => target.name === 'high')[0].value
            //         ) {
            //             newTargets.filter((target: any) => target.name === d.name)[0].value =
            //                 newValue;
            //         }
            //         render();
            //         return newTargets;
            //     });
            // });

            const dragLimit = d3.drag().on('drag', function (event) {
                const newValue = scaleData.yScale.invert(d3.pointer(event)[1] - 182);
                setLimit(() => {
                    return [{ name: 'Limit', value: newValue }];
                });
            });

            const drag = dragLimit;

            horizontalLine.decorate((selection: any) => {
                selection.enter().select('g.left-handle').append('text').attr('x', 5).attr('y', -5);
                selection.enter().select('g.right-handle').remove();
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

            let lastY = 0;
            let yOffset = 0;

            const zoom = d3
                .zoom()
                .scaleExtent([1, 10])
                .on('zoom', (event: any) => {
                    scaleData.xScale.domain(
                        event.transform.rescaleX(scaleData.xScaleCopy).domain(),
                    );

                    if (event.sourceEvent && event.sourceEvent.type != 'wheel') {
                        lastY = event.transform.y - yOffset;
                        const translate = d3.zoomIdentity.translate(0, lastY);
                        scaleData.yScale.domain(translate.rescaleY(scaleData.yScaleCopy).domain());
                    } else {
                        yOffset = event.transform.y - lastY;
                    }

                    render();
                }) as any;

            const yAxisZoom = d3
                .zoom()
                .scaleExtent([1, 10])
                .on('zoom', (event: any) => {
                    scaleData.yScale.domain(
                        event.transform.rescaleY(scaleData.yScaleCopy).domain(),
                    );
                    render();
                }) as any;

            const yAxisDrag = d3.drag().on('drag', (event: any) => {
                const factor = Math.pow(2, -event.dy * 0.01);
                d3.select(d3PlotArea.current).call(yAxisZoom.scaleBy, factor);
            }) as any;

            const candleJoin = d3fc.dataJoin('g', 'candle');
            const targetsJoin = d3fc.dataJoin('g', 'targets');
            const barJoin = d3fc.dataJoin('g', 'bar');
            const crosshairJoin = d3fc.dataJoin('g', 'crosshair');

            // handle the plot area measure event in order to compute the scale ranges
            d3.select(d3PlotArea.current).on('measure', function (event: any) {
                scaleData.xScale.range([0, event.detail.width]);
                scaleData.yScale.range([event.detail.height, 0]);

                scaleData.liquidityTickScale.range([event.detail.height, 0]);
                scaleData.liquidityScale.range([event.detail.width, event.detail.width / 2]);
            });

            d3.select(d3PlotArea.current).on('draw', function (event: any) {
                const svg = d3.select(event.target).select('svg');

                crosshairJoin(svg, [crosshairData]).call(crosshair);
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

            d3.select(d3PlotArea.current).on('measure.range', function (event: any) {
                const svg = d3.select(event.target).select('svg');
                scaleData.xScaleCopy.range([0, event.detail.width]);
                scaleData.yScaleCopy.range([event.detail.height, 0]);
                svg.call(zoom);
            });

            d3.select(d3PlotArea.current).on('mousemove', function (event: any) {
                crosshairData[0] = snap(candlestick, chartData, event)[0];

                tooltip
                    .style('visibility', 'visible')
                    .html(
                        '<div>' +
                            '<div class="block"><div class="value_title" >Open:</div>' +
                            '<div class="value">' +
                            priceFormatter(nearestCandleData.open) +
                            '</div></div>' +
                            '<div class="block"><div class="value_title" >Close:</div>' +
                            '<div class="value">' +
                            priceFormatter(nearestCandleData.close) +
                            '</div></div>' +
                            '<div class="block"><div class="value_title" >Max Price:</div>' +
                            '<div class="value">' +
                            priceFormatter(nearestCandleData.high) +
                            '</div></div>' +
                            '<div class="block"><div class="value_title" >Min Price:</div>' +
                            '<div class="value">' +
                            priceFormatter(nearestCandleData.low) +
                            '</div></div>' +
                            '<div class="block"><div class="value_title" >Date:</div>' +
                            '<div class="value">' +
                            moment(nearestCandleData.date).format('DD MMM  HH:mm') +
                            '</div></div>' +
                            '</div>',
                    )
                    .style('left', (event.x < 1250 ? event.x - 250 : 1000) + 'px')
                    .style('top', event.y - 50 + 'px');

                render();
            });

            d3.select(d3Yaxis.current)
                .on('mouseover', (event: any) => {
                    d3.select(event.currentTarget).style('cursor', 'ns-resize');
                })
                .call(yAxisDrag);

            const nd = d3.select('#group').node() as any;
            render();
        }
    }, []);

    // Set selected candle transactions
    useEffect(() => {
        if (isChartSelected !== undefined && transactionFilter !== undefined) {
            props.changeState(isChartSelected, transactionFilter);
        }
    }, [isChartSelected, transactionFilter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const newTargetData: targetData[] = [
                {
                    name: 'high',
                    value: ranges.filter((target: any) => target.name === 'high')[0].value,
                },
                {
                    name: 'low',
                    value: ranges.filter((target: any) => target.name === 'low')[0].value,
                },
            ];

            dispatch(setTargetData(newTargetData));
        }, 1000);
        return () => clearTimeout(timer);
    }, [ranges]);

    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(setLimitPrice(limit[0].value.toString()));
            props.setLimitRate(limit[0].value.toString());
        }, 1000);
        return () => clearTimeout(timer);
    }, [limit]);

    return (
        <div ref={d3Container} className='main_layout_chart' data-testid={'chart'}>
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
                        <d3fc-svg
                            className='y-axis'
                            ref={d3Yaxis}
                            style={{ width: '3em' }}
                        ></d3fc-svg>
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
