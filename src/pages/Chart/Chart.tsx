import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import moment from 'moment';
import { DetailedHTMLProps, HTMLAttributes, useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../utils/hooks/reduxToolkit';
import {
    formatAmountChartData,
    formatAmountWithoutDigit,
    formatDollarAmountAxis,
} from '../../utils/numbers';
import { CandleData } from '../../utils/state/graphDataSlice';
import {
    setLimitTick,
    setRangeHighLineTriggered,
    setRangeLowLineTriggered,
    setRangeModuleTriggered,
    setSimpleRangeWidth,
    setTargetData,
    targetData,
    candleDomain,
    setCandleDomains,
} from '../../utils/state/tradeDataSlice';
import { CandleChartData } from '../Trade/TradeCharts/TradeCharts';
import FeeRateSubChart from '../Trade/TradeCharts/TradeChartsLoading/FeeRateSubChart';
import TvlSubChart from '../Trade/TradeCharts/TradeChartsLoading/TvlSubChart';
import VolumeSubChart from '../Trade/TradeCharts/TradeChartsLoading/VolumeSubChart';
import { ChartUtils } from '../Trade/TradeCharts/TradeCandleStickChart';
import './Chart.css';
import {
    ChainSpec,
    CrocPoolView,
    pinTickLower,
    pinTickUpper,
    tickToPrice,
} from '@crocswap-libs/sdk';
import { getPinnedPriceValuesFromDisplayPrices } from '../Trade/Range/rangeFunctions';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';

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
    pool: CrocPoolView | undefined;
    chainData: ChainSpec;
    isTokenABase: boolean;
    expandTradeTable: boolean;
    candleData: ChartUtils | undefined;
    liquidityData: any;
    changeState: (isOpen: boolean | undefined, candleData: CandleData | undefined) => void;
    denomInBase: boolean;
    limitTick: number;
    isAdvancedModeActive: boolean | undefined;
    simpleRangeWidth: number | undefined;
    pinnedMinPriceDisplayTruncated: number | undefined;
    pinnedMaxPriceDisplayTruncated: number | undefined;
    truncatedPoolPrice: number | undefined;
    poolPriceDisplay: number | undefined;
    chartItemStates: chartItemStates;
    setCurrentData: React.Dispatch<React.SetStateAction<CandleChartData | undefined>>;
    upBodyColor: string;
    upBorderColor: string;
    downBodyColor: string;
    downBorderColor: string;
    isCandleAdded: boolean | undefined;
    scaleData: any;
    chainId: string;
}

