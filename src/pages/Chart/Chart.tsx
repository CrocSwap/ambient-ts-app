import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import {
    DetailedHTMLProps,
    HTMLAttributes,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useAppDispatch } from '../../utils/hooks/reduxToolkit';
import { CandleData, CandlesByPoolAndDuration } from '../../utils/state/graphDataSlice';
import { setTargetData, targetData } from '../../utils/state/tradeDataSlice';
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

    const [targets, setTargets] = useState([
        {
            name: 'high',
            value: 0,
        },
        {
            name: 'low',
            value: 0,
        },
    ]);

    const [isChartSelected, setIsChartSelected] = useState<boolean>(false);
    const [transactionFilter, setTransactionFilter] = useState<CandleData>();
    const [scaleData, setScaleData] = useState<any>();

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

    // Set Targets
    useEffect(() => {
        const reustls: boolean[] = [];

        targets.map((mapData) => {
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
            setTargets((prevState) => {
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
            setTargets(() => {
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
                                              return o.priceOpen !== undefined ? o.priceOpen : 0;
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
    }, [parsedChartData.period, props.targetData]);

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

            setScaleData(() => {
                return {
                    xScale: xScale,
                    yScale: yScale,
                    xScaleCopy: xScaleCopy,
                    yScaleCopy: yScaleCopy,
                };
            });
        }
    }, [parsedChartData.period]);

    // Call drawChart()
    useEffect(() => {
        if (parsedChartData !== undefined && scaleData !== undefined) {
            drawChart(parsedChartData.chartData, targets, scaleData);
        }
    }, [parsedChartData, scaleData, targets]);

    // Draw Chart
    const drawChart = useCallback((chartData: any, targets: any, scaleData: any) => {
        if (chartData.length > 0) {
            let selectedCandle: any;
            const crosshairData = [{ x: 0, y: -1 }];

            const render = () => {
                nd.requestRedraw();
            };

            const valueFormatter = d3.format('.8f');

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

            // axes
            const xAxis = d3fc.axisBottom().scale(scaleData.xScale);
            const yAxis = d3fc.axisRight().scale(scaleData.yScale);

            const barSeries = d3fc
                .autoBandwidth(d3fc.seriesSvgBar())
                .widthFraction(1)
                .orient('horizontal')
                .mainValue((d: any) => liqScale.invert(d.value))
                .crossValue((d: any) => d.tick)
                .xScale(liquidityScale)
                .yScale(scaleData.yScale)
                .decorate((selection: any) => {
                    selection.select('.bar > path').style('fill', (d: any) => {
                        return d.tick < barThreshold
                            ? 'rgba(205, 193, 255, 0.25)'
                            : 'rgba(115, 113, 252, 0.25)';
                    });
                });

            const tooltip = d3
                .select(d3Container.current)
                .append('div')
                .attr('class', 'tooltip')
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
                        .style('fill', (d: any) =>
                            selectedCandle?.time === d.time
                                ? '#F7385B'
                                : d.close > d.open
                                ? '#7371FC'
                                : '#CDC1FF',
                        )
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
                            if (event.target.__data__ === selectedCandle) {
                                tooltip.style('visibility', 'hidden');
                                setIsChartSelected(false);
                                selectedCandle = undefined;
                            } else {
                                selectedCandle = event.target.__data__;
                                setIsChartSelected(true);
                                setTransactionFilter(() => {
                                    return event.target.__data__;
                                });

                                tooltip
                                    .style('visibility', 'visible')
                                    .html(
                                        '<p>Showing Transactions for <span style="color: #E6274A">selected</span> Candle</p>',
                                    )
                                    .style('left', '37%')
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

            const drag = d3.drag().on('drag', function (event, d: any) {
                const newValue = scaleData.yScale.invert(d3.pointer(event)[1] - 182);
                setTargets((prevState) => {
                    const newTargets = [...prevState];
                    if (
                        d.name === 'high' &&
                        newValue >
                            newTargets.filter((target: any) => target.name === 'low')[0].value
                    ) {
                        newTargets.filter((target: any) => target.name === d.name)[0].value =
                            newValue;
                    } else if (
                        d.name === 'low' &&
                        newValue <
                            newTargets.filter((target: any) => target.name === 'high')[0].value
                    ) {
                        newTargets.filter((target: any) => target.name === d.name)[0].value =
                            newValue;
                    }
                    render();
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

            const zoom = d3
                .zoom()
                .scaleExtent([1, 10])
                .on('zoom', (event: any) => {
                    scaleData.xScale.domain(
                        event.transform.rescaleX(scaleData.xScaleCopy).domain(),
                    );
                    scaleData.yScale.domain(
                        event.transform.rescaleY(scaleData.yScaleCopy).domain(),
                    );
                    render();
                }) as any;

            const candleJoin = d3fc.dataJoin('g', 'candle');
            const targetsJoin = d3fc.dataJoin('g', 'targets');
            const barJoin = d3fc.dataJoin('g', 'bar');
            const crosshairJoin = d3fc.dataJoin('g', 'crosshair');

            // handle the plot area measure event in order to compute the scale ranges
            d3.select(d3PlotArea.current).on('measure', function (event: any) {
                scaleData.xScale.range([0, event.detail.width]);
                scaleData.yScale.range([event.detail.height, 0]);

                liquidityTickScale.range([event.detail.height, 0]);
                liquidityScale.range([event.detail.width, event.detail.width / 2]);
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
                crosshairData[0] = {
                    x: scaleData.xScale.invert(event.offsetX),
                    y: scaleData.yScale.invert(event.offsetY),
                };
                render();
            });

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
            console.log('setTarget');
            const newTargetData: targetData[] = [
                {
                    name: 'high',
                    value: targets.filter((target: any) => target.name === 'high')[0].value,
                },
                {
                    name: 'low',
                    value: targets.filter((target: any) => target.name === 'low')[0].value,
                },
            ];

            dispatch(setTargetData(newTargetData));
        }, 1000);
        return () => clearTimeout(timer);
    }, [targets]);

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
