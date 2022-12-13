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
import { CandleChartData, VolumeChartData } from '../Trade/TradeCharts/TradeCharts';
import FeeRateSubChart from '../Trade/TradeCharts/TradeChartsLoading/FeeRateSubChart';
import TvlSubChart from '../Trade/TradeCharts/TradeChartsLoading/TvlSubChart';
import { ChartUtils } from '../Trade/TradeCharts/TradeCandleStickChart';
import './Chart.css';
import {
    ChainSpec,
    CrocEnv,
    CrocPoolView,
    pinTickLower,
    pinTickUpper,
    tickToPrice,
} from '@crocswap-libs/sdk';
import {
    getPinnedPriceValuesFromDisplayPrices,
    getPinnedPriceValuesFromTicks,
} from '../Trade/Range/rangeFunctions';
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
    isUserLoggedIn: boolean | undefined;
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
    setCurrentVolumeData: React.Dispatch<React.SetStateAction<number | undefined>>;
    upBodyColor: string;
    upBorderColor: string;
    downBodyColor: string;
    downBorderColor: string;
    isCandleAdded: boolean | undefined;
    scaleData: any;
    chainId: string;
    poolPriceNonDisplay: number | undefined;
    selectedDate: Date | undefined;
    setSelectedDate: React.Dispatch<Date | undefined>;
    volumeData: VolumeChartData;
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
    crocEnv: CrocEnv | undefined;
}

function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
        width,
        height,
    };
}