export default function Chart(props: ChartData) {
    const {
        pool,
        chainData,
        isTokenABase,
        denomInBase,
        isAdvancedModeActive,
        pinnedMinPriceDisplayTruncated,
        pinnedMaxPriceDisplayTruncated,
        simpleRangeWidth,
        poolPriceDisplay,
        expandTradeTable,
        isCandleAdded,
        scaleData,
        chainId,
    } = props;

    const tradeData = useAppSelector((state) => state.tradeData);
    const targetData = tradeData.targetData;
    const rangeModuleTriggered = tradeData.rangeModuleTriggered;

    const rangeLowLineTriggered = tradeData.rangeLowLineTriggered;
    const rangeHighLineTriggered = tradeData.rangeHighLineTriggered;

    const { showFeeRate, showTvl, showVolume } = props.chartItemStates;
    const { upBodyColor, upBorderColor, downBodyColor, downBorderColor } = props;

    const parsedChartData = props.candleData;

    const d3Container = useRef(null);
    const d3PlotArea = useRef(null);

    const d3Xaxis = useRef(null);
    const d3Yaxis = useRef(null);
    const dispatch = useAppDispatch();

    const location = useLocation();

    const { tokenA, tokenB } = tradeData;
    const tokenADecimals = tokenA.decimals;
    const tokenBDecimals = tokenB.decimals;
    const baseTokenDecimals = isTokenABase ? tokenADecimals : tokenBDecimals;
    const quoteTokenDecimals = !isTokenABase ? tokenADecimals : tokenBDecimals;

    const [ranges, setRanges] = useState([
        {
            name: 'Min',
            value: 0,
        },
        {
            name: 'Max',
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

    // Axes
    const [yAxis, setYaxis] = useState<any>();
    const [xAxis, setXaxis] = useState<any>();

    // Rules
    const [dragControl, setDragControl] = useState(false);
    const [rescale, setRescale] = useState(true);
    const [zoomAndYdragControl, setZoomAndYdragControl] = useState();
    const [rescaleText, setRescaleText] = useState<any>();
    const [isMouseMoveCrosshair, setIsMouseMoveCrosshair] = useState(false);
    const [crosshairXForSubChart, setCrosshairXForSubChart] = useState(0);
    const [isMouseMoveForSubChart, setIsMouseMoveForSubChart] = useState(false);
    const [mouseMoveEventForSubChart, setMouseMoveEventForSubChart] = useState<any>();

    // Data
    const [crosshairData, setCrosshairData] = useState([{ x: 0, y: -1 }]);
    const [currentPriceData] = useState([{ value: -1 }]);
    const [indicatorLineData] = useState([{ x: 0, y: 0 }]);
    const [liqTooltipSelectedLiqBar, setLiqTooltipSelectedLiqBar] = useState({
        activeLiq: 0,
        liqPrices: 0,
    });

    // d3
    const [selectedDate, setSelectedDate] = useState<any>();

    // Crosshairs
    const [liqTooltip, setLiqTooltip] = useState<any>();
    // const [highlightedCurrentPriceLine, setHighlightedCurrentPriceLine] = useState<any>();
    const [indicatorLine, setIndicatorLine] = useState<any>();
    const [crosshairHorizontal, setCrosshairHorizontal] = useState<any>();
    const [crosshairVertical, setCrosshairVertical] = useState<any>();
    const [candlestick, setCandlestick] = useState<any>();

    // Line Series
    const [ghostLines, setGhostLines] = useState<any>();
    const [horizontalLine, setHorizontalLine] = useState<any>();
    const [marketLine, setMarketLine] = useState<any>();
    const [limitLine, setLimitLine] = useState<any>();

    // Line Joins
    const [targetsJoin, setTargetsJoin] = useState<any>();
    const [targetsAreaJoin, setTargetsAreaJoin] = useState<any>();
    const [marketJoin, setMarketJoin] = useState<any>();
    const [limitJoin, setLimitJoin] = useState<any>();

    // Liq Series
    const [liqAskSeries, setLiqAskSeries] = useState<any>();
    const [liqBidSeries, setLiqBidSeries] = useState<any>();
    const [liqHighligtedAskSeries, setLiqHighligtedAskSeries] = useState<any>();
    const [liqHighligtedBidSeries, setLiqHighligtedBidSeries] = useState<any>();

    // Liq Joins
    const [areaAskJoin, setAreaAskJoin] = useState<any>();
    const [areaBidJoin, setAreaBidJoin] = useState<any>();
    const [liqHighligtedAskJoin, setLiqHighligtedAskJoin] = useState<any>();
    const [liqHighligtedBidJoin, setLiqHighligtedBidJoin] = useState<any>();

    // Utils
    const [zoomUtils, setZoomUtils] = useState<any>();
    const [popupHeight, setPopupHeight] = useState<any>();
    const [dragRange, setDragRange] = useState<any>();
    const [dragLimit, setDragLimit] = useState<any>();

    const valueFormatter = d3.format('.5f');

    const setDefaultRangeData = () => {
        setRanges((prevState) => {
            const newTargets = [...prevState];
            newTargets.filter((target: any) => target.name === 'Max')[0].value =
                props.liquidityData !== undefined
                    ? props.liquidityData.liqData[0].liqPrices
                    : Infinity;
            newTargets.filter((target: any) => target.name === 'Min')[0].value = 0;

            return newTargets;
        });
    };

    useEffect(() => {
        addDefsStyle();
    }, []);

    const render = useCallback(() => {
        const nd = d3.select('#d3fc_group').node() as any;
        nd.requestRedraw();
    }, []);

    useEffect(() => {
        if (expandTradeTable) return;

        render();
    }, [props.chartItemStates, expandTradeTable, isCandleAdded]);

    function addText(scale: any) {
        if (location.pathname.includes('market')) {
            yAxis.tickValues([
                ...scale.ticks(),
                ...[market[0].value, isMouseMoveCrosshair ? crosshairData[0].y : 0],
            ]);

            yAxis.decorate((selection: any) => {
                selection
                    .attr('filter', (d: any) => {
                        if (isMouseMoveCrosshair && d === crosshairData[0].y) {
                            return 'url(#crossHairBg)';
                        }
                        if (d === market[0].value) {
                            return 'url(#marketBg)';
                        }
                    })
                    .select('text')
                    .attr('class', (d: any) => {
                        if (isMouseMoveCrosshair && d === crosshairData[0].y) {
                            return 'crossHairText';
                        }
                        if (d === market[0].value) {
                            return 'market';
                        }
                    });
            });
        } else {
            location.pathname.includes('limit')
                ? yAxis.tickValues([
                      ...scale.ticks(),
                      ...[
                          limit[0].value,
                          market[0].value,
                          isMouseMoveCrosshair ? crosshairData[0].y : 0,
                      ],
                  ])
                : yAxis.tickValues([
                      ...scale.ticks(),
                      ...[
                          ranges[0].value,
                          ranges[1].value,
                          market[0].value,
                          isMouseMoveCrosshair ? crosshairData[0].y : 0,
                      ],
                  ]);

            yAxis.decorate((selection: any) => {
                selection
                    .attr('filter', (d: any) => {
                        if (isMouseMoveCrosshair && d === crosshairData[0].y) {
                            return 'url(#crossHairBg)';
                        }

                        if (
                            location.pathname.includes('limit')
                                ? d === limit[0].value
                                : d === ranges[0].value || d === ranges[1].value
                        ) {
                            if (
                                location.pathname.includes('limit') &&
                                d === limit[0].value &&
                                market[0].value > limit[0].value
                            ) {
                                return 'url(#textLowBg)';
                            }
                            return 'url(#textBg)';
                        }
                        if (d === market[0].value) {
                            return 'url(#marketBg)';
                        }
                    })
                    .select('text')
                    .attr('class', (d: any) => {
                        if (
                            d === market[0].value ||
                            (location.pathname.includes('limit') &&
                                d === limit[0].value &&
                                market[0].value > limit[0].value)
                        ) {
                            return 'market';
                        }
                        if (isMouseMoveCrosshair && d === crosshairData[0].y) {
                            return 'crossHairText';
                        }
                        if (
                            location.pathname.includes('limit')
                                ? d === limit[0].value
                                : d === ranges[0].value || d === ranges[1].value
                        ) {
                            return 'y_axis';
                        }
                    });
            });
            // }
        }
    }

    // crosshair x text
    useEffect(() => {
        if (scaleData && xAxis) {
            if (isMouseMoveCrosshair) {
                xAxis
                    .tickValues([...scaleData.xScale.ticks(), ...[crosshairData[0].x]])
                    .tickFormat((d: any) => {
                        if (d === crosshairData[0].x) {
                            return moment(d).format('DD MMM  HH:mm');
                        }

                        return d3.timeFormat('%d/%m/%y')(d);
                    });

                xAxis.decorate((selection: any) => {
                    selection
                        .attr('filter', (d: any) => {
                            if (isMouseMoveCrosshair && d === crosshairData[0].x) {
                                return 'url(#crossHairBg)';
                            }
                        })
                        .select('text')
                        .attr('class', (d: any) => {
                            if (isMouseMoveCrosshair && d === crosshairData[0].x) {
                                return 'crossHairText';
                            }
                        });
                });
            }
        }
    }, [crosshairData, isMouseMoveCrosshair, zoomAndYdragControl]);

    useEffect(() => {
        if (scaleData && yAxis) {
            addText(scaleData.yScale);
        }
    }, [
        dragControl,
        scaleData,
        location,
        scaleData && scaleData.yScale.domain(),
        zoomAndYdragControl,
        ranges,
        limit,
        market,
        crosshairData,
        isMouseMoveCrosshair,
    ]);

    useEffect(() => {
        if (location.pathname.includes('range')) {
            d3.select(d3PlotArea.current).select('.targets').style('visibility', 'visible');
            d3.select(d3PlotArea.current)
                .select('.targets')
                .selectAll('.horizontal')
                .style('visibility', 'visible');

            d3.select(d3PlotArea.current).select('.targetsArea').style('visibility', 'visible');

            d3.select(d3PlotArea.current)
                .select('.targets')
                .select('.annotation-line')
                .on('mouseover', (event: any) => {
                    d3.select(event.currentTarget)
                        .select('.detector')
                        .style('cursor', 'row-resize');
                });

            d3.select(d3PlotArea.current).select('.limit').style('visibility', 'hidden');
            d3.select(d3Container.current)
                .select('.limit')
                .select('.horizontal')
                .style('visibility', 'hidden');
        } else if (location.pathname.includes('limit')) {
            d3.select(d3PlotArea.current).select('.limit').style('visibility', 'visible');
            d3.select(d3PlotArea.current)
                .select('.targetsArea')
                .selectAll('.horizontal')
                .style('visibility', 'hidden');
            d3.select(d3PlotArea.current)
                .select('.limit')
                .select('.horizontal')
                .style('visibility', 'visible');
            d3.select(d3PlotArea.current)
                .select('.limit')
                .select('.annotation-line')
                .on('mouseover', (event: any) => {
                    d3.select(event.currentTarget)
                        .select('.detector')
                        .style('cursor', 'row-resize');
                });

            d3.select(d3Container.current)
                .select('.targetsArea')
                .style('visibility', 'hidden')
                .style('filter', 'none');
            d3.select(d3PlotArea.current).select('.targetsArea').style('visibility', 'hidden');
            d3.select(d3Container.current)
                .select('.targets')
                .selectAll('.horizontal')
                .style('visibility', 'hidden')
                .style('filter', 'none');
        } else if (location.pathname.includes('market')) {
            d3.select(d3Container.current).select('.limit').style('visibility', 'hidden');
            d3.select(d3Container.current)
                .select('.limit')
                .select('.horizontal')
                .style('visibility', 'hidden');

            d3.select(d3Container.current)
                .select('.targetsArea')
                .style('visibility', 'hidden')
                .style('filter', 'none');
            d3.select(d3PlotArea.current).select('.targetsArea').style('visibility', 'hidden');
            d3.select(d3PlotArea.current)
                .select('.targetsArea')
                .selectAll('.horizontal')
                .style('visibility', 'hidden');

            d3.select(d3Container.current)
                .select('.targets')
                .selectAll('.horizontal')
                .style('visibility', 'hidden')
                .style('filter', 'none');
        }
    }, [location]);

    // Zoom
    useEffect(() => {
        if (scaleData !== undefined) {
            let domainBoundary = scaleData.xScaleCopy.domain();
            let candleDomain: candleDomain;
            let lastY = 0;
            let date: any | undefined = undefined;

            const zoom = d3
                .zoom()
                .scaleExtent([0.3, 5])
                .on('start', (event: any) => {
                    if (event.sourceEvent && event.sourceEvent.type != 'wheel') {
                        d3.select(d3Container.current).style('cursor', 'grabbing');
                    }

                    if (date === undefined) {
                        date = parsedChartData?.chartData[0].date;
                    }
                })
                .on('zoom', (event: any) => {
                    if (event.sourceEvent && event.sourceEvent.type !== 'dblclick') {
                        const t = event.transform;

                        if (
                            event.transform.rescaleX(scaleData.xScaleCopy).domain()[0] <
                            domainBoundary[0]
                        ) {
                            domainBoundary = scaleData.xScale.domain();
                        }

                        if (
                            domainBoundary[0] >
                            event.transform.rescaleX(scaleData.xScaleCopy).domain()[0]
                        ) {
                            candleDomain = {
                                lastCandleDate: parsedChartData?.chartData[0].time,
                                domainBoundry: date.getTime(),
                            };

                            if (event.transform.rescaleX(scaleData.xScaleCopy).domain()[0] < date) {
                                date.setTime(
                                    new Date(
                                        event.transform.rescaleX(scaleData.xScaleCopy).domain()[0],
                                    ).getTime() -
                                        100 * parsedChartData?.period * 1000,
                                );

                                candleDomain = {
                                    lastCandleDate: parsedChartData?.chartData[0].time,
                                    domainBoundry: date.getTime(),
                                };

                                dispatch(setCandleDomains(candleDomain));
                            }
                        }

                        if (rescale) {
                            const xmin = new Date(Math.floor(scaleData.xScale.domain()[0]));
                            const xmax = new Date(Math.floor(scaleData.xScale.domain()[1]));

                            const filtered = parsedChartData?.chartData.filter(
                                (data: any) => data.date >= xmin && data.date <= xmax,
                            );

                            if (filtered !== undefined) {
                                const minYBoundary = d3.min(filtered, (d) => d.low);
                                const maxYBoundary = d3.max(filtered, (d) => d.high);

                                if (maxYBoundary !== undefined && minYBoundary !== undefined) {
                                    const buffer = Math.floor((maxYBoundary - minYBoundary) * 0.1);

                                    scaleData.yScale.domain([
                                        minYBoundary - buffer,
                                        maxYBoundary + buffer,
                                    ]);
                                }
                            }
                        }

                        scaleData.xScale.domain(
                            event.transform.rescaleX(scaleData.xScaleCopy).domain(),
                        );

                        // PANNING
                        if (!rescale && event.sourceEvent && event.sourceEvent.type != 'wheel') {
                            const domainY = scaleData.yScale.domain();
                            const linearY = d3
                                .scaleLinear()
                                .domain(scaleData.yScale.range())
                                .range([domainY[1] - domainY[0], 0]);

                            const deltaY = linearY(t.y - lastY);

                            scaleData.yScale.domain([domainY[0] + deltaY, domainY[1] + deltaY]);
                        }

                        // setCrosshairXForSubChart(scaleData.xScale(crosshairData[0].x));

                        lastY = t.y;

                        render();
                    }

                    setZoomAndYdragControl(event);
                })
                .on('end', (event: any) => {
                    if (event.sourceEvent && event.sourceEvent.type != 'wheel') {
                        d3.select(d3Container.current).style('cursor', 'default');
                    }

                    // dispatch(setCandleDomains(candleDomain));
                }) as any;

            const yAxisDrag = d3.drag().on('drag', async (event: any) => {
                const dy = event.dy;
                const factor = Math.pow(2, -dy * 0.003);
                const domain = scaleData.yScale.domain();
                const center = (domain[1] + domain[0]) / 2;
                const size = (domain[1] - domain[0]) / 2 / factor;
                await scaleData.yScale.domain([center - size, center + size]);
                setZoomAndYdragControl(event);
                setRescale(() => {
                    return false;
                });

                setMarketLineValue();
                render();
            });

            setZoomUtils(() => {
                return {
                    zoom: zoom,
                    yAxisDrag: yAxisDrag,
                };
            });
        }
    }, [parsedChartData?.chartData, scaleData, rescale, location]);

    useEffect(() => {
        if (scaleData !== undefined) {
            if (rescale) {
                const xmin = new Date(Math.floor(scaleData.xScale.domain()[0]));
                const xmax = new Date(Math.floor(scaleData.xScale.domain()[1]));

                const filtered = parsedChartData?.chartData.filter(
                    (data: any) => data.date >= xmin && data.date <= xmax,
                );

                if (filtered !== undefined) {
                    const minYBoundary = d3.min(filtered, (d) => d.low);
                    const maxYBoundary = d3.max(filtered, (d) => d.high);

                    if (maxYBoundary !== undefined && minYBoundary !== undefined) {
                        const buffer = Math.floor((maxYBoundary - minYBoundary) * 0.1);

                        scaleData.yScale.domain([minYBoundary - buffer, maxYBoundary + buffer]);
                    }
                }
            }
        }
    }, [parsedChartData?.chartData]);

    const setMarketLineValue = () => {
        const lastCandlePrice = parsedChartData?.chartData[0]?.close;

        setMarket(() => {
            return [
                {
                    name: 'Current Market Price',
                    value: lastCandlePrice !== undefined ? lastCandlePrice : 0,
                },
            ];
        });
    };

    useEffect(() => {
        setLimitLineValue();
    }, [tradeData.limitTick]);

    const setLimitLineValue = () => {
        const limitDisplayPrice = denomInBase
            ? pool?.toDisplayPrice(tickToPrice(tradeData.limitTick))
            : pool?.toDisplayPrice(tickToPrice(tradeData.limitTick));

        limitDisplayPrice?.then((limit) => {
            setLimit([
                {
                    name: 'Limit',
                    value: limit || 0,
                },
            ]);
        });
    };

    const setBalancedLines = () => {
        if (simpleRangeWidth === 100 || rangeModuleTriggered) {
            const results: boolean[] = [];

            if (simpleRangeWidth === 100) {
                ranges.map((mapData) => {
                    if (mapData.value === 0) {
                        results.push(true);
                    }
                });

                if (results.length === 2) {
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
            dispatch(setRangeModuleTriggered(false));
        }
    };

    const setAdvancedLines = () => {
        const results: boolean[] = [];
        ranges.map((mapData) => {
            targetData?.map((data) => {
                if (mapData.name === data.name && mapData.value == data.value) {
                    results.push(true);
                }
            });
        });

        if (
            targetData === undefined ||
            (targetData[0].value === undefined && targetData[1].value === undefined)
        ) {
            setRanges([
                {
                    name: 'Min',
                    value: tradeData.pinnedMinPriceDisplayTruncated
                        ? tradeData.pinnedMinPriceDisplayTruncated
                        : 0,
                },
                {
                    name: 'Max',
                    value: tradeData.pinnedMaxPriceDisplayTruncated
                        ? tradeData.pinnedMaxPriceDisplayTruncated
                        : 0,
                },
            ]);
        } else if (results.length < 2) {
            setRanges(() => {
                let high = targetData?.filter((target: any) => target.name === 'Max')[0].value;
                const low = targetData?.filter((target: any) => target.name === 'Min')[0].value;

                if (high !== undefined && low !== undefined) {
                    if (high !== 0 && high < low) {
                        high = low + low / 100;
                    }

                    const chartTargets = [
                        {
                            name: 'Min',
                            value:
                                low !== undefined && low !== 0
                                    ? low
                                    : props.candleData !== undefined
                                    ? Math.min(
                                          ...props.candleData.chartData.map((o) => {
                                              return o.close !== undefined ? o.close : Infinity;
                                          }),
                                      )
                                    : 0,
                        },
                        {
                            name: 'Max',
                            value:
                                high !== undefined && high !== 0
                                    ? high
                                    : props.candleData !== undefined
                                    ? Math.max(
                                          ...props.candleData.chartData.map((o) => {
                                              return o.open !== undefined ? o.open : 0;
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
        dispatch(setRangeHighLineTriggered(false));
        dispatch(setRangeLowLineTriggered(false));
        dispatch(setRangeModuleTriggered(false));
    };

    // Targets
    useEffect(() => {
        setMarketLineValue();
        if (location.pathname.includes('limit')) {
            setLimitLineValue();
        }
    }, [location, props.limitTick, denomInBase]);

    useEffect(() => {
        if (location.pathname.includes('range')) {
            if (!isAdvancedModeActive) {
                setBalancedLines();
            } else if (isAdvancedModeActive) {
                if (
                    rangeLowLineTriggered === undefined ||
                    rangeHighLineTriggered === undefined ||
                    rangeModuleTriggered
                ) {
                    setAdvancedLines();
                }
            }
        }
    }, [
        location,
        targetData,
        denomInBase,
        isAdvancedModeActive,
        simpleRangeWidth,
        rangeModuleTriggered,
    ]);

    // Ghost Lines
    useEffect(() => {
        if (scaleData !== undefined) {
            const ghostLines = d3fc
                .annotationSvgLine()
                .value((d: any) => d.pinnedMaxPriceDisplayTruncated)
                .xScale(scaleData.xScale)
                .yScale(scaleData.yScale);

            ghostLines.decorate((selection: any) => {
                selection.enter().attr('id', (d: any) => d.name);
                selection.enter().select('g.right-handle').remove();
                selection.enter().select('g.left-handle').remove();
                selection.enter().select('line').attr('class', 'ghostline');
            });
            setGhostLines(() => {
                return ghostLines;
            });
        }
    }, [scaleData]);

    // Drag Type
    useEffect(() => {
        if (scaleData) {
            const snap = (data: any, value: any) => {
                if (value == undefined) return [];

                const filtered =
                    data.length > 1
                        ? data.filter((d: any) => d.pinnedMaxPriceDisplayTruncated != null)
                        : data;

                const nearest = filtered.reduce(function (prev: any, curr: any) {
                    return Math.abs(curr.pinnedMaxPriceDisplayTruncated - value) <
                        Math.abs(prev.pinnedMaxPriceDisplayTruncated - value)
                        ? curr
                        : prev;
                });

                return [
                    {
                        value: nearest.pinnedMaxPriceDisplayTruncated,
                        index: filtered.findIndex((liqData: any) => liqData === nearest),
                    },
                ];
            };

            let newLimitValue: any;
            let newRangeValue: any;

            let lowLineMoved: any;
            let highLineMoved: any;

            const dragRange = d3
                .drag()
                .on('start', () => {
                    d3.select(d3Container.current).style('cursor', 'grabbing');
                    d3.select(d3Container.current).select('.targets').style('cursor', 'grabbing');
                })
                .on('drag', function (event, d: any) {
                    d3.select(d3Container.current)
                        .select('.ghostLines')
                        .selectAll('.horizontal')
                        .style('visibility', 'visible');

                    const snapResponse = snap(
                        props.liquidityData.liqSnapData,
                        scaleData.yScale.invert(d3.pointer(event)[1] - 200),
                    );

                    const snappedValue = Math.round(snapResponse[0].value * 100) / 100;
                    const snappedValueIndex = snapResponse[0].index;

                    const neighborValues: any[] = [];

                    for (let i = -3; i < 4; i++) {
                        neighborValues.push(props.liquidityData.liqSnapData[snappedValueIndex + i]);
                    }

                    const ghostJoin = d3fc.dataJoin('g', 'ghostLines');

                    if (!isAdvancedModeActive) {
                        let valueWithRange: number;

                        if (d.name === 'Max') {
                            setRanges((prevState) => {
                                const newTargets = [...prevState];

                                const low = newTargets.filter(
                                    (target: any) => target.name === 'Min',
                                )[0].value;

                                const displayValue =
                                    poolPriceDisplay !== undefined ? poolPriceDisplay : 0;

                                const dragLimit = displayValue / 100.0;

                                valueWithRange =
                                    newTargets.filter((target: any) => target.name === 'Max')[0]
                                        .value - snappedValue;

                                if (snappedValue > displayValue + dragLimit) {
                                    newTargets.filter(
                                        (target: any) => target.name === 'Max',
                                    )[0].value = snappedValue;

                                    newTargets.filter(
                                        (target: any) => target.name === 'Min',
                                    )[0].value = snap(
                                        props.liquidityData.liqSnapData,
                                        low + valueWithRange,
                                    )[0].value;

                                    render();
                                } else {
                                    newTargets.filter(
                                        (target: any) => target.name === 'Max',
                                    )[0].value = snap(
                                        props.liquidityData.liqSnapData,
                                        displayValue + dragLimit * 1.01,
                                    )[0].value;

                                    newTargets.filter(
                                        (target: any) => target.name === 'Min',
                                    )[0].value = snap(
                                        props.liquidityData.liqSnapData,
                                        displayValue - dragLimit * 1.01,
                                    )[0].value;

                                    render();
                                }
                                newRangeValue = newTargets;
                                return newTargets;
                            });
                            highLineMoved = true;
                        } else {
                            setRanges((prevState) => {
                                const newTargets = [...prevState];

                                const displayValue =
                                    poolPriceDisplay !== undefined ? poolPriceDisplay : 0;
                                const dragLimit = displayValue / 100.0;

                                valueWithRange =
                                    newTargets.filter((target: any) => target.name === 'Min')[0]
                                        .value - snappedValue;

                                const high = newTargets.filter(
                                    (target: any) => target.name === 'Max',
                                )[0].value;

                                if (snappedValue < displayValue - dragLimit) {
                                    newTargets.filter(
                                        (target: any) => target.name === 'Min',
                                    )[0].value = snappedValue;

                                    newTargets.filter(
                                        (target: any) => target.name === 'Max',
                                    )[0].value = snap(
                                        props.liquidityData.liqSnapData,
                                        high + valueWithRange,
                                    )[0].value;

                                    render();
                                } else {
                                    newTargets.filter(
                                        (target: any) => target.name === 'Max',
                                    )[0].value = snap(
                                        props.liquidityData.liqSnapData,
                                        displayValue + dragLimit * 1.01,
                                    )[0].value;

                                    newTargets.filter(
                                        (target: any) => target.name === 'Min',
                                    )[0].value = snap(
                                        props.liquidityData.liqSnapData,
                                        displayValue - dragLimit * 1.01,
                                    )[0].value;

                                    render();
                                }

                                newRangeValue = newTargets;
                                return newTargets;
                            });
                            lowLineMoved = true;
                        }
                    } else {
                        setRanges((prevState) => {
                            const newTargets = [...prevState];

                            const low = newTargets.filter((target: any) => target.name === 'Min')[0]
                                .value;

                            const high = newTargets.filter(
                                (target: any) => target.name === 'Max',
                            )[0].value;

                            if (d.name === 'Max' && snappedValue > low) {
                                newTargets.filter(
                                    (target: any) => target.name === d.name,
                                )[0].value = snappedValue;
                            } else if (d.name === 'Min' && snappedValue < high) {
                                newTargets.filter(
                                    (target: any) => target.name === d.name,
                                )[0].value = snappedValue;
                            } else if (d.name === 'Max' && snappedValue < low) {
                                newTargets.filter((target: any) => target.name === 'Max')[0].value =
                                    snappedValue;
                            } else if (d.name === 'Min' && snappedValue > high) {
                                newTargets.filter((target: any) => target.name === 'Min')[0].value =
                                    snappedValue;
                            }

                            render();

                            newRangeValue = newTargets;

                            return newTargets;
                        });
                        highLineMoved = true;
                        lowLineMoved = true;
                    }

                    d3.select(d3PlotArea.current).on('draw', async function (event: any) {
                        const svg = d3.select(event.target).select('svg');

                        ghostJoin(svg, [neighborValues]).call(ghostLines);
                        targetsJoin(svg, [newRangeValue]).call(horizontalLine);
                    });
                })
                .on('end', () => {
                    d3.select(d3Container.current).style('cursor', 'default');

                    d3.select(d3Container.current)
                        .select('.ghostLines')
                        .selectAll('.horizontal')
                        .remove();

                    onBlurRange(newRangeValue, highLineMoved, lowLineMoved);
                });

            const dragLimit = d3
                .drag()
                .on('start', () => {
                    d3.select(d3Container.current).style('cursor', 'row-resize');
                    d3.select(d3Container.current).select('.targets').style('cursor', 'row-resize');
                })
                .on('drag', function (event) {
                    // d3.select(d3Container.current)
                    //     .select('.ghostLines')
                    //     .selectAll('.horizontal')
                    //     .style('visibility', 'visible');

                    // const snapResponse = snap(
                    //     props.liquidityData.liqSnapData,
                    //     scaleData.yScale.invert(d3.pointer(event)[1] - 215),
                    // );

                    // const snappedValueIndex = snapResponse[0].index;

                    // const neighborValues: any[] = [];

                    // for (let i = -3; i < 4; i++) {
                    //     neighborValues.push(props.liquidityData.liqSnapData[snappedValueIndex + i]);
                    // }

                    // const ghostJoin = d3fc.dataJoin('g', 'ghostLines');

                    newLimitValue = scaleData.yScale.invert(d3.pointer(event)[1] - 215);

                    d3.select(d3PlotArea.current).on('draw', async function (event: any) {
                        const svg = d3.select(event.target).select('svg');

                        // ghostJoin(svg, [neighborValues]).call(ghostLines);
                        limitJoin(svg, [[{ name: 'Limit', value: newLimitValue }]]).call(limitLine);
                    });

                    setLimit(() => {
                        return [{ name: 'Limit', value: newLimitValue }];
                    });
                })
                .on('end', () => {
                    d3.select(d3Container.current).style('cursor', 'default');

                    d3.select(d3Container.current)
                        .select('.ghostLines')
                        .selectAll('.horizontal')
                        .remove();

                    onBlurlimitRate(newLimitValue);
                });

            setDragRange(() => {
                return dragRange;
            });

            setDragLimit(() => {
                return dragLimit;
            });
        }
    }, [poolPriceDisplay, location, scaleData, isAdvancedModeActive, dragControl]);

    useEffect(() => {
        setDragControl(false);
    }, [parsedChartData]);

    useEffect(() => {
        if (rescaleText !== undefined) {
            rescaleText.style('fill', () =>
                rescale ? 'rgb(58, 60, 120)' : 'rgba(237, 231, 225, 0.2)',
            );
        }
    }, [rescale]);

    useEffect(() => {
        if (d3.select(d3Xaxis.current).select('svg').select('#rescale').node() == null) {
            const rescaleText = d3
                .select(d3Xaxis.current)
                .select('svg')
                .append('text')
                .attr('dx', '95%')
                .attr('dy', '60%')
                .attr('id', 'rescale')
                .style('font-size', '14px')
                .style('font-weight', 'bold')
                .style('fill', 'rgb(58, 60, 120)')
                .text('AUTO');

            rescaleText
                .on('mouseover', (event: any) => {
                    d3.select(event.currentTarget).style('cursor', 'pointer');
                })
                .on('click', () => {
                    setRescale((prevState) => {
                        rescaleText.style('fill', () =>
                            !prevState ? 'rgb(58, 60, 120)' : 'rgba(237, 231, 225, 0.2)',
                        );

                        return !prevState;
                    });
                });

            setRescaleText(() => {
                return rescaleText;
            });
        }

        if (d3.select(d3Xaxis.current).select('svg').select('#scroll').node() == null) {
            d3.select(d3Xaxis.current)
                .select('svg')
                .append('circle')
                .attr('id', 'scroll')
                .attr('cx', '90%')
                .attr('cy', '55%')
                .attr('r', 12)
                .attr('fill', 'rgba(41,47,63,0.8)')
                .attr('class', 'scroll')
                .on('mouseover', (event: any) => {
                    d3.select(event.currentTarget).style('cursor', 'pointer');
                    d3.select(d3Xaxis.current)
                        .select('svg')
                        .select('#scroll')
                        .attr('fill', 'rgba(41,47,63,1)');
                })
                .on('mouseleave', (event: any) => {
                    d3.select(event.currentTarget).style('cursor', 'pointer');
                    d3.select(d3Xaxis.current)
                        .select('svg')
                        .select('#scroll')
                        .attr('fill', 'rgba(41,47,63,0.8)');
                });
        }
    }, []);

    // y Axis
    useEffect(() => {
        if (scaleData) {
            const _yAxis = d3fc
                .axisRight()
                .scale(scaleData.yScale)
                .tickFormat((d: any) => formatAmountChartData(d));

            setYaxis(() => {
                return _yAxis;
            });

            const _xAxis = d3fc
                .axisBottom()
                .scale(scaleData.xScale)
                .tickArguments([6])
                .tickFormat((d: any) => {
                    return d3.timeFormat('%d/%m/%y')(d);
                });

            setXaxis(() => {
                return _xAxis;
            });
        }
    }, [scaleData]);

    // Horizontal Lines
    useEffect(() => {
        if (scaleData !== undefined) {
            const limitLine = d3fc
                .annotationSvgLine()
                .value((d: any) => d.value)
                .xScale(scaleData.xScale)
                .yScale(scaleData.yScale);

            limitLine.decorate((selection: any) => {
                selection
                    .enter()
                    .style('visibility', location.pathname.includes('limit') ? 'visible' : 'hidden')
                    .attr('id', (d: any) => d.name)
                    .select('g.left-handle')
                    .attr('x', 5)
                    .attr('y', -5);
                selection
                    .enter()
                    .append('rect')
                    .attr('width', '100%')
                    .attr('y', -20)
                    .attr('height', '8%')
                    .attr('fill', 'transparent')
                    .attr('stroke', 'none');

                selection.enter().select('g.right-handle').remove();
                selection
                    .select('line')
                    .attr('class', (d: any) => (d.value > market[0].value ? 'line' : 'lowline'));
            });

            const marketLine = d3fc
                .annotationSvgLine()
                .value((d: any) => d.value)
                .xScale(scaleData.xScale)
                .yScale(scaleData.yScale);

            marketLine.decorate((selection: any) => {
                selection
                    .enter()
                    .attr('id', (d: any) => d.name)
                    .select('g.left-handle')
                    .append('text')
                    .attr('x', 5)
                    .attr('y', -5);

                selection.enter().select('g.right-handle').remove();
                selection.enter().select('line').attr('class', 'marketLine');
                selection.select('g.left-handle').remove();
            });

            const horizontalLine = d3fc
                .annotationSvgLine()
                .value((d: any) => d.value)
                .xScale(scaleData.xScale)
                .yScale(scaleData.yScale);

            horizontalLine.decorate((selection: any) => {
                selection
                    .enter()
                    .attr('id', (d: any) => d.name)
                    .style('visibility', location.pathname.includes('range') ? 'visible' : 'hidden')
                    .select('g.left-handle')
                    .append('text')
                    .attr('x', 5)
                    .attr('y', -5);

                selection.enter().select('g.right-handle').remove();
                selection.enter().select('line').attr('class', 'line');
                selection.select('g.left-handle').remove();
            });

            const targetsJoin = d3fc.dataJoin('g', 'targets');
            const targetsAreaJoin = d3fc.dataJoin('g', 'targetsArea');

            const limitJoin = d3fc.dataJoin('g', 'limit');
            const marketJoin = d3fc.dataJoin('g', 'market');

            const liqTooltip = d3
                .select(d3Container.current)
                .append('div')
                .attr('class', 'liqTooltip')
                .style('visibility', 'hidden');

            setLiqTooltip(() => {
                return liqTooltip;
            });

            setTargetsJoin(() => {
                return targetsJoin;
            });

            setTargetsAreaJoin(() => {
                return targetsAreaJoin;
            });

            setLimitJoin(() => {
                return limitJoin;
            });

            setMarketJoin(() => {
                return marketJoin;
            });

            setHorizontalLine(() => {
                return horizontalLine;
            });

            setMarketLine(() => {
                return marketLine;
            });

            setLimitLine(() => {
                return limitLine;
            });
        }
    }, [scaleData, market]);

    // easy drag and triangle to horizontal lines for range
    async function addTriangleAndRect() {
        await d3
            .select(d3PlotArea.current)
            .select('.targets')
            .selectAll('.annotation-line')
            .select('path')
            .remove();

        if (!location.pathname.includes('market')) {
            const selectClass = location.pathname.includes('range') ? '.targets' : '.limit';
            d3.select(d3PlotArea.current)
                .select(selectClass)
                .selectAll('.annotation-line')
                .style('cursor', 'row-resize');

            const nodes = d3
                .select(d3PlotArea.current)
                .select(selectClass)
                .selectAll('.annotation-line')
                .nodes();

            nodes.forEach(async (res) => {
                if (d3.select(res).select('rect').node() === null) {
                    d3.select(res)
                        .append('rect')
                        .attr('width', '100%')
                        .attr('height', '8%')
                        .attr('y', '-4%')
                        .attr('fill', 'transparent')
                        .attr('stroke', 'none');
                }

                await d3.select(res).selectAll('polygon').remove();
                d3.select(res)
                    .append('polygon')
                    .attr('points', '0,40 0,55 10,49 10,46')
                    .attr(
                        'stroke',
                        selectClass.includes('limit')
                            ? market[0].value > limit[0].value
                                ? 'rgb(139, 253, 244)'
                                : 'rgba(235, 235, 255)'
                            : 'rgba(235, 235, 255)',
                    )
                    .attr(
                        'fill',
                        selectClass.includes('limit')
                            ? market[0].value > limit[0].value
                                ? 'rgb(139, 253, 244)'
                                : 'rgba(235, 235, 255)'
                            : 'rgba(235, 235, 255)',
                    )
                    .style('transform', 'translate(1px, -48px)');

                d3.select(res)
                    .append('polygon')
                    .attr('points', '0,40 0,55 10,49 10,46')
                    .attr(
                        'stroke',
                        selectClass.includes('limit')
                            ? market[0].value > limit[0].value
                                ? 'rgb(139, 253, 244)'
                                : 'rgba(235, 235, 255)'
                            : 'rgba(235, 235, 255)',
                    )
                    .attr(
                        'fill',
                        selectClass.includes('limit')
                            ? market[0].value > limit[0].value
                                ? 'rgb(139, 253, 244)'
                                : 'rgba(235, 235, 255)'
                            : 'rgba(235, 235, 255)',
                    )
                    .style('transform', 'translate(100%, 48px) rotate(180deg)');
            });
        }
    }

    function addDefsStyle() {
        const svgmain = d3.select(d3PlotArea.current).select('svg');
        if (svgmain.select('defs').node() === null) {
            const lg = svgmain
                .append('defs')
                .append('filter')
                .attr('x', 0)
                .attr('y', 0)
                .attr('height', 1)
                .attr('width', 1)
                .attr('id', 'targetsAreaBackground');

            lg.append('feFlood').attr('flood-color', '#7371FC1A').attr('result', 'bg');

            const feMergeTag = lg.append('feMerge');
            feMergeTag.append('feMergeNode').attr('in', 'bg');
            feMergeTag.append('feMergeNode').attr('in', 'SourceGraphic');

            const crosshairDefs = svgmain
                .append('defs')
                .append('filter')
                .attr('x', 0)
                .attr('y', 0)
                .attr('height', 1)
                .attr('width', 1)
                .attr('id', 'crossHairBg');

            crosshairDefs.append('feFlood').attr('flood-color', '#242F3F').attr('result', 'bg');
            const feMergeTagCrossHair = crosshairDefs.append('feMerge');
            feMergeTagCrossHair.append('feMergeNode').attr('in', 'bg');
            feMergeTagCrossHair.append('feMergeNode').attr('in', 'SourceGraphic');

            const marketDefs = svgmain
                .append('defs')
                .append('filter')
                .attr('x', 0)
                .attr('y', 0)
                .attr('height', 1)
                .attr('width', 1)
                .attr('id', 'marketBg');

            marketDefs.append('feFlood').attr('flood-color', '#FFFFFF').attr('result', 'bg');
            const feMergeTagMarket = marketDefs.append('feMerge');
            feMergeTagMarket.append('feMergeNode').attr('in', 'bg');
            feMergeTagMarket.append('feMergeNode').attr('in', 'SourceGraphic');

            const yAxisText = svgmain
                .append('defs')
                .append('filter')
                .attr('x', 0)
                .attr('y', 0)
                .attr('height', 1)
                .attr('width', 1)
                .attr('id', 'textBg');

            yAxisText.append('feFlood').attr('flood-color', '#7772FE').attr('result', 'bg');
            const feMergeTagYaxisText = yAxisText.append('feMerge');
            feMergeTagYaxisText.append('feMergeNode').attr('in', 'bg');
            feMergeTagYaxisText.append('feMergeNode').attr('in', 'SourceGraphic');

            const yAxisTextLow = svgmain
                .append('defs')
                .append('filter')
                .attr('x', 0)
                .attr('y', 0)
                .attr('height', 1)
                .attr('width', 1)
                .attr('id', 'textLowBg');

            yAxisTextLow.append('feFlood').attr('flood-color', '#5FFFF2').attr('result', 'bg');
            const feMergeTagYaxisTextLow = yAxisTextLow.append('feMerge');
            feMergeTagYaxisTextLow.append('feMergeNode').attr('in', 'bg');
            feMergeTagYaxisTextLow.append('feMergeNode').attr('in', 'SourceGraphic');
        }
    }

    useEffect(() => {
        if (location.pathname.includes('range')) {
            d3.select(d3PlotArea.current)
                .select('.targetsArea')
                .selectAll('annotation-line')
                .style('visibility', 'hidden');

            d3.select(d3PlotArea.current)
                .select('.targetsArea')
                .selectAll('annotation-line')
                .style('visibility', 'hidden');

            d3.select(d3PlotArea.current)
                .select('.targetsArea')
                .style('filter', 'url(#targetsAreaBackground)');
        }
        addTriangleAndRect();
    }, [dragControl, location, market, limit]);

    // Line Rules
    useEffect(() => {
        if (dragLimit !== undefined && dragRange !== undefined) {
            if (location.pathname.includes('range')) {
                d3.select(d3Container.current)
                    .select('.targets')
                    .select('.horizontal')
                    .on('mouseover', (event: any) => {
                        d3.select(event.currentTarget).style('cursor', 'row-resize');
                        d3.select(event.currentTarget).select('line').style('cursor', 'row-resize');
                    })
                    .call(dragRange);

                d3.select(d3Container.current)
                    .select('.targets')
                    .select('#Min')
                    .on('mouseover', (event: any) => {
                        d3.select(event.currentTarget).style('cursor', 'row-resize');
                        d3.select(event.currentTarget).select('line').style('cursor', 'row-resize');
                    })
                    .call(dragRange);

                d3.select(d3Container.current)
                    .select('.targets')
                    .select('#Max')
                    .on('mouseover', (event: any) => {
                        d3.select(event.currentTarget).style('cursor', 'row-resize');
                        d3.select(event.currentTarget).select('line').style('cursor', 'row-resize');
                    })
                    .call(dragRange);
            }

            if (location.pathname.includes('limit')) {
                d3.select(d3Container.current)
                    .select('.limit')
                    .on('mouseover', (event: any) => {
                        d3.select(event.currentTarget).style('cursor', 'row-resize');
                        d3.select(event.currentTarget).select('line').style('cursor', 'row-resize');
                    })
                    .call(dragLimit);
            }
        }

        const snap = (data: any, value: any) => {
            if (!value) return [];

            const filtered =
                data.length > 1
                    ? data.filter((d: any) => d.pinnedMaxPriceDisplayTruncated != null)
                    : data;

            const nearest = filtered.reduce(function (prev: any, curr: any) {
                return Math.abs(curr.pinnedMaxPriceDisplayTruncated - value) <
                    Math.abs(prev.pinnedMaxPriceDisplayTruncated - value)
                    ? curr
                    : prev;
            });

            return [
                {
                    value: nearest.pinnedMaxPriceDisplayTruncated,
                    index: filtered.findIndex((liqData: any) => liqData === nearest),
                },
            ];
        };

        if (location.pathname.includes('limit') && scaleData !== undefined) {
            d3.select(d3PlotArea.current).on('click', (event: any) => {
                if ((event.target.__data__ as CandleChartData) === undefined) {
                    const newLimitValue = scaleData.yScale.invert(d3.pointer(event)[1]);
                    onBlurlimitRate(newLimitValue);
                }
            });
        }

        if (location.pathname.includes('range') && scaleData !== undefined) {
            let newRangeValue: any;
            let lowLineMoved: boolean;
            let highLineMoved: boolean;

            d3.select(d3PlotArea.current).on('click', async (event: any) => {
                if ((event.target.__data__ as CandleChartData) === undefined) {
                    const clickedValue = scaleData.yScale.invert(d3.pointer(event)[1]);
                    const snapResponse = snap(props.liquidityData.liqSnapData, clickedValue);
                    const snappedValue = Math.round(snapResponse[0].value * 100) / 100;

                    const displayValue = poolPriceDisplay !== undefined ? poolPriceDisplay : 0;

                    const dragLimit = displayValue / 100.0;

                    const lineToBeSet = clickedValue > displayValue ? 'Max' : 'Min';

                    if (!isAdvancedModeActive) {
                        let valueWithRange: number;

                        if (lineToBeSet === 'Max') {
                            await setRanges((prevState) => {
                                const newTargets = [...prevState];

                                const low = newTargets.filter(
                                    (target: any) => target.name === 'Min',
                                )[0].value;

                                valueWithRange =
                                    newTargets.filter((target: any) => target.name === 'Max')[0]
                                        .value - snappedValue;

                                if (snappedValue > displayValue + dragLimit) {
                                    newTargets.filter(
                                        (target: any) => target.name === 'Max',
                                    )[0].value = snappedValue;

                                    newTargets.filter(
                                        (target: any) => target.name === 'Min',
                                    )[0].value = snap(
                                        props.liquidityData.liqSnapData,
                                        low + valueWithRange,
                                    )[0].value;

                                    render();
                                } else {
                                    newTargets.filter(
                                        (target: any) => target.name === 'Max',
                                    )[0].value = snap(
                                        props.liquidityData.liqSnapData,
                                        displayValue + dragLimit * 1.01,
                                    )[0].value;

                                    newTargets.filter(
                                        (target: any) => target.name === 'Min',
                                    )[0].value = snap(
                                        props.liquidityData.liqSnapData,
                                        displayValue - dragLimit * 1.01,
                                    )[0].value;

                                    render();
                                }

                                newRangeValue = newTargets;
                                return newTargets;
                            });
                            highLineMoved = true;
                        } else {
                            await setRanges((prevState) => {
                                const newTargets = [...prevState];

                                valueWithRange =
                                    newTargets.filter((target: any) => target.name === 'Min')[0]
                                        .value - snappedValue;

                                const high = newTargets.filter(
                                    (target: any) => target.name === 'Max',
                                )[0].value;

                                if (snappedValue < displayValue - dragLimit) {
                                    newTargets.filter(
                                        (target: any) => target.name === 'Min',
                                    )[0].value = snappedValue;

                                    newTargets.filter(
                                        (target: any) => target.name === 'Max',
                                    )[0].value = snap(
                                        props.liquidityData.liqSnapData,
                                        high + valueWithRange,
                                    )[0].value;

                                    render();
                                } else {
                                    newTargets.filter(
                                        (target: any) => target.name === 'Max',
                                    )[0].value = snap(
                                        props.liquidityData.liqSnapData,
                                        displayValue + dragLimit * 1.01,
                                    )[0].value;

                                    newTargets.filter(
                                        (target: any) => target.name === 'Min',
                                    )[0].value = snap(
                                        props.liquidityData.liqSnapData,
                                        displayValue - dragLimit * 1.01,
                                    )[0].value;

                                    render();
                                }

                                newRangeValue = newTargets;
                                return newTargets;
                            });
                            lowLineMoved = true;
                        }
                    } else {
                        const low = ranges.filter((target: any) => target.name === 'Min')[0].value;
                        const high = ranges.filter((target: any) => target.name === 'Max')[0].value;

                        let pinnedDisplayPrices;
                        if (lineToBeSet === 'Max') {
                            pinnedDisplayPrices = getPinnedPriceValuesFromDisplayPrices(
                                denomInBase,
                                baseTokenDecimals,
                                quoteTokenDecimals,
                                low.toString(),
                                scaleData.yScale.invert(d3.pointer(event)[1]).toString(),
                                lookupChain(chainId).gridSize,
                            );
                        } else {
                            pinnedDisplayPrices = getPinnedPriceValuesFromDisplayPrices(
                                denomInBase,
                                baseTokenDecimals,
                                quoteTokenDecimals,
                                scaleData.yScale.invert(d3.pointer(event)[1]).toString(),
                                high.toString(),
                                lookupChain(chainId).gridSize,
                            );
                        }

                        const pinnedMaxPriceDisplayTruncated = parseFloat(
                            pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated,
                        );
                        const pinnedMinPriceDisplayTruncated = parseFloat(
                            pinnedDisplayPrices.pinnedMinPriceDisplayTruncated,
                        );

                        await setRanges((prevState) => {
                            const newTargets = [...prevState];

                            if (lineToBeSet === 'Max') {
                                newTargets.filter((target: any) => target.name === 'Max')[0].value =
                                    pinnedMaxPriceDisplayTruncated;
                                highLineMoved = true;
                                lowLineMoved = false;
                            } else {
                                newTargets.filter((target: any) => target.name === 'Min')[0].value =
                                    pinnedMinPriceDisplayTruncated;
                                highLineMoved = false;
                                lowLineMoved = true;
                            }

                            render();

                            newRangeValue = newTargets;
                            return newTargets;
                        });
                    }

                    onBlurRange(newRangeValue, highLineMoved, lowLineMoved);
                }
            });
        }
    }, [dragLimit, dragRange, parsedChartData?.period, location, horizontalLine]);

    useEffect(() => {
        if (scaleData !== undefined) {
            // const highlightedCurrentPriceLine = d3fc
            //     .annotationSvgLine()
            //     .value((d: any) => d.value)
            //     .xScale(scaleData.xScaleIndicator)
            //     .yScale(scaleData.yScale)
            //     .decorate((selection: any) => {
            //         selection.enter().select('line').attr('class', 'highlightedPrice');
            //         selection
            //             .enter()
            //             .append('line')
            //             .attr('stroke-width', 1)
            //             .style('pointer-events', 'all');
            //         selection.enter().select('g.left-handle').remove();
            //         selection.enter().select('g.right-handle').remove();
            //     });

            // setHighlightedCurrentPriceLine(() => {
            //     return highlightedCurrentPriceLine;
            // });

            const indicatorLine = d3fc
                .annotationSvgLine()
                .orient('vertical')
                .value((d: any) => d.x)
                .xScale(scaleData.xScale)
                .yScale(scaleData.yScaleIndicator)
                .label('');

            indicatorLine.decorate((selection: any) => {
                selection.enter().select('line').attr('class', 'indicatorLine');
                selection
                    .enter()
                    .append('line')
                    .attr('stroke-width', 1)
                    .style('pointer-events', 'all');
                selection.enter().select('g.top-handle').remove();
            });

            setIndicatorLine(() => {
                return indicatorLine;
            });
        }
    }, [scaleData]);

    useEffect(() => {
        if (scaleData !== undefined) {
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
                selection.enter().select('g.top-handle').remove();
            });

            setCrosshairHorizontal(() => {
                return crosshairHorizontal;
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
                selection.enter().select('g.right-handle').remove();
            });

            setCrosshairVertical(() => {
                return crosshairVertical;
            });
        }
    }, [scaleData]);

    useEffect(() => {
        if (scaleData !== undefined) {
            const candlestick = d3fc
                .autoBandwidth(d3fc.seriesSvgCandlestick())
                .decorate((selection: any) => {
                    selection
                        .style('fill', (d: any) => {
                            return selectedDate !== undefined &&
                                selectedDate.getTime() === d.date.getTime()
                                ? '#E480FF'
                                : d.close > d.open
                                ? upBodyColor
                                : downBodyColor;
                        })
                        .style('stroke', (d: any) => {
                            return selectedDate !== undefined &&
                                selectedDate.getTime() === d.date.getTime()
                                ? '#E480FF'
                                : d.close > d.open
                                ? upBorderColor
                                : downBorderColor;
                        });
                    selection
                        .on('mouseover', (event: any) => {
                            d3.select(event.currentTarget).style('cursor', 'pointer');
                        })
                        .on('click', (event: any) => {
                            if (
                                selectedDate === undefined ||
                                selectedDate !== event.target.__data__.date
                            ) {
                                d3.select(event.currentTarget)
                                    .style('fill', '#E480FF')
                                    .style('stroke', '#E480FF');

                                setSelectedDate(() => {
                                    return event.target.__data__.date;
                                });
                            } else {
                                d3.select(event.currentTarget)
                                    .style('fill', (d: any) =>
                                        d.close > d.open ? upBodyColor : downBodyColor,
                                    )
                                    .style('stroke', (d: any) =>
                                        d.close > d.open ? upBorderColor : downBorderColor,
                                    );

                                setSelectedDate(() => {
                                    return undefined;
                                });
                            }
                        });
                })
                .xScale(scaleData.xScale)
                .yScale(scaleData.yScale);

            setCandlestick(() => {
                return candlestick;
            });
        }
    }, [scaleData, selectedDate]);

    // Liq Series
    useEffect(() => {
        if (scaleData !== undefined) {
            const liqAskSeries = d3fc
                .seriesSvgArea()
                .orient('horizontal')
                .curve(d3.curveNatural)
                .mainValue((d: any) => d.activeLiq)
                .crossValue((d: any) => d.liqPrices)
                .xScale(scaleData.liquidityScale)
                .yScale(scaleData.yScale)
                .decorate((selection: any) => {
                    selection.style('fill', 'rgba(205, 193, 255, 0.3)');
                });

            setLiqAskSeries(() => {
                return liqAskSeries;
            });

            const liqBidSeries = d3fc
                .seriesSvgArea()
                .orient('horizontal')
                .curve(d3.curveNatural)
                .mainValue((d: any) => d.activeLiq)
                .crossValue((d: any) => d.liqPrices)
                .xScale(scaleData.liquidityScale)
                .yScale(scaleData.yScale)
                .decorate((selection: any) => {
                    selection.style('fill', 'rgba(115, 113, 252, 0.3)');
                });

            setLiqBidSeries(() => {
                return liqBidSeries;
            });

            const liqHighligtedAskSeries = d3fc
                .seriesSvgArea()
                .orient('horizontal')
                .curve(d3.curveNatural)
                .mainValue((d: any) => d.activeLiq)
                .crossValue((d: any) => d.liqPrices)
                .xScale(scaleData.liquidityScale)
                .yScale(scaleData.yScale)
                .decorate((selection: any) => {
                    selection.style('fill', 'rgba(205, 193, 255, 0.3)');
                });

            setLiqHighligtedAskSeries(() => {
                return liqHighligtedAskSeries;
            });

            const liqHighligtedBidSeries = d3fc
                .seriesSvgArea()
                .orient('horizontal')
                .curve(d3.curveNatural)
                .mainValue((d: any) => d.activeLiq)
                .crossValue((d: any) => d.liqPrices)
                .xScale(scaleData.liquidityScale)
                .yScale(scaleData.yScale)
                .decorate((selection: any) => {
                    selection.style('fill', 'rgba(115, 113, 252, 0.6)');
                });

            setLiqHighligtedBidSeries(() => {
                return liqHighligtedBidSeries;
            });

            const areaAskJoin = d3fc.dataJoin('g', 'areaAsk');
            const areaBidJoin = d3fc.dataJoin('g', 'areaBid');
            const liqHighligtedAskJoin = d3fc.dataJoin('g', 'liqHighligtedAsk');
            const liqHighligtedBidJoin = d3fc.dataJoin('g', 'liqHighligtedBid');

            setAreaAskJoin(() => {
                return areaAskJoin;
            });
            setAreaBidJoin(() => {
                return areaBidJoin;
            });
            setLiqHighligtedAskJoin(() => {
                return liqHighligtedAskJoin;
            });
            setLiqHighligtedBidJoin(() => {
                return liqHighligtedBidJoin;
            });
        }
    }, [scaleData, props.liquidityData]);

    // Call drawChart()
    useEffect(() => {
        if (
            props.liquidityData.liqData !== undefined &&
            parsedChartData !== undefined &&
            scaleData !== undefined &&
            zoomUtils !== undefined &&
            limitJoin !== undefined &&
            indicatorLine !== undefined &&
            liqTooltip !== undefined &&
            crosshairVertical !== undefined &&
            crosshairHorizontal !== undefined &&
            limitLine !== undefined &&
            marketLine !== undefined &&
            marketJoin !== undefined &&
            candlestick !== undefined &&
            targetsJoin !== undefined &&
            liqAskSeries !== undefined &&
            liqAskSeries !== undefined &&
            areaAskJoin !== undefined &&
            areaBidJoin !== undefined &&
            liqHighligtedAskJoin !== undefined &&
            liqHighligtedBidJoin !== undefined &&
            liqHighligtedAskSeries !== undefined &&
            liqHighligtedBidSeries !== undefined &&
            targetsAreaJoin !== undefined
        ) {
            const targetData = {
                limit: limit,
                ranges: ranges,
                market: market,
            };

            drawChart(
                parsedChartData.chartData,
                targetData,
                scaleData,
                props.liquidityData,
                zoomUtils,
                horizontalLine,
                limitLine,
                targetsJoin,
                targetsAreaJoin,
                limitJoin,
                marketJoin,
                indicatorLine,
                liqTooltip,
                crosshairVertical,
                crosshairHorizontal,
                marketLine,
                candlestick,
                liqAskSeries,
                liqBidSeries,
                areaAskJoin,
                areaBidJoin,
                liqHighligtedAskJoin,
                liqHighligtedBidJoin,
                liqHighligtedAskSeries,
                liqHighligtedBidSeries,
                yAxis,
                xAxis,
                mouseMoveEventForSubChart,
                isMouseMoveForSubChart,
            );
        }
    }, [
        parsedChartData,
        market,
        ranges,
        limit,
        zoomUtils,
        horizontalLine,
        targetsJoin,
        limitJoin,
        marketJoin,
        denomInBase,
        indicatorLine,
        liqTooltip,
        crosshairVertical,
        crosshairHorizontal,
        marketLine,
        candlestick,
        liqAskSeries,
        liqBidSeries,
        areaAskJoin,
        areaBidJoin,
        liqHighligtedAskJoin,
        liqHighligtedBidJoin,
        liqHighligtedAskSeries,
        liqHighligtedBidSeries,
        yAxis,
        xAxis,
        mouseMoveEventForSubChart,
    ]);

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

    // Draw Chart
    const drawChart = useCallback(
        (
            chartData: any,
            targets: any,
            scaleData: any,
            liquidityData: any,
            zoomUtils: any,
            horizontalLine: any,
            limitLine: any,
            targetsJoin: any,
            targetsAreaJoin: any,
            limitJoin: any,
            marketJoin: any,
            indicatorLine: any,
            liqTooltip: any,
            crosshairVertical: any,
            crosshairHorizontal: any,
            marketLine: any,
            candlestick: any,
            liqAskSeries: any,
            liqBidSeries: any,
            areaAskJoin: any,
            areaBidJoin: any,
            liqHighligtedAskJoin: any,
            liqHighligtedBidJoin: any,
            liqHighligtedAskSeries: any,
            liqHighligtedBidSeries: any,
            yAxis: any,
            xAxis: any,
            mouseMoveEventForSubChart: any,
            isMouseMoveForSubChart: boolean,
        ) => {
            if (chartData.length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars

                const snap = (series: any, data: any, point: any) => {
                    if (point == undefined) return [];
                    const xScale = series.xScale(),
                        xValue = series.crossValue();

                    const filtered =
                        data.length > 1 ? data.filter((d: any) => xValue(d) != null) : data;
                    const nearest = minimum(filtered, (d: any) =>
                        Math.abs(point.offsetX - xScale(xValue(d))),
                    )[1];

                    setCrosshairXForSubChart(scaleData.xScale(nearest?.date));

                    props.setCurrentData(nearest);
                    return [
                        {
                            x: nearest?.date,
                            y: scaleData.yScale.invert(point.offsetY),
                        },
                    ];
                };

                const candleJoin = d3fc.dataJoin('g', 'candle');

                const crosshairHorizontalJoin = d3fc.dataJoin('g', 'crosshairHorizontal');
                const crosshairVerticalJoin = d3fc.dataJoin('g', 'crosshairVertical');
                // const highlightedCurrentPriceLineJoin = d3fc.dataJoin(
                //     'g',
                //     'highlightedCurrentPriceLine',
                // );
                const indicatorLineJoin = d3fc.dataJoin('g', 'indicatorLine');

                // handle the plot area measure event in order to compute the scale ranges
                d3.select(d3PlotArea.current).on('measure', function (event: any) {
                    scaleData.xScale.range([0, event.detail.width]);
                    scaleData.yScale.range([event.detail.height, 0]);

                    scaleData.xScaleIndicator.range([
                        (event.detail.width / 10) * 8,
                        event.detail.width,
                    ]);

                    scaleData.liquidityScale.range([
                        event.detail.width,
                        (event.detail.width / 10) * 8,
                    ]);
                });

                d3.select(d3PlotArea.current).on('draw', function (event: any) {
                    async function createElements() {
                        const svg = d3.select(event.target).select('svg');
                        targetsAreaJoin(svg, [targets.ranges]).call(horizontalLine);

                        crosshairHorizontalJoin(svg, [crosshairData]).call(crosshairHorizontal);
                        crosshairVerticalJoin(svg, [crosshairData]).call(crosshairVertical);

                        targetsJoin(svg, [targets.ranges]).call(horizontalLine);
                        marketJoin(svg, [targets.market]).call(marketLine);
                        limitJoin(svg, [targets.limit]).call(limitLine);

                        // highlightedCurrentPriceLineJoin(svg, [currentPriceData]).call(
                        //     highlightedCurrentPriceLine,
                        // );
                        indicatorLineJoin(svg, [indicatorLineData]).call(indicatorLine);

                        targetsJoin(svg, [targets.ranges]).call(horizontalLine);

                        candleJoin(svg, [chartData]).call(candlestick);
                        liqHighligtedAskJoin(svg, [liquidityData.liqHighligtedAskSeries]).call(
                            liqHighligtedAskSeries,
                        );
                        liqHighligtedBidJoin(svg, [liquidityData.liqHighligtedBidSeries]).call(
                            liqHighligtedBidSeries,
                        );

                        areaAskJoin(svg, [liquidityData.liqAskData]).call(liqAskSeries);
                        areaBidJoin(svg, [liquidityData.liqBidData]).call(liqBidSeries);
                        setDragControl(true);
                    }

                    const mouseOutFunc = () => {
                        liquidityData.liqHighligtedBidSeries = [];
                        liquidityData.liqHighligtedAskSeries = [];

                        // d3.select(d3PlotArea.current)
                        //     .select('.highlightedCurrentPriceLine')
                        //     .style('visibility', 'hidden');

                        d3.select(d3PlotArea.current)
                            .select('.indicatorLine')
                            .style('visibility', 'hidden');

                        liqTooltip.style('visibility', 'hidden');
                    };

                    createElements().then(() => {
                        d3.select(d3PlotArea.current)
                            .select('.areaAsk')
                            .on('mousemove', (event: any) => {
                                indicatorLineData[0] = {
                                    x: scaleData.xScale.invert(event.offsetX),
                                    y: event.offsetY,
                                };

                                currentPriceData[0] = {
                                    value: poolPriceDisplay !== undefined ? poolPriceDisplay : 0,
                                };

                                scaleData.yScaleIndicator.range([
                                    event.offsetY,
                                    scaleData.yScale(poolPriceDisplay),
                                ]);

                                // d3.select(d3PlotArea.current)
                                //     .select('.highlightedCurrentPriceLine')
                                //     .style('visibility', 'visible');

                                d3.select(d3PlotArea.current)
                                    .select('.indicatorLine')
                                    .style('visibility', 'visible');

                                const filtered =
                                    liquidityData.liqAskData.length > 1
                                        ? liquidityData.liqAskData.filter(
                                              (d: any) => d.liqPrices != null,
                                          )
                                        : liquidityData.liqAskData;

                                const nearest = filtered.reduce(function (prev: any, curr: any) {
                                    return Math.abs(
                                        curr.liqPrices - scaleData.yScale.invert(event.offsetY),
                                    ) <
                                        Math.abs(
                                            prev.liqPrices - scaleData.yScale.invert(event.offsetY),
                                        )
                                        ? curr
                                        : prev;
                                });

                                setLiqTooltipSelectedLiqBar(() => {
                                    return nearest;
                                });

                                liqTooltip
                                    .style('visibility', 'visible')
                                    .style(
                                        'top',
                                        event.y -
                                            80 -
                                            (event.offsetY - scaleData.yScale(poolPriceDisplay)) /
                                                2 +
                                            'px',
                                    )
                                    .style('left', event.offsetX - 80 + 'px');

                                liquidityData.liqHighligtedBidSeries = [];

                                liquidityData.liqHighligtedAskSeries =
                                    liquidityData.liqAskData.filter(
                                        (d: any) =>
                                            d.liqPrices >= scaleData.yScale.invert(event.offsetY),
                                    );
                                const index = filtered.findIndex(
                                    (liqData: any) => liqData === nearest,
                                );

                                let activeLiq = nearest.activeLiq;
                                if (scaleData.yScale.invert(event.offsetY) < nearest.liqPrices) {
                                    activeLiq =
                                        filtered[index + 1] !== undefined
                                            ? filtered[index + 1].activeLiq
                                            : nearest.activeLiq;
                                }

                                const mouseArea = {
                                    activeLiq: activeLiq,
                                    liqPrices: scaleData.yScale.invert(event.offsetY),
                                };

                                liquidityData.liqHighligtedAskSeries.push(mouseArea);

                                liquidityData.liqHighligtedAskSeries.sort(
                                    (a: any, b: any) => b.liqPrices - a.liqPrices,
                                );

                                render();
                            })
                            .on('mouseleave', mouseOutFunc);

                        d3.select(d3PlotArea.current)
                            .select('.areaBid')
                            .on('mousemove', (event: any) => {
                                indicatorLineData[0] = {
                                    x: scaleData.xScale.invert(event.offsetX),
                                    y: event.offsetY,
                                };

                                currentPriceData[0] = {
                                    value: poolPriceDisplay !== undefined ? poolPriceDisplay : 0,
                                };

                                scaleData.yScaleIndicator.range([
                                    event.offsetY,
                                    scaleData.yScale(poolPriceDisplay),
                                ]);

                                // d3.select(d3PlotArea.current)
                                //     .select('.highlightedCurrentPriceLine')
                                //     .style('visibility', 'visible');

                                d3.select(d3PlotArea.current)
                                    .select('.indicatorLine')
                                    .style('visibility', 'visible');

                                const filtered =
                                    liquidityData.liqBidData.length > 1
                                        ? liquidityData.liqBidData.filter(
                                              (d: any) => d.liqPrices != null,
                                          )
                                        : liquidityData.liqBidData;

                                const nearest = filtered.reduce(function (prev: any, curr: any) {
                                    return Math.abs(
                                        curr.liqPrices - scaleData.yScale.invert(event.offsetY),
                                    ) <
                                        Math.abs(
                                            prev.liqPrices - scaleData.yScale.invert(event.offsetY),
                                        )
                                        ? curr
                                        : prev;
                                });

                                setLiqTooltipSelectedLiqBar(() => {
                                    return nearest;
                                });

                                liqTooltip
                                    .style('visibility', 'visible')
                                    .style(
                                        'top',
                                        event.y -
                                            80 -
                                            (event.offsetY - scaleData.yScale(poolPriceDisplay)) /
                                                2 +
                                            'px',
                                    )
                                    .style('left', event.offsetX - 80 + 'px');

                                liquidityData.liqHighligtedAskSeries = [];

                                liquidityData.liqHighligtedBidSeries =
                                    liquidityData.liqBidData.filter(
                                        (d: any) =>
                                            scaleData.yScale.invert(event.offsetY) >= d.liqPrices,
                                    );

                                const index = filtered.findIndex(
                                    (liqData: any) => liqData === nearest,
                                );

                                let activeLiq = nearest.activeLiq;
                                if (scaleData.yScale.invert(event.offsetY) > nearest.liqPrices) {
                                    activeLiq =
                                        filtered[index - 1] !== undefined
                                            ? filtered[index - 1].activeLiq
                                            : nearest.activeLiq;
                                }

                                const mouseArea = {
                                    activeLiq: activeLiq,
                                    liqPrices: scaleData.yScale.invert(event.offsetY),
                                };

                                liquidityData.liqHighligtedBidSeries.push(mouseArea);

                                liquidityData.liqHighligtedBidSeries.sort(
                                    (a: any, b: any) => b.liqPrices - a.liqPrices,
                                );

                                render();
                            })
                            .on('mouseleave', mouseOutFunc);
                    });
                });

                d3.select(d3Xaxis.current).on('draw', function (event: any) {
                    d3.select(event.target).select('svg').call(xAxis);
                    d3.select(d3Xaxis.current).select('svg').select('.domain').remove();
                });

                d3.select(d3Yaxis.current).on('draw', function (event: any) {
                    d3.select(event.target).select('svg').call(yAxis);
                });

                d3.select(d3PlotArea.current).on('measure.range', function (event: any) {
                    const svg = d3.select(event.target).select('svg');
                    scaleData.xScaleCopy.range([0, event.detail.width]);
                    scaleData.yScaleCopy.range([event.detail.height, 0]);

                    svg.call(zoomUtils.zoom);
                });

                const setCrossHairLocation = (event: any) => {
                    crosshairData[0] = snap(candlestick, chartData, event)[0];
                    setIsMouseMoveCrosshair(true);

                    setCrosshairData([
                        {
                            x: crosshairData[0].x,
                            y: isMouseMoveForSubChart ? -1 : scaleData.yScale.invert(event.offsetY),
                        },
                    ]);

                    render();
                };

                if (isMouseMoveForSubChart) {
                    setCrossHairLocation(mouseMoveEventForSubChart);
                    // crosshairData[0].x = scaleData.xScale.invert(crosshairXForSubChart);
                    // setIsMouseMoveCrosshair(true);
                }

                d3.select(d3PlotArea.current).on('mousemove', async function (event: any) {
                    setCrossHairLocation(event);
                });

                d3.select(d3Yaxis.current)
                    .on('mouseover', (event: any) => {
                        d3.select(event.currentTarget).style('cursor', 'row-resize');
                    })
                    .call(zoomUtils.yAxisDrag);

                render();

                d3.select(d3PlotArea.current).on('mouseleave', () => {
                    liquidityData.liqHighligtedBidSeries = [];
                    liquidityData.liqHighligtedAskSeries = [];

                    d3.select(d3PlotArea.current)
                        .select('svg')
                        .select('.crosshairVertical')
                        .style('visibility', 'hidden');

                    setIsMouseMoveCrosshair(false);

                    render();
                });

                d3.select(d3PlotArea.current).on('mouseenter', () => {
                    d3.select(d3PlotArea.current)
                        .select('svg')
                        .select('.crosshairVertical')
                        .style('visibility', 'visible');
                });
            }
        },
        [],
    );

    useEffect(() => {
        if (
            liqTooltip !== undefined &&
            liqTooltipSelectedLiqBar !== undefined &&
            poolPriceDisplay !== undefined
        ) {
            const liqTextData = { totalValue: 0 };

            props.liquidityData.liqData.map((liqData: any) => {
                if (liqTooltipSelectedLiqBar.liqPrices < poolPriceDisplay) {
                    if (
                        liqData.liqPrices >= liqTooltipSelectedLiqBar.liqPrices &&
                        poolPriceDisplay > liqData.liqPrices
                    ) {
                        liqTextData.totalValue = liqTextData.totalValue + liqData.deltaAverageUSD;
                    }
                } else {
                    if (
                        liqData.liqPrices <= liqTooltipSelectedLiqBar.liqPrices &&
                        poolPriceDisplay < liqData.liqPrices
                    ) {
                        liqTextData.totalValue = liqTextData.totalValue + liqData.deltaAverageUSD;
                    }
                }
            });

            const difference = liqTooltipSelectedLiqBar.liqPrices - poolPriceDisplay;
            // const absoluteDifference = Math.abs(difference)
            const percentage =
                difference === 0
                    ? ''
                    : difference < 0
                    ? ((difference * 100) / poolPriceDisplay).toFixed(1)
                    : '+' + ((difference * 100) / poolPriceDisplay).toFixed(1);

            liqTooltip.html(
                '<p>' +
                    percentage +
                    '%</p>' +
                    '<p> $' +
                    formatAmountWithoutDigit(liqTextData.totalValue, 0) +
                    ' </p>',
            );
        }
    }, [liqTooltipSelectedLiqBar]);

    // Color Picker
    useEffect(() => {
        d3.select(d3PlotArea.current).select('.candle').selectAll('.up').style('fill', upBodyColor);
        d3.select(d3PlotArea.current)
            .select('.candle')
            .selectAll('.down')
            .style('fill', downBodyColor);
        d3.select(d3PlotArea.current)
            .select('.candle')
            .selectAll('.up')
            .style('stroke', upBorderColor);
        d3.select(d3PlotArea.current)
            .select('.candle')
            .selectAll('.down')
            .style('stroke', downBorderColor);
        render();
    }, [upBodyColor, downBodyColor, upBorderColor, downBorderColor]);

    // Candle transactions
    useEffect(() => {
        if (selectedDate !== undefined) {
            const candle = parsedChartData?.chartData.find(
                (candle: any) => candle.date.toString() === selectedDate.toString(),
            ) as any;

            if (candle !== undefined) {
                d3.select('#transactionPopup')
                    .style('visibility', 'visible')
                    .html(
                        '<p>Showing Transactions for <span style="color: #E480FF">' +
                            moment(candle.date).calendar() +
                            '</span></p>',
                    );
                // .html(
                //     '<p>Showing Transactions for <span style="color: #E480FF">' +
                //         moment(candle.date).format('DD MMM  HH:mm') +
                //         '</span></p>',
                // );

                props.changeState(true, candle);
            }
        } else {
            d3.select('#transactionPopup').style('visibility', 'hidden');

            props.changeState(false, undefined);
        }
    }, [selectedDate]);

    const onBlurRange = (range: any, highLineMoved: boolean, lowLineMoved: boolean) => {
        const results: boolean[] = [];

        if (range !== undefined) {
            range.map((mapData: any) => {
                targetData?.map((data) => {
                    if (mapData.name === data.name && mapData.value == data.value) {
                        results.push(true);
                    }
                });
            });
        }

        if (results.length < 2) {
            const low = range.filter((target: any) => target.name === 'Min')[0].value;
            const high = range.filter((target: any) => target.name === 'Max')[0].value;

            if (!isAdvancedModeActive) {
                if (poolPriceDisplay !== undefined && (highLineMoved || lowLineMoved)) {
                    const displayValue = poolPriceDisplay !== undefined ? poolPriceDisplay : 0;

                    const dragLimit = displayValue / 100.0;

                    const difference = highLineMoved
                        ? high - displayValue
                        : lowLineMoved
                        ? displayValue - low
                        : 1;

                    if (!(dragLimit > difference)) {
                        const percentage = (difference * 100) / displayValue;
                        dispatch(setSimpleRangeWidth(Math.round(percentage)));
                    } else {
                        dispatch(setSimpleRangeWidth(1));
                    }
                } else {
                    dispatch(setSimpleRangeWidth(simpleRangeWidth ? simpleRangeWidth : 1));
                }
            } else {
                const newTargetData: targetData[] = [
                    {
                        name: 'Min',
                        value: low > high ? high : low,
                    },
                    {
                        name: 'Max',
                        value: low > high ? low : high,
                    },
                ];

                dispatch(setTargetData(newTargetData));
                dispatch(setRangeHighLineTriggered(highLineMoved));
                dispatch(setRangeLowLineTriggered(lowLineMoved));
            }
        }
    };

    const onBlurlimitRate = (newLimitValue: any) => {
        const limitNonDisplay = denomInBase
            ? pool?.fromDisplayPrice(parseFloat(newLimitValue))
            : pool?.fromDisplayPrice(1 / parseFloat(newLimitValue));

        limitNonDisplay?.then((limit) => {
            // const limitPriceInTick = Math.log(limit) / Math.log(1.0001);
            const pinnedTick: number = isTokenABase
                ? pinTickLower(limit, chainData.gridSize)
                : pinTickUpper(limit, chainData.gridSize);

            dispatch(setLimitTick(pinnedTick));

            const tickPrice = tickToPrice(pinnedTick);

            const tickDispPrice = pool?.toDisplayPrice(tickPrice);

            if (!tickDispPrice) {
                setLimit(() => {
                    return [
                        {
                            name: 'Limit',
                            value: newLimitValue,
                        },
                    ];
                });
            } else {
                tickDispPrice.then((tp) => {
                    const displayPriceWithDenom = denomInBase ? tp : 1 / tp;

                    // const limitPriceWithDenom = isDenomBase ? 1 / tp : tp;
                    const limitRateTruncated =
                        displayPriceWithDenom < 2
                            ? displayPriceWithDenom.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 6,
                              })
                            : displayPriceWithDenom.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                              });

                    setLimit(() => {
                        return [
                            {
                                name: 'Limit',
                                value: parseFloat(limitRateTruncated.replace(',', '')),
                            },
                        ];
                    });
                });
            }
        });
    };

    useEffect(() => {
        let popupHeight = 60;
        Object.values(props.chartItemStates).map((value: any) => {
            if (value) popupHeight -= 7.8;
        });
        setPopupHeight(() => {
            return popupHeight;
        });
    }, [props.chartItemStates]);

    return (
        <div ref={d3Container} className='main_layout_chart' data-testid={'chart'}>
            <d3fc-group id='d3fc_group' auto-resize>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div
                        id='plotAreaDiv'
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
                            style={{ flex: 1, flexGrow: 20, overflow: 'hidden' }}
                        ></d3fc-svg>
                        <d3fc-svg
                            className='y-axis'
                            ref={d3Yaxis}
                            style={{ flexGrow: 1 }}
                        ></d3fc-svg>
                    </div>

                    {showFeeRate && (
                        <>
                            <hr />
                            <label>
                                Fee Rate:{' '}
                                {(
                                    subChartValues.filter(
                                        (value: any) => value.name === 'feeRate',
                                    )[0].value * 100
                                ).toString() + '%'}
                                {/* {formatDollarAmountAxis(
                                    subChartValues.filter(
                                        (value: any) => value.name === 'feeRate',
                                    )[0].value,
                                )} */}
                            </label>
                            <FeeRateSubChart
                                feeData={parsedChartData?.feeChartData.sort(
                                    (a, b) => b.time - a.time,
                                )}
                                period={parsedChartData?.period}
                                crosshairXForSubChart={crosshairXForSubChart}
                                setsubChartValues={setsubChartValues}
                                setZoomAndYdragControl={setZoomAndYdragControl}
                                xScale={scaleData !== undefined ? scaleData.xScale : undefined}
                                setIsMouseMoveForSubChart={setIsMouseMoveForSubChart}
                                setMouseMoveEventForSubChart={setMouseMoveEventForSubChart}
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
                                tvlData={parsedChartData?.tvlChartData.sort(
                                    (a, b) => b.time - a.time,
                                )}
                                period={parsedChartData?.period}
                                crosshairXForSubChart={crosshairXForSubChart}
                                crosshairData={crosshairData}
                                setsubChartValues={setsubChartValues}
                                xScale={scaleData !== undefined ? scaleData.xScale : undefined}
                                xScaleCopy={
                                    scaleData !== undefined ? scaleData.xScaleCopy : undefined
                                }
                                setZoomAndYdragControl={setZoomAndYdragControl}
                                setIsMouseMoveForSubChart={setIsMouseMoveForSubChart}
                                setMouseMoveEventForSubChart={setMouseMoveEventForSubChart}
                                render={render}
                            />
                        </>
                    )}

                    {showVolume === true && candlestick !== undefined && (
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
                                volumeData={parsedChartData?.volumeChartData}
                                period={parsedChartData?.period}
                                crosshairXForSubChart={crosshairXForSubChart}
                                setsubChartValues={setsubChartValues}
                                setSelectedDate={setSelectedDate}
                                selectedDate={selectedDate}
                                candlestick={candlestick}
                                xScale={scaleData !== undefined ? scaleData.xScale : undefined}
                                xScaleCopy={
                                    scaleData !== undefined ? scaleData.xScaleCopy : undefined
                                }
                                setZoomAndYdragControl={setZoomAndYdragControl}
                                zoomAndYdragControl={zoomAndYdragControl}
                                setIsMouseMoveForSubChart={setIsMouseMoveForSubChart}
                                setMouseMoveEventForSubChart={setMouseMoveEventForSubChart}
                                render={render}
                            />
                        </>
                    )}

                    <hr />
                    <d3fc-svg
                        ref={d3Xaxis}
                        className='x-axis'
                        style={{ height: '2em', width: '100%' }}
                    ></d3fc-svg>
                </div>
            </d3fc-group>

            <div
                className='popup'
                id='transactionPopup'
                style={{ visibility: 'hidden', top: popupHeight + '%' }}
                onClick={() => {
                    setSelectedDate(() => {
                        return undefined;
                    });

                    d3.select('#transactionPopup').style('visibility', 'hidden');
                    props.changeState(false, undefined);
                }}
            ></div>
        </div>
    );
}
