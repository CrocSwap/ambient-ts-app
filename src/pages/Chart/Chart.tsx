import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import moment from 'moment';
import { DetailedHTMLProps, HTMLAttributes, useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDispatch } from '../../utils/hooks/reduxToolkit';
import { formatDollarAmountAxis } from '../../utils/numbers';
import { CandleData } from '../../utils/state/graphDataSlice';
import {
    setLimitPrice,
    setPinnedMaxPrice,
    setPinnedMinPrice,
    setSimpleRangeWidth,
    setTargetData,
    targetData,
} from '../../utils/state/tradeDataSlice';
import FeeRateSubChart from '../Trade/TradeCharts/TradeChartsLoading/FeeRateSubChart';
import TvlSubChart from '../Trade/TradeCharts/TradeChartsLoading/TvlSubChart';
import VolumeSubChart from '../Trade/TradeCharts/TradeChartsLoading/VolumeSubChart';
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

type chartItemStates = {
    showTvl: boolean;
    showVolume: boolean;
    showFeeRate: boolean;
};
interface ChartData {
    priceData: ChartUtils | undefined;
    liquidityData: any;
    changeState: (isOpen: boolean | undefined, candleData: CandleData | undefined) => void;
    denomInBase: boolean;
    targetData: targetData[] | undefined;
    limitPrice: string | undefined;
    setLimitRate: React.Dispatch<React.SetStateAction<string>>;
    limitRate: string;
    isAdvancedModeActive: boolean | undefined;
    simpleRangeWidth: number | undefined;
    pinnedMinPriceDisplayTruncated: number | undefined;
    pinnedMaxPriceDisplayTruncated: number | undefined;
    truncatedPoolPrice: number | undefined;
    spotPriceDisplay: string | undefined;
    feeData: any[];
    volumeData: any[];
    tvlData: any[];
    chartItemStates: chartItemStates;
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
    const {
        denomInBase,
        isAdvancedModeActive,
        pinnedMinPriceDisplayTruncated,
        pinnedMaxPriceDisplayTruncated,
        simpleRangeWidth,
        spotPriceDisplay,
    } = props;

    const { showFeeRate, showTvl, showVolume } = props.chartItemStates;

    const parsedChartData = props.priceData;

    const d3Container = useRef(null);
    const d3PlotArea = useRef(null);
    const d3Xaxis = useRef(null);
    const d3Yaxis = useRef(null);

    const dispatch = useAppDispatch();

    const location = useLocation();