export default function Chart(props: ChartData) {
    const {
        isUserLoggedIn,
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
        crocEnv,
        activeTimeFrame,
    } = props;

    const tradeData = useAppSelector((state) => state.tradeData);

    const isDenomBase = tradeData.isDenomBase;
    const isBid = tradeData.isTokenABase;

    const side = (isDenomBase && !isBid) || (!isDenomBase && isBid) ? 'buy' : 'sell';
    const sellOrderStyle = side === 'sell' ? 'order_sell' : 'order_buy';

    const targetData = tradeData.targetData;
    const rangeModuleTriggered = tradeData.rangeModuleTriggered;

    const rangeLowLineTriggered = tradeData.rangeLowLineTriggered;
    const rangeHighLineTriggered = tradeData.rangeHighLineTriggered;
    const volumeData = props.volumeData;
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
    const [zoomAndYdragControl, setZoomAndYdragControl] = useState();
    const [isMouseMoveCrosshair, setIsMouseMoveCrosshair] = useState(false);
    const [crosshairForSubChart, setCrosshairForSubChart] = useState([{ x: 0, y: -1 }]);

    const [isMouseMoveForSubChart, setIsMouseMoveForSubChart] = useState(false);
    const [mouseMoveEventCharts, setMouseMoveEventCharts] = useState<any>();
    const [isZoomForSubChart, setIsZoomForSubChart] = useState(false);
    const [isLineDrag, setIsLineDrag] = useState(false);
    const [mouseMoveChartName, setMouseMoveChartName] = useState<string | undefined>(undefined);
    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());
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

    // d3

    // Crosshairs
    const [liqTooltip, setLiqTooltip] = useState<any>();
    // const [highlightedCurrentPriceLine, setHighlightedCurrentPriceLine] = useState<any>();
    const [indicatorLine, setIndicatorLine] = useState<any>();
    const [crosshairHorizontal, setCrosshairHorizontal] = useState<any>();
    const [crosshairVertical, setCrosshairVertical] = useState<any>();
    const [candlestick, setCandlestick] = useState<any>();
    const [barSeries, setBarSeries] = useState<any>();
    // Line Series
    // const [ghostLines, setGhostLines] = useState<any>();
    const [horizontalLine, setHorizontalLine] = useState<any>();
    const [marketLine, setMarketLine] = useState<any>();
    const [limitLine, setLimitLine] = useState<any>();

    // Line Joins
    const [targetsJoin, setTargetsJoin] = useState<any>();
    const [horizontalBandJoin, setHorizontalBandJoin] = useState<any>();
    const [marketJoin, setMarketJoin] = useState<any>();
    const [limitJoin, setLimitJoin] = useState<any>();

    // Liq Series
    const [liqAskSeries, setLiqAskSeries] = useState<any>();
    const [lineAskSeries, setLineAskSeries] = useState<any>();
    const [lineBidSeries, setLineBidSeries] = useState<any>();
    const [liqBidSeries, setLiqBidSeries] = useState<any>();
    const [liqHighligtedAskSeries, setLiqHighligtedAskSeries] = useState<any>();
    const [liqHighligtedBidSeries, setLiqHighligtedBidSeries] = useState<any>();

    // Liq Joins
    const [lineBidSeriesJoin, setLineBidSeriesJoin] = useState<any>();
    const [lineAskSeriesJoin, setLineAskSeriesJoin] = useState<any>();
    const [areaAskJoin, setAreaAskJoin] = useState<any>();
    const [areaBidJoin, setAreaBidJoin] = useState<any>();
    const [liqHighligtedAskJoin, setLiqHighligtedAskJoin] = useState<any>();
    const [liqHighligtedBidJoin, setLiqHighligtedBidJoin] = useState<any>();

    // Utils
    const [zoomUtils, setZoomUtils] = useState<any>();
    // const [popupHeight, setPopupHeight] = useState<any>();
    const [dragRange, setDragRange] = useState<any>();
    const [dragLimit, setDragLimit] = useState<any>();
    const [transformX, setTransformX] = useState<any>(0);

    // const valueFormatter = d3.format('.5f');
    const currentPoolPriceTick =
        poolPriceNonDisplay === undefined ? 0 : Math.log(poolPriceNonDisplay) / Math.log(1.0001);

    const setDefaultRangeData = () => {
        setRanges((prevState) => {
            const newTargets = [...prevState];
            newTargets.filter((target: any) => target.name === 'Max')[0].value =
                props.liquidityData !== undefined
                    ? props.liquidityData.liqBidData[0]?.liqPrices
                    : Infinity;
            newTargets.filter((target: any) => target.name === 'Min')[0].value = 0;

            setLiqHighlightedLinesAndArea(newTargets, true);

            return newTargets;
        });
    };

    useEffect(() => {
        addDefsStyle();
    }, []);

    useEffect(() => {
        setRescale(true);
    }, [denomInBase]);

    useEffect(() => {
        function handleResize() {
            setWindowDimensions(getWindowDimensions());
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
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
                ...[market[0].value],
                ...(isMouseMoveCrosshair ? [crosshairData[0].y] : []),
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
        } else if (location.pathname.includes('limit')) {
            const resultData = scaleData.yScale(limit[0].value) - scaleData.yScale(market[0].value);
            const resultLocationData = resultData < 0 ? -20 : 20;
            const isSameLocation = Math.abs(resultData) < 20;
            const sameLocationData = scaleData.yScale.invert(
                scaleData.yScale(market[0].value) + resultLocationData,
            );

            yAxis.tickFormat((d: any) =>
                isSameLocation &&
                d ===
                    scaleData.yScale.invert(scaleData.yScale(market[0].value) + resultLocationData)
                    ? formatAmountChartData(limit[0].value)
                    : formatAmountChartData(d),
            );

            yAxis.tickValues([
                ...scale.ticks(),
                ...[isSameLocation ? sameLocationData : limit[0].value, market[0].value],
                ...(isMouseMoveCrosshair && !isLineDrag ? [crosshairData[0].y] : []),
            ]);

            yAxis.decorate((selection: any) => {
                selection
                    .attr('filter', (d: any) => {
                        if (isMouseMoveCrosshair && d === crosshairData[0].y) {
                            return 'url(#crossHairBg)';
                        }
                        if (isSameLocation ? d === sameLocationData : d === limit[0].value) {
                            if (isUserLoggedIn ? checkLimitOrder : false) {
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
                            (isSameLocation ? d === sameLocationData : d === limit[0].value) &&
                            (isUserLoggedIn ? checkLimitOrder : false)
                        ) {
                            return sellOrderStyle === 'order_sell' ? 'market' : 'y_axis';
                        }
                        if (isMouseMoveCrosshair && d === crosshairData[0].y) {
                            return 'crossHairText';
                        }
                        if (isSameLocation ? d === sameLocationData : d === limit[0].value) {
                            return 'y_axis';
                        }
                    });
            });
        } else if (location.pathname.includes('range')) {
            let isSameLocationMin = false;
            let sameLocationDataMin = false;
            let isSameLocationMax = false;
            let sameLocationDataMax = false;

            const low = ranges.filter((target: any) => target.name === 'Min')[0].value;
            const high = ranges.filter((target: any) => target.name === 'Max')[0].value;
            const marketValue = market[0].value;

            const differenceLowHigh = scaleData.yScale(low) - scaleData.yScale(high);
            const differenceLowMarket = scaleData.yScale(low) - scaleData.yScale(marketValue);
            const differenceHighMarket = scaleData.yScale(high) - scaleData.yScale(marketValue);

            const isSameLocationLowHigh = Math.abs(differenceLowHigh) <= 30;
            const differenceLowHighData = differenceLowHigh < 0 ? -20 : 20;

            const isSameLocationLowMarket = Math.abs(differenceLowMarket) <= 20;
            const differenceLowMarketData = differenceLowMarket < 0 ? -20 : 20;

            const isSameLocationHighMarket = Math.abs(differenceHighMarket) <= 20;

            const differenceHighMarketData = differenceHighMarket < 0 ? -20 : 20;

            if (marketValue > low && marketValue < high) {
                isSameLocationMax = isSameLocationHighMarket;
                isSameLocationMin = isSameLocationLowMarket;

                if (isSameLocationHighMarket) {
                    sameLocationDataMax = scaleData.yScale.invert(
                        scaleData.yScale(marketValue) + differenceHighMarketData,
                    );
                }

                if (isSameLocationLowMarket) {
                    sameLocationDataMin = scaleData.yScale.invert(
                        scaleData.yScale(marketValue) + differenceLowMarketData,
                    );
                }
            } else if (low > marketValue && high > marketValue) {
                isSameLocationMax = isSameLocationHighMarket || isSameLocationLowHigh;
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
                    sameLocationDataMin = scaleData.yScale.invert(
                        scaleData.yScale(marketValue) + differenceLowMarketData,
                    );
                }

                if (isSameLocationLowHigh && isSameLocationLowMarket) {
                    sameLocationDataMin = scaleData.yScale.invert(
                        scaleData.yScale(marketValue) + differenceLowMarketData,
                    );

                    sameLocationDataMax = scaleData.yScale.invert(
                        scaleData.yScale(marketValue) +
                            differenceLowMarketData -
                            differenceLowHighData,
                    );
                }
            } else if (low < marketValue && high < marketValue) {
                isSameLocationMax = isSameLocationHighMarket;
                isSameLocationMin = isSameLocationLowHigh || isSameLocationLowMarket;

                if (isSameLocationLowHigh) {
                    sameLocationDataMin = scaleData.yScale.invert(
                        scaleData.yScale(high) + differenceLowHighData,
                    );
                }

                if (isSameLocationHighMarket) {
                    sameLocationDataMax = scaleData.yScale.invert(
                        scaleData.yScale(marketValue) + differenceHighMarketData,
                    );

                    if (Math.abs(differenceLowHigh) <= 35) {
                        isSameLocationMin = true;
                        sameLocationDataMin = scaleData.yScale.invert(
                            scaleData.yScale(marketValue) +
                                differenceHighMarketData +
                                differenceLowHighData,
                        );
                    }
                } else {
                    if (low > high) {
                        isSameLocationMax = isSameLocationHighMarket;
                        isSameLocationMin = isSameLocationLowMarket || isSameLocationLowHigh;
                        if (isSameLocationLowHigh) {
                            sameLocationDataMin = scaleData.yScale.invert(
                                scaleData.yScale(high) + differenceLowHighData,
                            );
                        }
                        if (isSameLocationHighMarket) {
                            sameLocationDataMin = scaleData.yScale.invert(
                                scaleData.yScale(marketValue) + differenceHighMarketData,
                            );
                        }

                        if (isSameLocationLowMarket) {
                            sameLocationDataMin = scaleData.yScale.invert(
                                scaleData.yScale(marketValue) + differenceLowMarketData,
                            );
                        }
                    }
                }
            }

            yAxis.tickValues([
                ...scale.ticks(),
                ...[
                    isSameLocationMin ? sameLocationDataMin : low,
                    isSameLocationMax ? sameLocationDataMax : high,
                    market[0].value,
                ],
                ...(isMouseMoveCrosshair && !isLineDrag ? [crosshairData[0].y] : []),
            ]);

            yAxis.tickFormat((d: any) => {
                if (isSameLocationMin && d === sameLocationDataMin) {
                    return formatAmountChartData(low);
                }

                if (isSameLocationMax && d === sameLocationDataMax) {
                    return formatAmountChartData(high);
                }

                return formatAmountChartData(d);
            });

            yAxis.decorate((selection: any) => {
                selection
                    .attr('filter', (d: any) => {
                        if (isMouseMoveCrosshair && d === crosshairData[0].y) {
                            return 'url(#crossHairBg)';
                        }

                        if (
                            (isSameLocationMin ? d === sameLocationDataMin : d === low) ||
                            (isSameLocationMax ? d === sameLocationDataMax : d === high)
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
                            (isSameLocationMin ? d === sameLocationDataMin : d === low) ||
                            (isSameLocationMax ? d === sameLocationDataMax : d === high)
                        ) {
                            return 'y_axis';
                        }
                    });
            });
        }
    }

    function getXAxisTick() {
        const oldTickValues = scaleData.xScale.ticks();
        const tempArray = [];

        if (
            (windowDimensions.width > 1800 && oldTickValues.length < 15) ||
            oldTickValues.length < 6
        ) {
            return oldTickValues;
        }

        if (oldTickValues.length < 15) {
            for (let index = 0; index < oldTickValues.length; index++) {
                tempArray.push(oldTickValues[index]);
                tempArray.push(
                    index + 2 > oldTickValues.length - 1
                        ? oldTickValues[oldTickValues.length - 1]
                        : oldTickValues[index + 2],
                );
                index = index + 3;
            }
        } else {
            for (let index = oldTickValues.length - 1; index >= 0; index = index - 1) {
                tempArray.push(oldTickValues[index]);
                if (index - 3 > 0) tempArray.push(oldTickValues[index - 3]);
                index = index - 5;
            }
        }

        return tempArray;
    }

    const utcDiff = moment().utcOffset();
    const utcDiffHours = Math.floor(utcDiff / 60);

    // x axis text
    useEffect(() => {
        if (scaleData && xAxis) {
            const oldTickValues = getXAxisTick();

            xAxis
                .tickValues([
                    ...oldTickValues,
                    ...(isMouseMoveCrosshair ? [crosshairData[0].x] : []),
                ])
                .tickFormat((d: any) => {
                    if (d === crosshairData[0].x) {
                        if (activeTimeFrame === '1d') {
                            return moment(d).subtract(utcDiffHours, 'hours').format('MMM DD YYYY');
                        } else {
                            return moment(d).format('MMM DD HH:mm');
                        }
                        // return moment(d).format('  DD HH:mm');
                    }
                    if (activeTimeFrame === '1d') {
                        return d3.timeFormat('%m/%d/%y')(d);
                    } else if (activeTimeFrame.match(/^(1m|5m|15m)$/)) {
                        return d3.timeFormat('%a %H:%M')(d);
                    } else if (activeTimeFrame.match(/^(1h|4h)$/)) {
                        return d3.timeFormat('%m/%d/%y')(d);
                    } else {
                        return d3.timeFormat('%m/%d/%y')(d);
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
                    });
            });
        }
    }, [
        crosshairData,
        isMouseMoveCrosshair,
        zoomAndYdragControl,
        scaleData,
        xAxis,
        windowDimensions,
        mouseMoveEventCharts,
        activeTimeFrame,
    ]);

    useEffect(() => {
        if (scaleData && yAxis) {
            addText(scaleData.yScale);
            render();
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

            d3.select(d3PlotArea.current).select('.horizontalBand').style('visibility', 'visible');

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

            d3.select(d3PlotArea.current).select('.horizontalBand').style('visibility', 'hidden');
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

            d3.select(d3PlotArea.current).select('.horizontalBand').style('visibility', 'hidden');

            d3.select(d3Container.current)
                .select('.targets')
                .selectAll('.horizontal')
                .style('visibility', 'hidden')
                .style('filter', 'none');
        }
    }, [location, parsedChartData?.period]);

    const snapForCandle = (point: any) => {
        if (point == undefined) return [];
        const series = candlestick;
        const data = parsedChartData?.chartData as any;
        const xScale = series.xScale(),
            xValue = series.crossValue();

        const filtered = data.length > 1 ? data.filter((d: any) => xValue(d) != null) : data;
        const nearest = minimum(filtered, (d: any) =>
            Math.abs(point.offsetX - xScale(xValue(d))),
        )[1];

        setCrosshairForSubChart((prevState) => {
            const newData = [...prevState];

            newData[0].x = nearest?.date;

            return newData;
        });
    };

    const getNewCandleData = (event: any, date: any, xScale: any) => {
        let candleDomain: candleDomain;
        let domainBoundary = scaleData.xScaleCopy.domain();
        if (event.transform.rescaleX(scaleData.xScaleCopy).domain()[0] < domainBoundary[0]) {
            domainBoundary = xScale.domain();
        }

        if (domainBoundary[0] > event.transform.rescaleX(scaleData.xScaleCopy).domain()[0]) {
            candleDomain = {
                lastCandleDate: parsedChartData?.chartData[0].time,
                domainBoundry: date.getTime(),
            };

            if (event.transform.rescaleX(scaleData.xScaleCopy).domain()[0] < date) {
                date.setTime(
                    new Date(event.transform.rescaleX(scaleData.xScaleCopy).domain()[0]).getTime() -
                        100 * parsedChartData?.period * 1000,
                );

                candleDomain = {
                    lastCandleDate: parsedChartData?.chartData[0].time,
                    domainBoundry: date.getTime(),
                };

                dispatch(setCandleDomains(candleDomain));
            }
        }
    };

    // Zoom
    useEffect(() => {
        if (scaleData !== undefined && parsedChartData !== undefined) {
            let date: any | undefined = undefined;
            let clickedForLine = false;

            const zoom = d3
                .zoom()
                .on('start', (event: any) => {
                    if (event.sourceEvent && event.sourceEvent.type !== 'dblclick') {
                        clickedForLine = false;

                        if (event.sourceEvent && event.sourceEvent.type != 'wheel') {
                            d3.select(d3Container.current).style('cursor', 'grabbing');
                        }

                        if (date === undefined) {
                            date = parsedChartData?.chartData[0].date;
                        }
                    }
                })
                .on('zoom', (event: any) => {
                    if (event.sourceEvent && event.sourceEvent.type !== 'dblclick') {
                        getNewCandleData(event, date, scaleData.xScale);

                        if (event.sourceEvent.type === 'wheel') {
                            const dx = event.sourceEvent.deltaY / 2;

                            const domainX = scaleData.xScale.domain();
                            const linearX = d3
                                .scaleTime()
                                .domain(scaleData.xScale.range())
                                .range([0, domainX[1] - domainX[0]]);

                            const deltaX = linearX(dx);

                            if (
                                (deltaX < 0 ||
                                    Math.abs(domainX[1].getTime() - domainX[0].getTime()) <=
                                        parsedChartData.period * 1000 * 300) &&
                                (deltaX > 0 ||
                                    Math.abs(domainX[1].getTime() - domainX[0].getTime()) >=
                                        parsedChartData.period * 1000)
                            ) {
                                if (!event.sourceEvent.ctrlKey) {
                                    scaleData.xScale.domain([
                                        new Date(domainX[0].getTime() - deltaX),
                                        domainX[1],
                                    ]);
                                } else {
                                    const gapTop =
                                        domainX[1].getTime() -
                                        scaleData.xScale
                                            .invert(event.sourceEvent.offsetX)
                                            .getTime();
                                    const gapBot =
                                        scaleData.xScale
                                            .invert(event.sourceEvent.offsetX)
                                            .getTime() - domainX[0].getTime();

                                    const minGap = Math.min(gapTop, gapBot);
                                    const maxGap = Math.max(gapTop, gapBot);
                                    const baseMovement = deltaX / (maxGap / minGap + 1);

                                    if (gapBot < gapTop) {
                                        scaleData.xScale.domain([
                                            new Date(domainX[0].getTime() - baseMovement),
                                            new Date(
                                                domainX[1].getTime() +
                                                    baseMovement * (maxGap / minGap),
                                            ),
                                        ]);
                                    } else {
                                        scaleData.xScale.domain([
                                            new Date(
                                                domainX[0].getTime() -
                                                    baseMovement * (maxGap / minGap),
                                            ),
                                            new Date(domainX[1].getTime() + baseMovement),
                                        ]);
                                    }
                                }
                            }
                        } else {
                            const domainX = scaleData.xScale.domain();
                            const linearX = d3
                                .scaleTime()
                                .domain(scaleData.xScale.range())
                                .range([0, domainX[1] - domainX[0]]);

                            const deltaX = linearX(-event.sourceEvent.movementX);
                            scaleData.xScale.domain([
                                new Date(domainX[0].getTime() + deltaX),
                                new Date(domainX[1].getTime() + deltaX),
                            ]);
                        }

                        const xmin = new Date(Math.floor(scaleData.xScale.domain()[0]));
                        const xmax = new Date(Math.floor(scaleData.xScale.domain()[1]));

                        const filtered = parsedChartData?.chartData.filter(
                            (data: any) => data.date >= xmin && data.date <= xmax,
                        );

                        if (rescale && filtered && filtered?.length > 10) {
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

                        // PANNING
                        if (!rescale && event.sourceEvent && event.sourceEvent.type != 'wheel') {
                            const domainY = scaleData.yScale.domain();
                            const linearY = d3
                                .scaleLinear()
                                .domain(scaleData.yScale.range())
                                .range([domainY[1] - domainY[0], 0]);

                            const deltaY = linearY(event.sourceEvent.movementY);
                            scaleData.yScale.domain([domainY[0] + deltaY, domainY[1] + deltaY]);

                            scaleData.yScaleIndicator.range([
                                event.sourceEvent.offsetY,
                                scaleData.yScale(poolPriceDisplay),
                            ]);

                            const topPlacement =
                                event.sourceEvent.y -
                                80 -
                                (event.sourceEvent.offsetY - scaleData.yScale(poolPriceDisplay)) /
                                    2;

                            liqTooltip
                                .style(
                                    'top',
                                    topPlacement > 500
                                        ? 500
                                        : (topPlacement < 115 ? 115 : topPlacement) + 'px',
                                )
                                .style('left', event.sourceEvent.offsetX - 80 + 'px');
                        }

                        clickedForLine = true;
                        render();

                        snapForCandle(event.sourceEvent);
                        setZoomAndYdragControl(event);
                    }
                })
                .on('end', (event: any) => {
                    if (event.sourceEvent && event.sourceEvent.type != 'wheel') {
                        d3.select(d3Container.current).style('cursor', 'default');
                    }

                    if (!clickedForLine) {
                        if (location.pathname.includes('limit')) {
                            const newLimitValue = scaleData.yScale.invert(
                                event.sourceEvent.offsetY,
                            );
                            onBlurlimitRate(newLimitValue);
                        } else if (location.pathname.includes('range')) {
                            // onClickRange(event);
                        }
                    }

                    const latestCandle = d3.max(parsedChartData.chartData, (d) => d.date);

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
                }) as any;

            const yAxisZoom = d3.zoom().on('zoom', async (event: any) => {
                const domainY = scaleData.yScale.domain();
                const center = (domainY[1] + domainY[0]) / 2;

                const deltaY = event.sourceEvent.movementY / 1.5;
                const dy = event.sourceEvent.deltaY / 3;

                const factor = Math.pow(
                    2,
                    event.sourceEvent.type === 'wheel'
                        ? -dy * 0.003
                        : event.sourceEvent.type === 'mousemove'
                        ? -deltaY * 0.003
                        : 1,
                );

                const size = (domainY[1] - domainY[0]) / 2 / factor;

                await scaleData.yScale.domain([center - size, center + size]);

                setZoomAndYdragControl(event);
                setRescale(() => {
                    return false;
                });

                setMarketLineValue();
                render();
            }) as any;

            setZoomUtils(() => {
                return {
                    zoom: zoom,
                    yAxisZoom: yAxisZoom,
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
        location,
        JSON.stringify(scaleData.xScale.domain()[0]),
        JSON.stringify(scaleData.xScale.domain()[1]),
        transformX,
        JSON.stringify(showLatest),
    ]);

    useEffect(() => {
        setShowLatest(false);
    }, [JSON.stringify(parsedChartData?.period)]);

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
    }, [parsedChartData?.chartData, rescale]);

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
    }, [tradeData.limitTick, denomInBase]);

    const setLimitLineValue = () => {
        const limitDisplayPrice = pool?.toDisplayPrice(tickToPrice(tradeData.limitTick));
        limitDisplayPrice?.then((limit) => {
            setLimit([
                {
                    name: 'Limit',
                    value: denomInBase ? limit : 1 / limit || 0,
                },
            ]);
        });
    };

    const setBalancedLines = () => {
        if (simpleRangeWidth === 100 || rangeModuleTriggered) {
            if (simpleRangeWidth === 100) {
                setDefaultRangeData();
            } else {
                setRanges((prevState) => {
                    const newTargets = [...prevState];

                    newTargets.filter((target: any) => target.name === 'Max')[0].value =
                        pinnedMaxPriceDisplayTruncated !== undefined
                            ? pinnedMaxPriceDisplayTruncated
                            : 0;

                    newTargets.filter((target: any) => target.name === 'Min')[0].value =
                        pinnedMinPriceDisplayTruncated !== undefined
                            ? pinnedMinPriceDisplayTruncated
                            : 0;

                    setLiqHighlightedLinesAndArea(newTargets);

                    return newTargets;
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

                    setLiqHighlightedLinesAndArea(chartTargets);

                    return chartTargets;
                }
                return [
                    { name: 'Min', value: 0 },
                    { name: 'Max', value: 0 },
                ];
            });

            dispatch(setRangeHighLineTriggered(false));
            dispatch(setRangeLowLineTriggered(false));
            dispatch(setRangeModuleTriggered(false));
        }
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
    // useEffect(() => {
    //     if (scaleData !== undefined) {
    //         const ghostLines = d3fc
    //             .annotationSvgLine()
    //             .value((d: any) => d.pinnedMaxPriceDisplayTruncated)
    //             .xScale(scaleData.xScale)
    //             .yScale(scaleData.yScale);

    //         ghostLines.decorate((selection: any) => {
    //             selection.enter().attr('id', (d: any) => d.name);
    //             selection.enter().select('g.right-handle').remove();
    //             selection.enter().select('g.left-handle').remove();
    //             selection.enter().select('line').attr('class', 'ghostline');
    //         });
    //         // setGhostLines(() => {
    //         //     return ghostLines;
    //         // });
    //     }
    // }, [scaleData]);

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
                    d3.select(d3Container.current).select('.targets').style('cursor', 'grabbing');
                })
                .on('drag', function (event) {
                    // d3.select(d3Container.current)
                    //     .select('.ghostLines')
                    //     .selectAll('.horizontal')
                    //     .style('visibility', 'visible');

                    // const ghostJoin = d3fc.dataJoin('g', 'ghostLines');

                    setIsLineDrag(true);
                    const dragedValue = scaleData.yScale.invert(event.y);
                    const displayValue = poolPriceDisplay !== undefined ? poolPriceDisplay : 0;

                    const low = ranges.filter((target: any) => target.name === 'Min')[0].value;
                    const high = ranges.filter((target: any) => target.name === 'Max')[0].value;

                    const lineToBeSet = dragedValue > displayValue ? 'Max' : 'Min';

                    let pinnedDisplayPrices: any;

                    if (!isAdvancedModeActive) {
                        let tickValue: any;

                        if (lineToBeSet === 'Max') {
                            tickValue = getPinnedPriceValuesFromDisplayPrices(
                                denomInBase,
                                baseTokenDecimals,
                                quoteTokenDecimals,
                                low.toString(),
                                dragedValue,
                                lookupChain(chainId).gridSize,
                            );

                            rangeWidthPercentage =
                                Math.abs(tickValue.pinnedLowTick - currentPoolPriceTick) / 100;

                            const lowTick =
                                currentPoolPriceTick -
                                (rangeWidthPercentage < 1 ? 1 : rangeWidthPercentage) * 100;
                            const highTick =
                                currentPoolPriceTick +
                                (rangeWidthPercentage < 1 ? 1 : rangeWidthPercentage) * 100;

                            pinnedDisplayPrices = getPinnedPriceValuesFromTicks(
                                denomInBase,
                                baseTokenDecimals,
                                quoteTokenDecimals,
                                lowTick,
                                highTick,
                                lookupChain(chainId).gridSize,
                            );
                        } else {
                            tickValue = getPinnedPriceValuesFromDisplayPrices(
                                denomInBase,
                                baseTokenDecimals,
                                quoteTokenDecimals,
                                dragedValue,
                                high.toString(),
                                lookupChain(chainId).gridSize,
                            );

                            rangeWidthPercentage =
                                Math.abs(tickValue.pinnedHighTick - currentPoolPriceTick) / 100;

                            const highTick =
                                currentPoolPriceTick +
                                (rangeWidthPercentage < 1 ? 1 : rangeWidthPercentage) * 100;
                            const lowTick =
                                currentPoolPriceTick -
                                (rangeWidthPercentage < 1 ? 1 : rangeWidthPercentage) * 100;

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

                                newTargets.filter((target: any) => target.name === 'Min')[0].value =
                                    parseFloat(pinnedDisplayPrices.pinnedMinPriceDisplayTruncated);

                                newTargets.filter((target: any) => target.name === 'Max')[0].value =
                                    parseFloat(pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated);

                                newRangeValue = newTargets;

                                setLiqHighlightedLinesAndArea(newTargets);
                                return newTargets;
                            });
                        }
                    } else {
                        const draggingLine = event.subject.name;

                        highLineMoved = draggingLine === 'Max';
                        lowLineMoved = draggingLine === 'Min';

                        let pinnedMaxPriceDisplayTruncated = high;
                        let pinnedMinPriceDisplayTruncated = low;

                        if (dragedValue >= 0) {
                            if (draggingLine === 'Max') {
                                pinnedDisplayPrices = getPinnedPriceValuesFromDisplayPrices(
                                    denomInBase,
                                    baseTokenDecimals,
                                    quoteTokenDecimals,
                                    low.toString(),
                                    dragedValue,
                                    lookupChain(chainId).gridSize,
                                );
                            } else {
                                pinnedDisplayPrices = getPinnedPriceValuesFromDisplayPrices(
                                    denomInBase,
                                    baseTokenDecimals,
                                    quoteTokenDecimals,
                                    dragedValue,
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
                                    pinnedMaxPriceDisplayTruncated < pinnedMinPriceDisplayTruncated
                                ) {
                                    newTargets.filter(
                                        (target: any) => target.name === 'Min',
                                    )[0].value = pinnedMaxPriceDisplayTruncated;
                                    dragSwitched = true;
                                } else {
                                    newTargets.filter(
                                        (target: any) => target.name === 'Max',
                                    )[0].value = pinnedMaxPriceDisplayTruncated;
                                }
                            } else {
                                if (
                                    dragSwitched ||
                                    pinnedMinPriceDisplayTruncated > pinnedMaxPriceDisplayTruncated
                                ) {
                                    newTargets.filter(
                                        (target: any) => target.name === 'Max',
                                    )[0].value = pinnedMinPriceDisplayTruncated;
                                    dragSwitched = true;
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
                    d3.select(d3Container.current).style('cursor', 'default');
                    setCrosshairData([
                        {
                            x: crosshairData[0].x,
                            y: scaleData.yScale.invert(event.sourceEvent.layerY),
                        },
                    ]);
                    setIsLineDrag(false);
                    d3.select(d3Container.current)
                        .select('.ghostLines')
                        .selectAll('.horizontal')
                        .remove();

                    if (!isAdvancedModeActive) {
                        dispatch(
                            setSimpleRangeWidth(
                                Math.floor(
                                    rangeWidthPercentage < 1
                                        ? 1
                                        : rangeWidthPercentage > 100
                                        ? 100
                                        : rangeWidthPercentage,
                                ),
                            ),
                        );
                    }

                    onBlurRange(newRangeValue, highLineMoved, lowLineMoved);
                    dragSwitched = false;
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
                    //     scaleData.yScale.invert(event.y),
                    // );

                    // const snappedValueIndex = snapResponse[0].index;

                    // const neighborValues: any[] = [];

                    // for (let i = -3; i < 4; i++) {
                    //     neighborValues.push(props.liquidityData.liqSnapData[snappedValueIndex + i]);
                    // }

                    // const ghostJoin = d3fc.dataJoin('g', 'ghostLines');
                    setIsLineDrag(true);
                    newLimitValue = scaleData.yScale.invert(event.y);

                    if (newLimitValue < 0) newLimitValue = 0;

                    newLimitValue =
                        poolPriceDisplay !== undefined && newLimitValue > poolPriceDisplay * 10
                            ? poolPriceDisplay * 10
                            : newLimitValue;

                    setLimit(() => {
                        return [{ name: 'Limit', value: newLimitValue }];
                    });
                })
                .on('end', (event: any) => {
                    d3.select(d3Container.current).style('cursor', 'default');

                    setCrosshairData([
                        {
                            x: crosshairData[0].x,
                            y:
                                isMouseMoveForSubChart || isZoomForSubChart
                                    ? -1
                                    : scaleData.yScale.invert(event.sourceEvent.layerY),
                        },
                    ]);

                    setIsLineDrag(false);

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
    }, [poolPriceDisplay, location, scaleData, isAdvancedModeActive, dragControl, targetsJoin]);

    useEffect(() => {
        setDragControl(false);
    }, [parsedChartData]);

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
                    .attr(
                        'class',
                        (isUserLoggedIn ? checkLimitOrder : false) ? sellOrderStyle : 'line',
                    );
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
            const horizontalBandJoin = d3fc.dataJoin('g', 'horizontalBand');

            const limitJoin = d3fc.dataJoin('g', 'limit');
            const marketJoin = d3fc.dataJoin('g', 'market');

            if (d3.select(d3Container.current).select('.liqTooltip').node() === null) {
                const liqTooltip = d3
                    .select(d3Container.current)
                    .append('div')
                    .attr('class', 'liqTooltip')
                    .style('visibility', 'hidden');

                setLiqTooltip(() => {
                    return liqTooltip;
                });
            }

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
        }
    }, [parsedChartData?.chartData, scaleData, market, checkLimitOrder, limit, isUserLoggedIn]);

    useEffect(() => {
        if (scaleData !== undefined && reset) {
            scaleData.xScale.domain(scaleData.xScaleCopy.domain());
            scaleData.yScale.domain(scaleData.yScaleCopy.domain());
            setReset(false);
            setShowLatest(false);
        }
    }, [scaleData, reset]);

    useEffect(() => {
        if (scaleData !== undefined && latest && parsedChartData !== undefined) {
            const latestCandleIndex = d3.maxIndex(parsedChartData?.chartData, (d) => d.date);

            const diff =
                scaleData.xScale.domain()[1].getTime() - scaleData.xScale.domain()[0].getTime();

            const centerX = parsedChartData?.chartData[latestCandleIndex].time * 1000;

            if (rescale) {
                scaleData.yScale.domain(scaleData.yScaleCopy.domain());

                scaleData.xScale.domain([
                    new Date(centerX - diff / 2),
                    new Date(centerX + diff / 2),
                ]);
            } else {
                const diffY = scaleData.yScale.domain()[1] - scaleData.yScale.domain()[0];

                const centerY =
                    parsedChartData?.chartData[latestCandleIndex].high -
                    Math.abs(
                        parsedChartData?.chartData[latestCandleIndex].low -
                            parsedChartData?.chartData[latestCandleIndex].high,
                    ) /
                        2;

                scaleData.yScale.domain([centerY - diffY / 2, centerY + diffY / 2]);

                scaleData.xScale.domain([
                    new Date(centerX - diff / 2),
                    new Date(centerX + diff / 2),
                ]);
            }

            setLatest(false);
            setShowLatest(false);
        }
    }, [scaleData, latest, parsedChartData?.chartData, denomInBase]);

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
                            ? (isUserLoggedIn ? checkLimitOrder : false)
                                ? sellOrderStyle === 'order_sell'
                                    ? 'var(--accent-secondary)'
                                    : '#7371FC'
                                : 'rgba(235, 235, 255)'
                            : 'rgba(235, 235, 255)',
                    )
                    .attr(
                        'fill',
                        selectClass.includes('limit')
                            ? (isUserLoggedIn ? checkLimitOrder : false)
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
                            ? (isUserLoggedIn ? checkLimitOrder : false)
                                ? sellOrderStyle === 'order_sell'
                                    ? 'var(--accent-secondary)'
                                    : '#7371FC'
                                : 'rgba(235, 235, 255)'
                            : 'rgba(235, 235, 255)',
                    )
                    .attr(
                        'fill',
                        selectClass.includes('limit')
                            ? (isUserLoggedIn ? checkLimitOrder : false)
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
        if (svgmain.select('defs').node() === null) {
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
            const feMergeTagYaxisTextSell = yAxisTextOrderSell.append('feMerge');
            feMergeTagYaxisTextSell.append('feMergeNode').attr('in', 'bg');
            feMergeTagYaxisTextSell.append('feMergeNode').attr('in', 'SourceGraphic');

            const yAxisTextOrderBuy = svgmain
                .append('defs')
                .append('filter')
                .attr('x', 0)
                .attr('y', 0)
                .attr('height', 1)
                .attr('width', 1)
                .attr('id', 'textOrderBuyBg');

            yAxisTextOrderBuy.append('feFlood').attr('flood-color', '#7371FC').attr('result', 'bg');
            const feMergeTagYaxisTextBuy = yAxisTextOrderBuy.append('feMerge');
            feMergeTagYaxisTextBuy.append('feMergeNode').attr('in', 'bg');
            feMergeTagYaxisTextBuy.append('feMergeNode').attr('in', 'SourceGraphic');
        }
    }

    useEffect(() => {
        addTriangleAndRect();
    }, [
        dragControl,
        location,
        market,
        limit,
        parsedChartData?.period,
        checkLimitOrder,
        isUserLoggedIn,
    ]);

    useEffect(() => {
        const limitNonDisplay = denomInBase
            ? pool?.fromDisplayPrice(limit[0].value)
            : pool?.fromDisplayPrice(1 / limit[0].value);

        limitNonDisplay?.then(async (res: any) => {
            // const limitPriceInTick = Math.log(limit) / Math.log(1.0001);
            const pinnedTick: number = isTokenABase
                ? pinTickLower(res, chainData.gridSize)
                : pinTickUpper(res, chainData.gridSize);

            const sellToken = tradeData.tokenA.address;
            const buyToken = tradeData.tokenB.address;
            const isTokenAPrimary = tradeData.isTokenAPrimary;

            const testOrder = isTokenAPrimary
                ? crocEnv?.sell(sellToken, 0)
                : crocEnv?.buy(buyToken, 0);

            const ko = testOrder?.atLimit(isTokenAPrimary ? buyToken : sellToken, pinnedTick);
            setCheckLimitOrder(!(await ko?.willMintFail()));
        });
    }, [limit, isDenomBase, chainData, tradeData]);

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

        if (location.pathname.includes('limit') && scaleData !== undefined) {
            d3.select(d3Container.current).on('click', (event: any) => {
                if ((event.target.__data__ as CandleChartData) === undefined) {
                    let newLimitValue = scaleData.yScale.invert(d3.pointer(event)[1]);

                    if (newLimitValue < 0) newLimitValue = 0;

                    newLimitValue =
                        poolPriceDisplay !== undefined && newLimitValue > poolPriceDisplay * 10
                            ? poolPriceDisplay * 10
                            : newLimitValue;

                    onBlurlimitRate(newLimitValue);
                }
            });
        }

        if (location.pathname.includes('range') && scaleData !== undefined) {
            d3.select(d3PlotArea.current).on('click', async (event: any) => {
                if (
                    (event.target.__data__ as CandleChartData) === undefined ||
                    event.target.__data__ instanceof Array
                ) {
                    onClickRange(event);
                }
            });
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

        const clickedValue = scaleData.yScale.invert(d3.pointer(event)[1]);
        const displayValue = poolPriceDisplay !== undefined ? poolPriceDisplay : 0;

        const lineToBeSet = clickedValue > displayValue ? 'Max' : 'Min';

        if (!isAdvancedModeActive) {
            let rangeWidthPercentage;
            let tickValue;
            let pinnedDisplayPrices: any;

            const low = ranges.filter((target: any) => target.name === 'Min')[0].value;
            const high = ranges.filter((target: any) => target.name === 'Max')[0].value;

            if (lineToBeSet === 'Max') {
                tickValue = getPinnedPriceValuesFromDisplayPrices(
                    denomInBase,
                    baseTokenDecimals,
                    quoteTokenDecimals,
                    low.toString(),
                    clickedValue,
                    lookupChain(chainId).gridSize,
                );

                rangeWidthPercentage =
                    Math.abs(tickValue.pinnedLowTick - currentPoolPriceTick) / 100;

                const lowTick =
                    currentPoolPriceTick -
                    (rangeWidthPercentage < 1 ? 1 : rangeWidthPercentage) * 100;
                const highTick =
                    currentPoolPriceTick +
                    (rangeWidthPercentage < 1 ? 1 : rangeWidthPercentage) * 100;

                pinnedDisplayPrices = getPinnedPriceValuesFromTicks(
                    denomInBase,
                    baseTokenDecimals,
                    quoteTokenDecimals,
                    lowTick,
                    highTick,
                    lookupChain(chainId).gridSize,
                );
            } else {
                tickValue = getPinnedPriceValuesFromDisplayPrices(
                    denomInBase,
                    baseTokenDecimals,
                    quoteTokenDecimals,
                    clickedValue,
                    high.toString(),
                    lookupChain(chainId).gridSize,
                );

                rangeWidthPercentage =
                    Math.abs(tickValue.pinnedHighTick - currentPoolPriceTick) / 100;

                const highTick =
                    currentPoolPriceTick +
                    (rangeWidthPercentage < 1 ? 1 : rangeWidthPercentage) * 100;
                const lowTick =
                    currentPoolPriceTick -
                    (rangeWidthPercentage < 1 ? 1 : rangeWidthPercentage) * 100;

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

                    newTargets.filter((target: any) => target.name === 'Min')[0].value = parseFloat(
                        pinnedDisplayPrices.pinnedMinPriceDisplayTruncated,
                    );

                    newTargets.filter((target: any) => target.name === 'Max')[0].value = parseFloat(
                        pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated,
                    );

                    newRangeValue = newTargets;

                    setLiqHighlightedLinesAndArea(newTargets);
                    return newTargets;
                });
            }

            await setRanges((prevState) => {
                const newTargets = [...prevState];

                newTargets.filter((target: any) => target.name === 'Min')[0].value = parseFloat(
                    pinnedDisplayPrices.pinnedMinPriceDisplayTruncated,
                );

                newTargets.filter((target: any) => target.name === 'Max')[0].value = parseFloat(
                    pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated,
                );

                newRangeValue = newTargets;

                setLiqHighlightedLinesAndArea(newTargets);
                return newTargets;
            });

            dispatch(
                setSimpleRangeWidth(
                    Math.floor(
                        rangeWidthPercentage < 1
                            ? 1
                            : rangeWidthPercentage > 100
                            ? 100
                            : rangeWidthPercentage,
                    ),
                ),
            );
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
                    scaleData.yScale.invert(event.offsetY).toString(),
                    lookupChain(chainId).gridSize,
                );
            } else {
                pinnedDisplayPrices = getPinnedPriceValuesFromDisplayPrices(
                    denomInBase,
                    baseTokenDecimals,
                    quoteTokenDecimals,
                    scaleData.yScale.invert(event.offsetY).toString(),
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
                } else {
                    newTargets.filter((target: any) => target.name === 'Min')[0].value =
                        pinnedMinPriceDisplayTruncated;
                }

                render();

                newRangeValue = newTargets;

                setLiqHighlightedLinesAndArea(newTargets);
                return newTargets;
            });

            onBlurRange(newRangeValue, lineToBeSet === 'Max', lineToBeSet === 'Min');
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
                selection.enter().style('visibility', 'hidden');
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
                                selectedDate.getTime() !==
                                    new Date(event.target.__data__.date).getTime()
                            ) {
                                d3.select(event.currentTarget)
                                    .style('fill', '#E480FF')
                                    .style('stroke', '#E480FF');

                                setSelectedDate(event.target.__data__.date);
                            } else {
                                d3.select(event.currentTarget)
                                    .style('fill', (d: any) =>
                                        d.close > d.open ? upBodyColor : downBodyColor,
                                    )
                                    .style('stroke', (d: any) =>
                                        d.close > d.open ? upBorderColor : downBorderColor,
                                    );

                                setSelectedDate(undefined);
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

    useEffect(() => {
        if (scaleData !== undefined && candlestick !== undefined) {
            const barSeries = d3fc
                .autoBandwidth(d3fc.seriesSvgBar())
                .align('center')
                .xScale(scaleData.xScale)
                .yScale(scaleData.volumeScale)
                .crossValue((d: any) => d.time)
                .mainValue((d: any) => d.value)
                .decorate((selection: any) => {
                    selection.style('fill', (d: any) => {
                        return selectedDate !== undefined &&
                            selectedDate.getTime() === d.time.getTime()
                            ? '#E480FF'
                            : 'rgba(115,113,252, 0.6)';
                    });
                    selection.style('stroke', (d: any) =>
                        selectedDate !== undefined && selectedDate.getTime() === d.time.getTime()
                            ? '#E480FF'
                            : 'rgba(115,113,252, 0.6)',
                    );
                    selection.on('mouseover', (event: any) => {
                        d3.select(event.currentTarget).style('cursor', 'pointer');
                    });
                    selection.on('click', (event: any) => {
                        if (
                            selectedDate === undefined ||
                            selectedDate.getTime() !==
                                new Date(event.target.__data__.time).getTime()
                        ) {
                            d3.select(event.currentTarget)
                                .style('fill', '#E480FF')
                                .style('stroke', '#E480FF');

                            setSelectedDate(event.target.__data__.time);
                        } else {
                            setSelectedDate(undefined);
                        }
                    });
                });

            setBarSeries(() => {
                return barSeries;
            });
        }
    }, [scaleData, selectedDate, candlestick, candlestick && candlestick.bandwidth()]);

    useEffect(() => {
        if (!location.pathname.includes('range')) {
            props.liquidityData.lineAskSeries = [];
            props.liquidityData.lineBidSeries = [];
        }
    }, [location]);

    const setLiqHighlightedLinesAndArea = (ranges: any, isAmbient = false) => {
        props.liquidityData.lineAskSeries = [];
        props.liquidityData.lineBidSeries = [];

        if (ranges !== undefined && location.pathname.includes('range')) {
            const low = ranges.filter((target: any) => target.name === 'Min')[0].value;
            const high = ranges.filter((target: any) => target.name === 'Max')[0].value;

            props.liquidityData.liqAskData.map((askData: any) => {
                if (askData.liqPrices > low && askData.liqPrices < high) {
                    props.liquidityData.lineAskSeries.push(askData);
                }
            });

            props.liquidityData.liqBidData.map((bidData: any) => {
                if (bidData.liqPrices < high && bidData.liqPrices > low) {
                    props.liquidityData.lineBidSeries.unshift(bidData);
                }
            });

            props.liquidityData.lineAskSeries.push({
                activeLiq:
                    props.liquidityData.lineAskSeries[props.liquidityData.lineAskSeries.length - 1]
                        ?.activeLiq,
                liqPrices: low,
                deltaAverageUSD: 0,
                cumAverageUSD: 0,
            });
            props.liquidityData.lineBidSeries.unshift({
                activeLiq: props.liquidityData.lineBidSeries[0]?.activeLiq,
                liqPrices: high,
                deltaAverageUSD: 0,
                cumAverageUSD: 0,
            });

            props.liquidityData.lineBidSeries = props.liquidityData.lineBidSeries.sort(
                (a: any, b: any) => b.liqPrices - a.liqPrices,
            );
            props.liquidityData.lineAskSeries = props.liquidityData.lineAskSeries.sort(
                (a: any, b: any) => b.liqPrices - a.liqPrices,
            );

            setHorizontalBandData([
                [
                    isAmbient ? 0 : ranges.filter((item: any) => item.name === 'Min')[0].value,
                    isAmbient ? 0 : ranges.filter((item: any) => item.name === 'Max')[0].value,
                ],
            ]);

            horizontalBandData[0] = [
                isAmbient ? 0 : ranges.filter((item: any) => item.name === 'Min')[0].value,
                isAmbient ? 0 : ranges.filter((item: any) => item.name === 'Max')[0].value,
            ];
        }
    };

    // Liq Series
    useEffect(() => {
        if (scaleData !== undefined) {
            const lineAskSeries = d3fc
                .seriesSvgLine()
                .orient('horizontal')
                .curve(d3.curveBasis)
                .mainValue((d: any) => d.activeLiq)
                .crossValue((d: any) => d.liqPrices)
                .xScale(scaleData.liquidityScale)
                .yScale(scaleData.yScale)
                .decorate((selection: any) => {
                    selection.enter().style('stroke', () => 'rgba(205, 193, 255)');
                    selection.attr('stroke-width', '2');
                    selection.style(
                        'visibility',
                        location.pathname.includes('range') ? 'visible' : 'hidden',
                    );
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
                .xScale(scaleData.liquidityScale)
                .yScale(scaleData.yScale)
                .decorate((selection: any) => {
                    selection.enter().style('stroke', () => '#7371FC');
                    selection.attr('stroke-width', '2');
                    selection.style(
                        'visibility',
                        location.pathname.includes('range') ? 'visible' : 'hidden',
                    );
                });

            setLineBidSeries(() => {
                return lineBidSeries;
            });

            const liqAskSeries = d3fc
                .seriesSvgArea()
                .orient('horizontal')
                .curve(d3.curveBasis)
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
                .curve(d3.curveBasis)
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
                .curve(d3.curveBasis)
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
                .curve(d3.curveBasis)
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
            const lineBidSeriesJoin = d3fc.dataJoin('g', 'lineBidSeries');
            const lineAskSeriesJoin = d3fc.dataJoin('g', 'lineAskSeries');

            setLineBidSeriesJoin(() => {
                return lineBidSeriesJoin;
            });
            setLineAskSeriesJoin(() => {
                return lineAskSeriesJoin;
            });
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
    }, [scaleData, props.liquidityData, location]);

    // Call drawChart()
    useEffect(() => {
        if (
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
            liqBidSeries !== undefined &&
            lineBidSeries !== undefined &&
            lineAskSeries !== undefined &&
            areaAskJoin !== undefined &&
            areaBidJoin !== undefined &&
            lineBidSeriesJoin !== undefined &&
            lineAskSeriesJoin !== undefined &&
            liqHighligtedAskJoin !== undefined &&
            liqHighligtedBidJoin !== undefined &&
            liqHighligtedAskSeries !== undefined &&
            liqHighligtedBidSeries !== undefined &&
            horizontalBandData !== undefined &&
            horizontalBandJoin !== undefined &&
            barSeries !== undefined &&
            volumeData !== undefined
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
                props.liquidityData,
                zoomUtils,
                horizontalLine,
                limitLine,
                targetsJoin,
                horizontalBandJoin,
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
                lineBidSeries,
                lineAskSeries,
                areaAskJoin,
                areaBidJoin,
                lineBidSeriesJoin,
                lineAskSeriesJoin,
                liqHighligtedAskJoin,
                liqHighligtedBidJoin,
                liqHighligtedAskSeries,
                liqHighligtedBidSeries,
                yAxis,
                xAxis,
                mouseMoveEventCharts,
                isMouseMoveForSubChart,
                isZoomForSubChart,
                horizontalBandData,
                barSeries,
                volumeData,
                showVolume,
                selectedDate,
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
        horizontalBandJoin,
        limitJoin,
        marketJoin,
        denomInBase,
        indicatorLine,
        liqTooltip,
        crosshairVertical,
        crosshairHorizontal,
        marketLine,
        candlestick,
        barSeries,
        liqAskSeries,
        liqBidSeries,
        lineBidSeries,
        lineAskSeries,
        areaAskJoin,
        areaBidJoin,
        lineBidSeriesJoin,
        lineAskSeriesJoin,
        liqHighligtedAskJoin,
        liqHighligtedBidJoin,
        liqHighligtedAskSeries,
        liqHighligtedBidSeries,
        yAxis,
        xAxis,
        mouseMoveEventCharts,
        isZoomForSubChart,
        horizontalBandData,
        showVolume,
        selectedDate,
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
            indicatorLine: any,
            liqTooltip: any,
            crosshairVertical: any,
            crosshairHorizontal: any,
            marketLine: any,
            candlestick: any,
            liqAskSeries: any,
            liqBidSeries: any,
            lineBidSeries: any,
            lineAskSeries: any,
            areaAskJoin: any,
            areaBidJoin: any,
            lineBidSeriesJoin: any,
            lineAskSeriesJoin: any,
            liqHighligtedAskJoin: any,
            liqHighligtedBidJoin: any,
            liqHighligtedAskSeries: any,
            liqHighligtedBidSeries: any,
            yAxis: any,
            xAxis: any,
            mouseMoveEventCharts: any,
            isMouseMoveForSubChart: boolean,
            isZoomForSubChart: boolean,
            horizontalBandData: any,
            barSeries: any,
            volumeData: any,
            showVolume: boolean,
            selectedDate: any,
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
                                (item: any) => item.time.getTime() === nearest?.date.getTime(),
                            )?.volume,
                        );
                    }

                    setsubChartValues((prevState: any) => {
                        const newData = [...prevState];

                        newData.filter((target: any) => target.name === 'tvl')[0].value =
                            tvlChartData.find(
                                (item: any) =>
                                    moment(item.time.getTime()).add(30, 'm').toDate().getTime() ===
                                    nearest?.date.getTime(),
                            )?.value;

                        newData.filter((target: any) => target.name === 'feeRate')[0].value =
                            feeChartData.find(
                                (item: any) => item.time.getTime() === nearest?.date.getTime(),
                            )?.value;

                        return newData;
                    });
                    return [
                        {
                            x: nearest?.date,
                            y: scaleData.yScale.invert(point.offsetY),
                        },
                    ];
                };

                const candleJoin = d3fc.dataJoin('g', 'candle');

                const horizontalBand = d3fc
                    .annotationSvgBand()
                    .xScale(scaleData.xScale)
                    .yScale(scaleData.yScale)
                    .fromValue((d: any) => d[0])
                    .toValue((d: any) => d[1])
                    .decorate((selection: any) => {
                        selection.select('path').attr('fill', '#7371FC1A');
                    });

                const crosshairHorizontalJoin = d3fc.dataJoin('g', 'crosshairHorizontal');
                const crosshairVerticalJoin = d3fc.dataJoin('g', 'crosshairVertical');
                // const highlightedCurrentPriceLineJoin = d3fc.dataJoin(
                //     'g',
                //     'highlightedCurrentPriceLine',
                // );
                const indicatorLineJoin = d3fc.dataJoin('g', 'indicatorLine');

                const barJoin = d3fc.dataJoin('g', 'bar');

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

                    scaleData.volumeScale.range([
                        event.detail.height,
                        event.detail.height - event.detail.height / 10,
                    ]);
                });

                d3.select(d3PlotArea.current).on('draw', function (event: any) {
                    async function createElements() {
                        const svg = d3.select(event.target).select('svg');
                        const svgFeeRateSub = d3.select('#fee_rate_chart').select('svg');
                        const svgTvlSub = d3.select('#d3PlotTvl').select('svg');

                        horizontalBandJoin(svg, [horizontalBandData]).call(horizontalBand);

                        crosshairHorizontalJoin(svg, [crosshairData]).call(crosshairHorizontal);
                        crosshairVerticalJoin(svg, [crosshairData]).call(crosshairVertical);

                        if (svgFeeRateSub.node() !== null)
                            crosshairHorizontalJoin(svgFeeRateSub, [crosshairData]).call(
                                crosshairHorizontal,
                            );

                        if (svgTvlSub.node() !== null)
                            crosshairHorizontalJoin(svgTvlSub, [crosshairData]).call(
                                crosshairHorizontal,
                            );

                        // d3.select('#fee_rate_chart')
                        // .select('svg')
                        // .select('.crosshairHorizontal').call(crosshairHorizontal);
                        targetsJoin(svg, [targets.ranges]).call(horizontalLine);
                        marketJoin(svg, [targets.market]).call(marketLine);
                        limitJoin(svg, [targets.limit]).call(limitLine);
                        // highlightedCurrentPriceLineJoin(svg, [currentPriceData]).call(
                        //     highlightedCurrentPriceLine,
                        // );
                        indicatorLineJoin(svg, [indicatorLineData]).call(indicatorLine);

                        candleJoin(svg, [chartData]).call(candlestick);
                        liqHighligtedAskJoin(svg, [liquidityData.liqHighligtedAskSeries]).call(
                            liqHighligtedAskSeries,
                        );
                        liqHighligtedBidJoin(svg, [liquidityData.liqHighligtedBidSeries]).call(
                            liqHighligtedBidSeries,
                        );

                        areaAskJoin(svg, [liquidityData.liqAskData]).call(liqAskSeries);
                        areaBidJoin(svg, [liquidityData.liqBidData]).call(liqBidSeries);
                        lineAskSeriesJoin(svg, [liquidityData.lineBidSeries]).call(lineBidSeries);
                        lineBidSeriesJoin(svg, [liquidityData.lineAskSeries]).call(lineAskSeries);

                        // barJoin(svg, [showVolume ? volumeData : []]).call(barSeries);
                        if (barSeries) barJoin(svg, [showVolume ? volumeData : []]).call(barSeries);
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
                                    y: scaleData.yScale.invert(event.offsetY),
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

                                const topPlacement =
                                    event.y -
                                    80 -
                                    (event.offsetY - scaleData.yScale(poolPriceDisplay)) / 2;

                                liqTooltip
                                    .style('visibility', 'visible')
                                    .style('top', (topPlacement < 115 ? 115 : topPlacement) + 'px')
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
                                    y: scaleData.yScale.invert(event.offsetY),
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

                                const topPlacement =
                                    event.y -
                                    80 -
                                    (event.offsetY - scaleData.yScale(poolPriceDisplay)) / 2;

                                liqTooltip
                                    .style('visibility', 'visible')
                                    .style('top', (topPlacement > 500 ? 500 : topPlacement) + 'px')
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

                    svg.call(zoomUtils.zoom).on('dblclick.zoom', null);
                });

                const setCrossHairLocation = (event: any) => {
                    if (snap(candlestick, chartData, event)[0] !== undefined) {
                        crosshairData[0] = snap(candlestick, chartData, event)[0];
                        setIsMouseMoveCrosshair(true);

                        setCrosshairData([
                            {
                                x: crosshairData[0].x,
                                y:
                                    isMouseMoveForSubChart || isZoomForSubChart
                                        ? -1
                                        : scaleData.yScale.invert(event.layerY),
                            },
                        ]);

                        render();
                    }
                };

                if (isMouseMoveForSubChart) {
                    setCrossHairLocation(mouseMoveEventCharts);
                } else if (isZoomForSubChart) {
                    setCrossHairLocation(mouseMoveEventCharts.sourceEvent);
                }

                d3.select(d3PlotArea.current).on('mousemove', async function (event: any) {
                    isMouseMoveForSubChart = false;
                    isZoomForSubChart = false;
                    setCrossHairLocation(event);
                    setMouseMoveEventCharts(event);
                    showCrosshair();
                });

                d3.select(d3Yaxis.current).on('mouseover', (event: any) => {
                    d3.select(event.currentTarget).style('cursor', 'row-resize');
                    crosshairData[0].x = -1;
                });

                d3.select(d3Yaxis.current).on('measure.range', function (event: any) {
                    const svg = d3.select(event.target).select('svg');

                    svg.call(zoomUtils.yAxisZoom)
                        .on('dblclick.zoom', null)
                        .on('dblclick.drag', null);
                });

                render();

                d3.select(d3Container.current).on('mouseleave', () => {
                    d3.select(d3PlotArea.current)
                        .select('svg')
                        .select('.crosshairHorizontal')
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

                    setIsMouseMoveCrosshair(false);

                    if (selectedDate === undefined) {
                        props.setShowTooltip(false);
                    }
                });
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

                    props.setShowTooltip(true);
                });
            }
        },
        [],
    );

    function showCrosshair() {
        d3.select(d3PlotArea.current)
            .select('svg')
            .select('.crosshairHorizontal')
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
    }

    useEffect(() => {
        if (
            liqTooltip !== undefined &&
            liqTooltipSelectedLiqBar !== undefined &&
            poolPriceDisplay !== undefined
        ) {
            const liqTextData = { totalValue: 0 };

            if (liqTooltipSelectedLiqBar.liqPrices < poolPriceDisplay) {
                props.liquidityData.liqAskData.map((liqData: any) => {
                    if (
                        liqData.liqPrices >= liqTooltipSelectedLiqBar.liqPrices &&
                        poolPriceDisplay > liqData.liqPrices
                    ) {
                        liqTextData.totalValue = liqTextData.totalValue + liqData.deltaAverageUSD;
                    }
                });
            } else {
                props.liquidityData.liqBidData.map((liqData: any) => {
                    if (
                        liqData.liqPrices <= liqTooltipSelectedLiqBar.liqPrices &&
                        poolPriceDisplay < liqData.liqPrices
                    ) {
                        liqTextData.totalValue = liqTextData.totalValue + liqData.deltaAverageUSD;
                    }
                });
            }

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

    // // Candle transactions
    useEffect(() => {
        if (selectedDate !== undefined) {
            const candle = parsedChartData?.chartData.find(
                (candle: any) => candle.date.toString() === selectedDate.toString(),
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
                // console.log('changing show all to false');
                props.changeState(true, candle);
            }
        } else {
            // d3.select('#transactionPopup').style('visibility', 'hidden');
            // console.log('changing pop up state to false');
            props.changeState(false, undefined);
        }
    }, [selectedDate]);

    const onBlurRange = (range: any, highLineMoved: boolean, lowLineMoved: boolean) => {
        if (range !== undefined) {
            const low = range.filter((target: any) => target.name === 'Min')[0].value;
            const high = range.filter((target: any) => target.name === 'Max')[0].value;

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
    };

    const onBlurlimitRate = (newLimitValue: any) => {
        if (newLimitValue === undefined) {
            return;
        }
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

                    const limitValue =
                        poolPriceDisplay !== undefined &&
                        parseFloat(limitRateTruncated.replace(',', '')) > poolPriceDisplay * 10
                            ? poolPriceDisplay * 10
                            : parseFloat(limitRateTruncated.replace(',', ''));

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

    // useEffect(() => {
    //     const popupHeight = 15;
    //     // let popupHeight = 22;
    //     // Object.values(props.chartItemStates).map((value: any) => {
    //     //     if (value) popupHeight -= 7.8;
    //     // });
    //     setPopupHeight(() => {
    //         return popupHeight;
    //     });
    // }, [props.chartItemStates]);

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
                            style={{ width: '4rem' }}
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
                                crosshairForSubChart={crosshairForSubChart}
                                setsubChartValues={setsubChartValues}
                                xScale={scaleData !== undefined ? scaleData.xScale : undefined}
                                getNewCandleData={getNewCandleData}
                                setZoomAndYdragControl={setZoomAndYdragControl}
                                zoomAndYdragControl={zoomAndYdragControl}
                                setIsMouseMoveForSubChart={setIsMouseMoveForSubChart}
                                isMouseMoveForSubChart={isMouseMoveForSubChart}
                                setIsZoomForSubChart={setIsZoomForSubChart}
                                setMouseMoveEventCharts={setMouseMoveEventCharts}
                                render={render}
                                mouseMoveChartName={mouseMoveChartName}
                                setMouseMoveChartName={setMouseMoveChartName}
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
                                crosshairForSubChart={crosshairForSubChart}
                                setsubChartValues={setsubChartValues}
                                scaleData={scaleData}
                                getNewCandleData={getNewCandleData}
                                setZoomAndYdragControl={setZoomAndYdragControl}
                                zoomAndYdragControl={zoomAndYdragControl}
                                isMouseMoveForSubChart={isMouseMoveForSubChart}
                                setIsMouseMoveForSubChart={setIsMouseMoveForSubChart}
                                setIsZoomForSubChart={setIsZoomForSubChart}
                                setMouseMoveEventCharts={setMouseMoveEventCharts}
                                render={render}
                                mouseMoveChartName={mouseMoveChartName}
                                setMouseMoveChartName={setMouseMoveChartName}
                                setTransformX={setTransformX}
                                transformX={transformX}
                            />
                        </>
                    )}

                    <hr />
                    <d3fc-svg
                        ref={d3Xaxis}
                        className='x-axis'
                        style={{ height: '1.25em', width: '100%' }}
                    ></d3fc-svg>
                </div>
            </d3fc-group>

            {/* <div
                className='popup'
                id='transactionPopup'
                style={{ visibility: 'hidden', top: popupHeight + '%' }}
                onClick={() => {
                    setSelectedDate(undefined);

                    d3.select('#transactionPopup').style('visibility', 'hidden');
                    props.changeState(false, undefined);
                }}
            ></div> */}
        </div>
    );
}
