import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import moment from 'moment';
import {
    DetailedHTMLProps,
    Dispatch,
    HTMLAttributes,
    SetStateAction,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../utils/hooks/reduxToolkit';
import {
    formatAmountChartData,
    formatAmountWithoutDigit,
} from '../../utils/numbers';
import { CandleData } from '../../utils/state/graphDataSlice';
import {
    setLimitTick,
    candleDomain,
    setIsLinesSwitched,
    // setIsTokenAPrimary,
    setShouldLimitDirectionReverse,
} from '../../utils/state/tradeDataSlice';
import {
    CandleChartData,
    VolumeChartData,
} from '../Trade/TradeCharts/TradeCharts';
import FeeRateSubChart from '../Trade/TradeCharts/TradeChartsLoading/FeeRateSubChart';
import TvlSubChart from '../Trade/TradeCharts/TradeChartsLoading/TvlSubChart';
import { ChartUtils } from '../Trade/TradeCharts/TradeCandleStickChart';
import './Chart.css';
import {
    ChainSpec,
    CrocPoolView,
    pinTickLower,
    pinTickUpper,
    tickToPrice,
} from '@crocswap-libs/sdk';
import {
    getPinnedPriceValuesFromDisplayPrices,
    getPinnedPriceValuesFromTicks,
    getPinnedTickFromDisplayPrice,
} from '../Trade/Range/rangeFunctions';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import {
    get15MinutesAxisTicks,
    get1MinuteAxisTicks,
    get5MinutesAxisTicks,
    getHourAxisTicks,
    getOneDayAxisTicks,
} from './calcuteDateAxis';
import useHandleSwipeBack from '../../utils/hooks/useHandleSwipeBack';

/* eslint-disable @typescript-eslint/no-explicit-any */

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements {
            'd3fc-group': DetailedHTMLProps<
                HTMLAttributes<HTMLDivElement>,
                HTMLDivElement
            >;
            'd3fc-svg': DetailedHTMLProps<
                HTMLAttributes<HTMLDivElement>,
                HTMLDivElement
            >;
            'd3fc-canvas': DetailedHTMLProps<
                HTMLAttributes<HTMLDivElement>,
                HTMLDivElement
            >;
        }
    }
}

type chartItemStates = {
    showTvl: boolean;
    showVolume: boolean;
    showFeeRate: boolean;
    liqMode: string;
};
interface ChartData {
    isUserLoggedIn: boolean | undefined;
    pool: CrocPoolView | undefined;
    chainData: ChainSpec;
    isTokenABase: boolean;
    expandTradeTable: boolean;
    candleData: ChartUtils | undefined;
    liquidityData: any;
    changeState: (
        isOpen: boolean | undefined,
        candleData: CandleData | undefined,
    ) => void;
    denomInBase: boolean;
    limitTick: number | undefined;
    isAdvancedModeActive: boolean | undefined;
    truncatedPoolPrice: number | undefined;
    poolPriceDisplay: number | undefined;
    chartItemStates: chartItemStates;
    setCurrentData: React.Dispatch<
        React.SetStateAction<CandleChartData | undefined>
    >;
    setCurrentVolumeData: React.Dispatch<
        React.SetStateAction<number | undefined>
    >;
    upBodyColor: string;
    upBorderColor: string;
    downBodyColor: string;
    downBorderColor: string;
    isCandleAdded: boolean | undefined;
    setIsCandleAdded: React.Dispatch<boolean>;
    scaleData: any;
    chainId: string;
    poolPriceNonDisplay: number | undefined;
    selectedDate: Date | undefined;
    setSelectedDate: React.Dispatch<Date | undefined>;
    volumeData: VolumeChartData[];
    rescale: boolean | undefined;
    setRescale: React.Dispatch<React.SetStateAction<boolean>>;
    latest: boolean | undefined;
    setLatest: React.Dispatch<React.SetStateAction<boolean>>;
    reset: boolean | undefined;
    setReset: React.Dispatch<React.SetStateAction<boolean>>;
    showLatest: boolean | undefined;
    setShowLatest: React.Dispatch<React.SetStateAction<boolean>>;
    setShowTooltip: React.Dispatch<React.SetStateAction<boolean>>;
    activeTimeFrame: string;
    handlePulseAnimation: (type: string) => void;
    liquidityScale: any;
    liquidityDepthScale: any;
    minPrice: number;
    maxPrice: number;
    setMaxPrice: React.Dispatch<React.SetStateAction<number>>;
    setMinPrice: React.Dispatch<React.SetStateAction<number>>;
    rescaleRangeBoundariesWithSlider: boolean;
    setRescaleRangeBoundariesWithSlider: Dispatch<SetStateAction<boolean>>;
    setCandleDomains: Dispatch<SetStateAction<candleDomain>>;
    showSidebar: boolean;
    setRangeSimpleRangeWidth: Dispatch<SetStateAction<number>>;
    rangeSimpleRangeWidth: number | undefined;
    setRepositionRangeWidth: Dispatch<SetStateAction<number>>;
    repositionRangeWidth: number;
    setChartTriggeredBy: React.Dispatch<React.SetStateAction<string>>;
    chartTriggeredBy: string;
}