    const [ranges, setRanges] = useState([
        {
            name: 'Max',
            value: 0,
        },
        {
            name: 'Min',
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

    const [subChartValues, setsubChartValues] = useState([
        {
            name: 'feeRate',
            value: 0,
        },
        {
            name: 'tvl',
            value: 0,
        },
        {
            name: 'volume',
            value: 0,
        },
    ]);

    const [isChartSelected, setIsChartSelected] = useState<boolean>(false);
    const [isHighMoved, setIsHighMoved] = useState<boolean>(false);
    const [isLowMoved, setIsLowMoved] = useState<boolean>(false);
    const [transactionFilter, setTransactionFilter] = useState<CandleData>();
    const [scaleData, setScaleData] = useState<any>();
    const [dragType, setDragType] = useState<any>();
    const [crosshairData, setCrosshairData] = useState([{ x: 0, y: -1 }]);

    const setDefaultRangeData = () => {
        setRanges((prevState) => {
            const newTargets = [...prevState];
            newTargets.filter((target: any) => target.name === 'Max')[0].value =
                props.priceData !== undefined
                    ? Math.max(
                          ...props.priceData.chartData.map((o) => {
                              return o.open !== undefined ? o.open : 0;
                          }),
                      )
                    : 0;
            newTargets.filter((target: any) => target.name === 'Min')[0].value =
                props.priceData !== undefined
                    ? Math.min(
                          ...props.priceData.chartData.map((o) => {
                              return o.close !== undefined ? o.close : Infinity;
                          }),
                      )
                    : 0;

            return newTargets;
        });
    };

    const render = useCallback(() => {
        const nd = d3.select('#group').node() as any;
        nd.requestRedraw();
    }, []);

    useEffect(() => {
        d3.select(d3Container.current)
            .select('.targets')
            .select('.annotation-line')
            .on('mouseover', (event: any) => {
                if (!location.pathname.includes('market')) {
                    d3.select(event.currentTarget).select('.detector').style('cursor', 'ns-resize');
                }
            });
    }, [location]);

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
            const barThreshold = 1600;

            // bar chart
            const liquidityExtent = d3fc
                .extentLinear(props.liquidityData)
                .include([0])
                .accessors([(d: any) => parseFloat(d.activeLiq)]);

            liquidityScale.domain(liquidityExtent(props.liquidityData));

            const liqScale = liquidityScale
                .copy()
                .range([
                    Math.min(...props.liquidityData.map((o: any) => parseFloat(o.activeLiq))) / 2.5,
                    Math.max(...props.liquidityData.map((o: any) => parseFloat(o.activeLiq))) * 2.5,
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
    }, [parsedChartData?.period, denomInBase]);

    // Set Targets
    useEffect(() => {
        const reustls: boolean[] = [];

        if (location.pathname.includes('market')) {
            let lastCandlePrice: number | undefined;
            props.priceData?.chartData.map((data) => {
                if (lastCandlePrice === undefined && data.close !== undefined) {
                    lastCandlePrice = data.close;
                }
            });
            setMarket(() => {
                return [
                    {
                        name: 'Current Market Price',
                        value: lastCandlePrice !== undefined ? lastCandlePrice : 0,
                    },
                ];
            });
        } else if (location.pathname.includes('limit')) {
            setLimit(() => {
                return [
                    {
                        name: 'Limit',
                        value: parseFloat(props.limitPrice !== undefined ? props.limitPrice : '0'),
                    },
                ];
            });
        } else if (location.pathname.includes('range') && !isHighMoved && !isLowMoved) {
            if (!isAdvancedModeActive) {
                if (simpleRangeWidth === 100) {
                    ranges.map((mapData) => {
                        if (mapData.value === 0) {
                            reustls.push(true);
                        }
                    });

                    if (reustls.length === 2) {
                        setDefaultRangeData();
                    }
                } else {
                    setRanges(() => {
                        return [
                            {
                                name: 'Min',
                                value:
                                    pinnedMinPriceDisplayTruncated !== undefined
                                        ? pinnedMinPriceDisplayTruncated
                                        : 0,
                            },
                            {
                                name: 'Max',
                                value:
                                    pinnedMaxPriceDisplayTruncated !== undefined
                                        ? pinnedMaxPriceDisplayTruncated
                                        : 0,
                            },
                        ];
                    });
                }
            } else {
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
                    setDefaultRangeData();
                } else if (reustls.length < 2) {
                    setRanges(() => {
                        let high = props.targetData?.filter(
                            (target: any) => target.name === 'Max',
                        )[0].value;
                        const low = props.targetData?.filter(
                            (target: any) => target.name === 'Min',
                        )[0].value;

                        if (high !== undefined && low !== undefined) {
                            if (high !== 0 && high < low) {
                                high = low + low / 100;
                            }

                            const chartTargets = [
                                {
                                    name: 'Max',
                                    value:
                                        high !== undefined && high !== 0
                                            ? high
                                            : props.priceData !== undefined
                                            ? Math.max(
                                                  ...props.priceData.chartData.map((o) => {
                                                      return o.open !== undefined ? o.open : 0;
                                                  }),
                                              )
                                            : 0,
                                },
                                {
                                    name: 'Min',
                                    value:
                                        low !== undefined && low !== 0
                                            ? low
                                            : props.priceData !== undefined
                                            ? Math.min(
                                                  ...props.priceData.chartData.map((o) => {
                                                      return o.close !== undefined
                                                          ? o.close
                                                          : Infinity;
                                                  }),
                                              )
                                            : 0,
                                },
                            ];
                            return chartTargets;
                        }
                        return [
                            { name: 'Min', value: 0 },
                            { name: 'Max', value: 0 },
                        ];
                    });
                }
            }
        }
    }, [
        location,
        props.limitPrice,
        props.targetData,
        denomInBase,
        isAdvancedModeActive,
        simpleRangeWidth,
        pinnedMinPriceDisplayTruncated,
        pinnedMaxPriceDisplayTruncated,
    ]);

    // Set dragType
    useEffect(() => {
        if (scaleData !== undefined) {
            const dragRange = d3.drag().on('drag', function (event, d: any) {
                const newValue = scaleData.yScale.invert(d3.pointer(event)[1] - 169);
                if (!isAdvancedModeActive) {
                    let valueWithRange: number;

                    if (d.name === 'Max') {
                        setRanges((prevState) => {
                            const newTargets = [...prevState];

                            const val =
                                spotPriceDisplay !== undefined
                                    ? spotPriceDisplay.replace(',', '')
                                    : '';

                            const dragLimit = parseFloat(val) / 100;

                            valueWithRange =
                                newTargets.filter((target: any) => target.name === 'Max')[0].value -
                                newValue;

                            const low = newTargets.filter((target: any) => target.name === 'Min')[0]
                                .value;

                            console.log(parseFloat(val) - low);
                            console.log({ dragLimit });

                            if (!(dragLimit > parseFloat(val) - low)) {
                                newTargets.filter((target: any) => target.name === 'Max')[0].value =
                                    newValue;

                                newTargets.filter((target: any) => target.name === 'Min')[0].value =
                                    low + valueWithRange;

                                render();
                            } else {
                                newTargets.filter((target: any) => target.name === 'Max')[0].value =
                                    parseFloat(val) + dragLimit * 1.01;

                                newTargets.filter((target: any) => target.name === 'Min')[0].value =
                                    parseFloat(val) - dragLimit * 1.01;

                                render();
                            }
                            return newTargets;
                        });
                        setIsHighMoved(true);
                    } else {
                        setRanges((prevState) => {
                            const newTargets = [...prevState];

                            const val =
                                spotPriceDisplay !== undefined
                                    ? spotPriceDisplay.replace(',', '')
                                    : '';

                            const dragLimit = parseFloat(val) / 100;

                            valueWithRange =
                                newTargets.filter((target: any) => target.name === 'Min')[0].value -
                                newValue;

                            const high = newTargets.filter(
                                (target: any) => target.name === 'Max',
                            )[0].value;

                            console.log(high - parseFloat(val));
                            console.log({ dragLimit });

                            if (!(dragLimit > high - parseFloat(val))) {
                                newTargets.filter((target: any) => target.name === 'Min')[0].value =
                                    newValue;

                                newTargets.filter((target: any) => target.name === 'Max')[0].value =
                                    high + valueWithRange;

                                render();
                            } else {
                                newTargets.filter((target: any) => target.name === 'Max')[0].value =
                                    parseFloat(val) + dragLimit * 1.01;

                                newTargets.filter((target: any) => target.name === 'Min')[0].value =
                                    parseFloat(val) - dragLimit * 1.01;

                                render();
                            }

                            return newTargets;
                        });
                        setIsLowMoved(true);
                    }
                } else {
                    setRanges((prevState) => {
                        const newTargets = [...prevState];
                        if (
                            d.name === 'Max' &&
                            newValue >
                                newTargets.filter((target: any) => target.name === 'Min')[0].value
                        ) {
                            newTargets.filter((target: any) => target.name === d.name)[0].value =
                                newValue;
                        } else if (
                            d.name === 'Min' &&
                            newValue <
                                newTargets.filter((target: any) => target.name === 'Max')[0].value
                        ) {
                            newTargets.filter((target: any) => target.name === d.name)[0].value =
                                newValue;
                        }
                        render();
                        return newTargets;
                    });
                }
            });

            const dragLimit = d3.drag().on('drag', function (event) {
                const newValue = scaleData.yScale.invert(d3.pointer(event)[1] - 182);
                setLimit(() => {
                    return [{ name: 'Limit', value: newValue }];
                });
                render();
            });

            setDragType(() => {
                return location.pathname.includes('limit') ? dragLimit : dragRange;
            });
        }
    }, [location, scaleData, isAdvancedModeActive]);

    // set HorizontalLines
    useEffect(() => {
        if (dragType !== undefined) {
            if (location.pathname.includes('limit')) {
                d3.select(d3Container.current)
                    .select('.targets')
                    .on('mouseover', (event: any) => {
                        d3.select(event.currentTarget)
                            // .select('.detector')
                            .style('cursor', 'ns-resize');
                    })
                    .call(dragType);
            }

            if (location.pathname.includes('range')) {
                d3.select(d3Container.current)
                    .select('.targets')
                    .select('.horizontal')
                    .on('mouseover', (event: any) => {
                        d3.select(event.currentTarget)
                            // .select('.detector')
                            .style('cursor', 'ns-resize');
                    })
                    .call(dragType);

                d3.select(d3Container.current)
                    .select('.targets')
                    .select('#Min')
                    .on('mouseover', (event: any) => {
                        d3.select(event.currentTarget).style('cursor', 'ns-resize');
                    })
                    .call(dragType);

                d3.select(d3Container.current)
                    .select('.targets')
                    .select('#Max')
                    .on('mouseover', (event: any) => {
                        d3.select(event.currentTarget).style('cursor', 'ns-resize');
                    })
                    .call(dragType);
            }
        }
    }, [dragType, parsedChartData?.period]);

    // Call drawChart()
    useEffect(() => {
        if (
            props.liquidityData !== undefined &&
            parsedChartData !== undefined &&
            scaleData !== undefined
        ) {
            const targetData = location.pathname.includes('limit')
                ? limit
                : location.pathname.includes('range')
                ? ranges
                : location.pathname.includes('market')
                ? market
                : undefined;

            drawChart(parsedChartData.chartData, targetData, scaleData, props.liquidityData);
        }
    }, [parsedChartData, scaleData, location, market, ranges, limit]);

    // Draw Chart
    const drawChart = useCallback(
        (chartData: any, targets: any, scaleData: any, liquidityData: any) => {
            if (chartData.length > 0) {
                let selectedCandle: any;
                const crosshairData = [{ x: 0, y: -1 }];

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

                    setCrosshairData([{ x: point.offsetX, y: -1 }]);
                    return [
                        {
                            x: nearest?.date,
                            y: scaleData.yScale.invert(point.offsetY),
                        },
                    ];
                };

                const valueFormatter = d3.format('.5f');

                // axes
                const xAxis = d3fc.axisBottom().scale(scaleData.xScale);
                const yAxis = d3fc.axisRight().scale(scaleData.yScale);

                const barSeries = d3fc
                    .autoBandwidth(d3fc.seriesSvgBar())
                    .widthFraction(3)
                    .orient('horizontal')
                    .align('center')
                    .mainValue((d: any) => scaleData.liqScale.invert(parseFloat(d.activeLiq)))
                    .crossValue((d: any) => d.upperBoundInvPriceDecimalCorrected)
                    .xScale(scaleData.liquidityScale)
                    .yScale(scaleData.yScale)
                    .decorate((selection: any) => {
                        selection.select('.bar > path').style('fill', 'rgba(205, 193, 255, 0.25)');
                    });

                const popup = d3
                    .select(d3Container.current)
                    .append('div')
                    .attr('class', 'popup')
                    .style('visibility', 'hidden');

                const crosshairHorizontal = d3fc
                    .annotationSvgLine()
                    .orient('vertical')
                    .value((d: any) => d.x)
                    .xScale(scaleData.xScale)
                    .yScale(scaleData.yScale)
                    .label('');

                crosshairHorizontal.decorate((selection: any) => {
                    selection.enter().select('line').attr('class', 'crosshair');
                    selection
                        .enter()
                        .append('line')
                        .attr('stroke-width', 1)
                        .style('pointer-events', 'all');
                    selection.enter().select('g.bottom-handle').append('text');
                    selection.enter().select('g.top-handle').remove();
                    // selection.select('g.bottom-handle text').text((d: any) => moment(d.x).format('DD/MM HH:mm'));
                });

                const crosshairVertical = d3fc
                    .annotationSvgLine()
                    .value((d: any) => d.y)
                    .xScale(scaleData.xScale)
                    .yScale(scaleData.yScale);

                crosshairVertical.decorate((selection: any) => {
                    selection.enter().select('line').attr('class', 'crosshair');
                    selection
                        .enter()
                        .append('line')
                        .attr('stroke-width', 1)
                        .style('pointer-events', 'all');
                    selection.enter().select('g.left-handle').remove();
                    selection.enter().select('g.right-handle');
                    selection.select('g.right-handle text').text((d: any) => d.y);
                });

                const candlestick = d3fc
                    .autoBandwidth(d3fc.seriesSvgCandlestick())
                    .decorate((selection: any) => {
                        selection
                            .enter()
                            .style('fill', (d: any) => (d.close > d.open ? '#7371FC' : '#CDC1FF'))
                            .style('stroke', (d: any) =>
                                d.close > d.open ? '#7371FC' : '#CDC1FF',
                            );
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
                                        .style('fill', '#E480FF')
                                        .style('stroke', '#E480FF');

                                    popup
                                        .style('visibility', 'visible')
                                        .html(
                                            '<p>Showing Transactions for <span style="color: #E480FF">' +
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

                horizontalLine.decorate((selection: any) => {
                    selection
                        .enter()
                        .attr('id', (d: any) => d.name)
                        .select('g.left-handle')
                        .append('text')
                        .attr('x', 5)
                        .attr('y', -5);
                    selection.enter().select('g.right-handle').remove();
                    selection.enter().select('line').attr('class', 'redline');
                    selection
                        .select('g.left-handle text')
                        .text((d: any) => d.name + ' - ' + valueFormatter(d.value));
                    selection
                        .enter()
                        .select('line')
                        .on('mouseout', (event: any) => {
                            d3.select(event.currentTarget).style('cursor', 'default');
                        });
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
                            scaleData.yScale.domain(
                                translate.rescaleY(scaleData.yScaleCopy).domain(),
                            );
                        } else {
                            yOffset = event.transform.y - lastY;
                        }

                        render();
                    }) as any;

                const yAxisZoom = d3
                    .zoom()
                    .scaleExtent([1, 10])
                    .on('zoom', (event: any) => {
                        if (event.sourceEvent && event.sourceEvent.type != 'wheel') {
                            lastY = event.transform.y - yOffset;
                            const translate = d3.zoomIdentity.translate(0, lastY);
                            scaleData.yScale.domain(
                                translate.rescaleY(scaleData.yScaleCopy).domain(),
                            );
                        } else {
                            yOffset = event.transform.y - lastY;
                        }

                        render();
                    }) as any;

                const yAxisDrag = d3.drag().on('drag', (event: any) => {
                    const factor = Math.pow(2, -event.dy * 0.01);
                    d3.select(d3PlotArea.current).call(yAxisZoom.scaleBy, factor);
                }) as any;

                const candleJoin = d3fc.dataJoin('g', 'candle');
                const targetsJoin = d3fc.dataJoin('g', 'targets');
                const barJoin = d3fc.dataJoin('g', 'bar');
                const crosshairHorizontalJoin = d3fc.dataJoin('g', 'crosshairHorizontal');
                const crosshairVerticalJoin = d3fc.dataJoin('g', 'crosshairVertical');

                // handle the plot area measure event in order to compute the scale ranges
                d3.select(d3PlotArea.current).on('measure', function (event: any) {
                    scaleData.xScale.range([0, event.detail.width]);
                    scaleData.yScale.range([event.detail.height, 0]);

                    scaleData.liquidityTickScale.range([event.detail.height, 0]);
                    scaleData.liquidityScale.range([event.detail.width, event.detail.width / 2]);
                });

                d3.select(d3PlotArea.current).on('draw', function (event: any) {
                    const svg = d3.select(event.target).select('svg');

                    crosshairHorizontalJoin(svg, [crosshairData]).call(crosshairHorizontal);
                    crosshairVerticalJoin(svg, [crosshairData]).call(crosshairVertical);
                    barJoin(svg, [liquidityData]).call(barSeries);
                    candleJoin(svg, [chartData]).call(candlestick);
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
                    render();
                });

                d3.select(d3Yaxis.current)
                    .on('mouseover', (event: any) => {
                        d3.select(event.currentTarget).style('cursor', 'ns-resize');
                    })
                    .call(yAxisDrag);

                render();
            }
        },
        [],
    );

    // Set selected candle transactions
    useEffect(() => {
        if (isChartSelected !== undefined && transactionFilter !== undefined) {
            props.changeState(isChartSelected, transactionFilter);
        }
    }, [isChartSelected, transactionFilter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const reustls: boolean[] = [];

            ranges.map((mapData) => {
                props.targetData?.map((data) => {
                    if (mapData.name === data.name && mapData.value == data.value) {
                        reustls.push(true);
                    }
                });
            });

            if (reustls.length < 2) {
                const low = ranges.filter((target: any) => target.name === 'Min')[0].value;
                const high = ranges.filter((target: any) => target.name === 'Max')[0].value;

                if (!isAdvancedModeActive) {
                    dispatch(setPinnedMinPrice(low));
                    dispatch(setPinnedMaxPrice(high));

                    if (spotPriceDisplay !== undefined && (isHighMoved || isLowMoved)) {
                        const val = spotPriceDisplay.replace(',', '');

                        const dragLimit = parseFloat(val) / 100;

                        const difference = isHighMoved
                            ? high - parseFloat(val)
                            : isLowMoved
                            ? parseFloat(val) - low
                            : 1;

                        if (!(dragLimit > difference)) {
                            const percentage = (difference * 100) / parseFloat(val);

                            setIsHighMoved(false);
                            setIsLowMoved(false);
                            dispatch(setSimpleRangeWidth(Math.round(percentage)));
                        }
                    } else {
                        dispatch(setSimpleRangeWidth(simpleRangeWidth!));
                    }
                } else {
                    const newTargetData: targetData[] = [
                        {
                            name: 'Max',
                            value: ranges.filter((target: any) => target.name === 'Max')[0].value,
                        },
                        {
                            name: 'Min',
                            value: ranges.filter((target: any) => target.name === 'Min')[0].value,
                        },
                    ];

                    dispatch(setTargetData(newTargetData));
                }
            }
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
                    <div
                        style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'row',
                            overflow: 'hidden',
                        }}
                    >
                        <d3fc-svg
                            ref={d3PlotArea}
                            className='plot-area'
                            style={{ flex: 1, overflow: 'visible' }}
                        ></d3fc-svg>
                        <d3fc-svg
                            className='y-axis'
                            ref={d3Yaxis}
                            style={{ width: '3em' }}
                        ></d3fc-svg>
                    </div>

                    {showFeeRate && (
                        <>
                            <hr />
                            <label>
                                Fee Rate{' '}
                                {formatDollarAmountAxis(
                                    subChartValues.filter(
                                        (value: any) => value.name === 'feeRate',
                                    )[0].value,
                                )}
                            </label>
                            <FeeRateSubChart
                                feeData={props.feeData}
                                crosshairData={crosshairData}
                                setsubChartValues={setsubChartValues}
                            />
                        </>
                    )}

                    {showTvl && (
                        <>
                            <hr />
                            <label>
                                TVL{' '}
                                {formatDollarAmountAxis(
                                    subChartValues.filter((value: any) => value.name === 'tvl')[0]
                                        .value,
                                )}
                            </label>
                            <TvlSubChart
                                tvlData={props.tvlData}
                                crosshairData={crosshairData}
                                setsubChartValues={setsubChartValues}
                            />
                        </>
                    )}

                    {showVolume === true && (
                        <>
                            <hr />
                            <label>
                                Volume{' '}
                                {formatDollarAmountAxis(
                                    subChartValues.filter(
                                        (value: any) => value.name === 'volume',
                                    )[0].value,
                                )}
                            </label>
                            <VolumeSubChart
                                volumeData={props.volumeData}
                                crosshairData={crosshairData}
                                setsubChartValues={setsubChartValues}
                            />
                        </>
                    )}

                    <d3fc-svg
                        ref={d3Xaxis}
                        className='x-axis'
                        style={{ height: '2em', marginRight: '3em', width: '100%' }}
                    ></d3fc-svg>
                </div>
            </d3fc-group>
        </div>
    );
}