export default function Chart(props: ChartData) {
    const {
        isUserLoggedIn,
        pool,
        chainData,
        isTokenABase,
        denomInBase,
        isAdvancedModeActive,
        poolPriceDisplay,
        expandTradeTable,
        setIsCandleAdded,
        scaleData,
        chainId,
        poolPriceNonDisplay,
        selectedDate,
        setSelectedDate,
        rescale,
        setRescale,
        reset,
        setReset,
        showLatest,
        setShowLatest,
        latest,
        setLatest,
        activeTimeFrame,
        liquidityData,
        handlePulseAnimation,
        liquidityScale,
        liquidityDepthScale,
        minPrice,
        maxPrice,
        setMaxPrice,
        setMinPrice,
        rescaleRangeBoundariesWithSlider,
        setRescaleRangeBoundariesWithSlider,
        showSidebar,
        setRangeSimpleRangeWidth,
        rangeSimpleRangeWidth,
        setRepositionRangeWidth,
        repositionRangeWidth,
        setChartTriggeredBy,
        chartTriggeredBy,
    } = props;

    const tradeData = useAppSelector((state) => state.tradeData);

    const isDenomBase = tradeData.isDenomBase;
    const isBid = tradeData.isTokenABase;
    const side =
        (isDenomBase && !isBid) || (!isDenomBase && isBid) ? 'buy' : 'sell';
    const sellOrderStyle = side === 'sell' ? 'order_sell' : 'order_buy';

    const volumeData = props.volumeData;
    const { showFeeRate, showTvl, showVolume, liqMode } = props.chartItemStates;
    const { upBodyColor, upBorderColor, downBodyColor, downBorderColor } =
        props;

    const parsedChartData = props.candleData;

    const d3Container = useRef<HTMLInputElement | null>(null);
    const d3PlotArea = useRef<HTMLInputElement | null>(null);
    const d3CanvasCandle = useRef(null);
    const d3CanvasBar = useRef(null);
    const d3CanvasLiqBid = useRef(null);
    const d3CanvasLiqAsk = useRef(null);

    const d3Xaxis = useRef(null);
    const d3Yaxis = useRef(null);
    const dispatch = useAppDispatch();

    const location = useLocation();
    const position = location?.state?.position;

    const simpleRangeWidth = location.pathname.includes('reposition')
        ? repositionRangeWidth
        : rangeSimpleRangeWidth;
    const setSimpleRangeWidth = location.pathname.includes('reposition')
        ? setRepositionRangeWidth
        : setRangeSimpleRangeWidth;

    // const simpleRangeWidth = rangeSimpleRangeWidth;
    // const setSimpleRangeWidth = setRangeSimpleRangeWidth;

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
            value: undefined,
        },
        {
            name: 'tvl',
            value: undefined,
        },
        {
            name: 'volume',
            value: undefined,
        },
    ]);

    // Axes
    const [yAxis, setYaxis] = useState<any>();
    const [xAxis, setXaxis] = useState<any>();
    const [boundaries, setBoundaries] = useState<any>();

    // Rules
    const [dragControl, setDragControl] = useState(false);
    const [zoomAndYdragControl, setZoomAndYdragControl] = useState();
    const [isMouseMoveCrosshair, setIsMouseMoveCrosshair] = useState(false);
    const [crosshairForSubChart, setCrosshairForSubChart] = useState([
        { x: 0, y: -1 },
    ]);

    const [isMouseMoveForSubChart, setIsMouseMoveForSubChart] = useState(false);
    const [mouseMoveEventCharts, setMouseMoveEventCharts] = useState<any>();
    const [isZoomForSubChart, setIsZoomForSubChart] = useState(false);
    const [isLineDrag, setIsLineDrag] = useState(false);
    const [isChartZoom, setIsChartZoom] = useState(false);

    const [mouseMoveChartName, setMouseMoveChartName] = useState<
        string | undefined
    >(undefined);
    const [checkLimitOrder, setCheckLimitOrder] = useState<boolean>(false);

    // Data
    const [crosshairData, setCrosshairData] = useState([{ x: 0, y: -1 }]);
    const [currentPriceData] = useState([{ value: -1 }]);
    const [indicatorLineData] = useState([{ x: 0, y: 0 }]);
    const [liqTooltipSelectedLiqBar, setLiqTooltipSelectedLiqBar] = useState({
        activeLiq: 0,
        liqPrices: 0,
    });
    const [horizontalBandData, setHorizontalBandData] = useState([[0, 0]]);
    const [firstCandle, setFirstCandle] = useState<number>();

    // d3

    // Crosshairs
    const [liqTooltip, setLiqTooltip] = useState<any>();

    // const [highlightedCurrentPriceLine, setHighlightedCurrentPriceLine] = useState<any>();
    // const [indicatorLine, setIndicatorLine] = useState<any>();
    const [crosshairHorizontal, setCrosshairHorizontal] = useState<any>();
    const [crosshairVertical, setCrosshairVertical] = useState<any>();
    const [candlestick, setCandlestick] = useState<any>();
    const [barSeries, setBarSeries] = useState<any>();
    // Line Series
    const [horizontalLine, setHorizontalLine] = useState<any>();
    const [marketLine, setMarketLine] = useState<any>();
    const [limitLine, setLimitLine] = useState<any>();

    // Line Joins
    const [targetsJoin, setTargetsJoin] = useState<any>();
    const [horizontalBandJoin, setHorizontalBandJoin] = useState<any>();
    const [horizontalBand, setHorizontalBand] = useState<any>();
    const [marketJoin, setMarketJoin] = useState<any>();
    const [limitJoin, setLimitJoin] = useState<any>();

    // NoGoZone Joins
    const [limitNoGoZone, setLimitNoGoZone] = useState<any>();
    const [limitNoGoZoneJoin, setlimitNoGoZoneJoin] = useState<any>();
    const [noGoZoneBoudnaries, setNoGoZoneBoudnaries] = useState([[0, 0]]);

    // Ghost Lines
    const [ghostLines, setGhostLines] = useState<any>();
    const [ghostJoin, setGhostJoin] = useState<any>();
    const [ghostLineValues, setGhostLineValues] = useState<any>();

    // Liq Series
    const [liqBidSeries, setLiqBidSeries] = useState<any>();
    const [liqAskSeries, setLiqAskSeries] = useState<any>();

    // Liq Line Series
    const [lineAskSeries, setLineAskSeries] = useState<any>();
    const [lineBidSeries, setLineBidSeries] = useState<any>();
    const [lineGradient, setLineGradient] = useState<any>();
    const [lineDepthAskSeries, setLineDepthAskSeries] = useState<any>();
    const [lineDepthBidSeries, setLineDepthBidSeries] = useState<any>();

    // Liq Joins
    const [lineBidSeriesJoin, setLineBidSeriesJoin] = useState<any>();
    const [lineAskSeriesJoin, setLineAskSeriesJoin] = useState<any>();
    const [lineDepthBidSeriesJoin, setLineDepthBidSeriesJoin] = useState<any>();
    const [lineDepthAskSeriesJoin, setLineDepthAskSeriesJoin] = useState<any>();

    // Utils
    const [zoomUtils, setZoomUtils] = useState<any>();
    // const [popupHeight, setPopupHeight] = useState<any>();
    const [dragRange, setDragRange] = useState<any>();
    const [dragLimit, setDragLimit] = useState<any>();
    const [transformX, setTransformX] = useState<any>(0);

    const [yAxisWidth, setYaxisWidth] = useState('4rem');
    const [bandwidth, setBandwidth] = useState(5);

    const [gradientForAsk, setGradientForAsk] = useState();
    const [gradientForBid, setGradientForBid] = useState();

    // Subcharts
    const [tvlAreaSeries, setTvlAreaSeries] = useState<any>();
    const currentPoolPriceTick =
        poolPriceNonDisplay === undefined
            ? 0
            : Math.log(poolPriceNonDisplay) / Math.log(1.0001);
    useEffect(() => {
        useHandleSwipeBack(d3Container);
    }, [d3Container === null]);

    useEffect(() => {
        if (minPrice !== 0 && maxPrice !== 0) {
            setRanges((prevState) => {
                const newTargets = [...prevState];
                newTargets.filter(
                    (target: any) => target.name === 'Max',
                )[0].value = maxPrice;
                newTargets.filter(
                    (target: any) => target.name === 'Min',
                )[0].value = minPrice;

                setLiqHighlightedLinesAndArea(newTargets, true);

                scaleWithButtons(minPrice, maxPrice);

                return newTargets;
            });
        }
    }, [minPrice, maxPrice]);

    const scaleWithButtons = (minPrice: number, maxPrice: number) => {
        if (
            poolPriceDisplay !== undefined &&
            rescaleRangeBoundariesWithSlider &&
            rescale
        ) {
            const xmin = new Date(Math.floor(scaleData.xScale.domain()[0]));
            const xmax = new Date(Math.floor(scaleData.xScale.domain()[1]));

            const filtered = parsedChartData?.chartData.filter(
                (data: any) => data.date >= xmin && data.date <= xmax,
            );

            if (filtered !== undefined) {
                const minYBoundary = d3.min(filtered, (d) => d.low);
                const maxYBoundary = d3.max(filtered, (d) => d.high);

                if (maxYBoundary && minYBoundary) {
                    const min =
                        minYBoundary < minPrice ? minYBoundary : minPrice;
                    const max =
                        maxYBoundary > maxPrice ? maxYBoundary : maxPrice;

                    const buffer = Math.abs((max - min) / 6);
                    const domain = [min - buffer, max + buffer / 2];
                    scaleData.yScale.domain(domain);
                    setRescaleRangeBoundariesWithSlider(false);
                }
            }
        }
    };

    useEffect(() => {
        if (rescaleRangeBoundariesWithSlider) {
            scaleWithButtons(minPrice, maxPrice);
        }
    }, [rescaleRangeBoundariesWithSlider, minPrice, maxPrice]);

    const standardDeviation = (arr: any, usePopulation = false) => {
        const mean =
            arr.reduce((acc: any, val: any) => acc + val, 0) / arr.length;
        return Math.sqrt(
            arr
                .reduce(
                    (acc: any, val: any) => acc.concat((val - mean) ** 2),
                    [],
                )
                .reduce((acc: any, val: any) => acc + val, 0) /
                (arr.length - (usePopulation ? 0 : 1)),
        );
    };

    const setDefaultRangeData = () => {
        if (scaleData) {
            setRanges((prevState) => {
                const newTargets = [...prevState];
                newTargets.filter(
                    (target: any) => target.name === 'Max',
                )[0].value =
                    liquidityData !== undefined
                        ? liquidityData.topBoundary
                        : Infinity;
                newTargets.filter(
                    (target: any) => target.name === 'Min',
                )[0].value = 0;

                setLiqHighlightedLinesAndArea(newTargets);

                return newTargets;
            });
            d3.select(d3PlotArea.current)
                .select('svg')
                .select('.targets')
                .selectAll('.horizontal')
                .style('visibility', 'hidden');
        }
    };

    useEffect(() => {
        addDefsStyle();
    }, []);

    useEffect(() => {
        setRescale(true);
    }, [denomInBase]);

    const render = useCallback(() => {
        const nd = d3.select('#d3fc_group').node() as any;
        if (nd) nd.requestRedraw();
    }, []);

    useEffect(() => {
        console.log('re-rending chart');
        if (expandTradeTable) return;

        if (parsedChartData && parsedChartData?.chartData.length > 0) {
            if (
                !showLatest &&
                firstCandle &&
                parsedChartData?.chartData[0].time !== firstCandle
            ) {
                setIsCandleAdded(false);
                const diff = Math.abs(
                    firstCandle - parsedChartData?.chartData[0].time,
                );
                setFirstCandle(() => {
                    return parsedChartData?.chartData[0].time;
                });
                const domainLeft = scaleData.xScale.domain()[0];
                const domainRight = scaleData.xScale.domain()[1];
                scaleData.xScale.domain([
                    new Date(new Date(domainLeft).getTime() + diff * 1000),
                    new Date(new Date(domainRight).getTime() + diff * 1000),
                ]);
            } else if (firstCandle === undefined) {
                setFirstCandle(() => {
                    return parsedChartData?.chartData[0].time;
                });
            }
        }

        render();
        renderCanvas();
    }, [
        JSON.stringify(props.chartItemStates),
        expandTradeTable,
        parsedChartData?.chartData.length,
        parsedChartData?.chartData[0]?.time,
        firstCandle,
    ]);

    function addTextMarket(scale: any) {
        yAxis.tickValues([
            ...scale.ticks(),
            ...[market[0].value],
            ...(isMouseMoveCrosshair ? [crosshairData[0].y] : []),
        ]);

        yAxis.tickFormat((d: any) =>
            formatAmountChartData(
                d,
                d === market[0].value || d === crosshairData[0].y
                    ? undefined
                    : d.toString().split('.')[1]?.length,
            ),
        );

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
    }

    function addTextLimit(scale: any) {
        const resultData =
            scaleData.yScale(limit[0].value) -
            scaleData.yScale(market[0].value);
        const resultLocationData = resultData < 0 ? -20 : 20;
        const isSameLocation = Math.abs(resultData) < 20;
        const sameLocationData = scaleData.yScale.invert(
            scaleData.yScale(market[0].value) + resultLocationData,
        );
        yAxis.tickFormat((d: any) => {
            if (d === crosshairData[0].y) {
                return formatAmountChartData(crosshairData[0].y);
            } else {
                return isSameLocation && d === sameLocationData
                    ? formatAmountChartData(limit[0].value)
                    : formatAmountChartData(
                          d,
                          d === market[0].value || d === limit[0].value
                              ? undefined
                              : d.toString().split('.')[1]?.length,
                      );
            }
        });

        yAxis.tickValues([
            ...scale.ticks(),
            ...[
                isSameLocation ? sameLocationData : limit[0].value,
                market[0].value,
            ],
            ...(isMouseMoveCrosshair && !isLineDrag
                ? [crosshairData[0].y]
                : []),
        ]);

        yAxis.decorate((selection: any) => {
            selection
                .attr('filter', (d: any) => {
                    if (isMouseMoveCrosshair && d === crosshairData[0].y) {
                        return 'url(#crossHairBg)';
                    }
                    if (
                        isSameLocation
                            ? d === sameLocationData
                            : d === limit[0].value
                    ) {
                        if (checkLimitOrder) {
                            return sellOrderStyle === 'order_sell'
                                ? 'url(#textOrderSellBg)'
                                : 'url(#textOrderBuyBg)';
                        }
                        return 'url(#textBg)';
                    }
                    if (d === market[0].value) {
                        return 'url(#marketBg)';
                    }
                })
                .select('text')
                .attr('class', (d: any) => {
                    if (d === market[0].value) {
                        return 'market';
                    }
                    if (
                        (isSameLocation
                            ? d === sameLocationData
                            : d === limit[0].value) &&
                        checkLimitOrder
                    ) {
                        return sellOrderStyle === 'order_sell'
                            ? 'market'
                            : 'y_axis';
                    }
                    if (isMouseMoveCrosshair && d === crosshairData[0].y) {
                        return 'crossHairText';
                    }
                    if (
                        isSameLocation
                            ? d === sameLocationData
                            : d === limit[0].value
                    ) {
                        return 'y_axis';
                    }
                });
        });
    }

    function addTextRange(scale: any) {
        let isSameLocationMin = false;
        let sameLocationDataMin = false;
        let isSameLocationMax = false;
        let sameLocationDataMax = false;

        const low = ranges.filter((target: any) => target.name === 'Min')[0]
            .value;
        const high = ranges.filter((target: any) => target.name === 'Max')[0]
            .value;
        const marketValue = market[0].value;

        const differenceLowHigh =
            scaleData.yScale(low) - scaleData.yScale(high);
        const differenceLowMarket =
            scaleData.yScale(low) - scaleData.yScale(marketValue);
        const differenceHighMarket =
            scaleData.yScale(high) - scaleData.yScale(marketValue);

        const isSameLocationLowHigh = Math.abs(differenceLowHigh) <= 30;
        const differenceLowHighData = differenceLowHigh <= 0 ? -20 : 20;

        const isSameLocationLowMarket = Math.abs(differenceLowMarket) <= 20;
        const differenceLowMarketData = differenceLowMarket <= 0 ? -20 : 20;

        const isSameLocationHighMarket = Math.abs(differenceHighMarket) <= 20;

        const differenceHighMarketData = differenceHighMarket <= 0 ? -20 : 20;

        if (high > low) {
            if (marketValue > low && marketValue < high) {
                isSameLocationMax = isSameLocationHighMarket;
                isSameLocationMin = isSameLocationLowMarket;
                if (isSameLocationHighMarket) {
                    sameLocationDataMax = scaleData.yScale.invert(
                        scaleData.yScale(marketValue) +
                            differenceHighMarketData,
                    );
                }

                if (isSameLocationLowMarket) {
                    sameLocationDataMin = scaleData.yScale.invert(
                        scaleData.yScale(marketValue) + differenceLowMarketData,
                    );
                }

                if (differenceHighMarketData === differenceLowMarketData) {
                    sameLocationDataMin = scaleData.yScale.invert(
                        scaleData.yScale(marketValue) -
                            differenceHighMarketData,
                    );
                }
            } else if (low > marketValue && high > marketValue) {
                isSameLocationMax =
                    isSameLocationHighMarket || isSameLocationLowHigh;
                isSameLocationMin = isSameLocationLowMarket;

                if (isSameLocationLowHigh) {
                    sameLocationDataMax = scaleData.yScale.invert(
                        scaleData.yScale(low) - differenceLowHighData,
                    );
                }
                if (isSameLocationHighMarket) {
                    sameLocationDataMax = scaleData.yScale.invert(
                        scaleData.yScale(low) + differenceLowHighData,
                    );
                }

                if (isSameLocationLowMarket) {
                    isSameLocationMin = true;
                    sameLocationDataMin = scaleData.yScale.invert(
                        scaleData.yScale(marketValue) + differenceLowMarketData,
                    );
                }

                if (isSameLocationLowHigh && isSameLocationLowMarket) {
                    sameLocationDataMax = scaleData.yScale.invert(
                        scaleData.yScale(marketValue) +
                            differenceLowMarketData * 2,
                    );

                    if (differenceHighMarketData === differenceLowMarketData) {
                        sameLocationDataMax = scaleData.yScale.invert(
                            scaleData.yScale(marketValue) +
                                differenceHighMarketData * 2,
                        );
                    }
                }
            } else if (low < marketValue && high < marketValue) {
                isSameLocationMax = isSameLocationHighMarket;
                isSameLocationMin =
                    isSameLocationLowHigh || isSameLocationLowMarket;

                if (isSameLocationLowHigh) {
                    sameLocationDataMin = scaleData.yScale.invert(
                        scaleData.yScale(high) + differenceLowHighData,
                    );
                }

                if (isSameLocationHighMarket) {
                    sameLocationDataMax = scaleData.yScale.invert(
                        scaleData.yScale(marketValue) +
                            differenceHighMarketData,
                    );
                }

                if (isSameLocationLowHigh && isSameLocationHighMarket) {
                    sameLocationDataMax = scaleData.yScale.invert(
                        scaleData.yScale(marketValue) +
                            differenceHighMarketData,
                    );

                    sameLocationDataMin = scaleData.yScale.invert(
                        scaleData.yScale(marketValue) +
                            differenceHighMarketData +
                            differenceLowHighData,
                    );

                    if (differenceHighMarket === 0) {
                        sameLocationDataMax = scaleData.yScale.invert(
                            scaleData.yScale(marketValue) -
                                differenceHighMarketData,
                        );
                        sameLocationDataMin = scaleData.yScale.invert(
                            scaleData.yScale(marketValue) -
                                differenceHighMarketData * 2,
                        );
                    }

                    if (differenceHighMarket === differenceLowMarket) {
                        sameLocationDataMax = scaleData.yScale.invert(
                            scaleData.yScale(marketValue) -
                                (differenceLowMarket === 0
                                    ? differenceHighMarketData
                                    : -differenceHighMarketData),
                        );

                        sameLocationDataMin = scaleData.yScale.invert(
                            scaleData.yScale(marketValue) -
                                (differenceLowMarket === 0
                                    ? differenceHighMarketData * 2
                                    : -(differenceHighMarketData * 2)),
                        );
                    }
                }
            }
        } else if (low > high) {
            if (marketValue > low && marketValue > high) {
                if (isSameLocationLowHigh) {
                    isSameLocationMax = true;
                    sameLocationDataMax = scaleData.yScale.invert(
                        scaleData.yScale(low) - differenceLowHighData,
                    );
                }

                if (isSameLocationLowMarket) {
                    isSameLocationMin = true;
                    sameLocationDataMin = scaleData.yScale.invert(
                        scaleData.yScale(marketValue) + differenceLowMarketData,
                    );
                }

                if (isSameLocationLowMarket && isSameLocationLowHigh) {
                    isSameLocationMax = true;
                    isSameLocationMin = true;
                    sameLocationDataMin = scaleData.yScale.invert(
                        scaleData.yScale(marketValue) + differenceLowMarketData,
                    );

                    sameLocationDataMax = scaleData.yScale.invert(
                        scaleData.yScale(marketValue) +
                            differenceLowMarketData -
                            differenceLowHighData,
                    );
                }
            }

            if (marketValue < low && marketValue > high) {
                if (isSameLocationLowMarket) {
                    isSameLocationMin = true;
                    sameLocationDataMin = scaleData.yScale.invert(
                        scaleData.yScale(marketValue) + differenceLowMarketData,
                    );
                }

                if (isSameLocationHighMarket) {
                    isSameLocationMax = true;
                    sameLocationDataMax = scaleData.yScale.invert(
                        scaleData.yScale(marketValue) +
                            differenceHighMarketData,
                    );
                }
            }

            if (marketValue < low && marketValue < high) {
                if (isSameLocationLowHigh) {
                    isSameLocationMin = true;
                    sameLocationDataMin = scaleData.yScale.invert(
                        scaleData.yScale(high) + differenceLowHighData,
                    );
                }

                if (isSameLocationHighMarket) {
                    isSameLocationMax = true;
                    sameLocationDataMax = scaleData.yScale.invert(
                        scaleData.yScale(marketValue) +
                            differenceHighMarketData,
                    );
                }
                if (isSameLocationHighMarket && isSameLocationLowHigh) {
                    isSameLocationMax = true;
                    isSameLocationMin = true;
                    sameLocationDataMax = scaleData.yScale.invert(
                        scaleData.yScale(marketValue) +
                            differenceHighMarketData,
                    );

                    sameLocationDataMin = scaleData.yScale.invert(
                        scaleData.yScale(marketValue) +
                            differenceHighMarketData +
                            differenceLowHighData,
                    );
                }
            }
        } else {
            if (marketValue < low && marketValue < high) {
                isSameLocationMax = true;
                sameLocationDataMax = scaleData.yScale.invert(
                    scaleData.yScale(low) - differenceLowHighData,
                );

                if (isSameLocationHighMarket || isSameLocationLowMarket) {
                    isSameLocationMin = true;
                    sameLocationDataMin = scaleData.yScale.invert(
                        scaleData.yScale(marketValue) + differenceLowMarketData,
                    );

                    sameLocationDataMax = scaleData.yScale.invert(
                        scaleData.yScale(marketValue) +
                            differenceLowMarketData * 2,
                    );
                }
            }

            if (marketValue > low && marketValue > high) {
                isSameLocationMin = true;
                sameLocationDataMin = scaleData.yScale.invert(
                    scaleData.yScale(high) + differenceLowHighData,
                );

                if (isSameLocationLowMarket || differenceLowMarket < 35) {
                    isSameLocationMax = true;
                    sameLocationDataMax = scaleData.yScale.invert(
                        scaleData.yScale(marketValue) +
                            differenceHighMarketData,
                    );

                    sameLocationDataMin = scaleData.yScale.invert(
                        scaleData.yScale(marketValue) +
                            differenceHighMarketData * 2,
                    );
                }
            }

            if (low === marketValue) {
                isSameLocationMin = true;
                isSameLocationMax = true;

                sameLocationDataMax = scaleData.yScale.invert(
                    scaleData.yScale(marketValue) - differenceHighMarketData,
                );

                sameLocationDataMin = scaleData.yScale.invert(
                    scaleData.yScale(marketValue) + differenceHighMarketData,
                );
            }
        }

        yAxis.tickValues([
            ...scale.ticks(),
            ...(simpleRangeWidth === 100 &&
            (!isAdvancedModeActive || location.pathname.includes('reposition'))
                ? [market[0].value]
                : [
                      isSameLocationMin ? sameLocationDataMin : low,
                      isSameLocationMax ? sameLocationDataMax : high,
                      market[0].value,
                  ]),
            ...(isMouseMoveCrosshair && !isLineDrag
                ? [crosshairData[0].y]
                : []),
        ]);

        yAxis.tickFormat((d: any) => {
            if (simpleRangeWidth !== 100 || isAdvancedModeActive) {
                const data =
                    (isSameLocationMin && d === sameLocationDataMin) ||
                    (isSameLocationMax && d === sameLocationDataMax)
                        ? isSameLocationMin && d === sameLocationDataMin
                            ? low
                            : high
                        : d;

                const longerValue =
                    formatAmountChartData(low).length >
                    formatAmountChartData(high).length
                        ? low
                        : high;
                const shorterValue =
                    formatAmountChartData(low).length >
                    formatAmountChartData(high).length
                        ? high
                        : low;

                const isSameLocation =
                    isSameLocationMin && d === sameLocationDataMin
                        ? isSameLocationMin
                        : isSameLocationMax;
                const sameLocationData =
                    isSameLocationMin && d === sameLocationDataMin
                        ? sameLocationDataMin
                        : sameLocationDataMax;

                const digit =
                    formatAmountChartData(low).length >=
                    formatAmountChartData(high).length
                        ? formatAmountChartData(low).length -
                          formatAmountChartData(high).length +
                          formatAmountChartData(high).toString().split('.')[1]
                              ?.length
                        : formatAmountChartData(high).length -
                          formatAmountChartData(low).length +
                          formatAmountChartData(low).toString().split('.')[1]
                              ?.length;

                return formatAmountChartData(
                    isSameLocation && d === sameLocationData ? data : d,

                    d === sameLocationDataMax ||
                        d === sameLocationDataMin ||
                        d === shorterValue ||
                        d === longerValue ||
                        d === market[0].value ||
                        d === crosshairData[0].y
                        ? d === longerValue ||
                          d === market[0].value ||
                          d === crosshairData[0].y ||
                          d === sameLocationData
                            ? undefined
                            : digit
                        : d.toString().split('.')[1]?.length,
                );
            } else {
                return formatAmountChartData(
                    d,
                    d === market[0].value
                        ? undefined
                        : d.toString().split('.')[1]?.length,
                );
            }
        });

        yAxis.decorate((selection: any) => {
            selection
                .attr('filter', (d: any) => {
                    if (isMouseMoveCrosshair && d === crosshairData[0].y) {
                        return 'url(#crossHairBg)';
                    }

                    if (
                        (simpleRangeWidth !== 100 || isAdvancedModeActive) &&
                        ((isSameLocationMin
                            ? d === sameLocationDataMin
                            : d === low) ||
                            (isSameLocationMax
                                ? d === sameLocationDataMax
                                : d === high))
                    ) {
                        return 'url(#textBg)';
                    }
                    if (d === market[0].value) {
                        return 'url(#marketBg)';
                    }
                })
                .select('text')
                .attr('class', (d: any) => {
                    if (d === market[0].value) {
                        return 'market';
                    }
                    if (isMouseMoveCrosshair && d === crosshairData[0].y) {
                        return 'crossHairText';
                    }
                    if (
                        (simpleRangeWidth !== 100 || isAdvancedModeActive) &&
                        ((isSameLocationMin
                            ? d === sameLocationDataMin
                            : d === low) ||
                            (isSameLocationMax
                                ? d === sameLocationDataMax
                                : d === high))
                    ) {
                        return 'y_axis';
                    }
                });
        });
    }

    async function getXAxisTick() {
        const oldTickValues = scaleData.xScale.ticks();
        let result = oldTickValues;

        const domainX = scaleData.xScale.domain();
        if (activeTimeFrame === '1h') {
            result = await getHourAxisTicks(
                domainX[0],
                domainX[1],
                oldTickValues,
                bandwidth,
                1,
            );
        }

        if (activeTimeFrame === '1d') {
            result = await getOneDayAxisTicks(
                domainX[0],
                domainX[1],
                oldTickValues,
                bandwidth,
            );
        }

        if (activeTimeFrame === '4h') {
            result = await getHourAxisTicks(
                domainX[0],
                domainX[1],
                oldTickValues,
                bandwidth,
                4,
            );
        }

        if (activeTimeFrame === '15m') {
            result = get15MinutesAxisTicks(
                domainX[0],
                domainX[1],
                oldTickValues,
                bandwidth,
            );
        }

        if (activeTimeFrame === '5m') {
            result = get5MinutesAxisTicks(
                domainX[0],
                domainX[1],
                oldTickValues,
                bandwidth,
            );
        }

        if (activeTimeFrame === '1m') {
            result = get1MinuteAxisTicks(
                domainX[0],
                domainX[1],
                oldTickValues,
                bandwidth,
            );
        }

        return result;
    }

    const utcDiff = moment().utcOffset();
    const utcDiffHours = Math.floor(utcDiff / 60);

    useEffect(() => {
        setBandwidth(5);
    }, [reset]);

    // x axis text
    useEffect(() => {
        if (scaleData && xAxis) {
            getXAxisTick().then((res) => {
                const _res = res.map((item: any) => item.date);
                xAxis
                    .tickValues([
                        ..._res,
                        ...(isMouseMoveCrosshair ? [crosshairData[0].x] : []),
                    ])
                    .tickFormat((d: any) => {
                        if (d === crosshairData[0].x) {
                            if (activeTimeFrame === '1d') {
                                return moment(d)
                                    .subtract(utcDiffHours, 'hours')
                                    .format('MMM DD YYYY');
                            } else {
                                return moment(d).format('MMM DD HH:mm');
                            }
                        }

                        if (
                            moment(d)
                                .format('DD')
                                .match(/^(01)$/) &&
                            moment(d).format('HH:mm') === '00:00'
                        ) {
                            return moment(d).format('MMM') === 'Jan'
                                ? moment(d).format('YYYY')
                                : moment(d).format('MMM');
                        }

                        if (
                            moment(d).format('HH:mm') === '00:00' ||
                            activeTimeFrame.match(/^(1d)$/)
                        ) {
                            return moment(d).format('DD');
                        } else {
                            return moment(d).format('HH:mm');
                        }
                    });

                xAxis.decorate((selection: any) => {
                    selection
                        .attr('filter', (d: any) => {
                            if (d === crosshairData[0].x) {
                                return 'url(#crossHairBg)';
                            }
                        })
                        .select('text')
                        .attr('class', (d: any) => {
                            if (d === crosshairData[0].x) {
                                return 'crossHairText';
                            }

                            if (
                                res.find(
                                    (item: any) =>
                                        item.date.getTime() === d.getTime(),
                                )?.style
                            ) {
                                return 'startDate';
                            }
                        });
                });
            });
        }
    }, [
        crosshairData,
        isMouseMoveCrosshair,
        zoomAndYdragControl,
        scaleData,
        xAxis,
        JSON.stringify(d3Container.current?.offsetWidth),
        mouseMoveEventCharts,
        activeTimeFrame,
        latest,
        rescale,
        bandwidth,
    ]);

    function changeyAxisWidth() {
        let yTickValueLength = scaleData.yScale.ticks()[0]?.toString().length;
        let result = false;
        scaleData.yScale.ticks().forEach((element: any) => {
            if (element.toString().length > 4) {
                result = true;
                yTickValueLength =
                    yTickValueLength > element.toString().length
                        ? yTickValueLength
                        : element.toString().length;
            }
        });
        if (result) {
            if (yTickValueLength > 4 && yTickValueLength < 8)
                setYaxisWidth('6rem');
            if (yTickValueLength >= 8) setYaxisWidth('7rem');
            if (yTickValueLength >= 15) setYaxisWidth('10rem');
            if (yTickValueLength >= 20) setYaxisWidth('11rem');
        }
        if (yTickValueLength <= 4) setYaxisWidth('5rem');
    }
    useEffect(() => {
        if (scaleData && yAxis) {
            if (location.pathname.includes('market')) {
                addTextMarket(scaleData.yScale);
            } else if (location.pathname.includes('/limit')) {
                addTextLimit(scaleData.yScale);
            } else if (
                location.pathname.includes('range') ||
                location.pathname.includes('reposition')
            ) {
                addTextRange(scaleData.yScale);
            }
            changeyAxisWidth();
            render();
        }
    }, [
        dragControl,
        yAxis,
        location,
        scaleData && scaleData.yScale.domain(),
        zoomAndYdragControl,
        ranges,
        limit,
        market,
        crosshairData,
        isMouseMoveCrosshair,
        scaleData,
    ]);

    const showHighlightedLines = () => {
        d3.select(d3PlotArea.current)
            .select('.lineAskSeries')
            .style('visibility', 'visible');

        d3.select(d3PlotArea.current)
            .select('.lineBidSeries')
            .style('visibility', 'visible');

        d3.select(d3PlotArea.current)
            .select('.lineDepthAskSeries')
            .style('visibility', 'visible');

        d3.select(d3PlotArea.current)
            .select('.lineDepthBidSeries')
            .style('visibility', 'visible');
    };

    const hideHighlightedLines = () => {
        d3.select(d3PlotArea.current)
            .select('.lineAskSeries')
            .style('visibility', 'hidden');

        d3.select(d3PlotArea.current)
            .select('.lineBidSeries')
            .style('visibility', 'hidden');

        d3.select(d3PlotArea.current)
            .select('.lineDepthAskSeries')
            .style('visibility', 'hidden');

        d3.select(d3PlotArea.current)
            .select('.lineDepthBidSeries')
            .style('visibility', 'hidden');
    };

    useEffect(() => {
        if (
            location.pathname.includes('range') ||
            location.pathname.includes('reposition')
        ) {
            if (simpleRangeWidth !== 100 || isAdvancedModeActive) {
                d3.select(d3PlotArea.current)
                    .select('.targets')
                    .style('visibility', 'visible');
                d3.select(d3PlotArea.current)
                    .select('.targets')
                    .selectAll('.horizontal')
                    .style('visibility', 'visible');

                d3.select(d3PlotArea.current)
                    .select('.horizontalBand')
                    .style('visibility', 'visible');
            }

            showHighlightedLines();
            d3.select(d3PlotArea.current)
                .select('.targets')
                .select('.annotation-line')
                .on('mouseover', (event: any) => {
                    d3.select(event.currentTarget)
                        .select('.detector')
                        .style('cursor', 'row-resize');
                });

            d3.select(d3PlotArea.current)
                .select('.limit')
                .style('visibility', 'hidden');
            d3.select(d3Container.current)
                .select('.limit')
                .select('.horizontal')
                .style('visibility', 'hidden');
        } else if (location.pathname.includes('/limit')) {
            d3.select(d3PlotArea.current)
                .select('.limit')
                .style('visibility', 'visible');

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

            d3.select(d3PlotArea.current)
                .select('.horizontalBand')
                .style('visibility', 'hidden');
            hideHighlightedLines();
            d3.select(d3Container.current)
                .select('.targets')
                .selectAll('.horizontal')
                .style('visibility', 'hidden')
                .style('filter', 'none');
        } else if (location.pathname.includes('market')) {
            d3.select(d3Container.current)
                .select('.limit')
                .style('visibility', 'hidden');
            d3.select(d3Container.current)
                .select('.limit')
                .select('.horizontal')
                .style('visibility', 'hidden');

            d3.select(d3PlotArea.current)
                .select('.horizontalBand')
                .style('visibility', 'hidden');

            hideHighlightedLines();

            d3.select(d3Container.current)
                .select('.targets')
                .selectAll('.horizontal')
                .style('visibility', 'hidden')
                .style('filter', 'none');
        }
    }, [
        location,
        location.pathname,
        parsedChartData?.period,
        simpleRangeWidth,
        isAdvancedModeActive,
    ]);

    useEffect(() => {
        setRescale(true);
    }, [location.pathname, parsedChartData?.period]);

    useEffect(() => {
        setLiqHighlightedLinesAndArea(ranges);
    }, [parsedChartData?.poolAdressComb]);

    const snapForCandle = (point: any) => {
        if (point == undefined) return [];
        const series = candlestick;
        const data = parsedChartData?.chartData as any;
        const xScale = series.xScale(),
            xValue = series.crossValue();

        const filtered =
            data.length > 1 ? data.filter((d: any) => xValue(d) != null) : data;

        if (filtered.length > 1) {
            const nearest = minimum(filtered, (d: any) =>
                Math.abs(point.offsetX - xScale(xValue(d))),
            )[1];
            return nearest;
        }

        return filtered[0];
    };

    const getNewCandleData = (newBoundary: any, lastCandleDate: any) => {
        let candleDomain: candleDomain;

        candleDomain = {
            lastCandleDate: parsedChartData?.chartData[0].time,
            domainBoundry: lastCandleDate.getTime(),
        };

        if (newBoundary < lastCandleDate) {
            const filtered = parsedChartData?.chartData.filter(
                (data: any) => data.time !== undefined,
            );

            if (filtered) {
                const maxBoundary: any =
                    d3.min(filtered, (d: any) => d.time) * 1000 -
                    200 * parsedChartData?.period * 1000;

                lastCandleDate.setTime(
                    new Date(newBoundary).getTime() -
                        100 * parsedChartData?.period * 1000,
                );

                candleDomain = {
                    lastCandleDate: parsedChartData?.chartData[0].time,
                    domainBoundry:
                        maxBoundary > lastCandleDate.getTime()
                            ? maxBoundary
                            : lastCandleDate.getTime(),
                };

                props.setCandleDomains(candleDomain);
            }
        }
    };

    const hideCrosshair = () => {
        d3.select(d3PlotArea.current)
            .select('svg')
            .select('.crosshairHorizontal')
            .selectChild()
            .style('visibility', 'hidden');

        d3.select(d3PlotArea.current)
            .select('svg')
            .select('.crosshairVertical')
            .selectChild()
            .style('visibility', 'hidden');

        d3.select('#tvl_chart')
            .select('svg')
            .select('.crosshairHorizontal')
            .selectChild()
            .style('visibility', 'hidden');

        d3.select('#tvl_chart')
            .select('svg')
            .select('.crosshairVertical')
            .selectChild()
            .style('visibility', 'hidden');

        d3.select('#fee_rate_chart')
            .select('svg')
            .select('.crosshairHorizontal')
            .selectChild()
            .style('visibility', 'hidden');

        d3.select('#fee_rate_chart')
            .select('svg')
            .select('.crosshairVertical')
            .selectChild()
            .style('visibility', 'hidden');
    };

    const showCrosshair = () => {
        d3.select(d3PlotArea.current)
            .select('svg')
            .select('.crosshairHorizontal')
            .selectChild()
            .style('visibility', 'visible');

        d3.select(d3PlotArea.current)
            .select('svg')
            .select('.crosshairVertical')
            .selectChild()
            .style('visibility', 'visible');

        d3.select('#tvl_chart')
            .select('svg')
            .select('.crosshairHorizontal')
            .selectChild()
            .style('visibility', 'visible');

        d3.select('#tvl_chart')
            .select('svg')
            .select('.crosshairVertical')
            .selectChild()
            .style('visibility', 'visible');

        d3.select('#fee_rate_chart')
            .select('svg')
            .select('.crosshairHorizontal')
            .selectChild()
            .style('visibility', 'visible');

        d3.select('#fee_rate_chart')
            .select('svg')
            .select('.crosshairVertical')
            .selectChild()
            .style('visibility', 'visible');
    };

    // Zoom
    useEffect(() => {
        if (scaleData !== undefined && parsedChartData !== undefined) {
            let lastCandleDate: any | undefined = undefined;
            let clickedForLine = false;
            let zoomTimeout: any | undefined = undefined;
            let previousTouch: any | undefined = undefined;
            let previousDeltaTouch: any = undefined;

            const changeCandleSize = (
                domainX: any,
                deltaX: number,
                offsetX: number,
            ) => {
                const gapTop =
                    domainX[1].getTime() -
                    scaleData.xScale.invert(offsetX).getTime();
                const gapBot =
                    scaleData.xScale.invert(offsetX).getTime() -
                    domainX[0].getTime();

                const minGap = Math.min(gapTop, gapBot);
                const maxGap = Math.max(gapTop, gapBot);
                let baseMovement = deltaX / (maxGap / minGap + 1);
                baseMovement = baseMovement === 0 ? deltaX : baseMovement;
                if (gapBot < gapTop) {
                    getNewCandleData(
                        new Date(domainX[0].getTime() - baseMovement),
                        lastCandleDate,
                    );
                    scaleData.xScale.domain([
                        new Date(domainX[0].getTime() - baseMovement),
                        new Date(
                            domainX[1].getTime() +
                                baseMovement * (maxGap / minGap),
                        ),
                    ]);
                } else {
                    getNewCandleData(
                        new Date(
                            domainX[0].getTime() -
                                baseMovement * (maxGap / minGap),
                        ),
                        lastCandleDate,
                    );

                    let minX = new Date(
                        domainX[0].getTime() - baseMovement * (maxGap / minGap),
                    );
                    let maxX = new Date(domainX[1].getTime() + baseMovement);

                    if (minX.toString() === 'Invalid Date') {
                        minX = new Date(
                            domainX[0].getTime() -
                                parsedChartData.period * 1000 * 300,
                        );
                    }

                    if (maxX.toString() === 'Invalid Date') {
                        maxX = new Date(
                            domainX[1].getTime() +
                                parsedChartData.period * 1000,
                        );
                    }
                    scaleData.xScale.domain([minX, maxX]);
                }
            };

            const rescaleYAxis = () => {
                const xmin = new Date(Math.floor(scaleData.xScale.domain()[0]));
                const xmax = new Date(Math.floor(scaleData.xScale.domain()[1]));

                const filtered = parsedChartData?.chartData.filter(
                    (data: any) => data.date >= xmin && data.date <= xmax,
                );

                if (rescale && filtered && filtered?.length > 10) {
                    if (filtered !== undefined) {
                        const low = ranges.filter(
                            (target: any) => target.name === 'Min',
                        )[0].value;
                        const high = ranges.filter(
                            (target: any) => target.name === 'Max',
                        )[0].value;

                        const minYBoundary: any = d3.min(
                            filtered,
                            (d: any) => d.low,
                        );
                        const maxYBoundary: any = d3.max(
                            filtered,
                            (d: any) => d.high,
                        );

                        if (
                            (location.pathname.includes('range') ||
                                location.pathname.includes('reposition')) &&
                            (simpleRangeWidth !== 100 || isAdvancedModeActive)
                        ) {
                            if (
                                maxYBoundary !== undefined &&
                                minYBoundary !== undefined
                            ) {
                                const buffer = Math.abs(
                                    (Math.min(low, minYBoundary) -
                                        Math.max(high, maxYBoundary)) /
                                        6,
                                );

                                const domain = [
                                    Math.min(low, minYBoundary) - buffer,
                                    Math.max(high, maxYBoundary) + buffer / 2,
                                ];
                                scaleData.yScale.domain(domain);
                            }
                        } else if (location.pathname.includes('/limit')) {
                            if (
                                maxYBoundary !== undefined &&
                                minYBoundary !== undefined &&
                                poolPriceDisplay
                            ) {
                                const value = limit[0].value;

                                if (value > 0) {
                                    const low =
                                        minYBoundary < value
                                            ? minYBoundary
                                            : value;

                                    const high =
                                        maxYBoundary > value
                                            ? maxYBoundary
                                            : value;

                                    const buffer = Math.abs((low - high) / 6);
                                    const domain = [
                                        low - buffer,
                                        high + buffer / 2,
                                    ];
                                    scaleData.yScale.domain(domain);
                                } else {
                                    const buffer = Math.abs(
                                        (minYBoundary - maxYBoundary) / 6,
                                    );

                                    const domain = [
                                        minYBoundary - buffer,
                                        maxYBoundary + buffer / 2,
                                    ];
                                    scaleData.yScale.domain(domain);
                                }
                            }
                        } else {
                            if (
                                maxYBoundary !== undefined &&
                                minYBoundary !== undefined
                            ) {
                                const buffer = Math.abs(
                                    (maxYBoundary - minYBoundary) / 6,
                                );

                                const domain = [
                                    minYBoundary - buffer,
                                    maxYBoundary + buffer / 2,
                                ];
                                scaleData.yScale.domain(domain);
                            }
                        }
                    }
                }
            };

            const zoomWithWhell = (event: any, parsedChartData: any) => {
                let dx = event.sourceEvent.deltaY / 2;

                dx = Math.abs(dx) === 0 ? -event.sourceEvent.deltaX / 2 : dx;

                const domainX = scaleData.xScale.domain();
                const linearX = d3
                    .scaleTime()
                    .domain(scaleData.xScale.range())
                    .range([0, domainX[1] - domainX[0]]);

                const deltaX = linearX(dx);
                if (event.sourceEvent.shiftKey || event.sourceEvent.altKey) {
                    getNewCandleData(
                        new Date(domainX[0].getTime() + deltaX),
                        lastCandleDate,
                    );

                    scaleData.xScale.domain([
                        new Date(domainX[0].getTime() + deltaX),
                        new Date(domainX[1].getTime() + deltaX),
                    ]);
                } else {
                    if (
                        (deltaX < 0 ||
                            Math.abs(
                                domainX[1].getTime() - domainX[0].getTime(),
                            ) <=
                                parsedChartData.period * 1000 * 300) &&
                        (deltaX > 0 ||
                            Math.abs(
                                domainX[1].getTime() - domainX[0].getTime(),
                            ) >=
                                parsedChartData.period * 1000 * 2)
                    ) {
                        if (
                            (!event.sourceEvent.ctrlKey ||
                                event.sourceEvent.metaKey) &&
                            (event.sourceEvent.ctrlKey ||
                                !event.sourceEvent.metaKey)
                        ) {
                            const newBoundary = new Date(
                                domainX[0].getTime() - deltaX,
                            );
                            const lastXIndex =
                                parsedChartData.chartData.findIndex(
                                    (d: any) =>
                                        d.date ===
                                        d3.max(
                                            parsedChartData.chartData,
                                            (d: any) => d.date,
                                        ),
                                );

                            if (
                                newBoundary.getTime() >
                                parsedChartData.chartData[
                                    lastXIndex
                                ].date.getTime() -
                                    parsedChartData.period * 1000 * 2
                            ) {
                                const leftBoudnary = new Date(
                                    parsedChartData.chartData[
                                        lastXIndex + 1
                                    ].date.getTime() -
                                        parsedChartData.period * 500,
                                );

                                getNewCandleData(leftBoudnary, lastCandleDate);

                                scaleData.xScale.domain([
                                    leftBoudnary,
                                    new Date(domainX[1].getTime() + deltaX),
                                ]);
                            } else {
                                getNewCandleData(newBoundary, lastCandleDate);
                                scaleData.xScale.domain([
                                    newBoundary,
                                    domainX[1],
                                ]);
                            }
                        } else {
                            changeCandleSize(
                                domainX,
                                deltaX,
                                event.sourceEvent.offsetX,
                            );
                        }
                    }
                }
            };

            const zoom = d3
                .zoom()
                .on('start', (event: any) => {
                    setIsChartZoom(true);
                    if (event.sourceEvent.type.includes('touch')) {
                        // mobile
                        previousTouch = event.sourceEvent.touches[0];

                        if (event.sourceEvent.touches.length > 1) {
                            previousDeltaTouch = Math.hypot(
                                event.sourceEvent.touches[0].pageX -
                                    event.sourceEvent.touches[1].pageX,
                                event.sourceEvent.touches[0].pageY -
                                    event.sourceEvent.touches[1].pageY,
                            );
                        }
                    }
                    zoomTimeout = event.sourceEvent.timeStamp;
                    if (
                        event.sourceEvent &&
                        event.sourceEvent.type !== 'dblclick'
                    ) {
                        clickedForLine = false;

                        if (
                            event.sourceEvent &&
                            event.sourceEvent.type != 'wheel'
                        ) {
                            d3.select(d3Container.current).style(
                                'cursor',
                                'grabbing',
                            );
                        }

                        if (lastCandleDate === undefined) {
                            const filtered = parsedChartData?.chartData.filter(
                                (data: any) => data.time,
                            );

                            lastCandleDate = d3.min(filtered, (d) => d.date);
                        }

                        parsedChartData.chartData[0].date = new Date(
                            parsedChartData?.chartData[0].time * 1000,
                        );
                    }

                    hideCrosshair();
                })
                .on('zoom', (event: any) => {
                    async function newDomains(parsedChartData: any) {
                        if (
                            event.sourceEvent &&
                            event.sourceEvent.type !== 'dblclick'
                        ) {
                            if (event.sourceEvent.type === 'wheel') {
                                zoomWithWhell(event, parsedChartData);
                            } else if (
                                event.sourceEvent.type === 'touchmove' &&
                                event.sourceEvent.touches.length > 1
                            ) {
                                const domainX = scaleData.xScale.domain();
                                const linearX = d3
                                    .scaleTime()
                                    .domain(scaleData.xScale.range())
                                    .range([0, domainX[1] - domainX[0]]);

                                // mobile
                                const touch1 = event.sourceEvent.touches[0];
                                const touch2 = event.sourceEvent.touches[1];

                                const deltaTouch = Math.hypot(
                                    touch1.pageX - touch2.pageX,
                                    touch1.pageY - touch2.pageY,
                                );

                                let movement = Math.abs(
                                    touch1.pageX - touch2.pageX,
                                );

                                if (previousDeltaTouch > deltaTouch) {
                                    // zoom in
                                    movement = movement / 10;
                                }
                                if (previousDeltaTouch < deltaTouch) {
                                    // zoom out
                                    movement = -movement / 10;
                                }
                                const deltaX = linearX(movement);

                                changeCandleSize(
                                    domainX,
                                    deltaX,
                                    touch1.clientX,
                                );
                            } else {
                                const domainX = scaleData.xScale.domain();
                                const linearX = d3
                                    .scaleTime()
                                    .domain(scaleData.xScale.range())
                                    .range([0, domainX[1] - domainX[0]]);

                                let deltaX;
                                if (event.sourceEvent.type === 'touchmove') {
                                    // mobile
                                    const touch =
                                        event.sourceEvent.changedTouches[0];
                                    const _currentPageX = touch.pageX;
                                    const previousTouchPageX =
                                        previousTouch.pageX;
                                    const _movementX =
                                        _currentPageX - previousTouchPageX;

                                    deltaX = linearX(-_movementX);
                                } else {
                                    deltaX = linearX(
                                        -event.sourceEvent.movementX,
                                    );
                                }

                                if (deltaX) {
                                    getNewCandleData(
                                        new Date(domainX[0].getTime() + deltaX),
                                        lastCandleDate,
                                    );
                                    scaleData.xScale.domain([
                                        new Date(domainX[0].getTime() + deltaX),
                                        new Date(domainX[1].getTime() + deltaX),
                                    ]);
                                }
                            }

                            rescaleYAxis();

                            // PANNING
                            if (
                                !rescale &&
                                event.sourceEvent &&
                                (event.sourceEvent.type != 'wheel' ||
                                    (event.sourceEvent.type === 'touchmove' &&
                                        event.sourceEvent.touches.length < 2))
                            ) {
                                const domainY = scaleData.yScale.domain();
                                const linearY = d3
                                    .scaleLinear()
                                    .domain(scaleData.yScale.range())
                                    .range([domainY[1] - domainY[0], 0]);
                                let deltaY;
                                if (
                                    event.sourceEvent.type === 'touchmove' &&
                                    event.sourceEvent.touches.length === 1
                                ) {
                                    const touch =
                                        event.sourceEvent.changedTouches[0];

                                    const _currentPageY = touch.pageY;
                                    const previousTouchPageY =
                                        previousTouch.pageY;
                                    const _movementY =
                                        _currentPageY - previousTouchPageY;

                                    deltaY = linearY(_movementY);
                                } else {
                                    deltaY = linearY(
                                        event.sourceEvent.movementY,
                                    );
                                }

                                if (deltaY) {
                                    const domain = [
                                        domainY[0] + deltaY,
                                        domainY[1] + deltaY,
                                    ];

                                    scaleData.yScale.domain(domain);

                                    scaleData.yScaleIndicator.range([
                                        event.sourceEvent.offsetY,
                                        scaleData.yScale(poolPriceDisplay),
                                    ]);
                                }

                                const topPlacement =
                                    event.sourceEvent.y -
                                    80 -
                                    (event.sourceEvent.offsetY -
                                        scaleData.yScale(poolPriceDisplay)) /
                                        2;

                                liqTooltip
                                    .style(
                                        'top',
                                        topPlacement > 500
                                            ? 500
                                            : (topPlacement < 115
                                                  ? 115
                                                  : topPlacement) + 'px',
                                    )
                                    .style(
                                        'left',
                                        event.sourceEvent.offsetX - 80 + 'px',
                                    );

                                if (isAdvancedModeActive && liquidityData) {
                                    const liqAllBidPrices =
                                        liquidityData.liqBidData.map(
                                            (liqPrices: any) =>
                                                liqPrices.liqPrices,
                                        );
                                    const liqBidDeviation =
                                        standardDeviation(liqAllBidPrices);

                                    while (
                                        scaleData.yScale.domain()[1] +
                                            liqBidDeviation >=
                                        liquidityData.liqBidData[0].liqPrices
                                    ) {
                                        liquidityData.liqBidData.unshift({
                                            activeLiq: 30,
                                            liqPrices:
                                                liquidityData.liqBidData[0]
                                                    .liqPrices +
                                                liqBidDeviation,
                                            deltaAverageUSD: 0,
                                            cumAverageUSD: 0,
                                        });

                                        liquidityData.depthLiqBidData.unshift({
                                            activeLiq:
                                                liquidityData.depthLiqBidData[1]
                                                    .activeLiq,
                                            liqPrices:
                                                liquidityData.depthLiqBidData[0]
                                                    .liqPrices +
                                                liqBidDeviation,
                                            deltaAverageUSD: 0,
                                            cumAverageUSD: 0,
                                        });
                                    }

                                    setLiqHighlightedLinesAndArea(ranges);
                                }
                            }

                            clickedForLine = true;
                            if (candlestick) {
                                setBandwidth(candlestick.bandwidth());
                            }
                            render();
                            renderCanvas();

                            const nearest = snapForCandle(event.sourceEvent);
                            setCrosshairForSubChart((prevState) => {
                                const newData = [...prevState];

                                newData[0].x = nearest?.date;

                                return newData;
                            });

                            setZoomAndYdragControl(event);
                        }
                    }

                    newDomains(parsedChartData).then(() => {
                        // mobile
                        if (event.sourceEvent.type.includes('touch')) {
                            previousTouch = event.sourceEvent.changedTouches[0];
                            if (event.sourceEvent.touches.length > 1) {
                                previousDeltaTouch = Math.hypot(
                                    event.sourceEvent.touches[0].pageX -
                                        event.sourceEvent.touches[1].pageX,
                                    event.sourceEvent.touches[0].pageY -
                                        event.sourceEvent.touches[1].pageY,
                                );
                            }
                        }
                    });
                })
                .on('end', (event: any) => {
                    setIsChartZoom(false);
                    if (
                        event.sourceEvent &&
                        event.sourceEvent.type != 'wheel'
                    ) {
                        d3.select(d3Container.current).style(
                            'cursor',
                            'default',
                        );
                    }
                    if (clickedForLine) {
                        if (
                            event.sourceEvent.type !== 'wheel' &&
                            event.sourceEvent.timeStamp - zoomTimeout < 1
                        ) {
                            const {
                                isHoverCandleOrVolumeData,
                                _selectedDate,
                                nearest,
                            } = candleOrVolumeDataHoverStatus(
                                event.sourceEvent,
                            );
                            selectedDateEvent(
                                isHoverCandleOrVolumeData,
                                _selectedDate,
                                nearest,
                            );
                        }
                    }

                    const latestCandle = d3.max(
                        parsedChartData.chartData,
                        (d) => d.date,
                    );

                    if (
                        !showLatest &&
                        latestCandle &&
                        (scaleData.xScale.domain()[1] < latestCandle ||
                            scaleData.xScale.domain()[0] > latestCandle)
                    ) {
                        setShowLatest(true);
                    } else if (
                        showLatest &&
                        !(scaleData.xScale.domain()[1] < latestCandle) &&
                        !(scaleData.xScale.domain()[0] > latestCandle)
                    ) {
                        setShowLatest(false);
                    }

                    showCrosshair();

                    props.setShowTooltip(true);

                    setIsMouseMoveCrosshair(false);
                }) as any;

            let firstLocation: any;
            let newCenter: any;
            let previousDeltaTouchYaxis: any;

            const startZoom = (event: any) => {
                if (event.sourceEvent.type.includes('touch')) {
                    // mobile
                    previousTouch = event.sourceEvent.changedTouches[0];
                    firstLocation = previousTouch.pageY;
                    newCenter = scaleData.yScale.invert(firstLocation);

                    if (event.sourceEvent.touches.length > 1) {
                        previousDeltaTouchYaxis = Math.hypot(
                            0,
                            event.sourceEvent.touches[0].pageY -
                                event.sourceEvent.touches[1].pageY,
                        );
                        firstLocation = previousDeltaTouchYaxis;
                        newCenter = scaleData.yScale.invert(firstLocation);
                    }
                } else {
                    firstLocation = event.sourceEvent.offsetY;
                }

                hideCrosshair();
            };

            const yAxisZoom = d3
                .zoom()
                .on('start', (event) => {
                    startZoom(event);
                })
                .on('zoom', async (event: any) => {
                    (async () => {
                        const domainY = scaleData.yScale.domain();
                        const center =
                            domainY[1] !== domainY[0]
                                ? (domainY[1] + domainY[0]) / 2
                                : domainY[0] / 2;
                        let deltaY;

                        if (event.sourceEvent.type === 'touchmove') {
                            const touch = event.sourceEvent.changedTouches[0];

                            const _currentPageY = touch.pageY;
                            const previousTouchPageY = previousTouch.pageY;
                            const _movementY =
                                _currentPageY - previousTouchPageY;
                            deltaY = _movementY;
                        } else {
                            deltaY = event.sourceEvent.movementY / 1.5;
                            newCenter = scaleData.yScale.invert(firstLocation);
                        }

                        const dy = event.sourceEvent.deltaY / 3;

                        const factor = Math.pow(
                            2,
                            event.sourceEvent.type === 'wheel'
                                ? -dy * 0.003
                                : event.sourceEvent.type === 'mousemove'
                                ? -deltaY * 0.003
                                : event.sourceEvent.type === 'touchmove'
                                ? -deltaY * 0.005
                                : 1,
                        );

                        if (
                            event.sourceEvent.type !== 'touchmove' ||
                            event.sourceEvent.touches.length === 1
                        ) {
                            const size = (domainY[1] - domainY[0]) / factor;

                            const diff = domainY[1] - domainY[0];

                            const distance =
                                newCenter > center
                                    ? Math.abs(
                                          newCenter -
                                              scaleData.yScale.domain()[1],
                                      )
                                    : Math.abs(
                                          newCenter -
                                              scaleData.yScale.domain()[0],
                                      );
                            const diffFactor = (diff - distance) / distance;

                            const bottomDiff = size / (diffFactor + 1);
                            const topDiff = size - bottomDiff;

                            if (newCenter > center) {
                                const domain = [
                                    newCenter - topDiff,
                                    newCenter + bottomDiff,
                                ];

                                await scaleData.yScale.domain(domain);
                            } else {
                                const domain = [
                                    newCenter - bottomDiff,
                                    newCenter + topDiff,
                                ];

                                await scaleData.yScale.domain(domain);
                            }
                        } else if (event.sourceEvent.touches.length > 1) {
                            const touch1 = event.sourceEvent.touches[0];
                            const touch2 = event.sourceEvent.touches[1];
                            const deltaTouch = Math.hypot(
                                0,
                                touch1.pageY - touch2.pageY,
                            );

                            const currentDelta =
                                scaleData.yScale.invert(deltaTouch);
                            const delta =
                                Math.abs(currentDelta - newCenter) * 0.03;

                            if (previousDeltaTouchYaxis > deltaTouch) {
                                let domainMax =
                                    scaleData.yScale.domain()[1] + delta;
                                let domainMin =
                                    scaleData.yScale.domain()[0] - delta;

                                domainMax =
                                    domainMin > domainMax
                                        ? domainMin
                                        : domainMax;
                                domainMin =
                                    domainMin > domainMax
                                        ? domainMax
                                        : domainMin;

                                scaleData.yScale.domain([domainMin, domainMax]);
                            }
                            if (previousDeltaTouchYaxis < deltaTouch) {
                                let domainMax =
                                    scaleData.yScale.domain()[1] - delta * 0.5;
                                let domainMin =
                                    scaleData.yScale.domain()[0] + delta * 0.5;

                                domainMax =
                                    domainMin > domainMax
                                        ? domainMin
                                        : domainMax;
                                domainMin =
                                    domainMin > domainMax
                                        ? domainMax
                                        : domainMin;

                                if (domainMax === domainMin) {
                                    scaleData.yScale.domain([
                                        domainMin + delta,
                                        domainMax - delta,
                                    ]);
                                } else {
                                    scaleData.yScale.domain([
                                        domainMin,
                                        domainMax,
                                    ]);
                                }
                            }
                        }
                    })().then(() => {
                        if (event.sourceEvent.type.includes('touch')) {
                            // mobile
                            previousTouch = event.sourceEvent.changedTouches[0];

                            if (event.sourceEvent.touches.length > 1) {
                                previousDeltaTouchYaxis = Math.hypot(
                                    0,
                                    event.sourceEvent.touches[0].pageY -
                                        event.sourceEvent.touches[1].pageY,
                                );
                            }
                        }
                    });
                    if (isAdvancedModeActive && liquidityData) {
                        const liqAllBidPrices = liquidityData.liqBidData.map(
                            (liqPrices: any) => liqPrices.liqPrices,
                        );
                        const liqBidDeviation =
                            standardDeviation(liqAllBidPrices);

                        while (
                            scaleData.yScale.domain()[1] + liqBidDeviation >=
                            liquidityData.liqBidData[0].liqPrices
                        ) {
                            liquidityData.liqBidData.unshift({
                                activeLiq: 30,
                                liqPrices:
                                    liquidityData.liqBidData[0].liqPrices +
                                    liqBidDeviation,
                                deltaAverageUSD: 0,
                                cumAverageUSD: 0,
                            });

                            liquidityData.depthLiqBidData.unshift({
                                activeLiq:
                                    liquidityData.depthLiqBidData[1].activeLiq,
                                liqPrices:
                                    liquidityData.depthLiqBidData[0].liqPrices +
                                    liqBidDeviation,
                                deltaAverageUSD: 0,
                                cumAverageUSD: 0,
                            });
                        }

                        setLiqHighlightedLinesAndArea(ranges);
                    }

                    setZoomAndYdragControl(event);
                    setRescale(() => {
                        return false;
                    });

                    setMarketLineValue();
                    render();
                }) as any;

            const xAxisZoom = d3
                .zoom()
                .on('start', (event) => {
                    startZoom(event);

                    if (lastCandleDate === undefined) {
                        const filtered = parsedChartData?.chartData.filter(
                            (data: any) => data.time,
                        );

                        lastCandleDate = d3.min(filtered, (d) => d.date);
                    }
                })
                .on('zoom', async (event: any) => {
                    if (event.sourceEvent.type === 'wheel') {
                        zoomWithWhell(event, parsedChartData);
                    } else if (
                        event.sourceEvent.type === 'touchmove' &&
                        event.sourceEvent.touches.length > 1
                    ) {
                        const domainX = scaleData.xScale.domain();
                        const linearX = d3
                            .scaleTime()
                            .domain(scaleData.xScale.range())
                            .range([0, domainX[1] - domainX[0]]);

                        // mobile
                        const touch1 = event.sourceEvent.touches[0];
                        const touch2 = event.sourceEvent.touches[1];

                        const deltaTouch = Math.hypot(
                            touch1.pageX - touch2.pageX,
                            touch1.pageY - touch2.pageY,
                        );

                        let movement = Math.abs(touch1.pageX - touch2.pageX);

                        if (previousDeltaTouch > deltaTouch) {
                            // zoom out
                            movement = movement / 10;
                        }
                        if (previousDeltaTouch < deltaTouch) {
                            // zoom in
                            movement = -movement / 10;
                        }
                        const deltaX = linearX(movement);

                        changeCandleSize(domainX, deltaX, touch1.clientX);
                    } else {
                        const domainX = scaleData.xScale.domain();

                        const linearX = d3
                            .scaleTime()
                            .domain(scaleData.xScale.range())
                            .range([0, domainX[1] - domainX[0]]);

                        const deltaX = linearX(-event.sourceEvent.movementX);

                        if (deltaX !== undefined) {
                            getNewCandleData(
                                new Date(domainX[0].getTime() + deltaX),
                                lastCandleDate,
                            );
                            scaleData.xScale.domain([
                                new Date(domainX[0].getTime() + deltaX),
                                domainX[1],
                            ]);
                        }
                    }
                    rescaleYAxis();

                    setBandwidth(candlestick.bandwidth());
                    render();
                    renderCanvas();

                    setZoomAndYdragControl(event);
                })
                .on('end', () => {
                    const latestCandle = d3.max(
                        parsedChartData.chartData,
                        (d) => d.date,
                    );

                    if (
                        !showLatest &&
                        latestCandle &&
                        (scaleData.xScale.domain()[1] < latestCandle ||
                            scaleData.xScale.domain()[0] > latestCandle)
                    ) {
                        setShowLatest(true);
                    } else if (
                        showLatest &&
                        !(scaleData.xScale.domain()[1] < latestCandle) &&
                        !(scaleData.xScale.domain()[0] > latestCandle)
                    ) {
                        setShowLatest(false);
                    }
                });

            setZoomUtils(() => {
                return {
                    zoom: zoom,
                    yAxisZoom: yAxisZoom,
                    xAxisZoom: xAxisZoom,
                };
            });
        }
    }, [
        parsedChartData?.chartData,
        scaleData,
        rescale,
        location,
        candlestick,
        isZoomForSubChart,
        JSON.stringify(scaleData?.xScale.domain()[0]),
        JSON.stringify(scaleData?.xScale?.domain()[1]),
        transformX,
        JSON.stringify(showLatest),
        liquidityData?.liqBidData,
        simpleRangeWidth,
        ranges,
        limit,
    ]);

    useEffect(() => {
        console.log('timeframe changed');
        setShowLatest(false);
    }, [parsedChartData?.period]);

    useEffect(() => {
        if (scaleData !== undefined && liquidityData !== undefined) {
            if (rescale) {
                const xmin = new Date(Math.floor(scaleData.xScale.domain()[0]));
                const xmax = new Date(Math.floor(scaleData.xScale.domain()[1]));

                const filtered = parsedChartData?.chartData.filter(
                    (data: any) => data.date >= xmin && data.date <= xmax,
                );

                if (filtered !== undefined) {
                    const minYBoundary = d3.min(filtered, (d) => d.low);
                    const maxYBoundary = d3.max(filtered, (d) => d.high);

                    if (
                        (location.pathname.includes('range') ||
                            location.pathname.includes('reposition')) &&
                        (simpleRangeWidth !== 100 || isAdvancedModeActive)
                    ) {
                        const low = ranges.filter(
                            (target: any) => target.name === 'Min',
                        )[0].value;
                        const high = ranges.filter(
                            (target: any) => target.name === 'Max',
                        )[0].value;

                        if (
                            maxYBoundary !== undefined &&
                            minYBoundary !== undefined
                        ) {
                            const buffer = Math.abs(
                                (Math.max(high, maxYBoundary) -
                                    Math.min(low, minYBoundary)) /
                                    6,
                            );

                            const domain = [
                                Math.min(low, minYBoundary) - buffer,
                                Math.max(high, maxYBoundary) + buffer / 2,
                            ];

                            scaleData.yScale.domain(domain);
                        }

                        const liqAllBidPrices = liquidityData.liqBidData.map(
                            (liqPrices: any) => liqPrices.liqPrices,
                        );
                        const liqBidDeviation =
                            standardDeviation(liqAllBidPrices);

                        while (
                            scaleData.yScale.domain()[1] + liqBidDeviation >=
                            liquidityData?.liqBidData[0]?.liqPrices
                        ) {
                            liquidityData.liqBidData.unshift({
                                activeLiq: 30,
                                liqPrices:
                                    liquidityData.liqBidData[0].liqPrices +
                                    liqBidDeviation,
                                deltaAverageUSD: 0,
                                cumAverageUSD: 0,
                            });

                            liquidityData.depthLiqBidData.unshift({
                                activeLiq:
                                    liquidityData.depthLiqBidData[1].activeLiq,
                                liqPrices:
                                    liquidityData.depthLiqBidData[0].liqPrices +
                                    liqBidDeviation,
                                deltaAverageUSD: 0,
                                cumAverageUSD: 0,
                            });
                        }

                        setLiqHighlightedLinesAndArea(ranges);
                    } else if (location.pathname.includes('/limit')) {
                        if (
                            maxYBoundary !== undefined &&
                            minYBoundary !== undefined &&
                            poolPriceDisplay
                        ) {
                            const value = limit[0].value;
                            const low =
                                minYBoundary < value ? minYBoundary : value;

                            const high =
                                maxYBoundary > value ? maxYBoundary : value;
                            const bufferForLimit = Math.abs((low - high) / 6);

                            if (value > 0) {
                                const domain = [
                                    low - bufferForLimit,
                                    high + bufferForLimit / 2,
                                ];

                                scaleData.yScale.domain(domain);
                            }
                        }
                    } else {
                        if (
                            maxYBoundary !== undefined &&
                            minYBoundary !== undefined &&
                            liquidityData
                        ) {
                            const buffer = Math.abs(
                                (maxYBoundary - minYBoundary) / 6,
                            );
                            const domain = [
                                minYBoundary - buffer,
                                maxYBoundary + buffer / 2,
                            ];

                            scaleData.yScale.domain(domain);

                            setLiqHighlightedLinesAndArea(ranges);
                        }
                    }
                }
            }
        }
    }, [parsedChartData?.chartData?.length, rescale]);

    useEffect(() => {
        // const chartData = parsedChartData?.chartData;
        setMarketLineValue();
    }, [parsedChartData?.chartData[0]?.close]);

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

    const findLiqNearest = (liqDataAll: any[]) => {
        const point = scaleData.yScale(scaleData.yScale.domain()[0]);

        if (point == undefined) return 0;
        if (liqDataAll) {
            const tempLiqData = liqDataAll;

            const sortLiqaData = tempLiqData.sort(function (a, b) {
                return a.liqPrices - b.liqPrices;
            });

            const closestMin = sortLiqaData.reduce(function (prev, curr) {
                return Math.abs(curr.liqPrices - scaleData.yScale.domain()[0]) <
                    Math.abs(prev.liqPrices - scaleData.yScale.domain()[0])
                    ? curr
                    : prev;
            });

            const closestMax = sortLiqaData.reduce(function (prev, curr) {
                return Math.abs(curr.liqPrices - scaleData.yScale.domain()[1]) <
                    Math.abs(prev.liqPrices - scaleData.yScale.domain()[1])
                    ? curr
                    : prev;
            });

            if (closestMin !== undefined && closestMin !== undefined) {
                return {
                    min: closestMin.liqPrices ? closestMin.liqPrices : 0,
                    max: closestMax.liqPrices,
                };
            } else {
                return { min: 0, max: 0 };
            }
        }
    };

    useEffect(() => {
        const liqDataAll = liquidityData.depthLiqBidData.concat(
            liquidityData.depthLiqAskData,
        );

        const { min, max }: any = findLiqNearest(liqDataAll);
        const visibleDomain = liqDataAll.filter(
            (liqData: any) =>
                liqData.liqPrices >= min && liqData.liqPrices <= max,
        );
        const maxLiq = d3.max(visibleDomain, (d: any) => d.activeLiq);
        liquidityDepthScale.domain([0, maxLiq]);
    }, [
        scaleData && scaleData.yScale.domain()[0],
        scaleData && scaleData.yScale.domain()[1],
    ]);

    // set default limit tick
    useEffect(() => {
        if (tradeData.limitTick && Math.abs(tradeData.limitTick) === Infinity)
            dispatch(setLimitTick(undefined));
    }, []);

    useEffect(() => {
        setLimitLineValue();
    }, [tradeData.limitTick, denomInBase]);

    const setLimitLineValue = () => {
        if (tradeData.limitTick === undefined) return;
        const limitDisplayPrice = pool?.toDisplayPrice(
            tickToPrice(tradeData.limitTick),
        );
        limitDisplayPrice?.then((limit) => {
            setLimit([
                {
                    name: 'Limit',
                    value: denomInBase ? limit : 1 / limit || 0,
                },
            ]);
        });
    };

    useEffect(() => {
        setRanges((prevState) => {
            const newTargets = [...prevState];

            newTargets.filter((target: any) => target.name === 'Max')[0].value =
                maxPrice !== undefined ? maxPrice : 0;

            newTargets.filter((target: any) => target.name === 'Min')[0].value =
                minPrice !== undefined ? minPrice : 0;

            setLiqHighlightedLinesAndArea(newTargets);

            return newTargets;
        });
    }, [denomInBase]);

    useEffect(() => {
        if (position !== undefined) {
            setBalancedLines(true);
        }
    }, [position?.positionId]);

    const setBalancedLines = (isRepositionLinesSet = false) => {
        if (
            location.pathname.includes('reposition') &&
            position !== undefined &&
            isRepositionLinesSet
        ) {
            const lowTick = currentPoolPriceTick - 10 * 100;
            const highTick = currentPoolPriceTick + 10 * 100;

            const pinnedDisplayPrices = getPinnedPriceValuesFromTicks(
                isDenomBase,
                position.baseDecimals || 18,
                position.quoteDecimals || 18,
                lowTick,
                highTick,
                lookupChain(position?.chainId || '0x5').gridSize,
            );

            const pinnedMinPriceDisplayTruncated =
                pinnedDisplayPrices.pinnedMinPriceDisplayTruncated;
            const pinnedMaxPriceDisplayTruncated =
                pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated;

            setRanges((prevState) => {
                const newTargets = [...prevState];

                newTargets.filter(
                    (target: any) => target.name === 'Max',
                )[0].value = parseFloat(pinnedMaxPriceDisplayTruncated) || 0.0;

                newTargets.filter(
                    (target: any) => target.name === 'Min',
                )[0].value = parseFloat(pinnedMinPriceDisplayTruncated) || 0.0;

                setLiqHighlightedLinesAndArea(newTargets, true);

                return newTargets;
            });

            // setSimpleRangeWidth(10);
        } else if (
            simpleRangeWidth === 100 ||
            rescaleRangeBoundariesWithSlider
        ) {
            if (simpleRangeWidth === 100) {
                setDefaultRangeData();
            } else {
                setRanges((prevState) => {
                    const newTargets = [...prevState];

                    newTargets.filter(
                        (target: any) => target.name === 'Max',
                    )[0].value = maxPrice !== undefined ? maxPrice : 0;

                    newTargets.filter(
                        (target: any) => target.name === 'Min',
                    )[0].value = minPrice !== undefined ? minPrice : 0;

                    setLiqHighlightedLinesAndArea(newTargets);

                    if (
                        poolPriceDisplay !== undefined &&
                        rescaleRangeBoundariesWithSlider
                    ) {
                        const xmin = new Date(
                            Math.floor(scaleData.xScale.domain()[0]),
                        );
                        const xmax = new Date(
                            Math.floor(scaleData.xScale.domain()[1]),
                        );

                        const filtered = parsedChartData?.chartData.filter(
                            (data: any) =>
                                data.date >= xmin && data.date <= xmax,
                        );

                        if (filtered !== undefined) {
                            const minYBoundary = d3.min(filtered, (d) => d.low);
                            const maxYBoundary = d3.max(
                                filtered,
                                (d) => d.high,
                            );

                            if (maxYBoundary && minYBoundary) {
                                const low =
                                    minPrice !== undefined ? minPrice : 0;
                                const high =
                                    maxPrice !== undefined ? maxPrice : 0;

                                const min =
                                    minYBoundary < low ? minYBoundary : low;
                                const max =
                                    maxYBoundary > high ? maxYBoundary : high;

                                const buffer = Math.abs((max - min) / 6);

                                const domain = [min - buffer, max + buffer / 2];

                                scaleData.yScale.domain(domain);

                                setRescaleRangeBoundariesWithSlider(false);
                            }
                        }
                    }

                    return newTargets;
                });
            }
        } else {
            const lowTick =
                currentPoolPriceTick - (simpleRangeWidth || 10) * 100;
            const highTick =
                currentPoolPriceTick + (simpleRangeWidth || 10) * 100;

            const pinnedDisplayPrices = getPinnedPriceValuesFromTicks(
                denomInBase,
                baseTokenDecimals,
                quoteTokenDecimals,
                lowTick,
                highTick,
                lookupChain(chainId).gridSize,
            );

            setRanges((prevState) => {
                const newTargets = [...prevState];

                newTargets.filter(
                    (target: any) => target.name === 'Max',
                )[0].value =
                    parseFloat(pinnedDisplayPrices.pinnedMaxPriceDisplay) ||
                    0.0;

                newTargets.filter(
                    (target: any) => target.name === 'Min',
                )[0].value =
                    parseFloat(pinnedDisplayPrices.pinnedMinPriceDisplay) ||
                    0.0;

                setLiqHighlightedLinesAndArea(newTargets, true);

                return newTargets;
            });
        }
    };

    const setAdvancedLines = () => {
        if (minPrice !== undefined && maxPrice !== undefined) {
            setRanges(() => {
                const chartTargets = [
                    {
                        name: 'Min',
                        value: minPrice,
                    },
                    {
                        name: 'Max',
                        value: maxPrice,
                    },
                ];
                setLiqHighlightedLinesAndArea(chartTargets);

                return chartTargets;
            });

            setChartTriggeredBy('none');
        }
    };

    // Targets
    useEffect(() => {
        setMarketLineValue();
        if (location.pathname.includes('/limit')) {
            setLimitLineValue();
        }
    }, [location, props.limitTick, denomInBase]);

    useEffect(() => {
        console.log('setting range lines');
        if (
            location.pathname.includes('range') ||
            location.pathname.includes('reposition')
        ) {
            if (
                !isAdvancedModeActive ||
                location.pathname.includes('reposition')
            ) {
                setBalancedLines();
            }
        }
    }, [location, denomInBase, isAdvancedModeActive, simpleRangeWidth]);

    useEffect(() => {
        if (
            (location.pathname.includes('range') ||
                location.pathname.includes('reposition')) &&
            isAdvancedModeActive
        ) {
            if (chartTriggeredBy === '' || rescaleRangeBoundariesWithSlider) {
                setAdvancedLines();
            }
        }
    }, [
        location,
        denomInBase,
        minPrice,
        maxPrice,
        rescaleRangeBoundariesWithSlider,
        isAdvancedModeActive,
    ]);

    useEffect(() => {
        if (location.pathname.includes('reposition')) {
            setBalancedLines();
        }
    }, [location.pathname]);

    useEffect(() => {
        if (
            isAdvancedModeActive &&
            scaleData &&
            liquidityData &&
            denomInBase === boundaries
        ) {
            const liqAllBidPrices = liquidityData.liqBidData.map(
                (liqPrices: any) => liqPrices.liqPrices,
            );
            const liqBidDeviation = standardDeviation(liqAllBidPrices);

            while (
                liquidityData.liqBidData.length > 0 &&
                scaleData.yScale.domain()[1] + liqBidDeviation >=
                    liquidityData.liqBidData[0]?.liqPrices
            ) {
                liquidityData.liqBidData.unshift({
                    activeLiq: 30,
                    liqPrices:
                        liquidityData.liqBidData[0]?.liqPrices +
                        liqBidDeviation,
                    deltaAverageUSD: 0,
                    cumAverageUSD: 0,
                });

                liquidityData.depthLiqBidData.unshift({
                    activeLiq: liquidityData.depthLiqBidData[1]?.activeLiq,
                    liqPrices:
                        liquidityData.depthLiqBidData[0]?.liqPrices +
                        liqBidDeviation,
                    deltaAverageUSD: 0,
                    cumAverageUSD: 0,
                });
            }

            setLiqHighlightedLinesAndArea(ranges);
        } else {
            setBoundaries(denomInBase);
        }
    }, [isAdvancedModeActive, ranges, liquidityData?.liqBidData, scaleData]);

    // Ghost Lines
    useEffect(() => {
        if (scaleData !== undefined) {
            const ghostLines = d3fc
                .annotationSvgLine()
                .value((d: any) => d.tickValue)
                .xScale(scaleData.xScale)
                .yScale(scaleData.yScale);

            ghostLines.decorate((selection: any) => {
                selection.enter().attr('id', (d: any) => d.name);
                selection.enter().select('g.right-handle').remove();
                selection.enter().select('g.left-handle').remove();
                selection.enter().select('line').attr('class', 'ghostline');
                selection.enter().attr('pointer-events', 'none');
            });

            setGhostLines(() => {
                return ghostLines;
            });

            const ghostJoin = d3fc.dataJoin('g', 'ghostLines');

            setGhostJoin(() => {
                return ghostJoin;
            });
        }
    }, [scaleData]);

    function reverseTokenForChart(limitPreviousData: any, newLimitValue: any) {
        if (poolPriceDisplay) {
            // if (isUserLoggedIn && poolPriceDisplay) {
            if (sellOrderStyle === 'order_sell') {
                if (
                    limitPreviousData > poolPriceDisplay &&
                    newLimitValue < poolPriceDisplay
                ) {
                    handlePulseAnimation('limitOrder');
                    // reverseTokens();
                    dispatch(setShouldLimitDirectionReverse(true));
                }
            } else {
                if (
                    limitPreviousData < poolPriceDisplay &&
                    newLimitValue > poolPriceDisplay
                ) {
                    handlePulseAnimation('limitOrder');
                    // reverseTokens();
                    dispatch(setShouldLimitDirectionReverse(true));
                }
            }
        }
    }

    function adjTicks(linePrice: any) {
        const result = [
            { tickValue: 0.995 * linePrice },
            { tickValue: 0.99 * linePrice },
            { tickValue: 0.985 * linePrice },
            { tickValue: 1.005 * linePrice },
            { tickValue: 1.01 * linePrice },
            { tickValue: 1.015 * linePrice },
        ];

        return result;
    }

    const getNoZoneData = () => {
        const noGoZoneMin = noGoZoneBoudnaries[0][0];
        const noGoZoneMax = noGoZoneBoudnaries[0][1];

        return { noGoZoneMin: noGoZoneMin, noGoZoneMax: noGoZoneMax };
    };

    function setLimitForNoGoZone(newLimitValue: number) {
        const { noGoZoneMin, noGoZoneMax } = getNoZoneData();

        const diffNoGoZoneMin = Math.abs(newLimitValue - noGoZoneMin);
        const diffNoGoZoneMax = Math.abs(newLimitValue - noGoZoneMax);
        if (newLimitValue >= noGoZoneMin && newLimitValue <= noGoZoneMax) {
            if (diffNoGoZoneMin > diffNoGoZoneMax) {
                newLimitValue = noGoZoneMax;
            } else {
                newLimitValue = noGoZoneMin;
            }
        }
        return newLimitValue;
    }

    // Drag Type
    useEffect(() => {
        if (scaleData && targetsJoin !== undefined) {
            let newLimitValue: any;
            let newRangeValue: any;

            let lowLineMoved: any;
            let highLineMoved: any;

            let rangeWidthPercentage: any;

            let dragSwitched = false;

            const dragRange = d3
                .drag()
                .on('start', () => {
                    d3.select(d3Container.current).style('cursor', 'grabbing');
                    d3.select(d3Container.current)
                        .select('.targets')
                        .style('cursor', 'grabbing');
                    hideCrosshair();
                })
                .on('drag', function (event) {
                    // d3.select(d3Container.current)
                    //     .select('.ghostLines')
                    //     .selectAll('.horizontal')
                    //     .style('visibility', 'visible');

                    // const ghostJoin = d3fc.dataJoin('g', 'ghostLines');

                    setIsLineDrag(true);
                    let dragedValue =
                        scaleData.yScale.invert(event.y) >=
                        liquidityData.topBoundary
                            ? liquidityData.topBoundary
                            : scaleData.yScale.invert(event.y);

                    dragedValue = dragedValue < 0 ? 0 : dragedValue;

                    const displayValue =
                        poolPriceDisplay !== undefined ? poolPriceDisplay : 0;

                    const low = ranges.filter(
                        (target: any) => target.name === 'Min',
                    )[0].value;
                    const high = ranges.filter(
                        (target: any) => target.name === 'Max',
                    )[0].value;

                    const lineToBeSet =
                        dragedValue > displayValue ? 'Max' : 'Min';

                    let pinnedDisplayPrices: any;

                    if (
                        !isAdvancedModeActive ||
                        location.pathname.includes('reposition')
                    ) {
                        if (
                            dragedValue === 0 ||
                            dragedValue === liquidityData.topBoundary ||
                            dragedValue < liquidityData.lowBoundary
                        ) {
                            rangeWidthPercentage = 100;

                            setRanges((prevState) => {
                                const newTargets = [...prevState];

                                newTargets.filter(
                                    (target: any) => target.name === 'Min',
                                )[0].value =
                                    dragedValue === 0
                                        ? 0
                                        : dragedValue <
                                          liquidityData.lowBoundary
                                        ? dragedValue
                                        : 0;

                                newTargets.filter(
                                    (target: any) => target.name === 'Max',
                                )[0].value = liquidityData.topBoundary;

                                newRangeValue = newTargets;

                                setLiqHighlightedLinesAndArea(
                                    newTargets,
                                    false,
                                    rangeWidthPercentage,
                                );
                                return newTargets;
                            });
                        } else {
                            if (lineToBeSet === 'Max') {
                                const pinnedTick =
                                    getPinnedTickFromDisplayPrice(
                                        isDenomBase,
                                        baseTokenDecimals,
                                        quoteTokenDecimals,
                                        false, // isMinPrice
                                        dragedValue,
                                        lookupChain(chainId).gridSize,
                                    );

                                rangeWidthPercentage =
                                    Math.abs(
                                        pinnedTick - currentPoolPriceTick,
                                    ) / 100;

                                rangeWidthPercentage =
                                    rangeWidthPercentage < 1
                                        ? 1
                                        : rangeWidthPercentage;

                                const offset = rangeWidthPercentage * 100;
                                // (rangeWidthPercentage < 1 ? 1 : rangeWidthPercentage) * 100;

                                const lowTick = currentPoolPriceTick - offset;
                                const highTick = currentPoolPriceTick + offset;

                                pinnedDisplayPrices =
                                    getPinnedPriceValuesFromTicks(
                                        denomInBase,
                                        baseTokenDecimals,
                                        quoteTokenDecimals,
                                        lowTick,
                                        highTick,
                                        lookupChain(chainId).gridSize,
                                    );
                            } else {
                                const pinnedTick =
                                    getPinnedTickFromDisplayPrice(
                                        isDenomBase,
                                        baseTokenDecimals,
                                        quoteTokenDecimals,
                                        true, // isMinPrice
                                        dragedValue,
                                        lookupChain(chainId).gridSize,
                                    );

                                rangeWidthPercentage =
                                    Math.abs(
                                        currentPoolPriceTick - pinnedTick,
                                    ) / 100;

                                rangeWidthPercentage =
                                    rangeWidthPercentage < 1
                                        ? 1
                                        : rangeWidthPercentage;
                                const offset = rangeWidthPercentage * 100;

                                const lowTick = currentPoolPriceTick - offset;
                                const highTick = currentPoolPriceTick + offset;

                                pinnedDisplayPrices =
                                    getPinnedPriceValuesFromTicks(
                                        denomInBase,
                                        baseTokenDecimals,
                                        quoteTokenDecimals,
                                        lowTick,
                                        highTick,
                                        lookupChain(chainId).gridSize,
                                    );
                            }

                            const rangesF = [
                                {
                                    name: 'Min',
                                    value: pinnedDisplayPrices.pinnedMinPriceDisplay,
                                },
                                {
                                    name: 'Max',
                                    value: pinnedDisplayPrices.pinnedMaxPriceDisplay,
                                },
                            ];

                            setLiqHighlightedLinesAndArea(
                                rangesF,
                                false,
                                rangeWidthPercentage,
                            );

                            if (pinnedDisplayPrices !== undefined) {
                                setRanges((prevState) => {
                                    const newTargets = [...prevState];

                                    newTargets.filter(
                                        (target: any) => target.name === 'Min',
                                    )[0].value = parseFloat(
                                        pinnedDisplayPrices.pinnedMinPriceDisplay,
                                    );

                                    newTargets.filter(
                                        (target: any) => target.name === 'Max',
                                    )[0].value = parseFloat(
                                        pinnedDisplayPrices.pinnedMaxPriceDisplay,
                                    );

                                    newRangeValue = newTargets;

                                    return newTargets;
                                });
                            }
                        }
                    } else {
                        const advancedValue = scaleData.yScale.invert(event.y);

                        const draggingLine =
                            event.subject.name !== undefined
                                ? event.subject.name
                                : Math.abs(advancedValue - low) <
                                  Math.abs(advancedValue - high)
                                ? 'Min'
                                : 'Max';

                        highLineMoved = draggingLine === 'Max';
                        lowLineMoved = draggingLine === 'Min';

                        let pinnedMaxPriceDisplayTruncated = high;
                        let pinnedMinPriceDisplayTruncated = low;

                        if (advancedValue >= 0) {
                            if (draggingLine === 'Max') {
                                if (advancedValue < low) {
                                    pinnedDisplayPrices =
                                        getPinnedPriceValuesFromDisplayPrices(
                                            denomInBase,
                                            baseTokenDecimals,
                                            quoteTokenDecimals,
                                            high.toString(),
                                            advancedValue,
                                            lookupChain(chainId).gridSize,
                                        );
                                } else {
                                    pinnedDisplayPrices =
                                        getPinnedPriceValuesFromDisplayPrices(
                                            denomInBase,
                                            baseTokenDecimals,
                                            quoteTokenDecimals,
                                            low.toString(),
                                            advancedValue,
                                            lookupChain(chainId).gridSize,
                                        );
                                }
                            } else {
                                pinnedDisplayPrices =
                                    getPinnedPriceValuesFromDisplayPrices(
                                        denomInBase,
                                        baseTokenDecimals,
                                        quoteTokenDecimals,
                                        advancedValue,
                                        high.toString(),
                                        lookupChain(chainId).gridSize,
                                    );
                            }

                            pinnedMaxPriceDisplayTruncated = parseFloat(
                                pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated,
                            );
                            pinnedMinPriceDisplayTruncated = parseFloat(
                                pinnedDisplayPrices.pinnedMinPriceDisplayTruncated,
                            );
                        }

                        setRanges((prevState) => {
                            const newTargets = [...prevState];

                            if (draggingLine === 'Max') {
                                if (
                                    dragSwitched ||
                                    pinnedMaxPriceDisplayTruncated <
                                        pinnedMinPriceDisplayTruncated
                                ) {
                                    newTargets.filter(
                                        (target: any) => target.name === 'Min',
                                    )[0].value = pinnedMaxPriceDisplayTruncated;

                                    dragSwitched = true;
                                    highLineMoved = false;
                                    lowLineMoved = true;
                                } else {
                                    newTargets.filter(
                                        (target: any) => target.name === 'Max',
                                    )[0].value = pinnedMaxPriceDisplayTruncated;
                                }
                            } else {
                                if (
                                    dragSwitched ||
                                    pinnedMinPriceDisplayTruncated >
                                        pinnedMaxPriceDisplayTruncated
                                ) {
                                    newTargets.filter(
                                        (target: any) => target.name === 'Max',
                                    )[0].value = pinnedMinPriceDisplayTruncated;

                                    dragSwitched = true;
                                    highLineMoved = true;
                                    lowLineMoved = false;
                                } else {
                                    newTargets.filter(
                                        (target: any) => target.name === 'Min',
                                    )[0].value = pinnedMinPriceDisplayTruncated;
                                }
                            }

                            newRangeValue = newTargets;

                            setLiqHighlightedLinesAndArea(newTargets);
                            return newTargets;
                        });
                    }
                })
                .on('end', (event: any) => {
                    showCrosshair();

                    d3.select(d3Container.current).style('cursor', 'default');
                    setCrosshairData([
                        {
                            x: crosshairData[0].x,
                            y: Number(
                                formatAmountChartData(
                                    scaleData.yScale.invert(
                                        event.sourceEvent.layerY,
                                    ),
                                ),
                            ),
                        },
                    ]);
                    setIsLineDrag(false);
                    d3.select(d3Container.current)
                        .select('.ghostLines')
                        .selectAll('.horizontal')
                        .remove();

                    if (
                        (!isAdvancedModeActive ||
                            location.pathname.includes('reposition')) &&
                        rangeWidthPercentage
                    ) {
                        setSimpleRangeWidth(
                            Math.floor(
                                rangeWidthPercentage < 1
                                    ? 1
                                    : rangeWidthPercentage > 100
                                    ? 100
                                    : rangeWidthPercentage,
                            ),
                        );
                    }

                    const offset = rangeWidthPercentage * 100;

                    const lowTick = currentPoolPriceTick - offset;
                    const highTick = currentPoolPriceTick + offset;

                    const pinnedDisplayPrices = getPinnedPriceValuesFromTicks(
                        denomInBase,
                        baseTokenDecimals,
                        quoteTokenDecimals,
                        lowTick,
                        highTick,
                        lookupChain(chainId).gridSize,
                    );

                    const min = pinnedDisplayPrices.pinnedMinPriceDisplay;
                    const max = pinnedDisplayPrices.pinnedMaxPriceDisplay;
                    if (
                        min &&
                        min !== 'NaN' &&
                        !isNaN(parseFloat(min)) &&
                        max &&
                        max !== 'NaN' &&
                        !isNaN(parseFloat(max))
                    ) {
                        const rangesF = [
                            {
                                name: 'Min',
                                value: min,
                            },
                            {
                                name: 'Max',
                                value: max,
                            },
                        ];

                        setLiqHighlightedLinesAndArea(
                            rangesF,
                            true,
                            rangeWidthPercentage,
                        );
                    }

                    onBlurRange(
                        newRangeValue,
                        highLineMoved,
                        lowLineMoved,
                        dragSwitched,
                    );
                    dragSwitched = false;
                });

            const dragLimit = d3
                .drag()
                .on('start', () => {
                    d3.select(d3Container.current).style(
                        'cursor',
                        'row-resize',
                    );
                    d3.select(d3Container.current)
                        .select('.targets')
                        .style('cursor', 'row-resize');
                    hideCrosshair();

                    d3.select(d3Container.current)
                        .select('.ghostLines')
                        .selectAll('.horizontal')
                        .style('visibility', 'visible');

                    d3.select(d3Container.current)
                        .select('.limitNoGoZone')
                        .select('.horizontal')
                        .style('visibility', 'visible');
                })
                .on('drag', function (event) {
                    setIsLineDrag(true);

                    newLimitValue = scaleData.yScale.invert(event.y);

                    newLimitValue = setLimitForNoGoZone(newLimitValue);
                    setGhostLineValues(adjTicks(newLimitValue));

                    if (newLimitValue < 0) newLimitValue = 0;

                    setLimit(() => {
                        return [{ name: 'Limit', value: newLimitValue }];
                    });
                })
                .on('end', (event: any) => {
                    showCrosshair();

                    d3.select(d3Container.current).style('cursor', 'default');

                    d3.select(d3Container.current)
                        .select('.limitNoGoZone')
                        .select('.horizontal')
                        .style('visibility', 'hidden');
                    setGhostLineValues([]);
                    setCrosshairData([
                        {
                            x: crosshairData[0].x,
                            y:
                                isMouseMoveForSubChart || isZoomForSubChart
                                    ? -1
                                    : Number(
                                          formatAmountChartData(
                                              scaleData.yScale.invert(
                                                  event.sourceEvent.layerY,
                                              ),
                                          ),
                                      ),
                        },
                    ]);

                    setIsLineDrag(false);

                    d3.select(d3Container.current)
                        .select('.ghostLines')
                        .selectAll('.horizontal')
                        .remove();

                    const xmin = new Date(
                        Math.floor(scaleData.xScale.domain()[0]),
                    );
                    const xmax = new Date(
                        Math.floor(scaleData.xScale.domain()[1]),
                    );

                    const filtered = parsedChartData?.chartData.filter(
                        (data: any) => data.date >= xmin && data.date <= xmax,
                    );

                    if (filtered !== undefined) {
                        const minYBoundary = d3.min(filtered, (d) => d.low);
                        const maxYBoundary = d3.max(filtered, (d) => d.high);

                        if (minYBoundary && maxYBoundary) {
                            const value = newLimitValue;

                            const low =
                                minYBoundary < value ? minYBoundary : value;

                            const high =
                                maxYBoundary > value ? maxYBoundary : value;

                            const min = scaleData.yScale.domain()[0];
                            const max = scaleData.yScale.domain()[1];

                            if (min > low || max < high) {
                                const buffer = Math.abs((low - high) / 6);

                                const domain = [
                                    low - buffer,
                                    high + buffer / 2,
                                ];

                                scaleData.yScale.domain(domain);
                            }
                        }
                    }

                    onBlurLimitRate(newLimitValue);
                });

            setDragRange(() => {
                return dragRange;
            });

            setDragLimit(() => {
                return dragLimit;
            });
        }
    }, [
        poolPriceDisplay,
        location,
        scaleData,
        isAdvancedModeActive,
        dragControl,
        targetsJoin,
        ranges,
        minPrice,
        maxPrice,
    ]);

    useEffect(() => {
        setDragControl(false);
    }, [parsedChartData]);

    // Axis's
    useEffect(() => {
        if (scaleData) {
            const _yAxis = d3fc
                .axisRight()
                .scale(scaleData.yScale)
                .tickFormat((d: any) => {
                    const digit = d.toString().split('.')[1]?.length;
                    return formatAmountChartData(d, digit ? digit : 2);
                });

            setYaxis(() => {
                return _yAxis;
            });

            const _xAxis = d3fc
                .axisBottom()
                .scale(scaleData.xScale)
                .tickFormat((d: any) => {
                    return d3.timeFormat('%d/%m/%y')(d);
                });

            setXaxis(() => {
                return _xAxis;
            });

            d3.select(d3Yaxis.current).on('draw', function (event: any) {
                d3.select(event.target).select('svg').call(_yAxis);
            });

            d3.select(d3Xaxis.current).on('draw', function (event: any) {
                d3.select(event.target).select('svg').call(_xAxis);
                // d3.select(event.target).select('svg').attr('preserveAspectRatio','xMidyMid');
                d3.select(d3Xaxis.current)
                    .select('svg')
                    .select('.domain')
                    .remove();
            });
        }
    }, [scaleData, activeTimeFrame]);

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
                    .style(
                        'visibility',
                        location.pathname.includes('/limit')
                            ? 'visible'
                            : 'hidden',
                    )
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
                    .attr('class', checkLimitOrder ? sellOrderStyle : 'line');
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
                    .style(
                        'visibility',
                        location.pathname.includes('range') ||
                            location.pathname.includes('reposition')
                            ? 'visible'
                            : 'hidden',
                    )
                    .select('g.left-handle')
                    .append('text')
                    .attr('x', 5)
                    .attr('y', -5);

                selection.enter().select('g.right-handle').remove();
                selection.enter().select('line').attr('class', 'line');
                selection.select('g.left-handle').remove();
            });

            const targetsJoin = d3fc.dataJoin('g', 'targets');
            const horizontalBandJoin = d3fc.dataJoin('g', 'horizontalBand');

            const limitJoin = d3fc.dataJoin('g', 'limit');
            const marketJoin = d3fc.dataJoin('g', 'market');

            if (
                d3.select(d3Container.current).select('.liqTooltip').node() ===
                null
            ) {
                const liqTooltip = d3
                    .select(d3Container.current)
                    .append('div')
                    .attr('class', 'liqTooltip')
                    .style('visibility', 'hidden');

                setLiqTooltip(() => {
                    return liqTooltip;
                });
            }

            const horizontalBand = d3fc
                .annotationSvgBand()
                .xScale(scaleData.xScale)
                .yScale(scaleData.yScale)
                .fromValue((d: any) => d[0])
                .toValue((d: any) => d[1])
                .decorate((selection: any) => {
                    selection.select('path').attr('fill', '#7371FC1A');
                });

            setTargetsJoin(() => {
                return targetsJoin;
            });

            setHorizontalBandJoin(() => {
                return horizontalBandJoin;
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

            setHorizontalBand(() => {
                return horizontalBand;
            });
        }
    }, [
        parsedChartData?.chartData,
        scaleData,
        market,
        checkLimitOrder,
        limit,
        isUserLoggedIn,
    ]);

    useEffect(() => {
        if (
            scaleData !== undefined &&
            reset &&
            poolPriceDisplay !== undefined
        ) {
            scaleData.xScale.domain(scaleData.xScaleCopy.domain());

            const xmin = new Date(Math.floor(scaleData.xScale.domain()[0]));
            const xmax = new Date(Math.floor(scaleData.xScale.domain()[1]));

            const filtered = parsedChartData?.chartData.filter(
                (data: any) => data.date >= xmin && data.date <= xmax,
            );

            if (filtered !== undefined) {
                const minYBoundary = d3.min(filtered, (d) => d.low);
                const maxYBoundary = d3.max(filtered, (d) => d.high);

                if (
                    (location.pathname.includes('range') ||
                        location.pathname.includes('reposition')) &&
                    (isAdvancedModeActive ||
                        ((!isAdvancedModeActive ||
                            location.pathname.includes('reposition')) &&
                            simpleRangeWidth !== 100))
                ) {
                    const low = ranges.filter(
                        (target: any) => target.name === 'Min',
                    )[0].value;
                    const high = ranges.filter(
                        (target: any) => target.name === 'Max',
                    )[0].value;

                    if (
                        maxYBoundary !== undefined &&
                        minYBoundary !== undefined
                    ) {
                        const buffer = Math.abs(
                            (Math.max(high, maxYBoundary) -
                                Math.min(low, minYBoundary)) /
                                6,
                        );

                        const domain = [
                            Math.min(low, minYBoundary) - buffer,
                            Math.max(high, maxYBoundary) + buffer / 2,
                        ];

                        scaleData.yScale.domain(domain);
                    }
                } else if (location.pathname.includes('/limit')) {
                    if (
                        maxYBoundary !== undefined &&
                        minYBoundary !== undefined
                    ) {
                        const value = limit[0].value;

                        const low = minYBoundary < value ? minYBoundary : value;
                        const high =
                            maxYBoundary > value ? maxYBoundary : value;
                        if (value > 0) {
                            const buffer = Math.abs((low - high) / 6);
                            const domain = [low - buffer, high + buffer / 2];

                            scaleData.yScale.domain(domain);
                        } else {
                            const buffer = Math.abs(
                                (maxYBoundary - minYBoundary) / 6,
                            );

                            const domain = [
                                minYBoundary - buffer,
                                maxYBoundary + buffer / 2,
                            ];

                            scaleData.yScale.domain(domain);
                        }
                    }
                } else {
                    if (
                        maxYBoundary !== undefined &&
                        minYBoundary !== undefined &&
                        liquidityData
                    ) {
                        const buffer = Math.abs(
                            (maxYBoundary - minYBoundary) / 6,
                        );

                        const domain = [
                            minYBoundary - buffer,
                            maxYBoundary + buffer / 2,
                        ];

                        scaleData.yScale.domain(domain);
                    }
                }
            }

            setReset(false);
            setShowLatest(false);
        }
    }, [scaleData, reset]);

    useEffect(() => {
        if (
            scaleData !== undefined &&
            latest &&
            parsedChartData !== undefined
        ) {
            const latestCandleIndex = d3.maxIndex(
                parsedChartData?.chartData,
                (d) => d.date,
            );

            const diff =
                scaleData.xScale.domain()[1].getTime() -
                scaleData.xScale.domain()[0].getTime();

            const centerX =
                parsedChartData?.chartData[latestCandleIndex].time * 1000;

            if (rescale) {
                if (poolPriceDisplay) {
                    const xmin = new Date(
                        Math.floor(scaleData.xScaleCopy.domain()[0]),
                    );
                    const xmax = new Date(
                        Math.floor(scaleData.xScaleCopy.domain()[1]),
                    );

                    const filtered = parsedChartData?.chartData.filter(
                        (data: any) => data.date >= xmin && data.date <= xmax,
                    );

                    if (filtered !== undefined && filtered.length > 0) {
                        const minYBoundary = d3.min(filtered, (d) => d.low);
                        const maxYBoundary = d3.max(filtered, (d) => d.high);

                        if (
                            (location.pathname.includes('range') ||
                                location.pathname.includes('reposition')) &&
                            (simpleRangeWidth !== 100 || isAdvancedModeActive)
                        ) {
                            const low = ranges.filter(
                                (target: any) => target.name === 'Min',
                            )[0].value;
                            const high = ranges.filter(
                                (target: any) => target.name === 'Max',
                            )[0].value;

                            if (
                                maxYBoundary !== undefined &&
                                minYBoundary !== undefined
                            ) {
                                const buffer = Math.abs(
                                    (Math.max(high, maxYBoundary) -
                                        Math.min(low, minYBoundary)) /
                                        6,
                                );

                                const domain = [
                                    Math.min(low, minYBoundary) - buffer,
                                    Math.max(high, maxYBoundary) + buffer / 2,
                                ];

                                scaleData.yScale.domain(domain);
                            }
                        } else if (location.pathname.includes('/limit')) {
                            if (
                                maxYBoundary !== undefined &&
                                minYBoundary !== undefined
                            ) {
                                const value = limit[0].value;

                                const low =
                                    minYBoundary < value ? minYBoundary : value;
                                const high =
                                    maxYBoundary > value ? maxYBoundary : value;

                                const buffer = Math.abs((low - high) / 6);

                                const domain = [
                                    low - buffer,
                                    high + buffer / 2,
                                ];

                                scaleData.yScale.domain(domain);
                            }
                        } else {
                            if (
                                maxYBoundary !== undefined &&
                                minYBoundary !== undefined &&
                                liquidityData
                            ) {
                                const buffer = Math.abs(
                                    (maxYBoundary - minYBoundary) / 6,
                                );

                                const domain = [
                                    minYBoundary - buffer,
                                    maxYBoundary + buffer / 2,
                                ];

                                scaleData.yScale.domain(domain);
                            }
                        }
                    }
                }

                scaleData.xScale.domain([
                    new Date(centerX - diff * 0.8),
                    new Date(centerX + diff * 0.2),
                ]);
            } else {
                const diffY =
                    scaleData.yScale.domain()[1] - scaleData.yScale.domain()[0];

                const centerY =
                    parsedChartData?.chartData[latestCandleIndex].high -
                    Math.abs(
                        parsedChartData?.chartData[latestCandleIndex].low -
                            parsedChartData?.chartData[latestCandleIndex].high,
                    ) /
                        2;

                const domain = [centerY - diffY / 2, centerY + diffY / 2];

                scaleData.yScale.domain(domain);

                scaleData.xScale.domain([
                    new Date(centerX - diff * 0.8),
                    new Date(centerX + diff * 0.2),
                ]);
            }

            setLatest(false);
            setShowLatest(false);
        }
    }, [
        scaleData,
        latest,
        parsedChartData?.chartData,
        denomInBase,
        rescale,
        location.pathname,
    ]);

    // easy drag and triangle to horizontal lines for range
    async function addTriangleAndRect() {
        d3.select(d3PlotArea.current)
            .select('.targets')
            .selectAll('.annotation-line')
            .select('path')
            .remove();

        if (!location.pathname.includes('market')) {
            const selectClass =
                location.pathname.includes('range') ||
                location.pathname.includes('reposition')
                    ? '.targets'
                    : '.limit';
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
                            ? checkLimitOrder
                                ? sellOrderStyle === 'order_sell'
                                    ? 'var(--accent-secondary)'
                                    : '#7371FC'
                                : 'rgba(235, 235, 255)'
                            : 'rgba(235, 235, 255)',
                    )
                    .attr(
                        'fill',
                        selectClass.includes('limit')
                            ? checkLimitOrder
                                ? sellOrderStyle === 'order_sell'
                                    ? 'var(--accent-secondary)'
                                    : '#7371FC'
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
                            ? checkLimitOrder
                                ? sellOrderStyle === 'order_sell'
                                    ? 'var(--accent-secondary)'
                                    : '#7371FC'
                                : 'rgba(235, 235, 255)'
                            : 'rgba(235, 235, 255)',
                    )
                    .attr(
                        'fill',
                        selectClass.includes('limit')
                            ? checkLimitOrder
                                ? sellOrderStyle === 'order_sell'
                                    ? 'var(--accent-secondary)'
                                    : '#7371FC'
                                : 'rgba(235, 235, 255)'
                            : 'rgba(235, 235, 255)',
                    )
                    .style('transform', 'translate(100%, 48px) rotate(180deg)');
            });
        }
    }

    function addDefsStyle() {
        const svgmain = d3.select(d3PlotArea.current).select('svg');
        if (svgmain.select('defs').select('#crossHairBg').node() === null) {
            const crosshairDefs = svgmain
                .append('defs')
                .append('filter')
                .attr('x', 0)
                .attr('y', 0)
                .attr('height', 1)
                .attr('width', 1)
                .attr('id', 'crossHairBg');

            crosshairDefs
                .append('feFlood')
                .attr('flood-color', '#242F3F')
                .attr('result', 'bg');
            const feMergeTagCrossHair = crosshairDefs.append('feMerge');
            feMergeTagCrossHair.append('feMergeNode').attr('in', 'bg');
            feMergeTagCrossHair
                .append('feMergeNode')
                .attr('in', 'SourceGraphic');

            const marketDefs = svgmain
                .append('defs')
                .append('filter')
                .attr('x', 0)
                .attr('y', 0)
                .attr('height', 1)
                .attr('width', 1)
                .attr('id', 'marketBg');

            marketDefs
                .append('feFlood')
                .attr('flood-color', '#FFFFFF')
                .attr('result', 'bg');
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

            yAxisText
                .append('feFlood')
                .attr('flood-color', '#7772FE')
                .attr('result', 'bg');
            const feMergeTagYaxisText = yAxisText.append('feMerge');
            feMergeTagYaxisText.append('feMergeNode').attr('in', 'bg');
            feMergeTagYaxisText
                .append('feMergeNode')
                .attr('in', 'SourceGraphic');

            const yAxisTextOrderSell = svgmain
                .append('defs')
                .append('filter')
                .attr('x', 0)
                .attr('y', 0)
                .attr('height', 1)
                .attr('width', 1)
                .attr('id', 'textOrderSellBg');

            yAxisTextOrderSell
                .append('feFlood')
                .attr('flood-color', '#e480ff')
                .attr('result', 'bg');
            const feMergeTagYaxisTextSell =
                yAxisTextOrderSell.append('feMerge');
            feMergeTagYaxisTextSell.append('feMergeNode').attr('in', 'bg');
            feMergeTagYaxisTextSell
                .append('feMergeNode')
                .attr('in', 'SourceGraphic');

            const yAxisTextOrderBuy = svgmain
                .append('defs')
                .append('filter')
                .attr('x', 0)
                .attr('y', 0)
                .attr('height', 1)
                .attr('width', 1)
                .attr('id', 'textOrderBuyBg');

            yAxisTextOrderBuy
                .append('feFlood')
                .attr('flood-color', '#7371FC')
                .attr('result', 'bg');
            const feMergeTagYaxisTextBuy = yAxisTextOrderBuy.append('feMerge');
            feMergeTagYaxisTextBuy.append('feMergeNode').attr('in', 'bg');
            feMergeTagYaxisTextBuy
                .append('feMergeNode')
                .attr('in', 'SourceGraphic');
        }
    }

    useEffect(() => {
        addTriangleAndRect();
    }, [
        dragControl,
        location,
        market,
        limit,
        ranges,
        parsedChartData?.period,
        checkLimitOrder,
        isUserLoggedIn,
        poolPriceDisplay,
    ]);

    useEffect(() => {
        if (poolPriceDisplay) {
            setCheckLimitOrder(
                isUserLoggedIn
                    ? sellOrderStyle === 'order_sell'
                        ? limit[0].value > poolPriceDisplay
                        : limit[0].value < poolPriceDisplay
                    : false,
            );
        }
    }, [limit, sellOrderStyle, isUserLoggedIn, poolPriceDisplay]);

    // Line Rules
    useEffect(() => {
        if (dragLimit !== undefined && dragRange !== undefined) {
            if (
                location.pathname.includes('range') ||
                location.pathname.includes('reposition')
            ) {
                d3.select(d3Container.current)
                    .select('.targets')
                    .select('.horizontal')
                    .on('mouseover', (event: any) => {
                        d3.select(event.currentTarget).style(
                            'cursor',
                            'row-resize',
                        );
                        d3.select(event.currentTarget)
                            .select('line')
                            .style('cursor', 'row-resize');
                    })
                    .call(dragRange);

                d3.select(d3Container.current)
                    .select('.targets')
                    .select('#Min')
                    .on('mouseover', (event: any) => {
                        d3.select(event.currentTarget).style(
                            'cursor',
                            'row-resize',
                        );
                        d3.select(event.currentTarget)
                            .select('line')
                            .style('cursor', 'row-resize');
                    })
                    .call(dragRange);

                d3.select(d3Container.current)
                    .select('.targets')
                    .select('#Max')
                    .on('mouseover', (event: any) => {
                        d3.select(event.currentTarget).style(
                            'cursor',
                            'row-resize',
                        );
                        d3.select(event.currentTarget)
                            .select('line')
                            .style('cursor', 'row-resize');
                    })
                    .call(dragRange);

                d3.select(d3PlotArea.current)
                    .select('svg')
                    .select('.targets')
                    .selectAll('.horizontal')
                    .style(
                        'visibility',
                        simpleRangeWidth === 100 &&
                            (!isAdvancedModeActive ||
                                location.pathname.includes('reposition'))
                            ? 'hidden'
                            : 'visible',
                    );
            }

            if (location.pathname.includes('/limit')) {
                d3.select(d3Container.current)
                    .select('.limit')
                    .on('mouseover', (event: any) => {
                        d3.select(event.currentTarget).style(
                            'cursor',
                            'row-resize',
                        );
                        d3.select(event.currentTarget)
                            .select('line')
                            .style('cursor', 'row-resize');
                    })
                    .call(dragLimit);
            }
        }
    }, [
        dragLimit,
        dragRange,
        parsedChartData?.period,
        location,
        horizontalLine,
        currentPoolPriceTick,
    ]);

    const onClickRange = async (event: any) => {
        let newRangeValue: any;

        const low = ranges.filter((target: any) => target.name === 'Min')[0]
            .value;
        const high = ranges.filter((target: any) => target.name === 'Max')[0]
            .value;

        let clickedValue =
            scaleData.yScale.invert(d3.pointer(event)[1]) >=
            liquidityData.topBoundary
                ? liquidityData.topBoundary
                : scaleData.yScale.invert(d3.pointer(event)[1]);

        clickedValue = clickedValue < 0 ? 0.01 : clickedValue;

        const displayValue =
            poolPriceDisplay !== undefined ? poolPriceDisplay : 0;

        let lineToBeSet: any;

        if (low < displayValue && high < displayValue) {
            lineToBeSet =
                Math.abs(clickedValue - high) < Math.abs(clickedValue - low)
                    ? 'Max'
                    : 'Min';
        } else {
            lineToBeSet = clickedValue > displayValue ? 'Max' : 'Min';
        }

        if (!isAdvancedModeActive || location.pathname.includes('reposition')) {
            let rangeWidthPercentage;
            let tickValue;
            let pinnedDisplayPrices: any;

            if (
                clickedValue === 0 ||
                clickedValue === liquidityData.topBoundary ||
                clickedValue < liquidityData.lowBoundary
            ) {
                rangeWidthPercentage = 100;

                setRanges((prevState) => {
                    const newTargets = [...prevState];

                    newTargets.filter(
                        (target: any) => target.name === 'Min',
                    )[0].value = 0;

                    newTargets.filter(
                        (target: any) => target.name === 'Max',
                    )[0].value = liquidityData.topBoundary;

                    newRangeValue = newTargets;

                    setLiqHighlightedLinesAndArea(newTargets);
                    return newTargets;
                });
            } else {
                if (lineToBeSet === 'Max') {
                    tickValue = getPinnedTickFromDisplayPrice(
                        isDenomBase,
                        baseTokenDecimals,
                        quoteTokenDecimals,
                        false, // isMinPrice
                        clickedValue,
                        lookupChain(chainId).gridSize,
                    );

                    rangeWidthPercentage =
                        Math.abs(tickValue - currentPoolPriceTick) / 100;

                    rangeWidthPercentage =
                        rangeWidthPercentage < 1 ? 1 : rangeWidthPercentage;

                    const offset = rangeWidthPercentage * 100;
                    // (rangeWidthPercentage < 1 ? 1 : rangeWidthPercentage) * 100;

                    const lowTick = currentPoolPriceTick - offset;
                    const highTick = currentPoolPriceTick + offset;

                    pinnedDisplayPrices = getPinnedPriceValuesFromTicks(
                        denomInBase,
                        baseTokenDecimals,
                        quoteTokenDecimals,
                        lowTick,
                        highTick,
                        lookupChain(chainId).gridSize,
                    );
                } else {
                    tickValue = getPinnedTickFromDisplayPrice(
                        isDenomBase,
                        baseTokenDecimals,
                        quoteTokenDecimals,
                        true, // isMinPrice
                        clickedValue,
                        lookupChain(chainId).gridSize,
                    );

                    rangeWidthPercentage =
                        Math.abs(currentPoolPriceTick - tickValue) / 100;
                    rangeWidthPercentage =
                        rangeWidthPercentage < 1 ? 1 : rangeWidthPercentage;
                    const offset = rangeWidthPercentage * 100;

                    const lowTick = currentPoolPriceTick - offset;
                    const highTick = currentPoolPriceTick + offset;

                    pinnedDisplayPrices = getPinnedPriceValuesFromTicks(
                        denomInBase,
                        baseTokenDecimals,
                        quoteTokenDecimals,
                        lowTick,
                        highTick,
                        lookupChain(chainId).gridSize,
                    );
                }

                if (pinnedDisplayPrices !== undefined) {
                    setRanges((prevState) => {
                        const newTargets = [...prevState];

                        newTargets.filter(
                            (target: any) => target.name === 'Min',
                        )[0].value = parseFloat(
                            pinnedDisplayPrices.pinnedMinPriceDisplay,
                        );

                        newTargets.filter(
                            (target: any) => target.name === 'Max',
                        )[0].value = parseFloat(
                            pinnedDisplayPrices.pinnedMaxPriceDisplay,
                        );

                        newRangeValue = newTargets;

                        setLiqHighlightedLinesAndArea(newTargets);
                        return newTargets;
                    });
                }
            }

            setSimpleRangeWidth(
                Math.floor(
                    rangeWidthPercentage < 1
                        ? 1
                        : rangeWidthPercentage > 100
                        ? 100
                        : rangeWidthPercentage,
                ),
            );
        } else {
            const value =
                scaleData.yScale.invert(event.offsetY) < 0
                    ? 0.1
                    : scaleData.yScale.invert(event.offsetY);
            let pinnedDisplayPrices;
            if (lineToBeSet === 'Max') {
                pinnedDisplayPrices = getPinnedPriceValuesFromDisplayPrices(
                    denomInBase,
                    baseTokenDecimals,
                    quoteTokenDecimals,
                    low.toString(),
                    value.toString(),
                    lookupChain(chainId).gridSize,
                );
            } else {
                pinnedDisplayPrices = getPinnedPriceValuesFromDisplayPrices(
                    denomInBase,
                    baseTokenDecimals,
                    quoteTokenDecimals,
                    value.toString(),
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

            (async () => {
                setRanges((prevState) => {
                    const newTargets = [...prevState];

                    if (lineToBeSet === 'Max') {
                        newTargets.filter(
                            (target: any) => target.name === 'Max',
                        )[0].value = pinnedMaxPriceDisplayTruncated;
                    } else {
                        newTargets.filter(
                            (target: any) => target.name === 'Min',
                        )[0].value = pinnedMinPriceDisplayTruncated;
                    }

                    render();

                    newRangeValue = newTargets;

                    setLiqHighlightedLinesAndArea(newTargets);
                    return newTargets;
                });
            })().then(() => {
                onBlurRange(
                    newRangeValue,
                    lineToBeSet === 'Max',
                    lineToBeSet === 'Min',
                    false,
                );
            });
        }
    };

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

            // setIndicatorLine(() => {
            //     return indicatorLine;
            // });
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
                selection.enter().style('visibility', 'hidden');
                selection
                    .enter()
                    .append('line')
                    .attr('stroke-width', 1)
                    .attr('pointer-events', 'none');
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
                    .attr('pointer-events', 'none');
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
            const canvasCandlestick = d3fc
                .autoBandwidth(d3fc.seriesCanvasCandlestick())
                .decorate((context: any, d: any) => {
                    context.fillStyle =
                        selectedDate !== undefined &&
                        selectedDate.getTime() === d.date.getTime()
                            ? '#E480FF'
                            : d.color;

                    context.strokeStyle =
                        selectedDate !== undefined &&
                        selectedDate.getTime() === d.date.getTime()
                            ? '#E480FF'
                            : d.stroke;
                    context.cursorStyle = 'pointer';
                })
                .xScale(scaleData.xScale)
                .yScale(scaleData.yScale);

            setCandlestick(() => canvasCandlestick);
            renderCanvas();
            render();
        }
    }, [scaleData === undefined, selectedDate]);

    useEffect(() => {
        const canvas = d3
            .select(d3CanvasCandle.current)
            .select('canvas')
            .node() as any;
        const ctx = canvas.getContext('2d');

        if (candlestick) {
            d3.select(d3CanvasCandle.current)
                .on('draw', () => {
                    candlestick(parsedChartData?.chartData);
                })
                .on('measure', () => {
                    candlestick.context(ctx);
                });
        }
    }, [parsedChartData, candlestick]);

    useEffect(() => {
        if (scaleData !== undefined) {
            const canvasBarChart = d3fc
                .autoBandwidth(d3fc.seriesCanvasBar())
                .decorate((context: any, d: any) => {
                    context.fillStyle =
                        d.value === 0
                            ? 'transparent'
                            : selectedDate !== undefined &&
                              selectedDate.getTime() === d.time.getTime()
                            ? '#E480FF'
                            : d.color;

                    context.strokeStyle =
                        d.value === 0
                            ? 'transparent'
                            : selectedDate !== undefined &&
                              selectedDate.getTime() === d.time.getTime()
                            ? '#E480FF'
                            : d.color;

                    context.cursorStyle = 'pointer';
                })
                .xScale(scaleData.xScale)
                .yScale(scaleData.volumeScale)
                .crossValue((d: any) => d.time)
                .mainValue((d: any) => d.value);

            setBarSeries(() => canvasBarChart);
            renderCanvas();
            render();
        }
    }, [scaleData, selectedDate]);

    useEffect(() => {
        const ctx = (
            d3.select(d3CanvasBar.current).select('canvas').node() as any
        ).getContext('2d');

        if (barSeries) {
            d3.select(d3CanvasBar.current)
                .on('draw', () => {
                    barSeries(volumeData);
                })
                .on('measure', () => {
                    barSeries.context(ctx);
                });
        }
    }, [volumeData, barSeries]);

    useEffect(() => {
        if (showVolume) {
            d3.select(d3CanvasBar.current)
                .select('canvas')
                .style('display', 'inline');
        } else {
            d3.select(d3CanvasBar.current)
                .select('canvas')
                .style('display', 'none');
        }
    }, [showVolume]);

    useEffect(() => {
        if (liqMode === 'Off') {
            d3.select(d3CanvasLiqAsk.current)
                .select('canvas')
                .style('display', 'none');
            d3.select(d3CanvasLiqBid.current)
                .select('canvas')
                .style('display', 'none');
        } else {
            d3.select(d3CanvasLiqAsk.current)
                .select('canvas')
                .style('display', 'inline');
            d3.select(d3CanvasLiqBid.current)
                .select('canvas')
                .style('display', 'inline');
        }
    }, [liqMode]);

    function renderCanvas() {
        if (d3CanvasCandle) {
            const container = d3.select(d3CanvasCandle.current).node() as any;
            if (container) container.requestRedraw();
        }

        if (d3CanvasBar) {
            const container = d3.select(d3CanvasBar.current).node() as any;
            if (container) container.requestRedraw();
        }

        if (d3CanvasLiqAsk) {
            const container = d3.select(d3CanvasLiqAsk.current).node() as any;
            if (container) container.requestRedraw();
        }

        if (d3CanvasLiqBid) {
            const container = d3.select(d3CanvasLiqBid.current).node() as any;
            if (container) container.requestRedraw();
        }
    }

    useEffect(() => {
        if (
            !location.pathname.includes('range') &&
            !location.pathname.includes('reposition') &&
            liquidityData !== undefined
        ) {
            liquidityData.lineAskSeries = [];
            liquidityData.lineBidSeries = [];
        }
    }, [location]);

    useEffect(() => {
        setLiqHighlightedLinesAndArea(ranges);
    }, [liqMode]);

    // line gradient
    const setLiqHighlightedLinesAndArea = (
        ranges: any,
        autoScale = false,
        simpleRangeWidthGra = simpleRangeWidth,
    ) => {
        if (
            ranges !== undefined &&
            (location.pathname.includes('range') ||
                location.pathname.includes('reposition')) &&
            poolPriceDisplay
        ) {
            setHorizontalBandData([
                [
                    simpleRangeWidthGra === 100 &&
                    (!isAdvancedModeActive ||
                        location.pathname.includes('reposition'))
                        ? 0
                        : ranges.filter((item: any) => item.name === 'Min')[0]
                              .value,
                    simpleRangeWidthGra === 100 &&
                    (!isAdvancedModeActive ||
                        location.pathname.includes('reposition'))
                        ? 0
                        : ranges.filter((item: any) => item.name === 'Max')[0]
                              .value,
                ],
            ]);

            horizontalBandData[0] = [
                simpleRangeWidthGra === 100 &&
                (!isAdvancedModeActive ||
                    location.pathname.includes('reposition'))
                    ? 0
                    : ranges.filter((item: any) => item.name === 'Min')[0]
                          .value,
                simpleRangeWidthGra === 100 &&
                (!isAdvancedModeActive ||
                    location.pathname.includes('reposition'))
                    ? 0
                    : ranges.filter((item: any) => item.name === 'Max')[0]
                          .value,
            ];

            d3.select(d3PlotArea.current)
                .select('svg')
                .select('.targets')
                .selectAll('.horizontal')
                .style(
                    'visibility',
                    simpleRangeWidthGra === 100 &&
                        (!isAdvancedModeActive ||
                            location.pathname.includes('reposition'))
                        ? 'hidden'
                        : 'visible',
                );

            const low = ranges.filter((target: any) => target.name === 'Min')[0]
                .value;
            const high = ranges.filter(
                (target: any) => target.name === 'Max',
            )[0].value;

            const minBoudnary = d3.min(
                liqMode === 'Depth'
                    ? liquidityData.depthLiqBidData
                    : liquidityData.liqBidData,
                (d: any) => d.liqPrices,
            );

            const maxBoudnary = d3.max(
                liqMode === 'Depth'
                    ? liquidityData.depthLiqBidData
                    : liquidityData.liqBidData,
                (d: any) => d.liqPrices,
            );

            const liqData =
                liqMode === 'Depth'
                    ? liquidityData.depthLiqAskData
                    : liquidityData.liqAskData;

            const maxBoudnaryAsk = d3.max(liqData, (d: any) => d.liqPrices);

            if (
                minBoudnary &&
                maxBoudnary &&
                maxBoudnaryAsk &&
                poolPriceDisplay
            ) {
                const percentageBid =
                    ((high - parseFloat(minBoudnary)) * 100) /
                    (parseFloat(maxBoudnary) - parseFloat(minBoudnary));

                const percentageAsk = (low * 100) / parseFloat(maxBoudnaryAsk);

                const svgmain = d3.select(d3PlotArea.current).select('svg');

                svgmain.selectAll('#gradients').remove();

                const lineGradient = svgmain
                    .append('defs')
                    .attr('id', 'gradients');

                // lineBidGradient
                const lineBidGradient = lineGradient
                    .append('linearGradient')
                    .attr('id', 'lineBidGradient')
                    .attr('x1', '100%')
                    .attr('x2', '100%')
                    .attr('y1', '0%')
                    .attr('y2', '100%');

                if (low > poolPriceDisplay) {
                    const percHigh =
                        (((high < low ? low : high) - parseFloat(minBoudnary)) *
                            100) /
                        (parseFloat(maxBoudnary) - parseFloat(minBoudnary));

                    const percLow =
                        (((high < low ? high : low) - parseFloat(minBoudnary)) *
                            100) /
                        (parseFloat(maxBoudnary) - parseFloat(minBoudnary));

                    if (percHigh > 50) {
                        lineBidGradient
                            .append('stop')
                            .attr('offset', 100 - percHigh + '%')
                            .style('stop-color', 'transparent')
                            .style('stop-opacity', 0.7);

                        lineBidGradient
                            .append('stop')
                            .attr('offset', 100 - percHigh + '%')
                            .style('stop-color', '#7371FC')
                            .style('stop-opacity', 0.7);

                        lineBidGradient
                            .append('stop')
                            .attr('offset', 100 - percLow + '%')
                            .style('stop-color', '#7371FC')
                            .style('stop-opacity', 0.7);

                        lineBidGradient
                            .append('stop')
                            .attr('offset', 100 - percLow + '%')
                            .style('stop-color', 'transparent')
                            .style('stop-opacity', 0.7);
                    } else {
                        lineBidGradient
                            .append('stop')
                            .attr('offset', 100 - percHigh + '%')
                            .style('stop-color', 'transparent')
                            .style('stop-opacity', 0.7);

                        lineBidGradient
                            .append('stop')
                            .attr('offset', percHigh + '%')
                            .style('stop-color', '#7371FC')
                            .style('stop-opacity', 0.7);

                        lineBidGradient
                            .append('stop')
                            .attr('offset', 100 - percLow + '%')
                            .style('stop-color', '#7371FC')
                            .style('stop-opacity', 0.7);

                        lineBidGradient
                            .append('stop')
                            .attr('offset', percLow + '%')
                            .style('stop-color', 'transparent')
                            .style('stop-opacity', 0.7);
                    }
                } else {
                    if (percentageBid > 50) {
                        lineBidGradient
                            .append('stop')
                            .attr('offset', 100 - percentageBid + '%')
                            .style('stop-color', 'transparent')
                            .style('stop-opacity', 0.7);

                        lineBidGradient
                            .append('stop')
                            .attr('offset', 100 - percentageBid + '%')
                            .style('stop-color', '#7371FC')
                            .style('stop-opacity', 0.7);
                    } else {
                        lineBidGradient
                            .append('stop')
                            .attr('offset', 100 - percentageBid + '%')
                            .style('stop-color', 'transparent')
                            .style('stop-opacity', 0.7);

                        lineBidGradient
                            .append('stop')
                            .attr('offset', percentageBid + '%')
                            .style('stop-color', '#7371FC')
                            .style('stop-opacity', 0.7);
                    }
                }

                // lineAskGradient
                const lineAskGradient = lineGradient
                    .append('linearGradient')
                    .attr('id', 'lineAskGradient')
                    .attr('x1', '100%')
                    .attr('x2', '100%')
                    .attr('y1', '100%')
                    .attr('y2', '0%');

                if (high < poolPriceDisplay) {
                    const percHigh =
                        ((high < low ? low : high) * 100) /
                        parseFloat(maxBoudnaryAsk);
                    const percLow =
                        ((high < low ? high : low) * 100) /
                        parseFloat(maxBoudnaryAsk);

                    if (percLow < 50) {
                        lineAskGradient
                            .append('stop')
                            .attr('offset', percLow + '%')
                            .style('stop-color', 'transparent')
                            .style('stop-opacity', 0.7);

                        lineAskGradient
                            .append('stop')
                            .attr('offset', percLow + '%')
                            .style('stop-color', 'rgba(205, 193, 255)')
                            .style('stop-opacity', 0.7);

                        lineAskGradient
                            .append('stop')
                            .attr('offset', percHigh + '%')
                            .style('stop-color', 'rgba(205, 193, 255)')
                            .style('stop-opacity', 0.7);

                        lineAskGradient
                            .append('stop')
                            .attr('offset', percHigh + '%')
                            .style('stop-color', 'transparent')
                            .style('stop-opacity', 0.7);
                    } else {
                        lineAskGradient
                            .append('stop')
                            .attr('offset', percLow + '%')
                            .style('stop-color', 'transparent')
                            .style('stop-opacity', 0.7);

                        lineAskGradient
                            .append('stop')
                            .attr('offset', 100 - percLow + '%')
                            .style('stop-color', 'rgba(205, 193, 255)')
                            .style('stop-opacity', 0.7);

                        lineAskGradient
                            .append('stop')
                            .attr('offset', percHigh + '%')
                            .style('stop-color', 'rgba(205, 193, 255)')
                            .style('stop-opacity', 0.7);

                        lineAskGradient
                            .append('stop')
                            .attr('offset', 100 - percHigh + '%')
                            .style('stop-color', 'transparent')
                            .style('stop-opacity', 0.7);
                    }
                } else {
                    if (percentageAsk < 50) {
                        lineAskGradient
                            .append('stop')
                            .attr('offset', percentageAsk + '%')
                            .style('stop-color', 'transparent')
                            .style('stop-opacity', 0.7);

                        lineAskGradient
                            .append('stop')
                            .attr('offset', percentageAsk + '%')
                            .style('stop-color', 'rgba(205, 193, 255)')
                            .style('stop-opacity', 0.7);
                    } else {
                        lineAskGradient
                            .append('stop')
                            .attr('offset', percentageAsk + '%')
                            .style('stop-color', 'transparent')
                            .style('stop-opacity', 0.7);

                        lineAskGradient
                            .append('stop')
                            .attr('offset', 100 - percentageAsk + '%')
                            .style('stop-color', 'rgba(205, 193, 255)')
                            .style('stop-opacity', 0.7);
                    }
                }

                setLineGradient(() => {
                    return lineGradient;
                });
            }

            if (autoScale && rescale) {
                const xmin = new Date(Math.floor(scaleData.xScale.domain()[0]));
                const xmax = new Date(Math.floor(scaleData.xScale.domain()[1]));

                const filtered = parsedChartData?.chartData.filter(
                    (data: any) => data.date >= xmin && data.date <= xmax,
                );

                if (filtered !== undefined) {
                    const minYBoundary = d3.min(filtered, (d) => d.low);
                    const maxYBoundary = d3.max(filtered, (d) => d.high);

                    if (maxYBoundary && minYBoundary) {
                        const buffer = Math.abs(
                            (Math.min(low, minYBoundary) -
                                Math.max(high, maxYBoundary)) /
                                6,
                        );

                        const domain = [
                            Math.min(low, minYBoundary) - buffer,
                            Math.max(high, maxYBoundary) + buffer / 2,
                        ];

                        scaleData.yScale.domain(domain);
                    }
                }

                d3.select(d3PlotArea.current).on('draw', function (event: any) {
                    const svg = d3.select(event.target).select('svg');

                    horizontalBandJoin(svg, [horizontalBandData]).call(
                        horizontalBand,
                    );
                    targetsJoin(svg, [ranges]).call(horizontalLine);

                    if (JSON.stringify(liquidityScale.domain()) !== '[0,0]') {
                        lineAskSeriesJoin(svg, [
                            liqMode === 'Curve' ? liquidityData.liqAskData : [],
                        ]).call(lineAskSeries);
                        lineBidSeriesJoin(svg, [
                            liqMode === 'Curve' ? liquidityData.liqBidData : [],
                        ]).call(lineBidSeries);

                        lineDepthBidSeriesJoin(svg, [
                            liqMode === 'Depth'
                                ? liquidityData.depthLiqBidData
                                : [],
                        ]).call(lineDepthAskSeries);

                        lineDepthAskSeriesJoin(svg, [
                            liqMode === 'Depth'
                                ? liquidityData.depthLiqAskData
                                : [],
                        ]).call(lineDepthBidSeries);
                    }
                });
            }

            render();
        }
    };

    function setAskGradientDefault() {
        const ctx = (
            d3.select(d3CanvasLiqAsk.current).select('canvas').node() as any
        ).getContext('2d');

        const gradient = ctx.createLinearGradient(0, 0, 100, 0);
        gradient.addColorStop(1, 'rgba(205, 193, 255, 0.3)');
        setGradientForAsk(gradient);
    }

    function setBidGradientDefault() {
        const ctx = (
            d3.select(d3CanvasLiqAsk.current).select('canvas').node() as any
        ).getContext('2d');

        const gradient = ctx.createLinearGradient(0, 0, 100, 0);
        gradient.addColorStop(1, 'rgba(115, 113, 252, 0.3)');
        setGradientForBid(gradient);
    }

    useEffect(() => {
        setAskGradientDefault();
        setBidGradientDefault();
    }, []);

    // Liq Series

    useEffect(() => {
        if (scaleData !== undefined && gradientForAsk) {
            const d3CanvasLiqAskChart = d3fc
                .seriesCanvasArea()
                .decorate((context: any) => {
                    context.fillStyle = gradientForAsk;
                    context.strokeWidth = 2;
                })
                .orient('horizontal')
                .curve(liqMode === 'Curve' ? d3.curveBasis : d3.curveStep)
                .mainValue((d: any) => d.activeLiq)
                .crossValue((d: any) => d.liqPrices)
                .xScale(
                    liqMode === 'Curve' ? liquidityScale : liquidityDepthScale,
                )
                .yScale(scaleData.yScale);

            setLiqAskSeries(() => d3CanvasLiqAskChart);
            renderCanvas();
            render();
        }
    }, [
        scaleData === undefined,
        gradientForAsk,
        liqMode,
        liquidityScale,
        liquidityDepthScale,
    ]);

    useEffect(() => {
        const ctx = (
            d3.select(d3CanvasLiqAsk.current).select('canvas').node() as any
        ).getContext('2d');

        if (liqAskSeries && liquidityData.liqAskData) {
            d3.select(d3CanvasLiqAsk.current)
                .on('draw', () => {
                    liqAskSeries(
                        liqMode === 'Curve'
                            ? liquidityData.liqAskData
                            : liquidityData.depthLiqAskData,
                    );
                })
                .on('measure', () => {
                    liqAskSeries.context(ctx);
                });
        }
    }, [
        liquidityData.liqAskData,
        liquidityData.depthLiqAskData,
        liqAskSeries,
        liqMode,
    ]);

    useEffect(() => {
        if (scaleData !== undefined && gradientForBid) {
            const d3CanvasLiqBidChart = d3fc
                .seriesCanvasArea()
                .decorate((context: any) => {
                    context.fillStyle = gradientForBid;
                    context.strokeWidth = 2;
                })
                .orient('horizontal')
                .curve(liqMode === 'Curve' ? d3.curveBasis : d3.curveStep)
                .mainValue((d: any) => d.activeLiq)
                .crossValue((d: any) => d.liqPrices)
                .xScale(
                    liqMode === 'Curve' ? liquidityScale : liquidityDepthScale,
                )
                .yScale(scaleData.yScale);

            setLiqBidSeries(() => d3CanvasLiqBidChart);
            renderCanvas();
            render();
        }
    }, [
        scaleData,
        liqMode,
        gradientForBid,
        liquidityScale,
        liquidityDepthScale,
    ]);

    useEffect(() => {
        const ctx = (
            d3.select(d3CanvasLiqBid.current).select('canvas').node() as any
        ).getContext('2d');

        if (liqBidSeries && liquidityData.liqBidData) {
            d3.select(d3CanvasLiqBid.current)
                .on('draw', () => {
                    liqBidSeries(
                        liqMode === 'Curve'
                            ? liquidityData.liqBidData
                            : isAdvancedModeActive
                            ? liquidityData.depthLiqBidData
                            : liquidityData.depthLiqBidData.filter(
                                  (d: any) =>
                                      d.liqPrices <= liquidityData.topBoundary,
                              ),
                    );
                })
                .on('measure', () => {
                    liqBidSeries.context(ctx);
                });
        }
    }, [liquidityData.liqBidData, liqBidSeries, liqMode]);

    useEffect(() => {
        if (scaleData !== undefined) {
            const lineAskSeries = d3fc
                .seriesSvgLine()
                .orient('horizontal')
                .curve(d3.curveBasis)
                .mainValue((d: any) => d.activeLiq)
                .crossValue((d: any) => d.liqPrices)
                .xScale(liquidityScale)
                .yScale(scaleData.yScale)
                .decorate((selection: any) => {
                    selection.style('stroke', () => {
                        return 'url(#lineAskGradient)';
                    });
                    selection.attr('stroke-width', '2');
                });

            setLineAskSeries(() => {
                return lineAskSeries;
            });

            const lineBidSeries = d3fc
                .seriesSvgLine()
                .orient('horizontal')
                .curve(d3.curveBasis)
                .mainValue((d: any) => d.activeLiq)
                .crossValue((d: any) => d.liqPrices)
                .xScale(liquidityScale)
                .yScale(scaleData.yScale)
                .decorate((selection: any) => {
                    // selection.enter().style('stroke', () => '#7371FC');
                    selection.style('stroke', () => {
                        return 'url(#lineBidGradient)';
                    });
                    selection.attr('stroke-width', '2');
                });

            setLineBidSeries(() => {
                return lineBidSeries;
            });

            const lineDepthAskSeries = d3fc
                .seriesSvgLine()
                .orient('horizontal')
                .curve(d3.curveStep)
                .mainValue((d: any) => d.activeLiq)
                .crossValue((d: any) => d.liqPrices)
                .xScale(liquidityDepthScale)
                .yScale(scaleData.yScale)
                .decorate((selection: any) => {
                    // selection.enter().style('stroke', () => 'rgba(205, 193, 255)');
                    selection.style('stroke', () => {
                        return 'url(#lineBidGradient)';
                    });
                    selection.attr('stroke-width', '2');
                });

            setLineDepthAskSeries(() => {
                return lineDepthAskSeries;
            });

            const lineDepthBidSeries = d3fc
                .seriesSvgLine()
                .orient('horizontal')
                .curve(d3.curveStep)
                .mainValue((d: any) => d.activeLiq)
                .crossValue((d: any) => d.liqPrices)
                .xScale(liquidityDepthScale)
                .yScale(scaleData.yScale)
                .decorate((selection: any) => {
                    // selection.enter().style('stroke', () => '#7371FC');
                    selection.style('stroke', () => {
                        return 'url(#lineAskGradient)';
                    });
                    selection.attr('stroke-width', '2');
                });

            setLineDepthBidSeries(() => {
                return lineDepthBidSeries;
            });

            const svgmain = d3.select(d3PlotArea.current).select('svg');

            svgmain.selectAll('#areaGradients').remove();

            const lineGradient = svgmain
                .append('defs')
                .attr('id', 'areaGradients');

            const askAreaGradient = lineGradient
                .append('linearGradient')
                .attr('id', 'askAreaGradient')
                .attr('x1', '100%')
                .attr('x2', '100%')
                .attr('y1', '0%')
                .attr('y2', '100%');

            askAreaGradient
                .append('stop')
                .attr('offset', '100%')
                .style('stop-color', 'rgba(205, 193, 255, 0.3)')
                .style('stop-opacity', 0.7);

            const bidAreaGradient = lineGradient
                .append('linearGradient')
                .attr('id', 'bidAreaGradient')
                .attr('x1', '100%')
                .attr('x2', '100%')
                .attr('y1', '0%')
                .attr('y2', '100%');

            bidAreaGradient
                .append('stop')
                .attr('offset', '100%')
                .style('stop-color', 'rgba(115, 113, 252, 0.3)')
                .style('stop-opacity', 0.7);

            const lineBidSeriesJoin = d3fc.dataJoin('g', 'lineBidSeries');
            const lineAskSeriesJoin = d3fc.dataJoin('g', 'lineAskSeries');
            const lineDepthBidSeriesJoin = d3fc.dataJoin(
                'g',
                'lineDepthBidSeries',
            );
            const lineDepthAskSeriesJoin = d3fc.dataJoin(
                'g',
                'lineDepthAskSeries',
            );

            setLineBidSeriesJoin(() => {
                return lineBidSeriesJoin;
            });
            setLineAskSeriesJoin(() => {
                return lineAskSeriesJoin;
            });
            setLineDepthBidSeriesJoin(() => {
                return lineDepthBidSeriesJoin;
            });
            setLineDepthAskSeriesJoin(() => {
                return lineDepthAskSeriesJoin;
            });
        }
    }, [
        scaleData,
        liquidityData,
        location,
        lineGradient,
        JSON.stringify(d3Container.current?.offsetWidth),
    ]);

    // NoGoZone
    useEffect(() => {
        if (scaleData !== undefined) {
            const limitNoGoZone = d3fc
                .annotationSvgBand()
                .xScale(scaleData.xScale)
                .yScale(scaleData.yScale)
                .fromValue((d: any) => d[0])
                .toValue((d: any) => d[1])
                .decorate((selection: any) => {
                    selection
                        .select('path')
                        .attr('fill', 'rgba(235, 235, 255, 0.1)');
                    selection.enter().style('visibility', 'hidden');
                });

            setLimitNoGoZone(() => {
                return limitNoGoZone;
            });

            const limitNoGoZoneJoin = d3fc.dataJoin('g', 'limitNoGoZone');

            setlimitNoGoZoneJoin(() => {
                return limitNoGoZoneJoin;
            });
        }
    }, [scaleData]);

    function noGoZone(poolPrice: any) {
        return [[poolPrice * 0.99, poolPrice * 1.01]];
    }

    useEffect(() => {
        const noGoZoneBoudnaries = noGoZone(poolPriceDisplay);
        setNoGoZoneBoudnaries(() => {
            return noGoZoneBoudnaries;
        });
    }, [poolPriceDisplay]);

    function changeScale() {
        if (poolPriceDisplay && scaleData) {
            const xmin = new Date(Math.floor(scaleData.xScale.domain()[0]));
            const xmax = new Date(Math.floor(scaleData.xScale.domain()[1]));

            const filtered = parsedChartData?.chartData.filter(
                (data: any) => data.date >= xmin && data.date <= xmax,
            );

            if (filtered !== undefined && filtered.length > 0) {
                const minYBoundary = d3.min(filtered, (d) => d.low);
                const maxYBoundary = d3.max(filtered, (d) => d.high);

                if (minYBoundary && maxYBoundary) {
                    const buffer = Math.abs((maxYBoundary - minYBoundary) / 6);

                    if (
                        (location.pathname.includes('range') ||
                            location.pathname.includes('reposition')) &&
                        (simpleRangeWidth !== 100 || isAdvancedModeActive)
                    ) {
                        const min = ranges.filter(
                            (target: any) => target.name === 'Min',
                        )[0].value;
                        const max = ranges.filter(
                            (target: any) => target.name === 'Max',
                        )[0].value;

                        const low =
                            minYBoundary < (min !== 0 ? min : minYBoundary)
                                ? minYBoundary
                                : min !== 0
                                ? min
                                : minYBoundary;
                        const high =
                            maxYBoundary > (max !== 0 ? max : maxYBoundary)
                                ? maxYBoundary
                                : max !== 0
                                ? max
                                : maxYBoundary;

                        const bufferForRange = Math.abs((low - high) / 6);

                        const domain = [
                            low - bufferForRange,
                            high + bufferForRange / 2,
                        ];

                        scaleData.yScale.domain(domain);
                    } else if (location.pathname.includes('/limit')) {
                        const value = limit[0].value;
                        const low = minYBoundary < value ? minYBoundary : value;

                        const high =
                            maxYBoundary > value ? maxYBoundary : value;
                        const bufferForLimit = Math.abs((low - high) / 6);
                        if (value > 0 && Math.abs(value) !== Infinity) {
                            const domain = [
                                low - bufferForLimit,
                                high + bufferForLimit / 2,
                            ];

                            scaleData.yScale.domain(domain);
                        }
                    } else {
                        const domain = [
                            minYBoundary - buffer,
                            maxYBoundary + buffer / 2,
                        ];

                        scaleData.yScale.domain(domain);
                    }
                }
            }
        }
    }

    // autoScaleF
    useEffect(() => {
        if (rescale && !isLineDrag) {
            changeScale();
        }
    }, [
        ranges,
        limit,
        location.pathname,
        parsedChartData?.period,
        parsedChartData?.chartData[0]?.close,
    ]);

    // Call drawChart()
    useEffect(() => {
        if (
            parsedChartData !== undefined &&
            scaleData !== undefined &&
            zoomUtils !== undefined &&
            limitJoin !== undefined &&
            liqTooltip !== undefined &&
            limitLine !== undefined &&
            marketLine !== undefined &&
            marketJoin !== undefined &&
            ghostLines !== undefined &&
            ghostJoin !== undefined &&
            candlestick !== undefined &&
            targetsJoin !== undefined &&
            lineBidSeries !== undefined &&
            lineAskSeries !== undefined &&
            lineDepthAskSeries !== undefined &&
            lineDepthBidSeries !== undefined &&
            lineBidSeriesJoin !== undefined &&
            lineAskSeriesJoin !== undefined &&
            lineDepthBidSeriesJoin !== undefined &&
            lineDepthAskSeriesJoin !== undefined &&
            horizontalBandData !== undefined &&
            noGoZoneBoudnaries !== undefined &&
            horizontalBandJoin !== undefined &&
            barSeries !== undefined &&
            volumeData !== undefined &&
            limitNoGoZone !== undefined &&
            limitNoGoZoneJoin !== undefined &&
            liquidityScale !== undefined
        ) {
            const targetData = {
                limit: limit,
                ranges: ranges,
                market: market,
            };

            drawChart(
                parsedChartData.chartData,
                parsedChartData.tvlChartData,
                parsedChartData.feeChartData,
                targetData,
                scaleData,
                liquidityData,
                zoomUtils,
                horizontalLine,
                limitLine,
                targetsJoin,
                horizontalBandJoin,
                limitJoin,
                marketJoin,
                ghostJoin,
                ghostLineValues,
                ghostLines,
                marketLine,
                candlestick,
                lineBidSeries,
                lineAskSeries,
                lineDepthBidSeries,
                lineDepthAskSeries,
                lineBidSeriesJoin,
                lineAskSeriesJoin,
                lineDepthBidSeriesJoin,
                lineDepthAskSeriesJoin,
                mouseMoveEventCharts,
                isMouseMoveForSubChart,
                isZoomForSubChart,
                horizontalBandData,
                noGoZoneBoudnaries,
                // barSeries,
                volumeData,
                // showVolume,
                selectedDate,
                liqMode,
                liquidityScale,
                limitNoGoZone,
                limitNoGoZoneJoin,
            );
        }
    }, [
        parsedChartData,
        JSON.stringify(market[0].value),
        ranges,
        limit,
        zoomUtils,
        horizontalLine,
        targetsJoin,
        horizontalBandJoin,
        limitJoin,
        marketJoin,
        denomInBase,
        liqTooltip,
        marketLine,
        candlestick,
        ghostJoin,
        ghostLines,
        // barSeries,
        lineBidSeries,
        lineAskSeries,
        lineDepthAskSeries,
        lineDepthBidSeries,
        lineBidSeriesJoin,
        lineAskSeriesJoin,
        lineDepthBidSeriesJoin,
        lineDepthAskSeriesJoin,
        mouseMoveEventCharts,
        isZoomForSubChart,
        horizontalBandData,
        noGoZoneBoudnaries,
        // showVolume,
        selectedDate,
        liqMode,
        liquidityScale,
        liquidityDepthScale,
        showSidebar,
        limitNoGoZone,
        limitNoGoZoneJoin,
    ]);

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

    const candleOrVolumeDataHoverStatus = (event: any) => {
        const lastDate = scaleData.xScale.invert(event.offsetX + bandwidth / 2);
        const startDate = scaleData.xScale.invert(
            event.offsetX - bandwidth / 2,
        );

        const arr = parsedChartData?.chartData.map((chartData: any) =>
            Math.abs(chartData.close - chartData.open),
        );

        let minHeight = 0;

        if (arr) minHeight = arr.reduce((a, b) => a + b, 0) / arr.length;

        const longestValue = d3.max(volumeData, (d: any) => d.value) / 2;

        const nearest = snapForCandle(event);
        const dateControl =
            nearest?.date.getTime() > startDate.getTime() &&
            nearest?.date.getTime() < lastDate.getTime();
        const yValue = scaleData.yScale.invert(event.offsetY);

        const yValueVolume = scaleData.volumeScale.invert(event.offsetY);
        const selectedVolumeData = volumeData.find(
            (item: any) => item.time.getTime() === nearest?.date.getTime(),
        );
        const selectedVolumeDataValue = selectedVolumeData?.value;

        const isSelectedVolume = selectedVolumeDataValue
            ? yValueVolume <=
                  (selectedVolumeDataValue < longestValue
                      ? longestValue
                      : selectedVolumeDataValue) && yValueVolume !== 0
                ? true
                : false
            : false;

        const diff = Math.abs(nearest.close - nearest.open);
        const scale = Math.abs(
            scaleData.yScale.domain()[1] - scaleData.yScale.domain()[0],
        );

        const topBoundary =
            nearest.close > nearest.open
                ? nearest.close + (minHeight - diff) / 2
                : nearest.open + (minHeight - diff) / 2;
        const botBoundary =
            nearest.open < nearest.close
                ? nearest.open - (minHeight - diff) / 2
                : nearest.close - (minHeight - diff) / 2;

        let limitTop =
            nearest.close > nearest.open ? nearest.close : nearest.open;
        let limitBot =
            nearest.close < nearest.open ? nearest.close : nearest.open;

        if (scale / 20 > diff) {
            if (nearest.close > nearest.open) {
                limitTop = nearest.close + scale / 20;
                limitBot = nearest.open - scale / 20;
            } else {
                limitTop = nearest.open + scale / 20;
                limitBot = nearest.close - scale / 20;
            }
        } else {
            if (nearest.close > nearest.open) {
                limitTop =
                    nearest.close > topBoundary ? nearest.close : topBoundary;
                limitBot =
                    nearest.open < botBoundary ? nearest.open : botBoundary;
            } else {
                limitTop =
                    nearest.open > topBoundary ? nearest.open : topBoundary;
                limitBot =
                    nearest.close < botBoundary ? nearest.close : botBoundary;
            }
        }

        return {
            isHoverCandleOrVolumeData:
                nearest &&
                (((limitTop > limitBot
                    ? limitTop > yValue && limitBot < yValue
                    : limitTop < yValue && limitBot > yValue) &&
                    dateControl) ||
                    isSelectedVolume),
            _selectedDate: nearest?.date,
            nearest: nearest,
        };
    };

    const liqDataHover = (event: any) => {
        const liqDataBid =
            liqMode === 'Depth'
                ? liquidityData.depthLiqBidData
                : liquidityData.liqBidData;
        const liqDataAsk =
            liqMode === 'Depth'
                ? liquidityData.depthLiqAskData
                : liquidityData.liqAskData;

        const allData = liqDataBid.concat(liqDataAsk);

        const liqMaxActiveLiq = d3.max(allData, (d: any) => d.activeLiq);

        const currentDataY = scaleData.yScale.invert(event.offsetY);
        const currentDataX =
            liqMode === 'Depth'
                ? liquidityDepthScale.invert(event.offsetX)
                : liquidityScale.invert(event.offsetX);

        const bidMinBoudnary = d3.min(liqDataBid, (d: any) => d.liqPrices);
        const bidMaxBoudnary = d3.max(liqDataBid, (d: any) => d.liqPrices);

        const askMinBoudnary = d3.min(liqDataAsk, (d: any) => d.liqPrices);
        const askMaxBoudnary = d3.max(liqDataAsk, (d: any) => d.liqPrices);

        if (liqMaxActiveLiq && currentDataX <= liqMaxActiveLiq) {
            if (bidMinBoudnary !== undefined && bidMaxBoudnary !== undefined) {
                if (
                    bidMinBoudnary < currentDataY &&
                    currentDataY < bidMaxBoudnary
                ) {
                    setAskGradientDefault();
                    bidAreaFunc(event, bidMinBoudnary, bidMaxBoudnary);
                } else if (
                    askMinBoudnary !== undefined &&
                    askMaxBoudnary !== undefined
                ) {
                    if (
                        askMinBoudnary < currentDataY &&
                        currentDataY < askMaxBoudnary
                    ) {
                        setBidGradientDefault();
                        askAreaFunc(event, askMinBoudnary, askMaxBoudnary);
                    }
                }
            }
        } else {
            mouseOutFuncForLiq();
        }
    };

    useEffect(() => {
        if (isLineDrag || isChartZoom) {
            mouseOutFuncForLiq();
        }
    }, [isLineDrag, isChartZoom]);

    const mouseOutFuncForLiq = () => {
        d3.select(d3PlotArea.current)
            .select('.indicatorLine')
            .style('visibility', 'hidden');

        if (liqTooltip) liqTooltip.style('visibility', 'hidden');

        setAskGradientDefault();
        setBidGradientDefault();
    };

    const bidAreaFunc = (
        event: any,
        minBoudnary: string,
        maxBoudnary: string,
    ) => {
        indicatorLineData[0] = {
            x: scaleData.xScale.invert(event.offsetX),
            y: scaleData.yScale.invert(event.offsetY),
        };

        currentPriceData[0] = {
            value: poolPriceDisplay !== undefined ? poolPriceDisplay : 0,
        };

        scaleData.yScaleIndicator.range([
            event.offsetY,
            scaleData.yScale(poolPriceDisplay),
        ]);

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

        const topPlacement =
            event.y -
            80 -
            (event.offsetY - scaleData.yScale(poolPriceDisplay)) / 2;

        liqTooltip
            .style('visibility', 'visible')
            .style('top', (topPlacement > 500 ? 500 : topPlacement) + 'px')
            .style('left', event.offsetX - 80 + 'px');

        liquidityData.liqHighligtedAskSeries = [];

        const canvas = d3
            .select(d3CanvasLiqAsk.current)
            .select('canvas')
            .node() as any;
        const ctx = canvas.getContext('2d');

        const percentageBid =
            (scaleData.yScale.invert(event.offsetY) - parseFloat(minBoudnary)) /
            (parseFloat(maxBoudnary) - parseFloat(minBoudnary));

        const gradient = ctx.createLinearGradient(
            0,
            scaleData.yScale(maxBoudnary),
            0,
            scaleData.yScale(minBoudnary),
        );

        gradient.addColorStop(1 - percentageBid, 'rgba(115, 113, 252, 0.3)');

        gradient.addColorStop(1 - percentageBid, 'rgba(115, 113, 252, 0.6)');

        setGradientForBid(gradient);

        renderCanvas();
    };

    const askAreaFunc = (
        event: any,
        minBoudnary: string,
        maxBoudnary: string,
    ) => {
        indicatorLineData[0] = {
            x: scaleData.xScale.invert(event.offsetX),
            y: scaleData.yScale.invert(event.offsetY),
        };

        currentPriceData[0] = {
            value: poolPriceDisplay !== undefined ? poolPriceDisplay : 0,
        };

        scaleData.yScaleIndicator.range([
            event.offsetY,
            scaleData.yScale(poolPriceDisplay),
        ]);

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

        const topPlacement =
            event.y -
            80 -
            (event.offsetY - scaleData.yScale(poolPriceDisplay)) / 2;

        liqTooltip
            .style('visibility', 'visible')
            .style('top', (topPlacement < 115 ? 115 : topPlacement) + 'px')
            .style('left', event.offsetX - 80 + 'px');

        const canvas = d3
            .select(d3CanvasLiqBid.current)
            .select('canvas')
            .node() as any;
        const ctx = canvas.getContext('2d');
        if (maxBoudnary) {
            const percentageAsk =
                (parseFloat(maxBoudnary) -
                    scaleData.yScale.invert(event.offsetY)) /
                (parseFloat(maxBoudnary) - parseFloat(minBoudnary));

            const gradient = ctx.createLinearGradient(
                0,
                scaleData.yScale(maxBoudnary),
                0,
                scaleData.yScale(minBoudnary),
            );

            gradient.addColorStop(percentageAsk, 'rgba(205, 193, 255, 0.6)');

            gradient.addColorStop(percentageAsk, 'rgba(205, 193, 255, 0.3)');

            setGradientForAsk(gradient);
        }

        renderCanvas();
    };

    const selectedDateEvent = (
        isHoverCandleOrVolumeData: any,
        _selectedDate: any,
        nearest: any,
    ) => {
        if (isHoverCandleOrVolumeData) {
            if (
                selectedDate === undefined ||
                selectedDate.getTime() !== _selectedDate.getTime()
            ) {
                props.setCurrentData(nearest);

                const volumeData = props.volumeData.find(
                    (item: any) =>
                        item.time.getTime() === _selectedDate.getTime(),
                ) as any;

                props.setCurrentVolumeData(volumeData?.volume);

                setSelectedDate(_selectedDate);
            } else {
                setSelectedDate(undefined);
            }
        }
    };

    useEffect(() => {
        if (
            crosshairVertical !== undefined &&
            crosshairHorizontal !== undefined
        ) {
            const crosshairHorizontalJoin = d3fc.dataJoin(
                'g',
                'crosshairHorizontal',
            );
            const crosshairVerticalJoin = d3fc.dataJoin(
                'g',
                'crosshairVertical',
            );

            d3.select(d3PlotArea.current).on('draw', function (event: any) {
                const svg = d3.select(event.target).select('svg');

                const svgFeeRateSub = d3
                    .select('#fee_rate_chart')
                    .select('svg');
                const svgTvlSub = d3.select('#d3PlotTvl').select('svg');

                crosshairHorizontalJoin(svg, [crosshairData]).call(
                    crosshairHorizontal,
                );
                crosshairVerticalJoin(svg, [crosshairData]).call(
                    crosshairVertical,
                );

                if (svgFeeRateSub.node() !== null)
                    crosshairHorizontalJoin(svgFeeRateSub, [
                        crosshairData,
                    ]).call(crosshairHorizontal);

                if (svgTvlSub.node() !== null)
                    crosshairHorizontalJoin(svgTvlSub, [crosshairData]).call(
                        crosshairHorizontal,
                    );
            });
        }
    }, [crosshairData, scaleData]);

    const findTvlNearest = (point: any) => {
        const tvlData = parsedChartData?.tvlChartData;
        const series = tvlAreaSeries;
        if (point == undefined) return 0;
        if (series && tvlData) {
            const xScale = series.xScale(),
                xValue = series.crossValue();

            const filtered =
                tvlData.length > 1
                    ? tvlData.filter((d: any) => xValue(d) != null)
                    : tvlData;

            const nearest = minimum(filtered, (d: any) =>
                Math.abs(point.layerX - xScale(xValue(d))),
            )[1];

            if (nearest) {
                return nearest.value;
            } else {
                return 0;
            }
        }
    };

    // Draw Chart
    const drawChart = useCallback(
        (
            chartData: any,
            tvlChartData: any,
            feeChartData: any,
            targets: any,
            scaleData: any,
            liquidityData: any,
            zoomUtils: any,
            horizontalLine: any,
            limitLine: any,
            targetsJoin: any,
            horizontalBandJoin: any,
            limitJoin: any,
            marketJoin: any,
            ghostJoin: any,
            ghostLineValues: any,
            ghostLines: any,
            marketLine: any,
            candlestick: any,
            lineBidSeries: any,
            lineAskSeries: any,
            lineDepthBidSeries: any,
            lineDepthAskSeries: any,
            lineBidSeriesJoin: any,
            lineAskSeriesJoin: any,
            lineDepthBidSeriesJoin: any,
            lineDepthAskSeriesJoin: any,
            mouseMoveEventCharts: any,
            isMouseMoveForSubChart: boolean,
            isZoomForSubChart: boolean,
            horizontalBandData: any,
            noGoZoneBoudnaries: any,
            // barSeries: any,
            volumeData: any,
            // showVolume: boolean,
            selectedDate: any,
            liqMode: any,
            liquidityScale: any,
            limitNoGoZone: any,
            limitNoGoZoneJoin: any,
        ) => {
            if (chartData.length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const snap = (series: any, data: any, point: any) => {
                    if (point == undefined) return [];
                    const xScale = series.xScale(),
                        xValue = series.crossValue();

                    const filtered =
                        data.length > 1
                            ? data.filter((d: any) => xValue(d) != null)
                            : data;
                    const nearest = minimum(filtered, (d: any) =>
                        Math.abs(point.layerX - xScale(xValue(d))),
                    )[1];

                    setCrosshairForSubChart((prevState) => {
                        const newData = [...prevState];

                        newData[0].x = nearest?.date;
                        newData[0].y = point.layerY;

                        return newData;
                    });

                    if (selectedDate === undefined) {
                        props.setCurrentData(nearest);

                        props.setCurrentVolumeData(
                            volumeData.find(
                                (item: any) =>
                                    item.time.getTime() ===
                                    nearest?.date.getTime(),
                            )?.volume,
                        );
                    } else if (selectedDate) {
                        props.setCurrentVolumeData(
                            volumeData.find(
                                (item: any) =>
                                    item.time.getTime() ===
                                    selectedDate.getTime(),
                            )?.volume,
                        );
                    }

                    setsubChartValues((prevState: any) => {
                        const newData = [...prevState];

                        newData.filter(
                            (target: any) => target.name === 'tvl',
                        )[0].value = findTvlNearest(point);

                        newData.filter(
                            (target: any) => target.name === 'feeRate',
                        )[0].value = feeChartData.find(
                            (item: any) =>
                                item.time.getTime() === nearest?.date.getTime(),
                        )?.value;

                        return newData;
                    });

                    const returnXdata =
                        parsedChartData?.chartData[0].date <=
                        scaleData.xScale.invert(point.offsetX)
                            ? scaleData.xScale.invert(point.offsetX)
                            : nearest?.date;

                    return [
                        {
                            x: returnXdata,
                            y: scaleData.yScale.invert(point.offsetY),
                        },
                    ];
                };

                // const candleJoin = d3fc.dataJoin('g', 'candle');

                // const highlightedCurrentPriceLineJoin = d3fc.dataJoin(
                //     'g',
                //     'highlightedCurrentPriceLine',
                // );
                // const indicatorLineJoin = d3fc.dataJoin('g', 'indicatorLine');

                // const barJoin = d3fc.dataJoin('g', 'bar');

                // handle the plot area measure event in order to compute the scale ranges

                d3.select(d3PlotArea.current).on(
                    'measure',
                    function (event: any) {
                        scaleData.xScale.range([0, event.detail.width]);
                        scaleData.yScale.range([event.detail.height, 0]);

                        scaleData.xScaleIndicator.range([
                            (event.detail.width / 10) * 8,
                            event.detail.width,
                        ]);

                        liquidityScale.range([
                            event.detail.width,
                            (event.detail.width / 10) * 9,
                        ]);

                        if (liquidityDepthScale.domain()[1] <= 50) {
                            liquidityDepthScale.range([
                                event.detail.width,
                                event.detail.width -
                                    event.detail.width / (100 * 2.5),
                            ]);
                        } else {
                            liquidityDepthScale.range([
                                event.detail.width,
                                (event.detail.width / 10) * 9,
                            ]);
                        }

                        scaleData.volumeScale.range([
                            event.detail.height,
                            event.detail.height - event.detail.height / 10,
                        ]);
                    },
                );

                d3.select(d3PlotArea.current).on('click', (event: any) => {
                    const {
                        isHoverCandleOrVolumeData,
                        _selectedDate,
                        nearest,
                    } = candleOrVolumeDataHoverStatus(event);
                    selectedDateEvent(
                        isHoverCandleOrVolumeData,
                        _selectedDate,
                        nearest,
                    );

                    if (
                        (location.pathname.includes('range') ||
                            location.pathname.includes('reposition')) &&
                        scaleData !== undefined &&
                        !isHoverCandleOrVolumeData
                    ) {
                        onClickRange(event);
                    }

                    if (
                        location.pathname.includes('/limit') &&
                        scaleData !== undefined &&
                        !isHoverCandleOrVolumeData
                    ) {
                        let newLimitValue = scaleData.yScale.invert(
                            event.offsetY,
                        );

                        if (newLimitValue < 0) newLimitValue = 0;

                        const { noGoZoneMin, noGoZoneMax } = getNoZoneData();

                        if (
                            !(
                                newLimitValue >= noGoZoneMin &&
                                newLimitValue <= noGoZoneMax
                            )
                        ) {
                            onBlurLimitRate(newLimitValue);
                        }
                        // newLimitValue =
                        //     poolPriceDisplay !== undefined &&
                        //     newLimitValue > liquidityData.topBoundary
                        //         ? liquidityData.topBoundary
                        //         : newLimitValue;
                    }
                });

                d3.select(d3PlotArea.current).on('draw', function (event: any) {
                    const svg = d3.select(event.target).select('svg');
                    svg.attr('preserveAspectRatio', 'xMidYMid meet');
                    if (
                        !(
                            scaleData.xScale.domain()[0].toString() ===
                                'Invalid Date' ||
                            scaleData.xScale.domain()[1].toString() ===
                                'Invalid Date' ||
                            isNaN(scaleData.yScale.domain()[0]) ||
                            isNaN(scaleData.yScale.domain()[1])
                        )
                    ) {
                        horizontalBandJoin(svg, [horizontalBandData]).call(
                            horizontalBand,
                        );
                        limitNoGoZoneJoin(svg, [noGoZoneBoudnaries]).call(
                            limitNoGoZone,
                        );

                        targetsJoin(svg, [targets.ranges]).call(horizontalLine);
                        marketJoin(svg, [targets.market]).call(marketLine);
                        limitJoin(svg, [targets.limit]).call(limitLine);
                        ghostJoin(svg, [
                            ghostLineValues ? ghostLineValues : [],
                        ]).call(ghostLines);

                        if (
                            JSON.stringify(liquidityScale.domain()) !== '[0,0]'
                        ) {
                            lineAskSeriesJoin(svg, [
                                liqMode === 'Curve'
                                    ? liquidityData.liqAskData
                                    : [],
                            ]).call(lineAskSeries);
                            lineBidSeriesJoin(svg, [
                                liqMode === 'Curve'
                                    ? liquidityData.liqBidData
                                    : [],
                            ]).call(lineBidSeries);

                            lineDepthBidSeriesJoin(svg, [
                                liqMode === 'Depth'
                                    ? liquidityData.depthLiqBidData
                                    : [],
                            ]).call(lineDepthAskSeries);

                            lineDepthAskSeriesJoin(svg, [
                                liqMode === 'Depth'
                                    ? liquidityData.depthLiqAskData
                                    : [],
                            ]).call(lineDepthBidSeries);
                        }
                    }

                    setDragControl(true);
                });

                d3.select(d3PlotArea.current).on(
                    'measure.range',
                    function (event: any) {
                        const svg = d3.select(event.target).select('svg');
                        scaleData.xScaleCopy.range([0, event.detail.width]);
                        svg.call(zoomUtils.zoom).on('dblclick.zoom', null);
                    },
                );

                const setCrossHairLocation = (event: any) => {
                    if (snap(candlestick, chartData, event)[0] !== undefined) {
                        crosshairData[0] = snap(
                            candlestick,
                            chartData,
                            event,
                        )[0];
                        setIsMouseMoveCrosshair(true);
                        setCrosshairData([
                            {
                                x: crosshairData[0].x,
                                y:
                                    isMouseMoveForSubChart || isZoomForSubChart
                                        ? -1
                                        : Number(
                                              formatAmountChartData(
                                                  scaleData.yScale.invert(
                                                      event.layerY,
                                                  ),
                                              ),
                                          ),
                            },
                        ]);

                        render();
                    }
                };

                if (isMouseMoveForSubChart) {
                    setCrossHairLocation(mouseMoveEventCharts);
                    showCrosshairHorizontal();
                } else if (isZoomForSubChart) {
                    setCrossHairLocation(mouseMoveEventCharts.sourceEvent);
                }
                const mousemoveEventForCrosshair = (event: any) => {
                    isMouseMoveForSubChart = false;
                    isZoomForSubChart = false;
                    setCrossHairLocation(event);
                    setMouseMoveEventCharts(event);
                    showCrosshairHorizontal();
                    showCrosshairVertical();
                };

                d3.select(d3PlotArea.current).on(
                    'mousemove',
                    function (event: any) {
                        // console.log('mouse move event');
                        mousemoveEventForCrosshair(event);
                        const { isHoverCandleOrVolumeData } =
                            candleOrVolumeDataHoverStatus(event);
                        liqDataHover(event);
                        d3.select(event.currentTarget).style(
                            'cursor',
                            isHoverCandleOrVolumeData ? 'pointer' : 'default',
                        );
                    },
                );

                d3.select(d3Yaxis.current).on('mouseover', (event: any) => {
                    d3.select(event.currentTarget).style(
                        'cursor',
                        'row-resize',
                    );
                    crosshairData[0].x = -1;
                });

                d3.select(d3Yaxis.current).on(
                    'measure.range',
                    function (event: any) {
                        const svg = d3.select(event.target).select('svg');

                        svg.call(zoomUtils.yAxisZoom)
                            .on('dblclick.zoom', null)
                            .on('dblclick.drag', null);
                    },
                );

                d3.select(d3Xaxis.current).on('mouseover', (event: any) => {
                    d3.select(event.currentTarget).style(
                        'cursor',
                        'col-resize',
                    );
                    crosshairData[0].x = -1;
                });

                d3.select(d3Xaxis.current).on(
                    'measure.range',
                    function (event: any) {
                        const svg = d3.select(event.target).select('svg');

                        svg.call(zoomUtils.xAxisZoom)
                            .on('dblclick.zoom', null)
                            .on('dblclick.drag', null);
                    },
                );

                render();

                d3.select(d3Container.current).on('mouseleave', () => {
                    hideCrosshair();

                    setIsMouseMoveCrosshair(false);

                    setsubChartValues([
                        {
                            name: 'feeRate',
                            value: undefined,
                        },
                        {
                            name: 'tvl',
                            value: undefined,
                        },
                        {
                            name: 'volume',
                            value: undefined,
                        },
                    ]);

                    if (selectedDate === undefined) {
                        props.setShowTooltip(false);
                    }
                });
                d3.select(d3PlotArea.current).on('mouseleave', () => {
                    d3.select(d3PlotArea.current)
                        .select('svg')
                        .select('.crosshairVertical')
                        .style('visibility', 'hidden');
                    setIsMouseMoveCrosshair(false);
                    mouseOutFuncForLiq();

                    render();
                });

                d3.select(d3PlotArea.current).on('mouseenter', () => {
                    d3.select(d3PlotArea.current)
                        .select('svg')
                        .select('.crosshairVertical')
                        .style('visibility', 'visible');

                    props.setShowTooltip(true);
                });
            }
        },
        [
            candlestick,
            bandwidth,
            limit,
            ranges,
            location.pathname,
            parsedChartData?.chartData,
            liquidityData?.liqBidData,
            liquidityData?.liqAskData,
            liquidityData?.depthLiqBidData,
            liquidityData?.depthLiqAskData,
            showTvl,
            showVolume,
            showFeeRate,
            tvlAreaSeries,
            ghostLineValues,
        ],
    );

    function showCrosshairVertical() {
        d3.select('#tvl_chart')
            .select('svg')
            .select('.crosshairVertical')
            .selectChild()
            .style('visibility', 'visible');

        d3.select('#fee_rate_chart')
            .select('svg')
            .select('.crosshairVertical')
            .selectChild()
            .style('visibility', 'visible');
    }
    function showCrosshairHorizontal() {
        d3.select(d3PlotArea.current)
            .select('svg')
            .select('.crosshairHorizontal')
            .selectChild()
            .style('visibility', 'visible');

        d3.select(d3PlotArea.current)
            .select('svg')
            .select('.crosshairVertical')
            .selectChild()
            .style('visibility', 'visible');

        d3.select('#tvl_chart')
            .select('svg')
            .select('.crosshairHorizontal')
            .selectChild()
            .style('visibility', 'visible');

        d3.select('#fee_rate_chart')
            .select('svg')
            .select('.crosshairHorizontal')
            .selectChild()
            .style('visibility', 'visible');

        props.setShowTooltip(true);
    }

    useEffect(() => {
        if (scaleData && scaleData.xScale) {
            const xmin = new Date(
                Math.floor(scaleData.xScale.domain()[0]) - 3600 * 1000,
            );

            const filtered = volumeData?.filter(
                (data: any) => data.time >= xmin,
            );

            const minYBoundary = d3.min(filtered, (d) => d.value);
            const maxYBoundary = d3.max(filtered, (d) => d.value);
            if (minYBoundary !== undefined && maxYBoundary !== undefined) {
                const domain = [0, maxYBoundary / 1.05];
                scaleData.volumeScale.domain(domain);
            }
        }
    }, [scaleData && scaleData.xScale.domain()]);

    useEffect(() => {
        if (
            liqTooltip !== undefined &&
            liqTooltipSelectedLiqBar !== undefined &&
            poolPriceDisplay !== undefined
        ) {
            const liqTextData = { totalValue: 0 };

            // const snap = (data: any, point: any) => {
            //     if (point == undefined) return [];
            //     const filtered =
            //         data.length > 1 ? data.filter((d: any) => d.liqPrices != null) : data;
            //     const nearest = minimum(filtered, (d: any) => Math.abs(point - d.liqPrices))[1];
            //     return nearest?.cumAverageUSD;
            // };

            // const minimum = (data: any, accessor: any) => {
            //     return data
            //         .map(function (dataPoint: any, index: any) {
            //             return [accessor(dataPoint, index), dataPoint, index];
            //         })
            //         .reduce(
            //             function (accumulator: any, dataPoint: any) {
            //                 return accumulator[0] > dataPoint[0] ? dataPoint : accumulator;
            //             },
            //             [Number.MAX_VALUE, null, -1],
            //         );
            // };

            if (liqTooltipSelectedLiqBar.liqPrices != null) {
                // if (liqMode === 'Depth') {
                //     if (liqTooltipSelectedLiqBar.liqPrices < poolPriceDisplay) {
                //         liqTextData.totalValue = snap(
                //             liquidityData.depthLiqAskData,
                //             liqTooltipSelectedLiqBar.liqPrices,
                //         );
                //     } else {
                //         liqTextData.totalValue = snap(
                //             liquidityData.depthLiqBidData,
                //             liqTooltipSelectedLiqBar.liqPrices,
                //         );
                //     }
                // } else {
                if (liqTooltipSelectedLiqBar.liqPrices < poolPriceDisplay) {
                    liquidityData.liqAskData.map((liqData: any) => {
                        if (
                            liqData.liqPrices >=
                                liqTooltipSelectedLiqBar.liqPrices &&
                            poolPriceDisplay > liqData.liqPrices
                        ) {
                            liqTextData.totalValue =
                                liqTextData.totalValue +
                                liqData.deltaAverageUSD;
                        }
                    });
                } else {
                    liquidityData.liqBidData.map((liqData: any) => {
                        if (
                            liqData.liqPrices <=
                                liqTooltipSelectedLiqBar.liqPrices &&
                            poolPriceDisplay < liqData.liqPrices
                        ) {
                            liqTextData.totalValue =
                                liqTextData.totalValue +
                                liqData.deltaAverageUSD;
                        }
                    });
                }
                // }
            }
            // const absoluteDifference = Math.abs(difference)

            const pinnedTick = getPinnedTickFromDisplayPrice(
                isDenomBase,
                baseTokenDecimals,
                quoteTokenDecimals,
                false, // isMinPrice
                liqTooltipSelectedLiqBar.liqPrices.toString(),
                lookupChain(chainId).gridSize,
            );

            const percentage = parseFloat(
                (Math.abs(pinnedTick - currentPoolPriceTick) / 100).toString(),
            ).toFixed(1);

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
        d3.select(d3PlotArea.current)
            .select('.candle')
            .selectAll('.up')
            .style('fill', upBodyColor);
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

    // // Candle transactions
    useEffect(() => {
        if (selectedDate !== undefined) {
            const candle = parsedChartData?.chartData.find(
                (candle: any) =>
                    candle.date.toString() === selectedDate.toString(),
            ) as any;

            if (candle !== undefined) {
                // d3.select('#transactionPopup')
                //     .style('visibility', 'visible')
                //     .html(
                //         '<p>Showing Transactions for <span style="color: #E480FF">' +
                //             moment(candle.date).calendar() +
                //             '</span></p>',
                //     );
                // // .html(
                // //     '<p>Showing Transactions for <span style="color: #E480FF">' +
                // //         moment(candle.date).format('DD MMM  HH:mm') +
                // //         '</span></p>',
                // // );
                props.changeState(true, candle);
            }
        } else {
            // d3.select('#transactionPopup').style('visibility', 'hidden');
            props.changeState(false, undefined);
        }
    }, [selectedDate]);

    const onBlurRange = (
        range: any,
        highLineMoved: boolean,
        lowLineMoved: boolean,
        isLinesSwitched: boolean,
    ) => {
        if (range !== undefined) {
            const low = range.filter((target: any) => target.name === 'Min')[0]
                .value;
            const high = range.filter((target: any) => target.name === 'Max')[0]
                .value;

            setMinPrice(low > high ? high : low);
            setMaxPrice(low > high ? low : high);

            // dispatch(setTargetData(newTargetData));

            if (lowLineMoved) {
                setChartTriggeredBy('low_line');
            } else if (highLineMoved) {
                setChartTriggeredBy('high_line');
            }
            dispatch(setIsLinesSwitched(isLinesSwitched));
        }
    };

    const onBlurLimitRate = (newLimitValue: any) => {
        const limitPreviousData = limit[0].value;
        if (newLimitValue === undefined) {
            return;
        }

        const { noGoZoneMin, noGoZoneMax } = getNoZoneData();
        let isNoGoneZoneMin: boolean | undefined = undefined;
        if (newLimitValue === noGoZoneMin) {
            isNoGoneZoneMin = true;
        }
        if (newLimitValue === noGoZoneMax) {
            isNoGoneZoneMin = false;
        }

        const limitNonDisplay = denomInBase
            ? pool?.fromDisplayPrice(parseFloat(newLimitValue))
            : pool?.fromDisplayPrice(1 / parseFloat(newLimitValue));

        limitNonDisplay?.then((limit) => {
            // const limitPriceInTick = Math.log(limit) / Math.log(1.0001);

            limit = limit !== 0 ? limit : 1;

            const pinnedTick: number = isTokenABase
                ? pinTickLower(limit, chainData.gridSize)
                : pinTickUpper(limit, chainData.gridSize);

            if (isNoGoneZoneMin !== undefined && isNoGoneZoneMin) {
                setLimitTick(pinnedTick - chainData.gridSize);
            } else if (isNoGoneZoneMin !== undefined && !isNoGoneZoneMin) {
                setLimitTick(pinnedTick + chainData.gridSize);
            } else {
                dispatch(setLimitTick(pinnedTick));
            }

            const tickPrice = tickToPrice(pinnedTick);

            const tickDispPrice = pool?.toDisplayPrice(tickPrice);

            if (!tickDispPrice) {
                reverseTokenForChart(limitPreviousData, newLimitValue);
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

                    const limitValue = parseFloat(
                        limitRateTruncated.replace(',', ''),
                    );

                    reverseTokenForChart(limitPreviousData, limitValue);
                    setLimit(() => {
                        return [
                            {
                                name: 'Limit',
                                value: limitValue,
                            },
                        ];
                    });
                });
            }
        });
    };

    useEffect(() => {
        if (d3PlotArea) {
            const myDiv = d3.select(d3PlotArea.current) as any;

            const resizeObserver = new ResizeObserver((entries) => {
                const width = entries[0].contentRect.width;
                const height = entries[0].contentRect.height;
                if (height && width) {
                    scaleData.xScale.range([0, width]);
                    scaleData.yScale.range([height, 0]);

                    scaleData.xScaleIndicator.range([(width / 10) * 8, width]);

                    liquidityScale.range([width, (width / 10) * 9]);

                    liquidityDepthScale.range([width, (width / 10) * 9]);

                    scaleData.volumeScale.range([height, height - height / 10]);
                }

                render();
            });

            resizeObserver.observe(myDiv.node());

            return () => resizeObserver.unobserve(myDiv.node());
        }
    }, []);

    return (
        <div
            ref={d3Container}
            className='main_layout_chart'
            data-testid={'chart'}
        >
            <d3fc-group id='d3fc_group' auto-resize>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                    }}
                >
                    <div className='chart_grid'>
                        <d3fc-canvas
                            ref={d3CanvasCandle}
                            className='plot-canvas'
                        ></d3fc-canvas>
                        <d3fc-canvas
                            ref={d3CanvasBar}
                            className='plot-canvas'
                        ></d3fc-canvas>
                        <d3fc-canvas
                            ref={d3CanvasLiqBid}
                            className='plot-canvas'
                        ></d3fc-canvas>
                        <d3fc-canvas
                            ref={d3CanvasLiqAsk}
                            className='plot-canvas'
                        ></d3fc-canvas>

                        <d3fc-svg
                            ref={d3PlotArea}
                            className='plot-area'
                        ></d3fc-svg>

                        <d3fc-svg
                            className='y-axis-svg'
                            ref={d3Yaxis}
                            style={{
                                width: yAxisWidth,
                                gridColumn: 4,
                                gridRow: 3,
                            }}
                        ></d3fc-svg>
                    </div>
                    {showFeeRate && (
                        <>
                            <hr />
                            <FeeRateSubChart
                                feeData={parsedChartData?.feeChartData.sort(
                                    (a, b) => b.time - a.time,
                                )}
                                period={parsedChartData?.period}
                                crosshairForSubChart={crosshairForSubChart}
                                subChartValues={subChartValues}
                                setsubChartValues={setsubChartValues}
                                xScale={
                                    scaleData !== undefined
                                        ? scaleData.xScale
                                        : undefined
                                }
                                getNewCandleData={getNewCandleData}
                                setZoomAndYdragControl={setZoomAndYdragControl}
                                zoomAndYdragControl={zoomAndYdragControl}
                                setIsMouseMoveForSubChart={
                                    setIsMouseMoveForSubChart
                                }
                                isMouseMoveForSubChart={isMouseMoveForSubChart}
                                setIsZoomForSubChart={setIsZoomForSubChart}
                                setMouseMoveEventCharts={
                                    setMouseMoveEventCharts
                                }
                                render={render}
                                mouseMoveChartName={mouseMoveChartName}
                                setMouseMoveChartName={setMouseMoveChartName}
                                yAxisWidth={yAxisWidth}
                            />
                        </>
                    )}

                    {showTvl && (
                        <>
                            <hr />
                            <TvlSubChart
                                tvlData={parsedChartData?.tvlChartData.sort(
                                    (a, b) => b.time - a.time,
                                )}
                                period={parsedChartData?.period}
                                crosshairForSubChart={crosshairForSubChart}
                                setsubChartValues={setsubChartValues}
                                scaleData={scaleData}
                                getNewCandleData={getNewCandleData}
                                setZoomAndYdragControl={setZoomAndYdragControl}
                                zoomAndYdragControl={zoomAndYdragControl}
                                isMouseMoveForSubChart={isMouseMoveForSubChart}
                                subChartValues={subChartValues}
                                setIsMouseMoveForSubChart={
                                    setIsMouseMoveForSubChart
                                }
                                setIsZoomForSubChart={setIsZoomForSubChart}
                                setMouseMoveEventCharts={
                                    setMouseMoveEventCharts
                                }
                                render={render}
                                mouseMoveChartName={mouseMoveChartName}
                                setMouseMoveChartName={setMouseMoveChartName}
                                setTransformX={setTransformX}
                                transformX={transformX}
                                yAxisWidth={yAxisWidth}
                                setTvlAreaSeries={setTvlAreaSeries}
                            />
                        </>
                    )}

                    <div className='xAxis'>
                        <hr />
                        <d3fc-svg
                            ref={d3Xaxis}
                            className='x-axis'
                            style={{
                                height: '1.25em',
                                width: '100%',
                                gridColumn: 3,
                                gridRow: 4,
                            }}
                        ></d3fc-svg>
                    </div>
                </div>
            </d3fc-group>
        </div>
    );
}
