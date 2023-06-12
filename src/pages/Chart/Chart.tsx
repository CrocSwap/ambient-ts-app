/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable quotes */
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import moment from 'moment';

import {
    DetailedHTMLProps,
    HTMLAttributes,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
    useMemo,
} from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../utils/hooks/reduxToolkit';
import {
    formatAmountChartData,
    formatAmountWithoutDigit,
    formatPoolPriceAxis,
} from '../../utils/numbers';
import {
    CandleData,
    CandlesByPoolAndDuration,
} from '../../utils/state/graphDataSlice';
import {
    setLimitTick,
    setIsLinesSwitched,
    // setIsTokenAPrimary,
    setShouldLimitDirectionReverse,
    candleScale,
} from '../../utils/state/tradeDataSlice';
import { LiquidityDataLocal } from '../Trade/TradeCharts/TradeCharts';
import FeeRateSubChart from '../Trade/TradeCharts/TradeChartsLoading/FeeRateSubChart';
import TvlSubChart from '../Trade/TradeCharts/TradeChartsLoading/TvlSubChart';
import { PoolContext } from '../../contexts/PoolContext';
import './Chart.css';
import { pinTickLower, pinTickUpper, tickToPrice } from '@crocswap-libs/sdk';
import {
    getPinnedPriceValuesFromDisplayPrices,
    getPinnedPriceValuesFromTicks,
    getPinnedTickFromDisplayPrice,
} from '../Trade/Range/rangeFunctions';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { correctStyleForData } from './calcuteAxisDate';
import useHandleSwipeBack from '../../utils/hooks/useHandleSwipeBack';
import { candleTimeIF } from '../../App/hooks/useChartSettings';
import { IS_LOCAL_ENV } from '../../constants';
import {
    diffHashSig,
    diffHashSigChart,
} from '../../utils/functions/diffHashSig';
import { CandleContext } from '../../contexts/CandleContext';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';
import { SidebarContext } from '../../contexts/SidebarContext';
import { TradeTableContext } from '../../contexts/TradeTableContext';
import { RangeContext } from '../../contexts/RangeContext';
import { createTriangle } from './ChartUtils/triangle';

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

type crosshair = {
    x: number | Date;
    y: number | string;
};
type chartItemStates = {
    showTvl: boolean;
    showVolume: boolean;
    showFeeRate: boolean;
    liqMode: string;
};

type yLabel = {
    x: number;
    y: number;
    width: number;
    height: number;
};

type lineValue = {
    name: string;
    value: number;
};

interface propsIF {
    isTokenABase: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    liquidityData: any;
    changeState: (
        isOpen: boolean | undefined,
        candleData: CandleData | undefined,
    ) => void;
    denomInBase: boolean;
    chartItemStates: chartItemStates;
    setCurrentData: React.Dispatch<
        React.SetStateAction<CandleData | undefined>
    >;
    setCurrentVolumeData: React.Dispatch<
        React.SetStateAction<number | undefined>
    >;
    isCandleAdded: boolean | undefined;
    setIsCandleAdded: React.Dispatch<boolean>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    scaleData: any;
    poolPriceNonDisplay: number | undefined;
    selectedDate: number | undefined;
    setSelectedDate: React.Dispatch<number | undefined>;
    rescale: boolean | undefined;
    setRescale: React.Dispatch<React.SetStateAction<boolean>>;
    latest: boolean | undefined;
    setLatest: React.Dispatch<React.SetStateAction<boolean>>;
    reset: boolean | undefined;
    setReset: React.Dispatch<React.SetStateAction<boolean>>;
    showLatest: boolean | undefined;
    setShowLatest: React.Dispatch<React.SetStateAction<boolean>>;
    setShowTooltip: React.Dispatch<React.SetStateAction<boolean>>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    liquidityScale: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    liquidityDepthScale: any;
    candleTime: candleTimeIF;
    unparsedData: CandlesByPoolAndDuration;
    prevPeriod: number;
    candleTimeInSeconds: number;
}

export function setCanvasResolution(canvas: HTMLCanvasElement) {
    const ratio = window.devicePixelRatio < 1 ? 1 : window.devicePixelRatio;
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    if (canvas !== null) {
        const width = canvas.width;
        const height = canvas.height;
        canvas.width = width * ratio;
        canvas.height = height * ratio;

        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        context.scale(ratio, ratio);
    }
}

export function renderCanvasArray(canvasArray: any[]) {
    canvasArray.forEach((canvas) => {
        if (canvas) {
            const container = d3.select(canvas.current).node() as any;
            if (container) container.requestRedraw();
        }
    });
}

export default function Chart(props: propsIF) {
    const {
        isTokenABase,
        denomInBase,
        setIsCandleAdded,
        scaleData,
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
        liquidityData,
        liquidityScale,
        liquidityDepthScale,
        unparsedData,
        prevPeriod,
        candleTimeInSeconds,
    } = props;

    const {
        sidebar: { isOpen: isSidebarOpen },
    } = useContext(SidebarContext);
    const { chainData } = useContext(CrocEnvContext);
    const chainId = chainData.chainId;
    const { setCandleDomains, setCandleScale } = useContext(CandleContext);
    const { pool, poolPriceDisplay: poolPriceWithoutDenom } =
        useContext(PoolContext);
    const {
        minRangePrice: minPrice,
        setMinRangePrice: setMinPrice,
        maxRangePrice: maxPrice,
        setMaxRangePrice: setMaxPrice,
        rescaleRangeBoundariesWithSlider,
        chartTriggeredBy,
        setChartTriggeredBy,
        simpleRangeWidth: rangeSimpleRangeWidth,
        setSimpleRangeWidth: setRangeSimpleRangeWidth,
    } = useContext(RangeContext);
    const { expandTradeTable, handlePulseAnimation } =
        useContext(TradeTableContext);

    const { isLoggedIn: isUserConnected } = useAppSelector(
        (state) => state.userData,
    );
    const tradeData = useAppSelector((state) => state.tradeData);

    const [minTickForLimit, setMinTickForLimit] = useState<any>();
    const [maxTickForLimit, setMaxTickForLimit] = useState<any>();

    const unparsedCandleData = unparsedData.candles;

    const period = unparsedData.duration;

    const isDenomBase = tradeData.isDenomBase;
    const isBid = tradeData.isTokenABase;
    const side =
        (isDenomBase && !isBid) || (!isDenomBase && isBid) ? 'buy' : 'sell';
    const sellOrderStyle = side === 'sell' ? 'order_sell' : 'order_buy';

    const liqAskColor = 'rgba(205, 193, 255, 0.3)';
    const liqBidColor = 'rgba(115, 113, 252, 0.3)';

    const lineSellColor = 'rgba(115, 113, 252)';
    const lineBuyColor = 'rgba(205, 193, 255)';

    const { showFeeRate, showTvl, showVolume, liqMode } = props.chartItemStates;

    const poolPriceDisplay = poolPriceWithoutDenom
        ? isDenomBase && poolPriceWithoutDenom
            ? 1 / poolPriceWithoutDenom
            : poolPriceWithoutDenom ?? 0
        : 0;

    const d3Container = useRef<HTMLInputElement | null>(null);
    const d3CanvasCandle = useRef<HTMLInputElement | null>(null);
    const d3CanvasBar = useRef<HTMLInputElement | null>(null);
    const d3CanvasLiqBid = useRef<HTMLInputElement | null>(null);
    const d3CanvasLiqAsk = useRef<HTMLInputElement | null>(null);

    const d3CanvasLiqBidDepth = useRef<HTMLInputElement | null>(null);
    const d3CanvasLiqAskDepth = useRef<HTMLInputElement | null>(null);

    const d3CanvasCrosshair = useRef<HTMLInputElement | null>(null);
    const d3CanvasMarketLine = useRef<HTMLInputElement | null>(null);
    const d3CanvasMain = useRef<HTMLInputElement | null>(null);

    const d3CanvasLimitLine = useRef<HTMLInputElement | null>(null);
    const d3CanvasRangeLine = useRef<HTMLInputElement | null>(null);

    const d3Xaxis = useRef<HTMLInputElement | null>(null);
    const d3Yaxis = useRef<HTMLInputElement | null>(null);
    const dispatch = useAppDispatch();

    const location = useLocation();
    const position = location?.state?.position;

    const simpleRangeWidth = rangeSimpleRangeWidth;
    const setSimpleRangeWidth = setRangeSimpleRangeWidth;

    const { tokenA, tokenB } = tradeData;
    const tokenADecimals = tokenA.decimals;
    const tokenBDecimals = tokenB.decimals;
    const baseTokenDecimals = isTokenABase ? tokenADecimals : tokenBDecimals;
    const quoteTokenDecimals = !isTokenABase ? tokenADecimals : tokenBDecimals;

    const [ranges, setRanges] = useState<lineValue[]>([
        {
            name: 'Min',
            value: 0,
        },
        {
            name: 'Max',
            value: 0,
        },
    ]);

    const [limit, setLimit] = useState<lineValue[]>([
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

    // Axes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [yAxis, setYaxis] = useState<any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [xAxis, setXaxis] = useState<any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [boundaries, setBoundaries] = useState<any>();

    // Rules
    const [zoomAndYdragControl, setZoomAndYdragControl] = useState();

    const [isLineDrag, setIsLineDrag] = useState(false);
    const [isChartZoom, setIsChartZoom] = useState(false);
    const [checkLimitOrder, setCheckLimitOrder] = useState<boolean>(false);

    // Data
    const [crosshairData, setCrosshairData] = useState<crosshair[]>([
        { x: 0, y: 0 },
    ]);
    const [currentPriceData] = useState([{ value: -1 }]);
    const [liqTooltipSelectedLiqBar, setLiqTooltipSelectedLiqBar] = useState({
        activeLiq: 0,
        liqPrices: 0,
        deltaAverageUSD: 0,
        cumAverageUSD: 0,
        upperBound: 0,
        lowerBound: 0,
    });
    const [selectedLiq, setSelectedLiq] = useState('');
    const [firstCandle, setFirstCandle] = useState<number>();

    // d3

    const lastCandleData = unparsedCandleData.reduce(function (prev, current) {
        return prev.time > current.time ? prev : current;
    });
    const [subChartValues, setsubChartValues] = useState([
        {
            name: 'feeRate',
            value: lastCandleData?.averageLiquidityFee,
        },
        {
            name: 'tvl',
            value: lastCandleData?.tvlData.tvl,
        },
        {
            name: 'volume',
            value: undefined,
        },
    ]);
    // Crosshairs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [liqTooltip, setLiqTooltip] = useState<any>();
    const [crosshairActive, setCrosshairActive] = useState<string>('chart');

    const [crosshairVerticalCanvas, setCrosshairVerticalCanvas] =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        useState<any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [crosshairHorizontal, setCrosshairHorizontal] = useState<any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [candlestick, setCandlestick] = useState<any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [barSeries, setBarSeries] = useState<any>();
    // Line Series
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [horizontalLine, setHorizontalLine] = useState<any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [marketLine, setMarketLine] = useState<any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [limitLine, setLimitLine] = useState<any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [triangleLimit, setTriangleLimit] = useState<any>();
    const [triangleRange, setTriangleRange] = useState<any>();

    // Line Joins
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [horizontalBand, setHorizontalBand] = useState<any>();

    // NoGoZone Joins
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [noGoZoneBoudnaries, setNoGoZoneBoudnaries] = useState([[0, 0]]);

    // Liq Series
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [liqBidSeries, setLiqBidSeries] = useState<any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [liqAskSeries, setLiqAskSeries] = useState<any>();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [liqBidDepthSeries, setLiqBidDepthSeries] = useState<any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [liqAskDepthSeries, setLiqAskDepthSeries] = useState<any>();

    // Liq Line Series
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [lineAskSeries, setLineAskSeries] = useState<any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [lineBidSeries, setLineBidSeries] = useState<any>();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [lineAskDepthSeries, setLineAskDepthSeries] = useState<any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [lineBidDepthSeries, setLineBidDepthSeries] = useState<any>();

    // Utils
    const utcDiff = moment().utcOffset();
    const utcDiffHours = Math.floor(utcDiff / 60);
    const defaultCandleBandwith = 5;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [zoomUtils, setZoomUtils] = useState<any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [dragRange, setDragRange] = useState<any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [dragLimit, setDragLimit] = useState<any>();

    const [mouseLocationY, setMouseLocationY] = useState();
    const [yAxisWidth, setYaxisWidth] = useState('4rem');
    const [bandwidth, setBandwidth] = useState(5);
    const [yAxisCanvasWidth, setYaxisCanvasWidth] = useState(70);

    const [gradientForAsk, setGradientForAsk] = useState();
    const [gradientForBid, setGradientForBid] = useState();
    const [defaultGradientForBid, setDefaultGradientForBid] = useState();
    const [defaultGradientForAsk, setDefaultGradientForAsk] = useState();

    const [isMouseLeaveBidLiq, setIsMouseLeaveBidLiq] = useState(true);
    const [isMouseLeaveAskLiq, setIsMouseLeaveAskLiq] = useState(true);
    const [
        isOnCandleOrVolumeMouseLocation,
        setIsOnCandleOrVolumeMouseLocation,
    ] = useState(false);
    const [yAxisLabels] = useState<yLabel[]>([]);

    const currentPoolPriceTick =
        poolPriceNonDisplay === undefined
            ? 0
            : Math.log(poolPriceNonDisplay) / Math.log(1.0001);

    const isScientific = poolPriceNonDisplay
        ? poolPriceNonDisplay.toString().includes('e')
        : false;

    useEffect(() => {
        useHandleSwipeBack(d3Container);
    }, [d3Container === null]);

    useEffect(() => {
        if (
            minPrice !== 0 &&
            maxPrice !== 0 &&
            !isNaN(maxPrice) &&
            !isNaN(minPrice)
        ) {
            setRanges((prevState) => {
                const newTargets = [...prevState];
                newTargets.filter(
                    (target: lineValue) => target.name === 'Max',
                )[0].value =
                    !tradeData.advancedMode && simpleRangeWidth === 100
                        ? liquidityData?.topBoundary
                        : maxPrice;

                newTargets.filter(
                    (target: lineValue) => target.name === 'Min',
                )[0].value =
                    !tradeData.advancedMode && simpleRangeWidth === 100
                        ? 0
                        : minPrice;

                return newTargets;
            });
        }
    }, [minPrice, maxPrice, tradeData.advancedMode, simpleRangeWidth]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const standardDeviation = (arr: any, usePopulation = false) => {
        const mean =
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            arr.reduce((acc: any, val: any) => acc + val, 0) / arr.length;
        return Math.sqrt(
            arr
                .reduce(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (acc: any, val: any) => acc.concat((val - mean) ** 2),
                    [],
                )
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .reduce((acc: any, val: any) => acc + val, 0) /
                (arr.length - (usePopulation ? 0 : 1)),
        );
    };

    const fillLiqAdvanced = (standardDeviation: number, scaleData: any) => {
        const border = scaleData?.yScale.domain()[1];

        const filledTickNumber = Math.min(border / standardDeviation, 150);

        standardDeviation =
            filledTickNumber === 150
                ? (border - liquidityData?.liqBidData[0]?.liqPrices) / 150
                : standardDeviation;

        if (scaleData !== undefined) {
            if (
                border + standardDeviation >=
                liquidityData?.liqBidData[0]?.liqPrices
            ) {
                for (let index = 0; index < filledTickNumber; index++) {
                    liquidityData?.liqBidData.unshift({
                        activeLiq: 30,
                        liqPrices:
                            liquidityData?.liqBidData[0]?.liqPrices +
                            standardDeviation,
                        deltaAverageUSD: 0,
                        cumAverageUSD: 0,
                    });

                    liquidityData?.depthLiqBidData.unshift({
                        activeLiq: liquidityData?.depthLiqBidData[1]?.activeLiq,
                        liqPrices:
                            liquidityData?.depthLiqBidData[0]?.liqPrices +
                            standardDeviation,
                        deltaAverageUSD: 0,
                        cumAverageUSD: 0,
                    });
                }
            }
        }
    };

    const setDefaultRangeData = () => {
        if (scaleData) {
            const maxPrice =
                liquidityData !== undefined
                    ? liquidityData?.topBoundary
                    : Infinity;

            setRanges((prevState) => {
                const newTargets = [...prevState];
                newTargets.filter(
                    (target: lineValue) => target.name === 'Max',
                )[0].value = maxPrice;
                newTargets.filter(
                    (target: lineValue) => target.name === 'Min',
                )[0].value = 0;

                return newTargets;
            });

            d3.select(d3CanvasRangeLine.current)
                .select('canvas')
                .style('display', 'none');
        }
    };

    useEffect(() => {
        setRescale(true);
    }, [denomInBase]);

    const render = useCallback(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const nd = d3.select('#d3fc_group').node() as any;
        if (nd) nd.requestRedraw();
    }, []);

    useEffect(() => {
        IS_LOCAL_ENV && console.debug('re-rending chart');
        if (expandTradeTable) return;

        if (unparsedCandleData && unparsedCandleData.length > 0) {
            if (
                !showLatest &&
                firstCandle &&
                unparsedCandleData[0].time !== firstCandle
            ) {
                setIsCandleAdded(false);
                setFirstCandle(() => {
                    return unparsedCandleData[0].time;
                });

                const domainLeft = scaleData?.xScale.domain()[0];
                const domainRight = scaleData?.xScale.domain()[1];

                scaleData?.xScale.domain([
                    domainLeft + period * 1000,
                    domainRight + period * 1000,
                ]);
            } else if (firstCandle === undefined) {
                setFirstCandle(() => {
                    return unparsedCandleData[0].time;
                });
            }
        }

        renderCanvasArray([d3CanvasCandle]);
    }, [
        diffHashSig(props.chartItemStates),
        expandTradeTable,
        lastCandleData,
        firstCandle,
    ]);

    const sameLocationLimit = () => {
        const resultData =
            scaleData?.yScale(limit[0].value) -
            scaleData?.yScale(market[0].value);
        const resultLocationData = resultData < 0 ? -20 : 20;
        const isSameLocation = Math.abs(resultData) < 20;
        const sameLocationData =
            scaleData?.yScale(market[0].value) + resultLocationData;
        return {
            isSameLocation: isSameLocation,
            sameLocationData: sameLocationData,
        };
    };

    const sameLocationRange = () => {
        const low = ranges.filter((target: any) => target.name === 'Min')[0]
            .value;
        const high = ranges.filter((target: any) => target.name === 'Max')[0]
            .value;

        if (high >= low) {
            const resultData = scaleData?.yScale(low) - scaleData?.yScale(high);
            const resultLocationData = resultData < 0 ? -20 : 20;
            const isSameLocation = Math.abs(resultData) < 20;
            const sameLocationData =
                scaleData?.yScale(high) + resultLocationData;

            return {
                isSameLocationMin: isSameLocation,
                sameLocationDataMin: sameLocationData,
                isSameLocationMax: false,
                sameLocationDataMax: 0,
            };
        } else {
            const resultData = scaleData?.yScale(low) - scaleData?.yScale(high);
            const resultLocationData = resultData < 0 ? -20 : 20;
            const isSameLocation = Math.abs(resultData) < 20;
            const sameLocationData =
                scaleData?.yScale(low) - resultLocationData;

            return {
                isSameLocationMin: false,
                sameLocationDataMin: 0,
                isSameLocationMax: isSameLocation,
                sameLocationDataMax: sameLocationData,
            };
        }
    };

    const canUserDragRange = useMemo<boolean>(() => {
        if (
            mouseLocationY &&
            (location.pathname.includes('range') ||
                location.pathname.includes('reposition')) &&
            !(!tradeData.advancedMode && simpleRangeWidth === 100)
        ) {
            const mousePlacement = scaleData?.yScale.invert(mouseLocationY);
            const lineBuffer =
                (scaleData?.yScale.domain()[1] -
                    scaleData?.yScale.domain()[0]) /
                30;

            const rangeLowLineValue = ranges.filter(
                (target: any) => target.name === 'Min',
            )[0].value;
            const rangeHighLineValue = ranges.filter(
                (target: any) => target.name === 'Max',
            )[0].value;

            return (
                (mousePlacement < rangeLowLineValue + lineBuffer &&
                    mousePlacement > rangeLowLineValue - lineBuffer) ||
                (mousePlacement < rangeHighLineValue + lineBuffer &&
                    mousePlacement > rangeHighLineValue - lineBuffer)
            );
        }

        return false;
    }, [ranges, mouseLocationY]);

    const canUserDragLimit = useMemo<boolean>(() => {
        if (mouseLocationY && location.pathname.includes('/limit')) {
            const lineBuffer =
                (scaleData?.yScale.domain()[1] -
                    scaleData?.yScale.domain()[0]) /
                30;

            const mousePlacement = scaleData?.yScale.invert(mouseLocationY);
            const limitLineValue = limit[0].value;

            return (
                mousePlacement < limitLineValue + lineBuffer &&
                mousePlacement > limitLineValue - lineBuffer
            );
        }
        return false;
    }, [limit, mouseLocationY]);

    useEffect(() => {
        if (isLineDrag) {
            d3.select(d3CanvasMain.current).style('cursor', 'none');
        } else if (canUserDragLimit || canUserDragRange) {
            d3.select(d3CanvasMain.current).style('cursor', 'row-resize');
        } else {
            d3.select(d3CanvasMain.current).style(
                'cursor',
                isOnCandleOrVolumeMouseLocation ? 'pointer' : 'default',
            );
        }
    }, [canUserDragLimit, canUserDragRange, isOnCandleOrVolumeMouseLocation]);

    function changeyAxisWidth() {
        let yTickValueLength =
            formatPoolPriceAxis(scaleData?.yScale.ticks()[0]).length - 1;
        let result = false;
        scaleData?.yScale.ticks().forEach((element: any) => {
            if (formatPoolPriceAxis(element).length > 4) {
                result = true;
                yTickValueLength =
                    yTickValueLength > formatPoolPriceAxis(element).length - 1
                        ? yTickValueLength
                        : formatPoolPriceAxis(element).length - 1;
            }
        });
        if (result) {
            if (yTickValueLength > 4 && yTickValueLength < 8) {
                setYaxisWidth('6rem');
                setYaxisCanvasWidth(70);
            }
            if (yTickValueLength >= 8) {
                setYaxisWidth('7rem');
                setYaxisCanvasWidth(85);
            }
            if (yTickValueLength >= 10) {
                setYaxisWidth('8rem');
                setYaxisCanvasWidth(100);
            }
            if (yTickValueLength >= 13) {
                setYaxisWidth('9rem');
                setYaxisCanvasWidth(117);
            }
            if (yTickValueLength >= 15) {
                setYaxisWidth('10rem');
                setYaxisCanvasWidth(134);
            }
            if (yTickValueLength >= 16) {
                setYaxisCanvasWidth(142);
            }
            if (yTickValueLength >= 17) {
                setYaxisCanvasWidth(147);
            }
            if (yTickValueLength >= 20) {
                setYaxisWidth('11rem');
                setYaxisCanvasWidth(152);
            }
        }
        if (yTickValueLength <= 4) setYaxisWidth('5rem');
    }

    useEffect(() => {
        if (
            location.pathname.includes('range') ||
            location.pathname.includes('reposition')
        ) {
            d3.select(d3Container.current)
                .select('.limit')
                .select('.horizontal')
                .style('visibility', 'hidden');
        } else if (location.pathname.includes('/limit')) {
            d3.select(d3CanvasRangeLine.current)
                .select('canvas')
                .style('display', 'none');
        } else if (location.pathname.includes('market')) {
            d3.select(d3Container.current)
                .select('.limit')
                .style('visibility', 'hidden');
            d3.select(d3Container.current)
                .select('.limit')
                .select('.horizontal')
                .style('visibility', 'hidden');

            d3.select(d3CanvasRangeLine.current)
                .select('canvas')
                .style('display', 'none');
        }
    }, [
        location,
        location.pathname,
        period,
        simpleRangeWidth,
        tradeData.advancedMode,
    ]);

    useEffect(() => {
        setRescale(true);
    }, [location.pathname, period]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const snapForCandle = (point: any, filtered: Array<CandleData>) => {
        if (point == undefined) return [];
        const xScale = scaleData?.xScale;

        if (filtered.length > 1) {
            const nearest = minimum(filtered, (d: CandleData) =>
                Math.abs(point.offsetX - xScale(d.time * 1000)),
            )[1];
            return nearest;
        }

        return filtered[0];
    };

    useEffect(() => {
        if (scaleData) {
            const xDomain = scaleData?.xScale.domain();
            const isFutureDay =
                new Date(xDomain[1]).getTime() > new Date().getTime();

            let domainMax = isFutureDay
                ? new Date().getTime()
                : new Date(xDomain[1]).getTime();

            const nCandle = Math.floor(
                (xDomain[1] - xDomain[0]) / (period * 1000),
            );

            const minDate = 1657868400; // 15 July 2022

            domainMax = domainMax < minDate ? minDate : domainMax;

            setCandleScale((prev: candleScale) => {
                return {
                    isFetchForTimeframe: prev.isFetchForTimeframe,
                    lastCandleDate: Math.floor(domainMax / 1000),
                    nCandle: nCandle,
                };
            });
        }
    }, [diffHashSig(scaleData?.xScale.domain())]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getNewCandleData = (
        newBoundary: any,
        candleDate: any,
        isZoomRight = true,
    ) => {
        const filtered = unparsedCandleData.filter(
            (data: CandleData) => data.time !== undefined,
        );
        if (filtered) {
            if (isZoomRight) {
                if (newBoundary < candleDate) {
                    const maxBoundary: number | undefined =
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        d3.min(filtered, (d: any) => d.time) * 1000 -
                        200 * period * 1000;

                    const newLastCandle = newBoundary - 100 * period * 1000;

                    const finalData =
                        maxBoundary < newLastCandle
                            ? maxBoundary
                            : newLastCandle;

                    const lastCandleDate = d3.min(
                        filtered,
                        (d) => d.time * 1000,
                    );

                    const candleDomain = {
                        lastCandleDate:
                            lastCandleDate !== undefined
                                ? lastCandleDate
                                : filtered[0].time * 1000,
                        domainBoundry: finalData,
                    };

                    setCandleDomains(candleDomain);
                }
            } else {
                const lastCandleDate = d3.max(filtered, (d) => d.time * 1000);
                const candleDomain = {
                    lastCandleDate: new Date().getTime(),
                    domainBoundry: lastCandleDate,
                };

                setCandleDomains(candleDomain);
            }
        }
    };

    const maxNumCandlesForZoom = 2000;

    // Zoom
    useEffect(() => {
        if (scaleData !== undefined && unparsedData !== undefined) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let clickedForLine = false;
            let zoomTimeout: any | undefined = undefined;
            let previousTouch: any | undefined = undefined;
            let previousDeltaTouch: any = undefined;

            const filteredTime = unparsedCandleData.filter(
                (data: CandleData) => data.time,
            );

            const lastCandleDate = d3.min(filteredTime, (d) => d.time * 1000);

            if (lastCandleDate) {
                const changeCandleSize = (
                    domainX: any,
                    deltaX: number,
                    offsetX: number,
                    zoomCandle: undefined | number = undefined,
                ) => {
                    const point = zoomCandle
                        ? zoomCandle
                        : scaleData?.xScale.invert(offsetX);

                    const gapTop = domainX[1] - point;
                    const gapBot = point - domainX[0];

                    const minGap = Math.min(gapTop, gapBot);
                    const maxGap = Math.max(gapTop, gapBot);
                    let baseMovement = deltaX / (maxGap / minGap + 1);
                    baseMovement = baseMovement === 0 ? deltaX : baseMovement;
                    if (gapBot < gapTop) {
                        getNewCandleData(
                            domainX[0] - baseMovement,
                            lastCandleDate,
                        );
                        scaleData?.xScale.domain([
                            domainX[0] - baseMovement,
                            domainX[1] + baseMovement * (maxGap / minGap),
                        ]);
                    } else {
                        getNewCandleData(
                            domainX[0] - baseMovement * (maxGap / minGap),
                            lastCandleDate,
                        );

                        let minX =
                            domainX[0] - baseMovement * (maxGap / minGap);
                        let maxX = domainX[1] + baseMovement;

                        if (
                            new Date(minX * 1000).toString() === 'Invalid Date'
                        ) {
                            minX =
                                domainX[0] -
                                period * 1000 * maxNumCandlesForZoom;
                        }

                        if (
                            new Date(maxX * 1000).toString() === 'Invalid Date'
                        ) {
                            maxX = domainX[1] + period * 1000;
                        }
                        scaleData?.xScale.domain([minX, maxX]);
                    }
                };

                const zoomWithWhell = (
                    event: any,
                    unparsedCandleData: Array<CandleData>,
                ) => {
                    let dx = event.sourceEvent.deltaY / 3;

                    dx =
                        Math.abs(dx) === 0 ? -event.sourceEvent.deltaX / 3 : dx;

                    const domainX = scaleData?.xScale.domain();
                    const linearX = d3
                        .scaleTime()
                        .domain(scaleData?.xScale.range())
                        .range([0, domainX[1] - domainX[0]]);

                    const lastCandleTime = d3.max(
                        unparsedCandleData,
                        (d: CandleData) => d.time,
                    );

                    const firstCandleTime = d3.min(
                        unparsedCandleData,
                        (d: CandleData) => d.time,
                    );
                    const lastTime = domainX[1];

                    const firstTime = domainX[0];

                    const deltaX = linearX(dx);
                    if (lastCandleTime && firstCandleTime) {
                        if (
                            event.sourceEvent.shiftKey ||
                            event.sourceEvent.altKey
                        ) {
                            getNewCandleData(
                                firstTime + deltaX,
                                lastCandleDate,
                            );
                            scaleData?.xScale.domain([
                                firstTime + deltaX,
                                lastTime + deltaX,
                            ]);
                        } else {
                            if (
                                (deltaX < 0 ||
                                    Math.abs(lastTime - firstTime) <=
                                        period * 1000 * maxNumCandlesForZoom) &&
                                (deltaX > 0 ||
                                    Math.abs(lastTime - firstTime) >=
                                        period * 1000 * 2)
                            ) {
                                if (
                                    (!event.sourceEvent.ctrlKey ||
                                        event.sourceEvent.metaKey) &&
                                    (event.sourceEvent.ctrlKey ||
                                        !event.sourceEvent.metaKey)
                                ) {
                                    const newBoundary = domainX[0] - deltaX;

                                    const lastXIndex = d3.maxIndex(
                                        unparsedCandleData,
                                        (d: CandleData) => d.time,
                                    );

                                    if (
                                        newBoundary >
                                            unparsedCandleData[lastXIndex]
                                                .time *
                                                1000 -
                                                period * 1000 * 2 &&
                                        deltaX < 0
                                    ) {
                                        return;
                                    } else {
                                        getNewCandleData(
                                            newBoundary,
                                            lastCandleDate,
                                        );

                                        if (deltaX > 0) {
                                            if (
                                                lastTime >
                                                lastCandleTime * 1000
                                            ) {
                                                changeCandleSize(
                                                    domainX,
                                                    deltaX,
                                                    event.sourceEvent.offsetX,
                                                    lastCandleTime * 1000,
                                                );
                                            } else {
                                                scaleData?.xScale.domain([
                                                    newBoundary,
                                                    lastTime,
                                                ]);
                                            }
                                        } else {
                                            if (
                                                firstCandleTime * 1000 <
                                                lastTime
                                            ) {
                                                if (
                                                    lastCandleTime * 1000 <=
                                                        lastTime &&
                                                    deltaX < 0
                                                ) {
                                                    changeCandleSize(
                                                        domainX,
                                                        deltaX,
                                                        event.sourceEvent
                                                            .offsetX,
                                                        lastCandleTime * 1000,
                                                    );
                                                } else {
                                                    scaleData?.xScale.domain([
                                                        firstTime -
                                                            deltaX * 1.3,
                                                        lastTime,
                                                    ]);
                                                }
                                            } else {
                                                scaleData?.xScale.domain([
                                                    firstTime,
                                                    lastTime - deltaX,
                                                ]);
                                            }
                                        }
                                    }
                                } else {
                                    changeCandleSize(
                                        domainX,
                                        deltaX,
                                        event.sourceEvent.offsetX,
                                    );
                                }
                            } else {
                                getNewCandleData(
                                    firstTime - deltaX,
                                    lastCandleDate,
                                );
                                scaleData?.xScale.domain([
                                    firstTime - deltaX,
                                    lastTime - deltaX,
                                ]);
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
                                d3.select(d3CanvasMain.current).style(
                                    'cursor',
                                    'grabbing',
                                );
                            }
                        }
                    })
                    .on('zoom', (event: any) => {
                        async function newDomains(
                            unparsedCandleData: Array<CandleData>,
                        ) {
                            if (
                                event.sourceEvent &&
                                event.sourceEvent.type !== 'dblclick'
                            ) {
                                if (event.sourceEvent.type === 'wheel') {
                                    zoomWithWhell(event, unparsedCandleData);
                                } else if (
                                    event.sourceEvent.type === 'touchmove' &&
                                    event.sourceEvent.touches.length > 1
                                ) {
                                    const domainX = scaleData?.xScale.domain();
                                    const linearX = d3
                                        .scaleTime()
                                        .domain(scaleData?.xScale.range())
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
                                    const domainX = scaleData?.xScale.domain();
                                    const linearX = d3
                                        .scaleTime()
                                        .domain(scaleData?.xScale.range())
                                        .range([0, domainX[1] - domainX[0]]);

                                    let deltaX;
                                    if (
                                        event.sourceEvent.type === 'touchmove'
                                    ) {
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
                                        if (deltaX < 0) {
                                            getNewCandleData(
                                                domainX[0] + deltaX,
                                                lastCandleDate,
                                            );
                                        } else {
                                            const maxCandleDate = d3.max(
                                                filteredTime,
                                                (d) => d.time * 1000,
                                            );
                                            if (maxCandleDate) {
                                                getNewCandleData(
                                                    maxCandleDate + deltaX,
                                                    maxCandleDate,
                                                    false,
                                                );
                                            }
                                        }
                                        scaleData?.xScale.domain([
                                            domainX[0] + deltaX,
                                            domainX[1] + deltaX,
                                        ]);
                                    }
                                }

                                changeScale();

                                // PANNING
                                if (
                                    !rescale &&
                                    event.sourceEvent &&
                                    (event.sourceEvent.type != 'wheel' ||
                                        (event.sourceEvent.type ===
                                            'touchmove' &&
                                            event.sourceEvent.touches.length <
                                                2))
                                ) {
                                    const domainY = scaleData?.yScale.domain();
                                    const linearY = d3
                                        .scaleLinear()
                                        .domain(scaleData?.yScale.range())
                                        .range([domainY[1] - domainY[0], 0]);
                                    let deltaY;
                                    if (
                                        event.sourceEvent.type ===
                                            'touchmove' &&
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
                                            Math.min(domainY[1], domainY[0]) +
                                                deltaY,
                                            Math.max(domainY[1], domainY[0]) +
                                                deltaY,
                                        ];

                                        scaleData?.yScale.domain(domain);
                                    }

                                    const topPlacement =
                                        event.sourceEvent.y -
                                        80 -
                                        (event.sourceEvent.offsetY -
                                            scaleData?.yScale(
                                                poolPriceDisplay,
                                            )) /
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
                                            event.sourceEvent.offsetX -
                                                80 +
                                                'px',
                                        );

                                    if (
                                        tradeData.advancedMode &&
                                        liquidityData
                                    ) {
                                        const liqAllBidPrices =
                                            liquidityData?.liqBidData.map(
                                                (liqPrices: any) =>
                                                    liqPrices.liqPrices,
                                            );
                                        const liqBidDeviation =
                                            standardDeviation(liqAllBidPrices);

                                        fillLiqAdvanced(
                                            liqBidDeviation,
                                            scaleData,
                                        );
                                    }
                                }

                                clickedForLine = true;
                                if (candlestick) {
                                    setBandwidth(candlestick.bandwidth());
                                }
                                render();
                                setZoomAndYdragControl(event);
                            }
                        }

                        newDomains(unparsedCandleData).then(() => {
                            // mobile
                            if (event.sourceEvent.type.includes('touch')) {
                                previousTouch =
                                    event.sourceEvent.changedTouches[0];
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
                            d3.select(d3CanvasMain.current).style(
                                'cursor',
                                'pointer',
                            );

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

                        const latestCandleTime = d3.max(
                            unparsedCandleData,
                            (d) => d.time * 1000,
                        );

                        if (latestCandleTime !== undefined) {
                            if (
                                !showLatest &&
                                latestCandleTime &&
                                (scaleData?.xScale.domain()[1] <
                                    latestCandleTime ||
                                    scaleData?.xScale.domain()[0] >
                                        latestCandleTime)
                            ) {
                                setShowLatest(true);
                            } else if (
                                showLatest &&
                                !(
                                    scaleData?.xScale.domain()[1] <
                                    latestCandleTime
                                ) &&
                                !(
                                    scaleData?.xScale.domain()[0] >
                                    latestCandleTime
                                )
                            ) {
                                setShowLatest(false);
                            }
                        }

                        props.setShowTooltip(true);
                    })
                    .filter((event) => {
                        const isWheel = event.type === 'wheel';

                        if (location.pathname.includes('/market')) {
                            return true;
                        } else {
                            return (
                                (!canUserDragRange && !canUserDragLimit) ||
                                isWheel
                            );
                        }
                    }) as any;

                let firstLocation: any;
                let newCenter: any;
                let previousDeltaTouchYaxis: any;

                const startZoom = (event: any) => {
                    if (event.sourceEvent.type.includes('touch')) {
                        // mobile
                        previousTouch = event.sourceEvent.changedTouches[0];
                        firstLocation = previousTouch.pageY;
                        newCenter = scaleData?.yScale.invert(firstLocation);

                        if (event.sourceEvent.touches.length > 1) {
                            previousDeltaTouchYaxis = Math.hypot(
                                0,
                                event.sourceEvent.touches[0].pageY -
                                    event.sourceEvent.touches[1].pageY,
                            );
                            firstLocation = previousDeltaTouchYaxis;
                            newCenter = scaleData?.yScale.invert(firstLocation);
                        }
                    } else {
                        firstLocation = event.sourceEvent.offsetY;
                    }
                };

                const yAxisZoom = d3
                    .zoom()
                    .on('start', (event) => {
                        startZoom(event);
                    })
                    .on('zoom', async (event: any) => {
                        (async () => {
                            const domainY = scaleData?.yScale.domain();
                            const center =
                                domainY[1] !== domainY[0]
                                    ? (domainY[1] + domainY[0]) / 2
                                    : domainY[0] / 2;
                            let deltaY;

                            if (event.sourceEvent.type === 'touchmove') {
                                const touch =
                                    event.sourceEvent.changedTouches[0];

                                const _currentPageY = touch.pageY;
                                const previousTouchPageY = previousTouch.pageY;
                                const _movementY =
                                    _currentPageY - previousTouchPageY;
                                deltaY = _movementY;
                            } else {
                                deltaY = event.sourceEvent.movementY / 1.5;
                                newCenter =
                                    scaleData?.yScale.invert(firstLocation);
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
                                                  scaleData?.yScale.domain()[1],
                                          )
                                        : Math.abs(
                                              newCenter -
                                                  scaleData?.yScale.domain()[0],
                                          );
                                const diffFactor = (diff - distance) / distance;

                                const bottomDiff = size / (diffFactor + 1);
                                const topDiff = size - bottomDiff;

                                if (newCenter > center) {
                                    const domain = [
                                        newCenter - topDiff,
                                        newCenter + bottomDiff,
                                    ];
                                    await scaleData?.yScale.domain(domain);
                                } else {
                                    const domain = [
                                        newCenter - bottomDiff,
                                        newCenter + topDiff,
                                    ];
                                    await scaleData?.yScale.domain(domain);
                                }
                            } else if (event.sourceEvent.touches.length > 1) {
                                const touch1 = event.sourceEvent.touches[0];
                                const touch2 = event.sourceEvent.touches[1];
                                const deltaTouch = Math.hypot(
                                    0,
                                    touch1.pageY - touch2.pageY,
                                );

                                const currentDelta =
                                    scaleData?.yScale.invert(deltaTouch);
                                const delta =
                                    Math.abs(currentDelta - newCenter) * 0.03;

                                if (previousDeltaTouchYaxis > deltaTouch) {
                                    const domainMax =
                                        scaleData?.yScale.domain()[1] + delta;
                                    const domainMin =
                                        scaleData?.yScale.domain()[0] - delta;

                                    scaleData?.yScale.domain([
                                        Math.min(domainMin, domainMax),
                                        Math.max(domainMin, domainMax),
                                    ]);
                                }
                                if (previousDeltaTouchYaxis < deltaTouch) {
                                    const domainMax =
                                        scaleData?.yScale.domain()[1] -
                                        delta * 0.5;
                                    const domainMin =
                                        scaleData?.yScale.domain()[0] +
                                        delta * 0.5;

                                    if (domainMax === domainMin) {
                                        scaleData?.yScale.domain([
                                            Math.min(domainMin, domainMax) +
                                                delta,
                                            Math.max(domainMin, domainMax) -
                                                delta,
                                        ]);
                                    } else {
                                        scaleData?.yScale.domain([
                                            Math.min(domainMin, domainMax),
                                            Math.max(domainMin, domainMax),
                                        ]);
                                    }
                                }
                            }
                        })().then(() => {
                            if (event.sourceEvent.type.includes('touch')) {
                                // mobile
                                previousTouch =
                                    event.sourceEvent.changedTouches[0];

                                if (event.sourceEvent.touches.length > 1) {
                                    previousDeltaTouchYaxis = Math.hypot(
                                        0,
                                        event.sourceEvent.touches[0].pageY -
                                            event.sourceEvent.touches[1].pageY,
                                    );
                                }
                            }
                        });
                        if (tradeData.advancedMode && liquidityData) {
                            const liqAllBidPrices =
                                liquidityData?.liqBidData.map(
                                    (liqPrices: any) => liqPrices.liqPrices,
                                );
                            const liqBidDeviation =
                                standardDeviation(liqAllBidPrices);

                            fillLiqAdvanced(liqBidDeviation, scaleData);
                        }

                        setZoomAndYdragControl(event);
                        setRescale(() => {
                            return false;
                        });

                        setMarketLineValue();
                        render();
                    })
                    .filter((event) => {
                        const isWheel = event.type === 'wheel';

                        const isLabel =
                            yAxisLabels?.find((element: yLabel) => {
                                return (
                                    event.offsetY > element?.y &&
                                    event.offsetY < element?.y + element?.height
                                );
                            }) !== undefined;

                        return !isLabel || isWheel;
                    });

                const xAxisZoom = d3
                    .zoom()
                    .on('start', (event) => {
                        startZoom(event);
                    })
                    .on('zoom', async (event) => {
                        if (event.sourceEvent.type === 'wheel') {
                            zoomWithWhell(event, unparsedCandleData);
                        } else if (
                            event.sourceEvent.type === 'touchmove' &&
                            event.sourceEvent.touches.length > 1
                        ) {
                            const domainX = scaleData?.xScale.domain();
                            const linearX = d3
                                .scaleTime()
                                .domain(scaleData?.xScale.range())
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
                            const domainX = scaleData?.xScale.domain();

                            const linearX = d3
                                .scaleTime()
                                .domain(scaleData?.xScale.range())
                                .range([0, domainX[1] - domainX[0]]);

                            const deltaX = linearX(
                                -event.sourceEvent.movementX,
                            );

                            if (deltaX !== undefined) {
                                getNewCandleData(
                                    domainX[0] + deltaX,
                                    lastCandleDate,
                                );

                                const filterCandle = unparsedCandleData.filter(
                                    (item: CandleData) =>
                                        item.time * 1000 <= domainX[1] &&
                                        item.time * 1000 >= domainX[0],
                                );

                                if (
                                    (deltaX > 0 ||
                                        Math.abs(domainX[1] - domainX[0]) <=
                                            period *
                                                1000 *
                                                maxNumCandlesForZoom) &&
                                    (deltaX < 0 ||
                                        !(
                                            filterCandle.length <= 2 &&
                                            filterCandle[0].time * 1000 !==
                                                lastCandleDate
                                        ))
                                ) {
                                    scaleData?.xScale.domain([
                                        domainX[0] + deltaX,
                                        domainX[1],
                                    ]);
                                }
                            }
                        }
                        changeScale();

                        setBandwidth(candlestick.bandwidth());
                        render();

                        setZoomAndYdragControl(event);
                    })
                    .on('end', () => {
                        const latestCandleTime = d3.max(
                            unparsedCandleData,
                            (d) => d.time * 1000,
                        );

                        if (latestCandleTime) {
                            if (
                                !showLatest &&
                                latestCandleTime &&
                                (scaleData?.xScale.domain()[1] <
                                    latestCandleTime ||
                                    scaleData?.xScale.domain()[0] >
                                        latestCandleTime)
                            ) {
                                setShowLatest(true);
                            } else if (
                                showLatest &&
                                !(
                                    scaleData?.xScale.domain()[1] <
                                    latestCandleTime
                                ) &&
                                !(
                                    scaleData?.xScale.domain()[0] >
                                    latestCandleTime
                                )
                            ) {
                                setShowLatest(false);
                            }
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
        }
    }, [
        unparsedCandleData,
        scaleData,
        rescale,
        location,
        candlestick,
        diffHashSig(scaleData?.xScale.domain()[0]),
        diffHashSig(scaleData?.xScale?.domain()[1]),
        showLatest,
        liquidityData?.liqBidData,
        simpleRangeWidth,
        ranges,
        diffHashSig(limit),
        isLineDrag,
        diffHashSig(yAxisLabels),
        minTickForLimit,
        maxTickForLimit,
        canUserDragRange,
        canUserDragLimit,
    ]);

    useEffect(() => {
        IS_LOCAL_ENV && console.debug('timeframe changed');
        setShowLatest(false);
    }, [period]);

    useEffect(() => {
        if (scaleData !== undefined && liquidityData !== undefined) {
            if (rescale) {
                changeScale();

                if (
                    location.pathname.includes('range') ||
                    location.pathname.includes('reposition')
                ) {
                    const liqAllBidPrices = liquidityData?.liqBidData.map(
                        (liqPrices: any) => liqPrices.liqPrices,
                    );
                    const liqBidDeviation = standardDeviation(liqAllBidPrices);

                    fillLiqAdvanced(liqBidDeviation, scaleData);
                }
            }
        }
    }, [rescale]);

    useEffect(() => {
        setMarketLineValue();
    }, [
        unparsedCandleData[0]?.invPriceCloseExclMEVDecimalCorrected,
        unparsedCandleData[0]?.priceCloseExclMEVDecimalCorrected,
    ]);

    const setMarketLineValue = () => {
        const lastCandlePrice = denomInBase
            ? lastCandleData?.invPriceCloseExclMEVDecimalCorrected
            : lastCandleData?.priceCloseExclMEVDecimalCorrected;

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
        if (scaleData !== undefined) {
            const point = scaleData?.yScale.domain()[0];

            if (point == undefined) return 0;
            if (liqDataAll) {
                const tempLiqData = liqDataAll;

                const sortLiqaData = tempLiqData.sort(function (a, b) {
                    return a.liqPrices - b.liqPrices;
                });

                if (!sortLiqaData || sortLiqaData.length === 0) return;

                const closestMin = sortLiqaData.reduce(function (prev, curr) {
                    return Math.abs(
                        curr.liqPrices - scaleData?.yScale.domain()[0],
                    ) < Math.abs(prev.liqPrices - scaleData?.yScale.domain()[0])
                        ? curr
                        : prev;
                });

                const closestMax = sortLiqaData.reduce(function (prev, curr) {
                    return Math.abs(
                        curr.liqPrices - scaleData?.yScale.domain()[1],
                    ) < Math.abs(prev.liqPrices - scaleData?.yScale.domain()[1])
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
        }
    };

    useEffect(() => {
        const liqDataAll = liquidityData?.depthLiqBidData.concat(
            liquidityData?.depthLiqAskData,
        );
        try {
            if (liqDataAll && liqDataAll.length === 0) return;
            const { min, max }: any = findLiqNearest(liqDataAll);
            const visibleDomain = liqDataAll.filter(
                (liqData: LiquidityDataLocal) =>
                    liqData?.liqPrices >= min && liqData?.liqPrices <= max,
            );
            const maxLiq = d3.max(visibleDomain, (d: any) => d.activeLiq);
            if (maxLiq && parseFloat(maxLiq) !== 1) {
                liquidityDepthScale.domain([0, maxLiq]);
            }
        } catch (error) {
            console.error({ error });
        }
    }, [
        scaleData && scaleData?.yScale.domain()[0],
        scaleData && scaleData?.yScale.domain()[1],
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
        if (
            tradeData.limitTick === undefined ||
            Array.isArray(tradeData.limitTick) ||
            isNaN(tradeData.limitTick)
        )
            return;
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

            return newTargets;
        });
    }, [denomInBase]);

    useEffect(() => {
        if (position !== undefined) {
            setBalancedLines(true);
        }
    }, [position?.positionId]);

    useEffect(() => {
        if (location.pathname.includes('reposition')) {
            setBalancedLines();
        }
    }, [location.pathname]);

    const setBalancedLines = (isRepositionLinesSet = false) => {
        if (tokenA.address !== tokenB.address) {
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
                    lookupChain(position.chainId).gridSize,
                );

                setRanges((prevState) => {
                    const newTargets = [...prevState];

                    newTargets.filter(
                        (target: any) => target.name === 'Max',
                    )[0].value = Number(
                        pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated,
                    );

                    newTargets.filter(
                        (target: any) => target.name === 'Min',
                    )[0].value = Number(
                        pinnedDisplayPrices.pinnedMinPriceDisplayTruncated,
                    );

                    return newTargets;
                });
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

                        if (
                            poolPriceDisplay !== undefined &&
                            rescaleRangeBoundariesWithSlider &&
                            rescale
                        ) {
                            changeScale();
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
                    )[0].value = Number(
                        pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated,
                    );

                    newTargets.filter(
                        (target: any) => target.name === 'Min',
                    )[0].value = Number(
                        pinnedDisplayPrices.pinnedMinPriceDisplayTruncated,
                    );

                    return newTargets;
                });
            }
        }
    };

    const setAdvancedLines = () => {
        if (minPrice !== undefined && maxPrice !== undefined) {
            setRanges(() => {
                const newTargets = [
                    {
                        name: 'Min',
                        value: minPrice,
                    },
                    {
                        name: 'Max',
                        value: maxPrice,
                    },
                ];

                return newTargets;
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
    }, [location, tradeData.limitTick, denomInBase]);

    useEffect(() => {
        if (
            (location.pathname.includes('range') ||
                location.pathname.includes('reposition')) &&
            tradeData.advancedMode
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
        tradeData.advancedMode,
    ]);

    useEffect(() => {
        if (
            tradeData.advancedMode &&
            scaleData &&
            liquidityData &&
            denomInBase === boundaries
        ) {
            const liqAllBidPrices = liquidityData?.liqBidData.map(
                (liqPrices: any) => liqPrices.liqPrices,
            );
            const liqBidDeviation = standardDeviation(liqAllBidPrices);

            fillLiqAdvanced(liqBidDeviation, scaleData);
        } else {
            setBoundaries(denomInBase);
        }
    }, [tradeData.advancedMode, ranges, liquidityData?.liqBidData, scaleData]);

    function reverseTokenForChart(limitPreviousData: any, newLimitValue: any) {
        if (poolPriceDisplay) {
            if (sellOrderStyle === 'order_sell') {
                if (
                    limitPreviousData > poolPriceDisplay &&
                    newLimitValue < poolPriceDisplay
                ) {
                    handlePulseAnimation('limitOrder');
                    dispatch(setShouldLimitDirectionReverse(true));
                }
            } else {
                if (
                    limitPreviousData < poolPriceDisplay &&
                    newLimitValue > poolPriceDisplay
                ) {
                    handlePulseAnimation('limitOrder');
                    dispatch(setShouldLimitDirectionReverse(true));
                }
            }
        }
    }

    const getNoZoneData = () => {
        const noGoZoneMin = noGoZoneBoudnaries[0][0];
        const noGoZoneMax = noGoZoneBoudnaries[0][1];
        return { noGoZoneMin: noGoZoneMin, noGoZoneMax: noGoZoneMax };
    };

    const setLimitTickNearNoGoZone = (low: number, high: number) => {
        const limitNonDisplay = denomInBase
            ? pool?.fromDisplayPrice(parseFloat(low.toString()))
            : pool?.fromDisplayPrice(1 / parseFloat(low.toString()));

        limitNonDisplay?.then((limit) => {
            limit = limit !== 0 ? limit : 1;
            const pinnedTick: number = pinTickLower(limit, chainData.gridSize);

            const tickPrice = tickToPrice(
                pinnedTick + (denomInBase ? 1 : -1) * chainData.gridSize * 2,
            );

            const tickDispPrice = pool?.toDisplayPrice(tickPrice);

            if (tickDispPrice) {
                tickDispPrice.then((tp) => {
                    const displayPriceWithDenom = denomInBase ? tp : 1 / tp;

                    setMinTickForLimit(displayPriceWithDenom);
                });
            }
        });

        const limitNonDisplayMax = denomInBase
            ? pool?.fromDisplayPrice(parseFloat(high.toString()))
            : pool?.fromDisplayPrice(1 / parseFloat(high.toString()));

        limitNonDisplayMax?.then((limit) => {
            limit = limit !== 0 ? limit : 1;
            const pinnedTick: number = pinTickUpper(limit, chainData.gridSize);

            const tickPrice = tickToPrice(
                pinnedTick + (denomInBase ? -1 : 1) * chainData.gridSize * 2,
            );

            const tickDispPrice = pool?.toDisplayPrice(tickPrice);

            if (tickDispPrice) {
                tickDispPrice.then((tp) => {
                    const displayPriceWithDenom = denomInBase ? tp : 1 / tp;
                    setMaxTickForLimit(displayPriceWithDenom);
                });
            }
        });
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
        if (scaleData) {
            let newLimitValue: any;
            let newRangeValue: any;

            let lowLineMoved: any;
            let highLineMoved: any;

            let rangeWidthPercentage: any;

            let dragSwitched = false;
            let draggingLine: any = undefined;

            let cancelDrag = false;
            const cancelDragEvent = (event: any) => {
                if (event.key === 'Escape') {
                    cancelDrag = true;
                    event.preventDefault();
                    event.stopPropagation();
                    document.removeEventListener('keydown', cancelDragEvent);
                }
            };

            const canvasLimit = d3
                .select(d3CanvasLimitLine.current)
                .select('canvas')
                .node() as any;

            const rectLimit = canvasLimit.getBoundingClientRect();

            const canvasRange = d3
                .select(d3CanvasRangeLine.current)
                .select('canvas')
                .node() as any;

            const rectRange = canvasRange.getBoundingClientRect();

            let oldRangeMinValue: number | undefined = undefined;
            let oldRangeMaxValue: number | undefined = undefined;
            const dragRange = d3
                .drag()
                .on('start', (event) => {
                    setCrosshairActive('none');
                    document.addEventListener('keydown', cancelDragEvent);
                    d3.select(d3CanvasMain.current).style('cursor', 'none');

                    d3.select(d3Yaxis.current).style('cursor', 'none');

                    const advancedValue = scaleData?.yScale.invert(
                        event.sourceEvent.clientY - rectRange.top,
                    );

                    const low = ranges.filter(
                        (target: any) => target.name === 'Min',
                    )[0].value;
                    const high = ranges.filter(
                        (target: any) => target.name === 'Max',
                    )[0].value;

                    oldRangeMinValue = low;
                    oldRangeMaxValue = high;

                    if (draggingLine === undefined) {
                        draggingLine =
                            event.subject.name !== undefined
                                ? event.subject.name
                                : Math.abs(advancedValue - low) <
                                  Math.abs(advancedValue - high)
                                ? 'Min'
                                : 'Max';
                    }
                })
                .on('drag', function (event) {
                    if (!cancelDrag) {
                        setIsLineDrag(true);
                        setCrosshairActive('none');
                        let dragedValue =
                            scaleData?.yScale.invert(
                                event.sourceEvent.clientY - rectRange.top,
                            ) >= liquidityData?.topBoundary
                                ? liquidityData?.topBoundary
                                : scaleData?.yScale.invert(
                                      event.sourceEvent.clientY - rectRange.top,
                                  );

                        dragedValue = dragedValue < 0 ? 0 : dragedValue;

                        const displayValue =
                            poolPriceDisplay !== undefined
                                ? poolPriceDisplay
                                : 0;

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
                            !tradeData.advancedMode ||
                            location.pathname.includes('reposition')
                        ) {
                            if (
                                dragedValue === 0 ||
                                dragedValue === liquidityData?.topBoundary
                            ) {
                                const minValue =
                                    dragedValue === 0
                                        ? 0
                                        : dragedValue <
                                          liquidityData?.lowBoundary
                                        ? dragedValue
                                        : 0;

                                setRanges((prevState) => {
                                    const newTargets = [...prevState];

                                    newTargets.filter(
                                        (target: any) => target.name === 'Min',
                                    )[0].value = minValue;

                                    newTargets.filter(
                                        (target: any) => target.name === 'Max',
                                    )[0].value = liquidityData?.topBoundary;

                                    newRangeValue = newTargets;

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

                                    const lowTick =
                                        currentPoolPriceTick - offset;
                                    const highTick =
                                        currentPoolPriceTick + offset;

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

                                    const lowTick =
                                        currentPoolPriceTick - offset;
                                    const highTick =
                                        currentPoolPriceTick + offset;

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

                                if (pinnedDisplayPrices !== undefined) {
                                    setRanges((prevState) => {
                                        const newTargets = [...prevState];

                                        newTargets.filter(
                                            (target: any) =>
                                                target.name === 'Min',
                                        )[0].value = Number(
                                            pinnedDisplayPrices.pinnedMinPriceDisplayTruncated,
                                        );
                                        newTargets.filter(
                                            (target: any) =>
                                                target.name === 'Max',
                                        )[0].value = Number(
                                            pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated,
                                        );

                                        newRangeValue = newTargets;

                                        return newTargets;
                                    });
                                }
                            }
                        } else {
                            const advancedValue = scaleData?.yScale.invert(
                                event.sourceEvent.clientY - rectRange.top,
                            );
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

                                pinnedMaxPriceDisplayTruncated = Number(
                                    pinnedDisplayPrices.pinnedMaxPriceDisplay,
                                );
                                pinnedMinPriceDisplayTruncated = Number(
                                    pinnedDisplayPrices.pinnedMinPriceDisplay,
                                );
                            }
                            // to:do fix when advanced is fixed AdvancedPepe
                            setRanges((prevState) => {
                                const newTargets = [...prevState];

                                if (draggingLine === 'Max') {
                                    if (
                                        dragSwitched ||
                                        pinnedMaxPriceDisplayTruncated <
                                            pinnedMinPriceDisplayTruncated
                                    ) {
                                        newTargets.filter(
                                            (target: any) =>
                                                target.name === 'Min',
                                        )[0].value =
                                            pinnedMaxPriceDisplayTruncated;

                                        dragSwitched = true;
                                        highLineMoved = false;
                                        lowLineMoved = true;
                                    } else {
                                        newTargets.filter(
                                            (target: any) =>
                                                target.name === 'Max',
                                        )[0].value =
                                            pinnedMaxPriceDisplayTruncated;
                                    }
                                } else {
                                    if (
                                        dragSwitched ||
                                        pinnedMinPriceDisplayTruncated >
                                            pinnedMaxPriceDisplayTruncated
                                    ) {
                                        newTargets.filter(
                                            (target: any) =>
                                                target.name === 'Max',
                                        )[0].value =
                                            pinnedMinPriceDisplayTruncated;

                                        dragSwitched = true;
                                        highLineMoved = true;
                                        lowLineMoved = false;
                                    } else {
                                        newTargets.filter(
                                            (target: any) =>
                                                target.name === 'Min',
                                        )[0].value =
                                            pinnedMinPriceDisplayTruncated;
                                    }
                                }

                                newRangeValue = newTargets;

                                return newTargets;
                            });
                        }
                    } else {
                        if (
                            oldRangeMinValue !== undefined &&
                            oldRangeMaxValue !== undefined
                        ) {
                            setRanges([
                                {
                                    name: 'Min',
                                    value: oldRangeMinValue,
                                },
                                {
                                    name: 'Max',
                                    value: oldRangeMaxValue,
                                },
                            ]);
                        }
                    }
                })
                .on('end', () => {
                    setIsLineDrag(false);

                    if (!cancelDrag) {
                        if (
                            (!tradeData.advancedMode ||
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

                        onBlurRange(
                            newRangeValue,
                            highLineMoved,
                            lowLineMoved,
                            dragSwitched,
                        );
                        dragSwitched = false;
                    } else {
                        if (
                            oldRangeMinValue !== undefined &&
                            oldRangeMaxValue !== undefined
                        ) {
                            setRanges([
                                {
                                    name: 'Min',
                                    value: oldRangeMinValue,
                                },
                                {
                                    name: 'Max',
                                    value: oldRangeMaxValue,
                                },
                            ]);
                        }
                    }
                    d3.select(d3CanvasMain.current).style('cursor', 'default');

                    d3.select(d3Yaxis.current).style('cursor', 'default');

                    setCrosshairActive('none');
                });

            let oldLimitValue: number | undefined = undefined;
            const dragLimit = d3
                .drag()
                .on('start', () => {
                    d3.select(d3CanvasMain.current).style('cursor', 'none');

                    document.addEventListener('keydown', cancelDragEvent);

                    d3.select(d3Yaxis.current).style('cursor', 'none');

                    oldLimitValue = limit[0].value;
                })
                .on('drag', function (event) {
                    if (!cancelDrag) {
                        setCrosshairActive('none');
                        setIsLineDrag(true);

                        newLimitValue = scaleData?.yScale.invert(
                            event.sourceEvent.clientY - rectLimit.top,
                        );

                        if (newLimitValue < 0) newLimitValue = 0;

                        newLimitValue = setLimitForNoGoZone(newLimitValue);
                        const { noGoZoneMin, noGoZoneMax } = getNoZoneData();

                        const limitNonDisplay = denomInBase
                            ? pool?.fromDisplayPrice(parseFloat(newLimitValue))
                            : pool?.fromDisplayPrice(
                                  1 / parseFloat(newLimitValue),
                              );
                        const isNoGoneZoneMax = newLimitValue === noGoZoneMax;
                        const isNoGoneZoneMin = newLimitValue === noGoZoneMin;

                        limitNonDisplay?.then((limit) => {
                            limit = limit !== 0 ? limit : 1;
                            let pinnedTick: number = isTokenABase
                                ? pinTickLower(limit, chainData.gridSize)
                                : pinTickUpper(limit, chainData.gridSize);

                            if (isNoGoneZoneMin) {
                                pinnedTick = isDenomBase
                                    ? pinTickUpper(limit, chainData.gridSize)
                                    : pinTickLower(limit, chainData.gridSize);
                            }
                            if (isNoGoneZoneMax) {
                                pinnedTick = isDenomBase
                                    ? pinTickLower(limit, chainData.gridSize)
                                    : pinTickUpper(limit, chainData.gridSize);
                            }

                            const tickPrice = tickToPrice(pinnedTick);

                            const tickDispPrice =
                                pool?.toDisplayPrice(tickPrice);

                            if (tickDispPrice) {
                                tickDispPrice.then((tp) => {
                                    const displayPriceWithDenom = denomInBase
                                        ? tp
                                        : 1 / tp;

                                    if (
                                        displayPriceWithDenom
                                            .toString()
                                            .includes('e')
                                    ) {
                                        newLimitValue = displayPriceWithDenom;
                                    }
                                    if (
                                        !(
                                            newLimitValue >= noGoZoneMin &&
                                            newLimitValue <= noGoZoneMax
                                        )
                                    ) {
                                        setLimit(() => {
                                            return [
                                                {
                                                    name: 'Limit',
                                                    value: newLimitValue,
                                                },
                                            ];
                                        });
                                    }
                                });
                            }
                        });
                    } else {
                        if (oldLimitValue !== undefined) {
                            setLimit(() => {
                                return [
                                    {
                                        name: 'Limit',
                                        value: oldLimitValue as number,
                                    },
                                ];
                            });
                        }
                    }
                })
                .on('end', () => {
                    setIsLineDrag(false);

                    draggingLine = undefined;

                    if (!cancelDrag) {
                        d3.select(d3Container.current).style(
                            'cursor',
                            'row-resize',
                        );

                        if (rescale) {
                            changeScale();
                        }
                        if (oldLimitValue !== undefined) {
                            onBlurLimitRate(oldLimitValue, newLimitValue);
                        }
                    } else {
                        if (oldLimitValue !== undefined) {
                            setLimit(() => {
                                return [
                                    {
                                        name: 'Limit',
                                        value: oldLimitValue as number,
                                    },
                                ];
                            });
                        }
                    }

                    d3.select(d3CanvasMain.current).style('cursor', 'default');

                    d3.select(d3Yaxis.current).style('cursor', 'default');

                    setCrosshairActive('none');
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
        tradeData.advancedMode,
        ranges,
        limit,
        minPrice,
        maxPrice,
        minTickForLimit,
        maxTickForLimit,
        simpleRangeWidth,
    ]);

    useEffect(() => {
        setBandwidth(defaultCandleBandwith);

        if (reset) {
            getNewCandleData(undefined, undefined, false);
        }
    }, [reset]);

    useEffect(() => {
        if (scaleData) {
            const _yAxis = d3fc.axisRight().scale(scaleData?.yScale);

            setYaxis(() => {
                return _yAxis;
            });

            const _xAxis = d3fc
                .axisBottom()
                .scale(scaleData?.xScale)
                .tickFormat((d: any) => {
                    return d3.timeFormat('%d/%m/%y')(d);
                });

            setXaxis(() => {
                return _xAxis;
            });
        }
    }, [scaleData, location]);

    // Axis's
    useEffect(() => {
        if (scaleData) {
            const d3YaxisCanvas = d3
                .select(d3Yaxis.current)
                .select('canvas')
                .node() as HTMLCanvasElement;

            const d3YaxisContext = d3YaxisCanvas.getContext(
                '2d',
            ) as CanvasRenderingContext2D;

            d3.select(d3Yaxis.current).on('draw', function () {
                if (yAxis) {
                    setCanvasResolution(d3YaxisCanvas);
                    drawYaxis(
                        d3YaxisContext,
                        scaleData?.yScale,
                        d3YaxisCanvas.width / (2 * window.devicePixelRatio),
                    );
                }
            });

            const canvas = d3
                .select(d3Xaxis.current)
                .select('canvas')
                .node() as HTMLCanvasElement;
            const context = canvas.getContext('2d') as CanvasRenderingContext2D;

            d3.select(d3Xaxis.current).on('draw', function () {
                if (xAxis) {
                    setCanvasResolution(canvas);
                    drawXaxis(context, scaleData?.xScale, 3);
                }
            });

            renderCanvasArray([d3CanvasCrosshair, d3Xaxis, d3Yaxis]);
            renderSubchartCrCanvas();
        }
    }, [
        diffHashSig(scaleData),
        market,
        diffHashSig(crosshairData),
        limit,
        isLineDrag,
        ranges,
        simpleRangeWidth !== 100 || tradeData.advancedMode,
        yAxisCanvasWidth,
        bandwidth,
        reset,
        sellOrderStyle,
        checkLimitOrder,
        location,
        crosshairActive,
    ]);

    function createRectLabel(
        context: any,
        y: number,
        x: number,
        color: string,
        textColor: string,
        text: string,
        stroke: string | undefined = undefined,
        yAxisWidth: any = 70,
        subString: number | undefined = undefined,
    ) {
        context.beginPath();
        context.fillStyle = color;
        context.fillRect(0, y - 10, yAxisWidth + yAxisWidth / 2, 20);
        context.fillStyle = textColor;
        context.fontSize = '13';
        context.textAlign = 'center';
        context.textBaseline = 'middle';

        if (subString) {
            const textHeight =
                context.measureText('0.0').actualBoundingBoxAscent +
                context.measureText('0.0').actualBoundingBoxDescent;

            context.fillText(
                '0.0',
                x -
                    context.measureText('0.0').width / 2 -
                    context.measureText(subString).width / 2,
                y,
            );
            context.fillText(subString, x, y + textHeight / 3);
            context.fillText(
                text,
                x +
                    context.measureText('0.0').width / 2 +
                    context.measureText(subString).width / 2,
                y,
            );
        } else {
            context.fillText(text, x, y + 2);
        }

        if (stroke !== undefined) {
            context.strokeStyle = stroke;
            context.strokeRect(1, y - 10, yAxisWidth + yAxisWidth / 2, 20);
        }
    }

    function addYaxisLabel(y: number) {
        const rect = {
            x: 0,
            y: y - 10,
            width: 70,
            height: 20,
        };
        yAxisLabels?.push(rect);
    }

    useEffect(() => {
        if (yAxis && xAxis) {
            d3.select(d3CanvasMain.current).call(zoomUtils?.zoom);
            d3.select(d3Xaxis.current).call(zoomUtils?.xAxisZoom);

            d3.select(d3Yaxis.current)
                .call(zoomUtils?.yAxisZoom)
                .on('dblclick.zoom', null);
            if (location.pathname.includes('market')) {
                d3.select(d3Yaxis.current).on('.drag', null);
                d3.select(d3CanvasMain.current).on('.drag', null);

                d3.select(d3CanvasLimitLine.current)
                    .select('canvas')
                    .style('display', 'none');
            }
            if (
                location.pathname.includes('range') ||
                location.pathname.includes('reposition')
            ) {
                d3.select(d3Yaxis.current).call(dragRange);
                d3.select(d3CanvasMain.current).call(dragRange);

                d3.select(d3CanvasLimitLine.current)
                    .select('canvas')
                    .style('display', 'none');
            }
            if (location.pathname.includes('/limit')) {
                d3.select(d3Yaxis.current).call(dragLimit);
                d3.select(d3CanvasMain.current).call(dragLimit);
                d3.select(d3CanvasLimitLine.current)
                    .select('canvas')
                    .style('display', 'inline');
            }
            renderCanvasArray([d3Yaxis, d3CanvasMain]);
        }
    }, [location, zoomUtils, dragLimit, dragRange]);

    const drawYaxis = (context: any, yScale: any, X: any) => {
        if (unparsedCandleData !== undefined) {
            yAxisLabels.length = 0;
            const low = ranges.filter((target: any) => target.name === 'Min')[0]
                .value;
            const high = ranges.filter(
                (target: any) => target.name === 'Max',
            )[0].value;

            const canvas = d3
                .select(d3Yaxis.current)
                .select('canvas')
                .node() as HTMLCanvasElement;

            if (canvas !== null) {
                const height = canvas.height;

                const factor = height < 500 ? 5 : height.toString().length * 2;

                context.stroke();
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillStyle = 'rgba(189,189,189,0.8)';
                context.font = '12.425px Lexend Deca';

                const yScaleTicks = yScale.ticks(factor);

                let switchFormatter = false;

                yScaleTicks.forEach((element: any) => {
                    if (element > 99999) {
                        switchFormatter = true;
                    }
                });

                const formatTicks = switchFormatter
                    ? formatPoolPriceAxis
                    : formatAmountChartData;

                yScaleTicks.forEach((d: number) => {
                    const digit = d.toString().split('.')[1]?.length;

                    const isScientific = d.toString().includes('e');

                    if (isScientific) {
                        const splitNumber = d.toString().split('e');
                        const subString =
                            Math.abs(Number(splitNumber[1])) -
                            (splitNumber.includes('.') ? 2 : 1);

                        const precision = splitNumber[0]
                            .toString()
                            .replace('.', '');

                        const factor = Math.pow(10, 3 - precision.length);

                        const textHeight =
                            context.measureText('0.0').actualBoundingBoxAscent +
                            context.measureText('0.0').actualBoundingBoxDescent;

                        context.beginPath();
                        context.fillText(
                            '0.0',
                            X -
                                context.measureText('0.0').width / 2 -
                                context.measureText(subString).width / 2,
                            yScale(d),
                        );
                        context.fillText(
                            subString,
                            X,
                            yScale(d) + textHeight / 3,
                        );
                        context.fillText(
                            factor * Number(precision),
                            X +
                                context.measureText(factor * Number(precision))
                                    .width /
                                    2 +
                                context.measureText(subString).width / 2,
                            yScale(d),
                        );
                    } else {
                        context.beginPath();
                        context.fillText(
                            formatTicks(d, digit ? digit : 2),
                            X,
                            yScale(d),
                        );
                    }
                });

                const isScientificMarketTick = market[0].value
                    .toString()
                    .includes('e');

                let marketTick: number | string = formatTicks(
                    market[0].value,
                    undefined,
                );

                let marketSubString = undefined;

                if (isScientificMarketTick) {
                    const splitNumber = market[0].value.toString().split('e');
                    marketSubString =
                        Math.abs(Number(splitNumber[1])) -
                        (splitNumber.includes('.') ? 2 : 1);

                    const precision = splitNumber[0]
                        .toString()
                        .replace('.', '');

                    if (precision.length > 3) {
                        marketTick = precision.slice(0, 3);
                    } else {
                        const factor = Math.pow(10, 3 - precision.length);

                        marketTick = (factor * Number(precision)).toString();
                    }
                }

                createRectLabel(
                    context,
                    yScale(market[0].value),
                    X,
                    'white',
                    'black',
                    marketTick,
                    undefined,
                    yAxisCanvasWidth,
                    marketSubString,
                );

                if (
                    location.pathname.includes('range') ||
                    location.pathname.includes('reposition')
                ) {
                    const {
                        isSameLocationMin: isSameLocationMin,
                        sameLocationDataMin: sameLocationDataMin,
                        isSameLocationMax: isSameLocationMax,
                        sameLocationDataMax: sameLocationDataMax,
                    } = sameLocationRange();

                    const passValue =
                        liqMode === 'curve'
                            ? liquidityData?.liqTransitionPointforCurve
                            : liquidityData?.liqTransitionPointforDepth;

                    if (simpleRangeWidth !== 100 || tradeData.advancedMode) {
                        const isScientificlowTick = low
                            .toString()
                            .includes('e');

                        let lowTick: number | string = formatTicks(
                            low,
                            undefined,
                        );

                        let lowSubString = undefined;

                        if (isScientificlowTick) {
                            const splitNumber = low.toString().split('e');
                            lowSubString =
                                Math.abs(Number(splitNumber[1])) -
                                (splitNumber.includes('.') ? 2 : 1);

                            const precision = splitNumber[0]
                                .toString()
                                .replace('.', '');

                            if (precision.length > 3) {
                                lowTick = precision.slice(0, 3);
                            } else {
                                const factor = Math.pow(
                                    10,
                                    3 - precision.length,
                                );

                                lowTick = (
                                    factor * Number(precision)
                                ).toString();
                            }
                        }

                        createRectLabel(
                            context,
                            isSameLocationMin
                                ? sameLocationDataMin
                                : yScale(low),
                            X,
                            low > passValue ? lineSellColor : lineBuyColor,
                            low > passValue ? 'white' : 'black',
                            lowTick,
                            undefined,
                            yAxisCanvasWidth,
                            lowSubString,
                        );
                        addYaxisLabel(
                            isSameLocationMin
                                ? sameLocationDataMin
                                : yScale(low),
                        );

                        const isScientificHighTick = high
                            .toString()
                            .includes('e');

                        let highTick: number | string = formatTicks(
                            high,
                            undefined,
                        );

                        let highSubString = undefined;

                        if (isScientificHighTick) {
                            const splitNumber = high.toString().split('e');

                            highSubString =
                                Math.abs(Number(splitNumber[1])) -
                                (splitNumber.includes('.') ? 2 : 1);

                            const precision = splitNumber[0]
                                .toString()
                                .replace('.', '');

                            if (precision.length > 3) {
                                highTick = precision.slice(0, 3);
                            } else {
                                const factor = Math.pow(
                                    10,
                                    3 - precision.length,
                                );

                                highTick = (
                                    factor * Number(precision)
                                ).toString();
                            }
                        }

                        createRectLabel(
                            context,
                            isSameLocationMax
                                ? sameLocationDataMax
                                : yScale(high),
                            X,
                            high > passValue ? lineSellColor : lineBuyColor,
                            high > passValue ? 'white' : 'black',
                            highTick,
                            undefined,
                            yAxisCanvasWidth,
                            highSubString,
                        );
                        addYaxisLabel(
                            isSameLocationMax
                                ? sameLocationDataMax
                                : yScale(high),
                        );
                    }
                }

                if (location.pathname.includes('/limit')) {
                    const { isSameLocation, sameLocationData } =
                        sameLocationLimit();

                    const isScientificLimitTick = limit[0].value
                        .toString()
                        .includes('e');

                    let limitTick: number | string = formatTicks(
                        limit[0].value,
                        undefined,
                    );

                    let limitSubString = undefined;

                    if (isScientificLimitTick) {
                        const splitNumber = limit[0].value
                            .toString()
                            .split('e');

                        limitSubString =
                            Math.abs(Number(splitNumber[1])) -
                            (splitNumber.includes('.') ? 2 : 1);

                        const precision = splitNumber[0]
                            .toString()
                            .replace('.', '');

                        if (precision.length > 3) {
                            limitTick = precision.slice(0, 3);
                        } else {
                            const factor = Math.pow(10, 3 - precision.length);

                            limitTick = (factor * Number(precision)).toString();
                        }
                    }

                    if (checkLimitOrder) {
                        createRectLabel(
                            context,
                            isSameLocation
                                ? sameLocationData
                                : yScale(limit[0].value),
                            X,
                            sellOrderStyle === 'order_sell'
                                ? lineSellColor
                                : lineBuyColor,
                            sellOrderStyle === 'order_sell' ? 'white' : 'black',
                            limitTick,
                            undefined,
                            yAxisCanvasWidth,
                            limitSubString,
                        );
                    } else {
                        createRectLabel(
                            context,
                            isSameLocation
                                ? sameLocationData
                                : yScale(limit[0].value),
                            X,
                            '#7772FE',
                            'white',
                            limitTick,
                            undefined,
                            yAxisCanvasWidth,
                            limitSubString,
                        );
                    }
                    addYaxisLabel(
                        isSameLocation
                            ? sameLocationData
                            : yScale(limit[0].value),
                    );
                }

                if (crosshairActive === 'chart') {
                    const isScientificCrTick = crosshairData[0].y
                        .toString()
                        .includes('e');

                    let crTick: number | string = formatTicks(
                        Number(crosshairData[0].y),
                        undefined,
                    );

                    let crSubString = undefined;

                    if (isScientificCrTick) {
                        const splitNumber = crosshairData[0].y
                            .toString()
                            .split('e');

                        crSubString =
                            Math.abs(Number(splitNumber[1])) -
                            (splitNumber.includes('.') ? 2 : 1);

                        const precision = splitNumber[0]
                            .toString()
                            .replace('.', '');

                        if (precision.length > 3) {
                            crTick = precision.slice(0, 3);
                        } else {
                            const factor = Math.pow(10, 3 - precision.length);

                            crTick = (factor * Number(precision)).toString();
                        }
                    }

                    createRectLabel(
                        context,
                        yScale(crosshairData[0].y),
                        X,
                        '#242F3F',
                        'white',
                        crTick,
                        undefined,
                        yAxisCanvasWidth,
                        crSubString,
                    );
                }

                changeyAxisWidth();
            }
        }
    };

    const drawXaxis = (context: any, xScale: any, Y: any) => {
        const _width = 65; // magic number of pixels to blur surrounding price
        const tickSize = 6;

        scaleData.xScaleTime.domain(xScale.domain());

        const data = correctStyleForData(
            scaleData?.xScale.domain()[0],
            scaleData?.xScale.domain()[1],
            scaleData?.xScaleTime.ticks(),
        );

        const filteredData = data.reduce((acc: any, d: any) => {
            const sameTime = acc.find((d1: any) => {
                return d1.date.getTime() === d.date.getTime();
            });
            if (!sameTime) {
                acc.push(d);
            }
            return acc;
        }, []);

        filteredData.forEach((d: any) => {
            if (d.date instanceof Date) {
                let formatValue = undefined;
                context.textAlign = 'center';
                context.textBaseline = 'top';
                context.fillStyle = 'rgba(189,189,189,0.8)';
                context.font = '50 11.425px Lexend Deca';
                context.filter = ' blur(0px)';

                if (
                    moment(d.date).format('HH:mm') === '00:00' ||
                    period === 86400
                ) {
                    formatValue = moment(d.date).format('DD');
                } else {
                    formatValue = moment(d.date).format('HH:mm');
                }

                if (
                    moment(d.date)
                        .format('DD')
                        .match(/^(01)$/) &&
                    moment(d.date).format('HH:mm') === '00:00'
                ) {
                    formatValue =
                        moment(d.date).format('MMM') === 'Jan'
                            ? moment(d.date).format('YYYY')
                            : moment(d.date).format('MMM');
                }

                if (
                    crosshairActive !== 'none' &&
                    xScale(d.date) > xScale(crosshairData[0].x) - _width &&
                    xScale(d.date) < xScale(crosshairData[0].x) + _width &&
                    d.date !== crosshairData[0].x
                ) {
                    context.filter = ' blur(7px)';
                }
                if (d.style) {
                    context.font = '900 12px Lexend Deca';
                }

                context.beginPath();
                if (formatValue) {
                    const indexValue = filteredData.findIndex(
                        (d1: any) => d1.date === d.date,
                    );
                    if (!d.style) {
                        const maxIndex =
                            indexValue === filteredData.length - 1
                                ? indexValue
                                : indexValue + 1;
                        const minIndex =
                            indexValue === 0 ? indexValue : indexValue - 1;
                        const lastData = filteredData[maxIndex];
                        const beforeData = filteredData[minIndex];

                        if (
                            beforeData.style ||
                            (lastData.style && xScale(d.date.getTime()))
                        ) {
                            if (
                                Math.abs(
                                    xScale(beforeData.date.getTime()) -
                                        xScale(d.date.getTime()),
                                ) > _width &&
                                Math.abs(
                                    xScale(lastData.date.getTime()) -
                                        xScale(d.date.getTime()),
                                ) > _width
                            ) {
                                context.fillText(
                                    formatValue,
                                    xScale(d.date.getTime()),
                                    Y + tickSize,
                                );
                            }
                        } else {
                            context.fillText(
                                formatValue,
                                xScale(d.date.getTime()),
                                Y + tickSize,
                            );
                        }
                    } else {
                        context.fillText(
                            formatValue,
                            xScale(d.date.getTime()),
                            Y + tickSize,
                        );
                    }
                }

                context.restore();
            }
        });

        let dateCrosshair;
        context.filter = ' blur(0px)';

        context.font = '800 13px Lexend Deca';
        if (period === 86400) {
            dateCrosshair = moment(crosshairData[0].x)
                .subtract(utcDiffHours, 'hours')
                .format('MMM DD YYYY');
        } else {
            dateCrosshair = moment(crosshairData[0].x).format('MMM DD HH:mm');
        }

        context.beginPath();

        if (dateCrosshair && crosshairActive !== 'none') {
            context.fillText(
                dateCrosshair,
                xScale(crosshairData[0].x),
                Y + tickSize,
            );
        }

        context.restore();

        renderCanvasArray([d3Xaxis]);
    };

    // Horizontal Lines
    useEffect(() => {
        if (scaleData !== undefined) {
            const limitLine = d3fc
                .annotationCanvasLine()
                .value((d: any) => d.value)
                .xScale(scaleData?.xScale)
                .yScale(scaleData?.yScale);

            limitLine.decorate((context: any) => {
                context.strokeStyle = 'rgba(235, 235, 255)';
                context.pointerEvents = 'none';
                context.lineWidth = 1.5;
                context.fillStyle = 'transparent';
            });

            const marketLine = d3fc
                .annotationCanvasLine()
                .value((d: any) => d.value)
                .xScale(scaleData?.xScale)
                .yScale(scaleData?.yScale);

            marketLine.decorate((context: any) => {
                context.visibility = 'hidden';
                context.strokeStyle = 'rgba(235, 235, 255, 0.4)';
                context.pointerEvents = 'none';
                context.lineWidth = 0.5;
                context.fillStyle = 'transparent';
            });

            const horizontalLine = d3fc
                .annotationCanvasLine()
                .value((d: any) => d.value)
                .xScale(scaleData?.xScale)
                .yScale(scaleData?.yScale);

            horizontalLine.decorate((context: any) => {
                context.visibility =
                    location.pathname.includes('range') ||
                    location.pathname.includes('reposition')
                        ? 'visible'
                        : 'hidden';
                context.strokeStyle = 'var(--accent2)';
                context.fillStyle = 'transparent';
                context.pointerEvents = 'none';
                context.lineWidth = 1.5;
            });

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
                .annotationCanvasBand()
                .xScale(scaleData?.xScale)
                .yScale(scaleData?.yScale)
                .fromValue((d: any) => d[0])
                .toValue((d: any) => d[1])
                .decorate((context: any) => {
                    context.fillStyle = '#7371FC1A';
                });

            const triangleLimit = createTriangle(
                scaleData?.xScale,
                scaleData?.yScale,
            );
            const triangleRange = createTriangle(
                scaleData?.xScale,
                scaleData?.yScale,
            );

            setTriangleLimit(() => {
                return triangleLimit;
            });

            setTriangleRange(() => {
                return triangleRange;
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

            const lineAskSeries = d3fc
                .seriesCanvasLine()
                .orient('horizontal')
                .curve(d3.curveBasis)
                .mainValue((d: any) => d.activeLiq)
                .crossValue((d: any) => d.liqPrices)
                .xScale(liquidityScale)
                .yScale(scaleData?.yScale)
                .decorate((selection: any) => {
                    selection.strokeStyle = lineBuyColor;
                    selection.strokeWidth = 4;
                });

            setLineAskSeries(() => {
                return lineAskSeries;
            });

            const lineAskSeriesDepth = d3fc
                .seriesCanvasLine()
                .orient('horizontal')
                .curve(d3.curveStepBefore)
                .mainValue((d: any) => d.activeLiq)
                .crossValue((d: any) => d.liqPrices)
                .xScale(liquidityDepthScale)
                .yScale(scaleData?.yScale)
                .decorate((selection: any) => {
                    selection.strokeStyle = lineBuyColor;
                    selection.strokeWidth = 4;
                });

            setLineAskDepthSeries(() => {
                return lineAskSeriesDepth;
            });

            const lineBidSeries = d3fc
                .seriesCanvasLine()
                .orient('horizontal')
                .curve(d3.curveBasis)
                .mainValue((d: any) => d.activeLiq)
                .crossValue((d: any) => d.liqPrices)
                .xScale(liquidityScale)
                .yScale(scaleData?.yScale)
                .decorate((selection: any) => {
                    selection.strokeStyle = lineSellColor;
                });

            setLineBidSeries(() => {
                return lineBidSeries;
            });

            const lineBidDepthSeries = d3fc
                .seriesCanvasLine()
                .orient('horizontal')
                .curve(d3.curveStepAfter)
                .mainValue((d: any) => d.activeLiq)
                .crossValue((d: any) => d.liqPrices)
                .xScale(liquidityDepthScale)
                .yScale(scaleData?.yScale)
                .decorate((selection: any) => {
                    selection.strokeStyle = lineSellColor;
                });

            setLineBidDepthSeries(() => {
                return lineBidDepthSeries;
            });
        }
    }, [
        diffHashSig(scaleData),
        liquidityDepthScale,
        liquidityScale,
        lineSellColor,
        lineBuyColor,
        isUserConnected,
    ]);

    useEffect(() => {
        const passValue =
            liqMode === 'curve'
                ? liquidityData?.liqTransitionPointforCurve
                : liquidityData?.liqTransitionPointforDepth;

        if (triangleLimit !== undefined) {
            let color = 'rgba(235, 235, 255)';

            triangleLimit.decorate((context: any) => {
                if (location.pathname.includes('/limit')) {
                    if (checkLimitOrder) {
                        color =
                            sellOrderStyle === 'order_sell'
                                ? lineSellColor
                                : lineBuyColor;
                    }
                }
                const rotateDegree = 90;
                context.rotate((rotateDegree * Math.PI) / 180);
                context.strokeStyle = color;
                context.fillStyle = color;
            });
        }

        if (triangleRange !== undefined) {
            let color = 'rgba(235, 235, 255)';

            triangleRange.decorate((context: any, datum: any) => {
                if (
                    location.pathname.includes('/range') ||
                    location.pathname.includes('reposition')
                ) {
                    color =
                        datum.value > passValue ? lineSellColor : lineBuyColor;
                }

                const rotateDegree = 90;
                context.rotate((rotateDegree * Math.PI) / 180);
                context.strokeStyle = color;
                context.fillStyle = color;
            });
        }

        if (limitLine !== undefined && location.pathname.includes('/limit')) {
            limitLine.decorate((context: any) => {
                context.strokeStyle = checkLimitOrder
                    ? sellOrderStyle === 'order_sell'
                        ? lineSellColor
                        : lineBuyColor
                    : 'rgba(235, 235, 255)';
                context.pointerEvents = 'none';
                context.lineWidth = 1.5;
                context.fillStyle = 'transparent';
            });

            renderCanvasArray([d3CanvasLimitLine]);
        } else if (
            horizontalLine !== undefined &&
            (location.pathname.includes('range') ||
                location.pathname.includes('reposition'))
        ) {
            horizontalLine.decorate((context: any, datum: any) => {
                context.visibility =
                    location.pathname.includes('range') ||
                    location.pathname.includes('reposition')
                        ? 'visible'
                        : 'hidden';
                context.strokeStyle =
                    datum.value > passValue ? lineSellColor : lineBuyColor;
                context.pointerEvents = 'none';
                context.lineWidth = 1.5;
                context.fillStyle = 'transparent';
            });
        }
    }, [
        limitLine,
        horizontalLine,
        ranges,
        triangleLimit,
        triangleRange,
        checkLimitOrder,
        sellOrderStyle,
        location.pathname,
    ]);

    useEffect(() => {
        if (
            scaleData !== undefined &&
            reset &&
            poolPriceDisplay !== undefined
        ) {
            const nowDate = Date.now();

            const snapDiff = nowDate % (period * 1000);

            const snappedTime =
                nowDate -
                (snapDiff > period * 1000 - snapDiff
                    ? -1 * (period * 1000 - snapDiff)
                    : snapDiff);

            const minDomain = snappedTime - 100 * 1000 * period;
            const maxDomain = snappedTime + 39 * 1000 * period;

            scaleData?.xScale.domain([minDomain, maxDomain]);

            changeScale();

            setReset(false);
            setShowLatest(false);
        }
    }, [scaleData, reset, minTickForLimit, maxTickForLimit]);

    useEffect(() => {
        if (
            scaleData !== undefined &&
            latest &&
            unparsedCandleData !== undefined
        ) {
            const latestCandleIndex = d3.maxIndex(
                unparsedCandleData,
                (d) => d.time,
            );

            const diff =
                scaleData?.xScale.domain()[1] - scaleData?.xScale.domain()[0];

            const centerX = unparsedCandleData[latestCandleIndex].time * 1000;

            if (rescale) {
                scaleData?.xScale.domain([
                    centerX - diff * 0.8,
                    centerX + diff * 0.2,
                ]);

                changeScale();
            } else {
                const diffY =
                    scaleData?.yScale.domain()[1] -
                    scaleData?.yScale.domain()[0];

                const high = denomInBase
                    ? unparsedCandleData[latestCandleIndex]
                          .invMinPriceExclMEVDecimalCorrected
                    : unparsedCandleData[latestCandleIndex]
                          .maxPriceExclMEVDecimalCorrected;
                const low = denomInBase
                    ? unparsedCandleData[latestCandleIndex]
                          .invMaxPriceExclMEVDecimalCorrected
                    : unparsedCandleData[latestCandleIndex]
                          .minPriceExclMEVDecimalCorrected;

                const centerY = high - Math.abs(low - high) / 2;

                const domain = [centerY - diffY / 2, centerY + diffY / 2];

                scaleData?.yScale.domain(domain);
                scaleData?.xScale.domain([
                    centerX - diff * 0.8,
                    centerX + diff * 0.2,
                ]);
            }

            setLatest(false);
            setShowLatest(false);
        }
    }, [
        scaleData,
        latest,
        unparsedCandleData,
        denomInBase,
        rescale,
        location.pathname,
    ]);

    useEffect(() => {
        if (poolPriceDisplay) {
            setCheckLimitOrder(
                sellOrderStyle === 'order_sell'
                    ? limit[0].value > poolPriceDisplay
                    : limit[0].value < poolPriceDisplay,
            );
        }
    }, [limit, sellOrderStyle, poolPriceDisplay]);

    const onClickRange = async (event: any) => {
        let newRangeValue: any;

        const low = ranges.filter((target: any) => target.name === 'Min')[0]
            .value;
        const high = ranges.filter((target: any) => target.name === 'Max')[0]
            .value;

        let clickedValue =
            scaleData?.yScale.invert(d3.pointer(event)[1]) >=
            liquidityData?.topBoundary
                ? liquidityData?.topBoundary
                : scaleData?.yScale.invert(d3.pointer(event)[1]);

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

        if (
            !tradeData.advancedMode ||
            location.pathname.includes('reposition')
        ) {
            let rangeWidthPercentage;
            let tickValue;
            if (
                clickedValue === 0 ||
                clickedValue === liquidityData?.topBoundary ||
                clickedValue < liquidityData?.lowBoundary
            ) {
                rangeWidthPercentage = 100;

                setRanges((prevState) => {
                    const newTargets = [...prevState];

                    newTargets.filter(
                        (target: any) => target.name === 'Min',
                    )[0].value = 0;

                    newTargets.filter(
                        (target: any) => target.name === 'Max',
                    )[0].value = liquidityData?.topBoundary;

                    newRangeValue = newTargets;

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
                scaleData?.yScale.invert(event.offsetY) < 0
                    ? 0.1
                    : scaleData?.yScale.invert(event.offsetY);
            let pinnedDisplayPrices: {
                pinnedMinPriceDisplay: string;
                pinnedMaxPriceDisplay: string;
                pinnedMinPriceDisplayTruncated: string;
                pinnedMaxPriceDisplayTruncated: string;
                pinnedLowTick: number;
                pinnedHighTick: number;
                pinnedMinPriceNonDisplay: number;
                pinnedMaxPriceNonDisplay: number;
            };
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
                        )[0].value = isScientific
                            ? Number(pinnedDisplayPrices.pinnedMaxPriceDisplay)
                            : pinnedMaxPriceDisplayTruncated;
                    } else {
                        newTargets.filter(
                            (target: any) => target.name === 'Min',
                        )[0].value = isScientific
                            ? Number(pinnedDisplayPrices.pinnedMinPriceDisplay)
                            : pinnedMinPriceDisplayTruncated;
                    }

                    renderCanvasArray([
                        d3CanvasRangeLine,
                        d3CanvasLiqAsk,
                        d3CanvasLiqAskDepth,
                        d3CanvasLiqBid,
                        d3CanvasLiqBidDepth,
                    ]);

                    newRangeValue = newTargets;

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
            const crosshairVerticalCanvas = d3fc
                .annotationCanvasLine()
                .orient('vertical')
                .value((d: any) => d.x)
                .xScale(scaleData?.xScale)
                .yScale(scaleData?.yScale)
                .label('');

            crosshairVerticalCanvas.decorate((context: any) => {
                context.strokeStyle = 'rgba(235, 235, 255)';
                context.pointerEvents = 'none';
                context.lineWidth = 0.3;
                context.fillStyle = 'transparent';
            });

            setCrosshairVerticalCanvas(() => {
                return crosshairVerticalCanvas;
            });

            const crosshairHorizontal = d3fc
                .annotationCanvasLine()
                .value((d: crosshair) => d.y)
                .xScale(scaleData?.xScale)
                .yScale(scaleData?.yScale);

            crosshairHorizontal.decorate((context: any) => {
                context.visibility = 'hidden';
                context.strokeStyle = 'rgba(235, 235, 255)';
                context.pointerEvents = 'none';
                context.lineWidth = 0.3;
                context.fillStyle = 'transparent';
            });

            setCrosshairHorizontal(() => {
                return crosshairHorizontal;
            });
        }
    }, [scaleData]);

    useEffect(() => {
        if (scaleData !== undefined) {
            const canvasCandlestick = d3fc
                .autoBandwidth(d3fc.seriesCanvasCandlestick())
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .decorate((context: any, d: any) => {
                    const close = denomInBase
                        ? d.invPriceCloseExclMEVDecimalCorrected
                        : d.priceCloseExclMEVDecimalCorrected;

                    const open = denomInBase
                        ? d.invPriceOpenExclMEVDecimalCorrected
                        : d.priceOpenExclMEVDecimalCorrected;

                    context.fillStyle =
                        selectedDate !== undefined &&
                        selectedDate === d.time * 1000
                            ? '#E480FF'
                            : close > open
                            ? '#CDC1FF'
                            : '#24243e';

                    context.strokeStyle =
                        selectedDate !== undefined &&
                        selectedDate === d.time * 1000
                            ? '#E480FF'
                            : close > open
                            ? '#CDC1FF'
                            : '#7371FC';

                    context.cursorStyle = 'pointer';
                })
                .xScale(scaleData?.xScale)
                .yScale(scaleData?.yScale)
                .crossValue((d: any) => d.time * 1000)
                .highValue((d: any) =>
                    denomInBase
                        ? d.invMinPriceExclMEVDecimalCorrected
                        : d.maxPriceExclMEVDecimalCorrected,
                )
                .lowValue((d: any) =>
                    denomInBase
                        ? d.invMaxPriceExclMEVDecimalCorrected
                        : d.minPriceExclMEVDecimalCorrected,
                )
                .openValue((d: any) =>
                    denomInBase
                        ? d.invPriceOpenExclMEVDecimalCorrected
                        : d.priceOpenExclMEVDecimalCorrected,
                )
                .closeValue((d: any) =>
                    denomInBase
                        ? d.invPriceCloseExclMEVDecimalCorrected
                        : d.priceCloseExclMEVDecimalCorrected,
                );

            setCandlestick(() => canvasCandlestick);
            renderCanvasArray([d3CanvasCandle]);
        }
    }, [diffHashSig(scaleData), selectedDate]);

    useEffect(() => {
        const canvas = d3
            .select(d3CanvasCandle.current)
            .select('canvas')
            .node() as HTMLCanvasElement;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

        if (candlestick) {
            d3.select(d3CanvasCandle.current)
                .on('draw', () => {
                    setCanvasResolution(canvas);
                    if (unparsedCandleData !== undefined) {
                        candlestick(unparsedCandleData);
                    }
                })
                .on('measure', (event: any) => {
                    scaleData?.xScale.range([0, event.detail.width]);
                    scaleData?.yScale.range([event.detail.height, 0]);
                    scaleData?.xScaleCopy.range([0, event.detail.width]);

                    candlestick.context(ctx);
                });
        }
    }, [unparsedCandleData, candlestick, unparsedData]);

    useEffect(() => {
        if (d3CanvasCandle) {
            const canvasDiv = d3.select(d3CanvasCandle.current) as any;

            const resizeObserver = new ResizeObserver(() => {
                render();
            });

            resizeObserver.observe(canvasDiv.node());

            return () => resizeObserver.unobserve(canvasDiv.node());
        }
    }, []);

    useEffect(() => {
        const canvas = d3
            .select(d3CanvasCrosshair.current)
            .select('canvas')
            .node() as HTMLCanvasElement;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

        if (crosshairHorizontal && crosshairVerticalCanvas) {
            d3.select(d3CanvasCrosshair.current)
                .on('draw', () => {
                    setCanvasResolution(canvas);
                    ctx.setLineDash([4, 2]);
                    crosshairVerticalCanvas(crosshairData);
                    if (crosshairActive === 'chart') {
                        crosshairHorizontal(crosshairData);
                    }
                })
                .on('measure', () => {
                    ctx.setLineDash([4, 2]);
                    crosshairVerticalCanvas.context(ctx);
                    if (crosshairActive === 'chart') {
                        crosshairHorizontal.context(ctx);
                    }
                });
        }
    }, [
        crosshairData,
        crosshairHorizontal,
        crosshairActive,
        crosshairVerticalCanvas,
    ]);

    useEffect(() => {
        const canvas = d3
            .select(d3CanvasMarketLine.current)
            .select('canvas')
            .node() as HTMLCanvasElement;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

        if (marketLine) {
            d3.select(d3CanvasMarketLine.current)
                .on('draw', () => {
                    setCanvasResolution(canvas);
                    ctx.setLineDash([5, 3]);
                    marketLine(market);
                })
                .on('measure', () => {
                    ctx.setLineDash([5, 3]);
                    marketLine.context(ctx);
                });
        }
    }, [market, marketLine]);

    useEffect(() => {
        if (location.pathname.includes('/limit')) {
            const canvas = d3
                .select(d3CanvasLimitLine.current)
                .select('canvas')
                .node() as HTMLCanvasElement;
            const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

            if (limitLine) {
                d3.select(d3CanvasLimitLine.current)
                    .on('draw', () => {
                        if (location.pathname.includes('/limit')) {
                            setCanvasResolution(canvas);
                            ctx.setLineDash([20, 18]);
                            limitLine(limit);
                            triangleLimit(limit);
                        }
                    })
                    .on('measure', () => {
                        ctx.setLineDash([20, 18]);
                        limitLine.context(ctx);
                        triangleLimit.context(ctx);
                    });
            }
        }
    }, [limit, limitLine, location.pathname]);

    useEffect(() => {
        if (
            location.pathname.includes('range') ||
            location.pathname.includes('reposition')
        ) {
            const canvas = d3
                .select(d3CanvasRangeLine.current)
                .select('canvas')
                .node() as HTMLCanvasElement;
            const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

            if (horizontalLine && horizontalBand) {
                d3.select(d3CanvasRangeLine.current)
                    .on('draw', () => {
                        if (
                            location.pathname.includes('range') ||
                            location.pathname.includes('reposition')
                        ) {
                            setCanvasResolution(canvas);
                            ctx.setLineDash([20, 18]);
                            horizontalLine(ranges);
                            horizontalBand([
                                [ranges[0].value, ranges[1].value],
                            ]);
                            triangleRange(ranges);
                        }
                    })
                    .on('measure', () => {
                        ctx.setLineDash([20, 18]);
                        horizontalLine.context(ctx);
                        horizontalBand.context(ctx);
                        triangleRange.context(ctx);
                    });
            }
        }
    }, [ranges, horizontalLine, location.pathname]);

    useEffect(() => {
        if (scaleData !== undefined) {
            const canvasBarChart = d3fc
                .autoBandwidth(d3fc.seriesCanvasBar())
                .decorate((context: any, d: any) => {
                    const close = denomInBase
                        ? d.invPriceCloseExclMEVDecimalCorrected
                        : d.priceCloseExclMEVDecimalCorrected;

                    const open = denomInBase
                        ? d.invPriceOpenExclMEVDecimalCorrected
                        : d.priceOpenExclMEVDecimalCorrected;

                    context.fillStyle =
                        d.volumeUSD === null
                            ? 'transparent'
                            : selectedDate !== undefined &&
                              selectedDate === d.time * 1000
                            ? '#E480FF'
                            : close > open
                            ? 'rgba(205,193,255, 0.5)'
                            : 'rgba(115,113,252, 0.5)';

                    context.strokeStyle =
                        d.volumeUSD === null
                            ? 'transparent'
                            : selectedDate !== undefined &&
                              selectedDate === d.time * 1000
                            ? '#E480FF'
                            : close > open
                            ? 'rgba(205,193,255, 0.5)'
                            : 'rgba(115,113,252, 0.5)';

                    context.cursorStyle = 'pointer';
                })
                .xScale(scaleData?.xScale)
                .yScale(scaleData?.volumeScale)
                .crossValue((d: any) => d.time * 1000)
                .mainValue((d: any) => (d.volumeUSD ? d.volumeUSD : 0));

            setBarSeries(() => canvasBarChart);
            renderCanvasArray([d3CanvasBar]);
        }
    }, [scaleData, selectedDate]);

    useEffect(() => {
        const canvas = d3
            .select(d3CanvasBar.current)
            .select('canvas')
            .node() as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');

        if (barSeries) {
            d3.select(d3CanvasBar.current)
                .on('draw', () => {
                    setCanvasResolution(canvas);
                    barSeries(unparsedCandleData);
                })
                .on('measure', (event: any) => {
                    scaleData?.volumeScale.range([
                        event.detail.height,
                        event.detail.height - event.detail.height / 5,
                    ]);
                    barSeries.context(ctx);
                });
        }
    }, [unparsedCandleData, barSeries]);

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
        if (liqMode === 'none') {
            d3.select(d3CanvasLiqAsk.current)
                .select('canvas')
                .style('display', 'none');
            d3.select(d3CanvasLiqBid.current)
                .select('canvas')
                .style('display', 'none');

            d3.select(d3CanvasLiqAskDepth.current)
                .select('canvas')
                .style('display', 'none');
            d3.select(d3CanvasLiqBidDepth.current)
                .select('canvas')
                .style('display', 'none');
        } else {
            if (liqMode === 'curve') {
                d3.select(d3CanvasLiqAsk.current)
                    .select('canvas')
                    .style('display', 'inline');
                d3.select(d3CanvasLiqBid.current)
                    .select('canvas')
                    .style('display', 'inline');

                d3.select(d3CanvasLiqBidDepth.current)
                    .select('canvas')
                    .style('display', 'none');
                d3.select(d3CanvasLiqAskDepth.current)
                    .select('canvas')
                    .style('display', 'none');
            } else {
                d3.select(d3CanvasLiqAskDepth.current)
                    .select('canvas')
                    .style('display', 'inline');
                d3.select(d3CanvasLiqBidDepth.current)
                    .select('canvas')
                    .style('display', 'inline');

                d3.select(d3CanvasLiqBid.current)
                    .select('canvas')
                    .style('display', 'none');

                d3.select(d3CanvasLiqAsk.current)
                    .select('canvas')
                    .style('display', 'none');
            }
        }
    }, [liqMode, location]);

    const renderSubchartCrCanvas = () => {
        const feeRateCrCanvas = d3
            .select('#fee_rate_chart')
            .select('#d3CanvasCrosshair');

        if (feeRateCrCanvas) {
            const nd = feeRateCrCanvas.node() as any;
            if (nd) nd.requestRedraw();
        }

        const tvlCrCanvas = d3
            .select('#tvl_chart')
            .select('#d3CanvasCrosshair');

        if (tvlCrCanvas) {
            const nd = tvlCrCanvas.node() as any;
            if (nd) nd.requestRedraw();
        }

        const tvlYaxisCanvas = d3
            .select('#tvl_chart')
            .select('#y-axis-canvas_tvl');

        if (tvlYaxisCanvas) {
            const nd = tvlYaxisCanvas.node() as any;
            if (nd) nd.requestRedraw();
        }
    };

    useEffect(() => {
        displayHorizontalLines();
    }, [simpleRangeWidth, tradeData.advancedMode, location]);

    const displayHorizontalLines = () => {
        if (
            location.pathname.includes('reposition') ||
            location.pathname.includes('range')
        ) {
            if (tradeData.advancedMode || simpleRangeWidth !== 100) {
                d3.select(d3CanvasRangeLine.current)
                    .select('canvas')
                    .style('display', 'inline');
            } else {
                d3.select(d3CanvasRangeLine.current)
                    .select('canvas')
                    .style('display', 'none');
            }
        }
    };

    function setAskGradientDefault() {
        const ctx = (
            d3.select(d3CanvasLiqAsk.current).select('canvas').node() as any
        ).getContext('2d');

        const gradient = ctx.createLinearGradient(0, 0, 100, 0);
        gradient.addColorStop(1, liqAskColor);
        setGradientForAsk(() => {
            return gradient;
        });
        setDefaultGradientForAsk(() => {
            return gradient;
        });
    }

    function setBidGradientDefault() {
        const ctx = (
            d3.select(d3CanvasLiqAsk.current).select('canvas').node() as any
        ).getContext('2d');

        const gradient = ctx.createLinearGradient(0, 0, 100, 0);
        gradient.addColorStop(1, liqBidColor);
        setGradientForBid(() => {
            return gradient;
        });
        setDefaultGradientForBid(() => {
            return gradient;
        });
    }

    useEffect(() => {
        if (!isMouseLeaveAskLiq) {
            setAskGradientDefault();

            if (liqTooltip) liqTooltip.style('visibility', 'hidden');
        }
        if (!isMouseLeaveBidLiq) {
            setBidGradientDefault();

            if (liqTooltip) liqTooltip.style('visibility', 'hidden');
        }
    }, [isMouseLeaveBidLiq, isMouseLeaveAskLiq]);

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
                    context.fillStyle = isMouseLeaveAskLiq
                        ? gradientForAsk
                        : defaultGradientForAsk;
                    context.strokeWidth = 2;
                })
                .orient('horizontal')
                .curve(d3.curveBasis)
                .mainValue((d: any) => d.activeLiq)
                .crossValue((d: any) => d.liqPrices)
                .xScale(liquidityScale)
                .yScale(scaleData?.yScale);

            setLiqAskSeries(() => d3CanvasLiqAskChart);

            const d3CanvasLiqAskDepthChart = d3fc
                .seriesCanvasArea()
                .decorate((context: any) => {
                    context.fillStyle = isMouseLeaveAskLiq
                        ? gradientForAsk
                        : defaultGradientForAsk;
                    context.strokeWidth = 2;
                })
                .orient('horizontal')
                .curve(d3.curveStepBefore)
                .mainValue((d: any) => d.activeLiq)
                .crossValue((d: any) => d.liqPrices)
                .xScale(liquidityDepthScale)
                .yScale(scaleData?.yScale);

            setLiqAskDepthSeries(() => d3CanvasLiqAskDepthChart);

            renderCanvasArray([d3CanvasLiqAsk, d3CanvasLiqAskDepth]);
        }
    }, [
        diffHashSig(scaleData),
        gradientForAsk,
        liquidityScale,
        liquidityDepthScale,
        isMouseLeaveAskLiq,
        defaultGradientForAsk,
    ]);

    useEffect(() => {
        if (scaleData !== undefined && gradientForBid) {
            const d3CanvasLiqBidChart = d3fc
                .seriesCanvasArea()
                .decorate((context: any) => {
                    context.fillStyle = isMouseLeaveBidLiq
                        ? gradientForBid
                        : defaultGradientForBid;
                    context.strokeWidth = 2;
                })
                .orient('horizontal')
                .curve(d3.curveBasis)
                .mainValue((d: any) => d.activeLiq)
                .crossValue((d: any) => d.liqPrices)
                .xScale(liquidityScale)
                .yScale(scaleData?.yScale);

            setLiqBidSeries(() => d3CanvasLiqBidChart);

            const d3CanvasLiqBidDepthChart = d3fc
                .seriesCanvasArea()
                .decorate((context: any) => {
                    context.fillStyle = isMouseLeaveBidLiq
                        ? gradientForBid
                        : defaultGradientForBid;
                    context.strokeWidth = 2;
                })
                .orient('horizontal')
                .curve(d3.curveStepAfter)
                .mainValue((d: any) => d.activeLiq)
                .crossValue((d: any) => d.liqPrices)
                .xScale(liquidityDepthScale)
                .yScale(scaleData?.yScale);

            setLiqBidDepthSeries(() => d3CanvasLiqBidDepthChart);

            renderCanvasArray([d3CanvasLiqBid, d3CanvasLiqBidDepth]);
        }
    }, [
        diffHashSig(scaleData),
        gradientForBid,
        liquidityScale,
        liquidityDepthScale,
        isMouseLeaveBidLiq,
        defaultGradientForBid,
    ]);

    useEffect(() => {
        const canvas = d3
            .select(d3CanvasLiqAsk.current)
            .select('canvas')
            .node() as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');

        const canvasDepth = d3
            .select(d3CanvasLiqAskDepth.current)
            .select('canvas')
            .node() as HTMLCanvasElement;
        const ctxDepth = canvasDepth.getContext('2d');

        if (liqAskSeries && liquidityData?.liqAskData) {
            d3.select(d3CanvasLiqAsk.current)
                .on('draw', () => {
                    setCanvasResolution(canvas);
                    liqAskSeries(liquidityData?.liqAskData);
                    if (
                        location.pathname.includes('range') ||
                        (location.pathname.includes('reposition') &&
                            lineAskSeries)
                    ) {
                        clipAskHighlightedLines(
                            ctx,
                            canvas.width,
                            liquidityData?.liqTransitionPointforCurve,
                        );
                        lineAskSeries(liquidityData?.liqAskData);
                    }
                })
                .on('measure', (event: any) => {
                    liqAskSeries.context(ctx);
                    if (lineAskSeries) {
                        lineAskSeries.context(ctx);
                    }
                    liquidityScale.range([
                        event.detail.width,
                        (event.detail.width / 10) * 6,
                    ]);
                });
        }
        if (liqAskDepthSeries && liquidityData?.depthLiqAskData) {
            d3.select(d3CanvasLiqAskDepth.current)
                .on('draw', () => {
                    setCanvasResolution(canvasDepth);
                    liqAskDepthSeries(liquidityData?.depthLiqAskData);
                    if (
                        location.pathname.includes('range') ||
                        (location.pathname.includes('reposition') &&
                            lineAskDepthSeries)
                    ) {
                        clipAskHighlightedLines(
                            ctxDepth,
                            canvas.width,
                            liquidityData?.liqTransitionPointforDepth,
                        );
                        lineAskDepthSeries(liquidityData?.depthLiqAskData);
                    }
                })
                .on('measure', (event: any) => {
                    liquidityDepthScale.range([
                        event.detail.width,
                        event.detail.width * 0.5,
                    ]);
                    liqAskDepthSeries.context(ctxDepth);

                    if (lineAskDepthSeries)
                        lineAskDepthSeries.context(ctxDepth);
                });
        }
    }, [
        liquidityData?.liqAskData,
        liquidityData?.depthLiqAskData,
        liqAskSeries,
        lineAskSeries,
        lineAskDepthSeries,
        liqAskDepthSeries,
        liqMode,
        location,
        minPrice,
        maxPrice,
    ]);

    useEffect(() => {
        const canvas = d3
            .select(d3CanvasLiqBid.current)
            .select('canvas')
            .node() as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');

        const canvasDepth = d3
            .select(d3CanvasLiqBidDepth.current)
            .select('canvas')
            .node() as HTMLCanvasElement;
        const ctxDepth = canvasDepth.getContext('2d');

        if (liqBidSeries && liquidityData?.liqBidData) {
            d3.select(d3CanvasLiqBid.current)
                .on('draw', () => {
                    setCanvasResolution(canvas);
                    liqBidSeries(liquidityData?.liqBidData);
                    if (
                        location.pathname.includes('range') ||
                        (location.pathname.includes('reposition') &&
                            lineBidSeries)
                    ) {
                        clipBidHighlightedLines(
                            ctx,
                            canvas.width,
                            liquidityData?.liqTransitionPointforCurve,
                        );
                        lineBidSeries(liquidityData?.liqBidData);
                    }
                })
                .on('measure', (event: any) => {
                    liqBidSeries.context(ctx);
                    if (lineBidSeries) {
                        lineBidSeries.context(ctx);
                    }
                    liquidityScale.range([
                        event.detail.width,
                        (event.detail.width / 10) * 6,
                    ]);
                });
        }

        if (liqBidDepthSeries && liquidityData?.depthLiqBidData) {
            d3.select(d3CanvasLiqBidDepth.current)
                .on('draw', () => {
                    setCanvasResolution(canvasDepth);
                    liqBidDepthSeries(
                        tradeData.advancedMode
                            ? liquidityData?.depthLiqBidData
                            : liquidityData?.depthLiqBidData.filter(
                                  (d: any) =>
                                      d.liqPrices <= liquidityData?.topBoundary,
                              ),
                    );

                    if (
                        location.pathname.includes('range') ||
                        (location.pathname.includes('reposition') &&
                            lineBidDepthSeries)
                    ) {
                        clipBidHighlightedLines(
                            ctxDepth,
                            canvas.width,
                            liquidityData?.liqTransitionPointforDepth,
                        );

                        lineBidDepthSeries(
                            tradeData.advancedMode
                                ? liquidityData?.depthLiqBidData
                                : liquidityData?.depthLiqBidData.filter(
                                      (d: any) =>
                                          d.liqPrices <=
                                          liquidityData?.topBoundary,
                                  ),
                        );
                    }
                })
                .on('measure', (event: any) => {
                    liquidityDepthScale.range([
                        event.detail.width,
                        event.detail.width * 0.5,
                    ]);
                    liqBidDepthSeries.context(ctxDepth);

                    if (lineBidDepthSeries) {
                        lineBidDepthSeries.context(ctxDepth);
                    }
                });
        }
    }, [
        liquidityData?.liqBidData,
        liquidityData?.depthLiqBidData,
        tradeData.advancedMode,
        liqBidSeries,
        lineBidSeries,
        lineBidDepthSeries,
        liqMode,
        location,
        minPrice,
        maxPrice,
    ]);

    useEffect(() => {
        if (scaleData !== undefined) {
            renderCanvasArray([
                d3CanvasLiqAsk,
                d3CanvasLiqAskDepth,
                d3CanvasLiqBid,
                d3CanvasLiqBidDepth,
            ]);
        }
    }, [scaleData, liquidityData, location]);

    const clipBidHighlightedLines = (
        ctx: any,
        width: number,
        passValue: number,
    ) => {
        const _low = ranges.filter((target: any) => target.name === 'Min')[0]
            .value;
        const _high = ranges.filter((target: any) => target.name === 'Max')[0]
            .value;

        const low = _low > _high ? _high : _low;
        const high = _low > _high ? _low : _high;

        let height = scaleData?.yScale(passValue) - scaleData?.yScale(high);
        let y = scaleData?.yScale(high);

        if (low > passValue) {
            height = scaleData?.yScale(low) - scaleData?.yScale(high);
            y = scaleData?.yScale(high);
        }
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, y, width, height);
        ctx.clip();
    };

    const clipAskHighlightedLines = (
        ctx: any,
        width: number,
        passValue: number,
    ) => {
        const _low = ranges.filter((target: any) => target.name === 'Min')[0]
            .value;
        const _high = ranges.filter((target: any) => target.name === 'Max')[0]
            .value;

        const low = _low > _high ? _high : _low;
        const high = _low > _high ? _low : _high;
        let height = scaleData?.yScale(low) - scaleData?.yScale(passValue);
        let y = scaleData?.yScale(passValue);

        if (high < passValue) {
            height = scaleData?.yScale(low) - scaleData?.yScale(high);
            y = scaleData?.yScale(high);
        }
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, y, width, height);
        ctx.clip();
    };

    function noGoZone(poolPrice: any) {
        setLimitTickNearNoGoZone(poolPrice * 0.99, poolPrice * 1.01);
        return [[poolPrice * 0.99, poolPrice * 1.01]];
    }

    useEffect(() => {
        const noGoZoneBoudnaries = noGoZone(poolPriceDisplay);
        setNoGoZoneBoudnaries(() => {
            return noGoZoneBoudnaries;
        });
    }, [poolPriceDisplay]);

    function changeScale() {
        if (poolPriceDisplay && scaleData && rescale) {
            const xmin = scaleData?.xScale.domain()[0];
            const xmax = scaleData?.xScale.domain()[1];

            const filtered = unparsedCandleData.filter(
                (data: any) =>
                    data.time * 1000 >= xmin && data.time * 1000 <= xmax,
            );

            if (filtered !== undefined && filtered.length > 10) {
                const minYBoundary = d3.min(filtered, (d) =>
                    denomInBase
                        ? d.invMaxPriceExclMEVDecimalCorrected
                        : d.minPriceExclMEVDecimalCorrected,
                );
                const maxYBoundary = d3.max(filtered, (d) =>
                    denomInBase
                        ? d.invMinPriceExclMEVDecimalCorrected
                        : d.maxPriceExclMEVDecimalCorrected,
                );

                if (minYBoundary && maxYBoundary) {
                    const buffer = Math.abs((maxYBoundary - minYBoundary) / 6);
                    if (
                        location.pathname.includes('range') ||
                        location.pathname.includes('reposition')
                    ) {
                        const min = ranges.filter(
                            (target: any) => target.name === 'Min',
                        )[0].value;
                        const max = ranges.filter(
                            (target: any) => target.name === 'Max',
                        )[0].value;

                        const low = Math.min(Math.min(min, max), minYBoundary);

                        const high = Math.max(Math.max(min, max), maxYBoundary);

                        const bufferForRange = Math.abs(
                            (low - high) / (simpleRangeWidth !== 100 ? 6 : 90),
                        );
                        const domain = [
                            Math.min(low, high) - bufferForRange,
                            Math.max(low, high) + bufferForRange / 2,
                        ];
                        scaleData?.yScale.domain(domain);
                    } else if (location.pathname.includes('/limit')) {
                        const value = limit[0].value;
                        const low = Math.min(
                            minYBoundary,
                            value,
                            minTickForLimit,
                        );

                        const high = Math.max(
                            maxYBoundary,
                            value,
                            maxTickForLimit,
                        );

                        const bufferForLimit = Math.abs((low - high) / 6);
                        if (value > 0 && Math.abs(value) !== Infinity) {
                            const domain = [
                                Math.min(low, high) - bufferForLimit,
                                Math.max(low, high) + bufferForLimit / 2,
                            ];

                            scaleData?.yScale.domain(domain);
                        }
                    } else {
                        const domain = [
                            Math.min(minYBoundary, maxYBoundary) - buffer,
                            Math.max(minYBoundary, maxYBoundary) + buffer / 2,
                        ];

                        scaleData?.yScale.domain(domain);
                    }

                    renderCanvasArray([
                        d3CanvasCandle,
                        d3CanvasLiqAsk,
                        d3CanvasLiqAskDepth,
                        d3CanvasLiqBid,
                        d3CanvasLiqBidDepth,
                        d3Yaxis,
                    ]);
                }
            }
        }
    }

    // autoScaleF
    useEffect(() => {
        if (
            rescale &&
            !isLineDrag &&
            prevPeriod === period &&
            candleTimeInSeconds === period
        ) {
            changeScale();
        }
    }, [
        ranges,
        limit,
        location.pathname,
        period,
        diffHashSigChart(unparsedCandleData),
        noGoZoneBoudnaries,
        maxTickForLimit,
        minTickForLimit,
        prevPeriod === period,
        candleTimeInSeconds === period,
    ]);

    // Call drawChart()
    useEffect(() => {
        if (
            scaleData !== undefined &&
            zoomUtils !== undefined &&
            liqTooltip !== undefined
        ) {
            drawChart(scaleData, zoomUtils, selectedDate);
        }
    }, [
        zoomUtils,
        denomInBase,
        liqTooltip,
        selectedDate,
        isSidebarOpen,
        liqMode,
    ]);

    const candleOrVolumeDataHoverStatus = (event: any) => {
        const lastDate = scaleData?.xScale.invert(
            event.offsetX + bandwidth / 2,
        );
        const startDate = scaleData?.xScale.invert(
            event.offsetX - bandwidth / 2,
        );

        let avaregeHeight = 1;
        const filtered: Array<CandleData> = [];
        let longestValue = 0;

        const xmin = scaleData?.xScale.domain()[0];
        const xmax = scaleData?.xScale.domain()[1];

        unparsedCandleData.map((d: CandleData) => {
            avaregeHeight =
                avaregeHeight +
                Math.abs(
                    (denomInBase
                        ? d.invPriceCloseExclMEVDecimalCorrected
                        : d.priceCloseExclMEVDecimalCorrected) -
                        (denomInBase
                            ? d.invPriceOpenExclMEVDecimalCorrected
                            : d.priceOpenExclMEVDecimalCorrected),
                );

            if (d.time * 1000 >= xmin && d.time * 1000 <= xmax) {
                if (d.volumeUSD > longestValue) {
                    longestValue = d.volumeUSD;
                }

                filtered.push(d);
            }
        });

        const minHeight = avaregeHeight / unparsedCandleData.length;

        longestValue = longestValue / 2;

        const nearest = snapForCandle(event, filtered);
        const dateControl =
            nearest?.time * 1000 > startDate && nearest?.time * 1000 < lastDate;
        const yValue = scaleData?.yScale.invert(event.offsetY);

        const yValueVolume = scaleData?.volumeScale.invert(event.offsetY / 2);
        const selectedVolumeDataValue = nearest?.volumeUSD;

        const isSelectedVolume = selectedVolumeDataValue
            ? yValueVolume <=
                  (selectedVolumeDataValue < longestValue
                      ? longestValue
                      : selectedVolumeDataValue) && yValueVolume !== 0
                ? true
                : false
            : false;

        const close = denomInBase
            ? nearest?.invPriceCloseExclMEVDecimalCorrected
            : nearest?.priceCloseExclMEVDecimalCorrected;

        const open = denomInBase
            ? nearest?.invPriceOpenExclMEVDecimalCorrected
            : nearest?.priceOpenExclMEVDecimalCorrected;

        const diff = Math.abs(close - open);
        const scale = Math.abs(
            scaleData?.yScale.domain()[1] - scaleData?.yScale.domain()[0],
        );

        const topBoundary =
            close > open
                ? close + (minHeight - diff) / 2
                : open + (minHeight - diff) / 2;
        const botBoundary =
            open < close
                ? open - (minHeight - diff) / 2
                : close - (minHeight - diff) / 2;

        let limitTop;
        let limitBot;

        if (scale / 20 > diff) {
            if (close > open) {
                limitTop = close + scale / 20;
                limitBot = open - scale / 20;
            } else {
                limitTop = open + scale / 20;
                limitBot = close - scale / 20;
            }
        } else {
            if (close > open) {
                limitTop = close > topBoundary ? close : topBoundary;
                limitBot = open < botBoundary ? open : botBoundary;
            } else {
                limitTop = open > topBoundary ? open : topBoundary;
                limitBot = close < botBoundary ? close : botBoundary;
            }
        }

        setsubChartValues((prevState: any) => {
            const newData = [...prevState];

            newData.filter((target: any) => target.name === 'tvl')[0].value =
                nearest?.tvlData.tvl;

            newData.filter(
                (target: any) => target.name === 'feeRate',
            )[0].value = nearest?.averageLiquidityFee;

            return newData;
        });

        if (selectedDate === undefined) {
            props.setCurrentData(nearest);
            props.setCurrentVolumeData(nearest?.volumeUSD);
        } else if (selectedDate) {
            props.setCurrentVolumeData(
                unparsedCandleData.find(
                    (item: any) => item.time * 1000 === selectedDate,
                )?.volumeUSD,
            );
        }

        return {
            isHoverCandleOrVolumeData:
                nearest &&
                dateControl &&
                ((limitTop > limitBot
                    ? limitTop > yValue && limitBot < yValue
                    : limitTop < yValue && limitBot > yValue) ||
                    isSelectedVolume),
            _selectedDate: nearest?.time * 1000,
            nearest: nearest,
        };
    };

    const liqDataHover = (event: any) => {
        const liqDataBid =
            liqMode === 'depth'
                ? liquidityData?.depthLiqBidData
                : liquidityData?.liqBidData;
        const liqDataAsk =
            liqMode === 'depth'
                ? liquidityData?.depthLiqAskData
                : liquidityData?.liqAskData;

        const allData = liqDataBid.concat(liqDataAsk);

        if (!allData || allData.length === 0) return;
        const { min }: any = findLiqNearest(allData);

        let filteredAllData = allData.filter(
            (item: any) =>
                min <= item.liqPrices &&
                item.liqPrices <= scaleData?.yScale.domain()[1],
        );

        if (filteredAllData === undefined || filteredAllData.length === 0) {
            filteredAllData = allData.filter(
                (item: any) => min <= item.liqPrices,
            );
        }

        const liqMaxActiveLiq = d3.max(filteredAllData, function (d: any) {
            return d.activeLiq;
        });

        const canvas = d3
            .select(d3CanvasLiqAsk.current)
            .select('canvas')
            .node() as any;

        const canvasDepth = d3
            .select(d3CanvasLiqAskDepth.current)
            .select('canvas')
            .node() as any;

        const rect =
            liqMode === 'curve'
                ? canvas.getBoundingClientRect()
                : canvasDepth.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const currentDataY = scaleData?.yScale.invert(y);
        const currentDataX =
            liqMode === 'depth'
                ? liquidityDepthScale.invert(x)
                : liquidityScale.invert(x);

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
                    setIsMouseLeaveBidLiq(true);
                    setIsMouseLeaveAskLiq(false);
                    bidAreaFunc(event, bidMinBoudnary, bidMaxBoudnary);
                } else if (
                    askMinBoudnary !== undefined &&
                    askMaxBoudnary !== undefined
                ) {
                    if (
                        askMinBoudnary < currentDataY &&
                        currentDataY < askMaxBoudnary
                    ) {
                        setIsMouseLeaveAskLiq(true);
                        setIsMouseLeaveBidLiq(false);
                        askAreaFunc(event, askMinBoudnary, askMaxBoudnary);
                    }
                }
            }
        } else {
            setIsMouseLeaveBidLiq(false);
            setIsMouseLeaveAskLiq(false);
        }
    };

    useEffect(() => {
        setIsMouseLeaveBidLiq(isLineDrag || isChartZoom);
        setIsMouseLeaveAskLiq(isLineDrag || isChartZoom);
    }, [isLineDrag, isChartZoom]);

    const bidAreaFunc = (
        event: any,
        minBoudnary: string,
        maxBoudnary: string,
    ) => {
        const canvas = d3
            .select(d3CanvasLiqAsk.current)
            .select('canvas') as any;
        const ctx = canvas.node().getContext('2d');

        currentPriceData[0] = {
            value: poolPriceDisplay !== undefined ? poolPriceDisplay : 0,
        };

        const filtered =
            liquidityData?.liqBidData.length > 1
                ? liquidityData?.liqBidData.filter(
                      (d: any) => d.liqPrices != null,
                  )
                : liquidityData?.liqBidData;

        const mousePosition = scaleData?.yScale.invert(event.offsetY);

        let closest = filtered.find(
            (item: any) =>
                item.liqPrices === d3.min(filtered, (d: any) => d.liqPrices),
        );

        filtered.map((data: any) => {
            if (
                mousePosition > data.liqPrices &&
                data.liqPrices > closest.liqPrices
            ) {
                closest = data;
            }
        });

        setLiqTooltipSelectedLiqBar(() => {
            return closest;
        });

        setSelectedLiq(() => {
            return 'bidLiq';
        });

        const pinnedTick = closest.upperBound;

        const percentage = parseFloat(
            (Math.abs(pinnedTick - currentPoolPriceTick) / 100).toString(),
        ).toFixed(1);

        liqTooltip
            .style('visibility', percentage !== '0.0' ? 'visible' : 'hidden')
            .style('top', event.pageY - 80 + 'px')
            .style('left', event.offsetX - 80 + 'px');

        liquidityData.liqHighligtedAskSeries = [];

        maxBoudnary =
            maxBoudnary > scaleData.yScale.domain()[1]
                ? scaleData.yScale.domain()[1]
                : maxBoudnary;

        minBoudnary =
            minBoudnary < scaleData.yScale.domain()[0]
                ? scaleData.yScale.domain()[0]
                : minBoudnary;

        const ratioBid =
            (scaleData?.yScale.invert(event.offsetY) -
                parseFloat(minBoudnary)) /
            (parseFloat(maxBoudnary) - parseFloat(minBoudnary));

        if (ratioBid >= 0 && ratioBid <= 1) {
            const gradient = ctx.createLinearGradient(
                0,
                scaleData?.yScale(maxBoudnary),
                0,
                scaleData?.yScale(minBoudnary),
            );

            gradient.addColorStop(1 - ratioBid, liqBidColor);

            gradient.addColorStop(1 - ratioBid, 'rgba(115, 113, 252, 0.6)');

            setGradientForBid(gradient);
        }

        renderCanvasArray([d3CanvasLiqBid, d3CanvasLiqBidDepth]);
    };

    const askAreaFunc = (
        event: any,
        minBoudnary: string,
        maxBoudnary: string,
    ) => {
        currentPriceData[0] = {
            value: poolPriceDisplay !== undefined ? poolPriceDisplay : 0,
        };

        const filtered =
            liquidityData?.liqAskData.length > 1
                ? liquidityData?.liqAskData.filter(
                      (d: any) => d.liqPrices != null,
                  )
                : liquidityData?.liqAskData;

        const mousePosition = scaleData?.yScale.invert(event.offsetY);

        let closest = filtered.find(
            (item: any) =>
                item.liqPrices === d3.max(filtered, (d: any) => d.liqPrices),
        );
        if (closest !== undefined) {
            filtered.map((data: any) => {
                if (
                    mousePosition < data.liqPrices &&
                    data.liqPrices < closest.liqPrices
                ) {
                    closest = data;
                }
            });

            setLiqTooltipSelectedLiqBar(() => {
                return closest;
            });

            setSelectedLiq(() => {
                return 'askLiq';
            });
        }

        const pinnedTick = closest.lowerBound;

        const percentage = parseFloat(
            (Math.abs(pinnedTick - currentPoolPriceTick) / 100).toString(),
        ).toFixed(1);

        liqTooltip
            .style('visibility', percentage !== '0.0' ? 'visible' : 'hidden')
            .style('top', event.pageY - 80 + 'px')
            .style('left', event.offsetX - 80 + 'px');

        const canvas = d3
            .select(d3CanvasLiqBid.current)
            .select('canvas')
            .node() as any;
        const ctx = canvas.getContext('2d');

        minBoudnary =
            minBoudnary < scaleData.yScale.domain()[0]
                ? scaleData.yScale.domain()[0]
                : minBoudnary;

        maxBoudnary =
            maxBoudnary > scaleData.yScale.domain()[1]
                ? scaleData.yScale.domain()[1]
                : maxBoudnary;

        if (maxBoudnary) {
            const ratioAsk =
                (parseFloat(maxBoudnary) -
                    scaleData?.yScale.invert(event.offsetY)) /
                (parseFloat(maxBoudnary) - parseFloat(minBoudnary));

            const gradient = ctx.createLinearGradient(
                0,
                scaleData?.yScale(maxBoudnary),
                0,
                scaleData?.yScale(minBoudnary),
            );

            if (ratioAsk >= 0 && ratioAsk <= 1) {
                gradient.addColorStop(ratioAsk, 'rgba(205, 193, 255, 0.6)');

                gradient.addColorStop(ratioAsk, liqAskColor);

                setGradientForAsk(gradient);
            }
        }

        renderCanvasArray([d3CanvasLiqAsk, d3CanvasLiqAskDepth]);
    };

    const selectedDateEvent = (
        isHoverCandleOrVolumeData: any,
        _selectedDate: any,
        nearest: any,
    ) => {
        if (isHoverCandleOrVolumeData) {
            if (selectedDate === undefined || selectedDate !== _selectedDate) {
                props.setCurrentData(nearest);

                const volumeData = unparsedCandleData.find(
                    (item: CandleData) => item.time * 1000 === _selectedDate,
                ) as any;

                props.setCurrentVolumeData(volumeData?.volumeUSD);

                setSelectedDate(_selectedDate);
            } else {
                setSelectedDate(undefined);
            }
        }
    };

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

    useEffect(() => {
        d3.select(d3CanvasCrosshair.current).style(
            'visibility',
            crosshairActive !== 'none' ? 'visible' : 'hidden',
        );
        renderSubchartCrCanvas();
    }, [crosshairActive]);

    const mousemove = (event: any) => {
        if (!isLineDrag) {
            const snapDiff =
                scaleData?.xScale.invert(event.offsetX) % (period * 1000);

            const snappedTime =
                scaleData?.xScale.invert(event.offsetX) -
                (snapDiff > period * 1000 - snapDiff
                    ? -1 * (period * 1000 - snapDiff)
                    : snapDiff);

            setCrosshairActive('chart');

            setCrosshairData([
                {
                    x: snappedTime,
                    y: scaleData?.yScale.invert(event.layerY),
                },
            ]);
            setMouseLocationY(event.offsetY);

            renderCanvasArray([
                d3CanvasCrosshair,
                d3CanvasLiqBid,
                d3CanvasLiqBidDepth,
                d3CanvasLiqAsk,
                d3CanvasLiqAskDepth,
            ]);
        }
        if (liqMode !== 'none') {
            liqDataHover(event);
        }

        const { isHoverCandleOrVolumeData } =
            candleOrVolumeDataHoverStatus(event);
        setIsOnCandleOrVolumeMouseLocation(isHoverCandleOrVolumeData);
    };

    // Draw Chart
    const drawChart = useCallback(
        (scaleData: any, zoomUtils: any, selectedDate: any) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars

            const onClickCanvas = (event: any) => {
                const { isHoverCandleOrVolumeData, _selectedDate, nearest } =
                    candleOrVolumeDataHoverStatus(event);
                selectedDateEvent(
                    isHoverCandleOrVolumeData,
                    _selectedDate,
                    nearest,
                );

                setCrosshairActive('none');

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
                    let newLimitValue = scaleData?.yScale.invert(event.offsetY);

                    if (newLimitValue < 0) newLimitValue = 0;

                    const { noGoZoneMin, noGoZoneMax } = getNoZoneData();

                    if (
                        !(
                            newLimitValue >= noGoZoneMin &&
                            newLimitValue <= noGoZoneMax
                        )
                    ) {
                        onBlurLimitRate(limit[0].value, newLimitValue);
                    }
                }
            };

            d3.select(d3CanvasMain.current).on('click', (event: any) => {
                onClickCanvas(event);
            });

            d3.select(d3CanvasMain.current).on(
                'mousemove',
                function (event: any) {
                    mousemove(event);
                },
            );

            d3.select(d3Yaxis.current).on('mousemove', (event: any) => {
                d3.select(event.currentTarget).style('cursor', 'row-resize');
            });
            d3.select(d3Yaxis.current).on('mouseover', () => {
                mouseLeaveCanvas();
            });

            d3.select(d3Xaxis.current).on('mouseover', (event: any) => {
                d3.select(event.currentTarget).style('cursor', 'col-resize');
                setCrosshairActive('none');
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
                setCrosshairActive('none');

                setIsMouseLeaveBidLiq(false);
                setIsMouseLeaveAskLiq(false);

                if (unparsedCandleData) {
                    const lastData = unparsedCandleData.find(
                        (item: any) =>
                            item.time ===
                            d3.max(
                                unparsedCandleData,
                                (data: any) => data.time,
                            ),
                    );

                    setsubChartValues((prevState: any) => {
                        const newData = [...prevState];

                        newData.filter(
                            (target: any) => target.name === 'tvl',
                        )[0].value = lastData
                            ? lastData.tvlData.tvl
                            : undefined;

                        newData.filter(
                            (target: any) => target.name === 'feeRate',
                        )[0].value = lastData
                            ? lastData.averageLiquidityFee
                            : undefined;
                        return newData;
                    });
                }

                if (selectedDate === undefined) {
                    props.setShowTooltip(false);
                }
            });

            const mouseLeaveCanvas = () => {
                setCrosshairActive('none');

                setIsMouseLeaveBidLiq(false);
                setIsMouseLeaveAskLiq(false);
            };

            d3.select(d3CanvasMain.current).on('mouseleave', () => {
                mouseLeaveCanvas();
            });

            const mouseEnterCanvas = () => {
                if (!isLineDrag) {
                    setCrosshairActive('chart');
                }

                props.setShowTooltip(true);
            };

            d3.select(d3CanvasMain.current).on('mouseenter', () => {
                mouseEnterCanvas();
            });
        },
        [
            limit,
            ranges,
            location.pathname,
            liqMode,
            liquidityScale,
            liquidityDepthScale,
            isLineDrag,
            selectedDate,
            isMouseLeaveBidLiq,
            isMouseLeaveAskLiq,
            unparsedCandleData?.length,
            !tradeData.advancedMode && simpleRangeWidth === 100,
        ],
    );

    useEffect(() => {
        if (scaleData && scaleData?.xScale) {
            const xmin = scaleData?.xScale.domain()[0];

            const filtered = unparsedCandleData?.filter(
                (data: CandleData) => data.time * 1000 >= xmin,
            );

            const minYBoundary = d3.min(filtered, (d) => d.volumeUSD);
            const maxYBoundary = d3.max(filtered, (d) => d.volumeUSD);
            if (minYBoundary !== undefined && maxYBoundary !== undefined) {
                const domain = [0, maxYBoundary / 1.05];
                scaleData?.volumeScale.domain(domain);
            }
        }
    }, [scaleData && scaleData?.xScale.domain()]);

    useEffect(() => {
        if (
            liqTooltip !== undefined &&
            liqTooltipSelectedLiqBar !== undefined &&
            poolPriceDisplay !== undefined
        ) {
            const liqTextData = { totalValue: 0 };

            if (liqTooltipSelectedLiqBar.liqPrices != null) {
                if (selectedLiq === 'askLiq') {
                    liquidityData?.liqAskData.map((liqData: any) => {
                        if (
                            liqData?.liqPrices >
                            liqTooltipSelectedLiqBar.liqPrices
                        ) {
                            liqTextData.totalValue =
                                liqTextData.totalValue +
                                liqData?.deltaAverageUSD;
                        }
                    });
                } else {
                    liquidityData?.liqBidData.map((liqData: any) => {
                        if (
                            liqData?.liqPrices <
                            liqTooltipSelectedLiqBar.liqPrices
                        ) {
                            liqTextData.totalValue =
                                liqTextData.totalValue +
                                liqData?.deltaAverageUSD;
                        }
                    });
                }
                // }
            }

            // const absoluteDifference = Math.abs(difference)

            const pinnedTick =
                selectedLiq === 'bidLiq'
                    ? liqTooltipSelectedLiqBar.upperBound
                    : liqTooltipSelectedLiqBar.lowerBound;

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
    }, [liqTooltipSelectedLiqBar, liqMode, selectedLiq]);

    // // Candle transactions
    useEffect(() => {
        if (selectedDate !== undefined) {
            const candle = unparsedCandleData.find(
                (candle: CandleData) => candle.time * 1000 === selectedDate,
            ) as any;

            if (candle !== undefined) {
                props.changeState(true, candle);
            }
        } else {
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

            if (lowLineMoved) {
                setChartTriggeredBy('low_line');
            } else if (highLineMoved) {
                setChartTriggeredBy('high_line');
            }
            dispatch(setIsLinesSwitched(isLinesSwitched));
        }
    };

    const onBlurLimitRate = (limitPreviousData: number, newLimitValue: any) => {
        if (newLimitValue === undefined) {
            return;
        }
        const limitNonDisplay = denomInBase
            ? pool?.fromDisplayPrice(parseFloat(newLimitValue))
            : pool?.fromDisplayPrice(1 / parseFloat(newLimitValue));

        limitNonDisplay?.then((limit) => {
            limit = limit !== 0 ? limit : 1;

            const pinnedTick: number = isTokenABase
                ? pinTickLower(limit, chainData.gridSize)
                : pinTickUpper(limit, chainData.gridSize);

            dispatch(setLimitTick(pinnedTick));

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

                    newLimitValue = displayPriceWithDenom;
                    reverseTokenForChart(limitPreviousData, newLimitValue);
                    setLimit(() => {
                        return [
                            {
                                name: 'Limit',
                                value: newLimitValue,
                            },
                        ];
                    });
                });
            }
        });
    };
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
                            className='candle-canvas'
                        ></d3fc-canvas>
                        <d3fc-canvas
                            ref={d3CanvasBar}
                            className='volume-canvas'
                            style={{
                                position: 'relative',
                                height: '50%',
                                marginBottom: '0',
                                marginTop: 'auto',
                            }}
                        ></d3fc-canvas>

                        <d3fc-canvas
                            ref={d3CanvasLiqBid}
                            className='liq-bid-canvas'
                            style={{
                                position: 'relative',
                                width: '20%',
                                marginLeft: '80%',
                            }}
                        ></d3fc-canvas>

                        <d3fc-canvas
                            ref={d3CanvasLiqBidDepth}
                            className='liq-bid-canvas'
                            style={{
                                position: 'relative',
                                width: '20%',
                                marginLeft: '80%',
                            }}
                        ></d3fc-canvas>

                        <d3fc-canvas
                            ref={d3CanvasLiqAsk}
                            className='liq-ask-canvas'
                            style={{
                                position: 'relative',
                                width: '20%',
                                marginLeft: '80%',
                            }}
                        ></d3fc-canvas>
                        <d3fc-canvas
                            ref={d3CanvasLiqAskDepth}
                            className='liq-ask-canvas'
                            style={{
                                position: 'relative',
                                width: '20%',
                                marginLeft: '80%',
                            }}
                        ></d3fc-canvas>
                        <d3fc-canvas
                            ref={d3CanvasCrosshair}
                            className='cr-canvas'
                        ></d3fc-canvas>
                        <d3fc-canvas
                            ref={d3CanvasMarketLine}
                            className='market-line-canvas'
                        ></d3fc-canvas>
                        <d3fc-canvas
                            ref={d3CanvasRangeLine}
                            className='range-line-canvas'
                        ></d3fc-canvas>
                        <d3fc-canvas
                            ref={d3CanvasLimitLine}
                            className='limit-line-canvas'
                        ></d3fc-canvas>

                        <d3fc-canvas
                            ref={d3CanvasMain}
                            className='main-canvas'
                        ></d3fc-canvas>

                        <d3fc-canvas
                            className='y-axis-canvas'
                            ref={d3Yaxis}
                            style={{
                                width: yAxisWidth,
                                gridColumn: 4,
                                gridRow: 3,
                            }}
                        ></d3fc-canvas>
                    </div>
                    {showFeeRate && (
                        <>
                            <hr />
                            <FeeRateSubChart
                                feeData={unparsedCandleData.sort(
                                    (a, b) => b.time - a.time,
                                )}
                                period={period}
                                crosshairForSubChart={crosshairData}
                                setCrosshairData={setCrosshairData}
                                subChartValues={subChartValues}
                                xScale={
                                    scaleData !== undefined
                                        ? scaleData?.xScale
                                        : undefined
                                }
                                getNewCandleData={getNewCandleData}
                                setZoomAndYdragControl={setZoomAndYdragControl}
                                zoomAndYdragControl={zoomAndYdragControl}
                                render={render}
                                yAxisWidth={yAxisWidth}
                                setCrossHairLocation={
                                    candleOrVolumeDataHoverStatus
                                }
                                setCrosshairActive={setCrosshairActive}
                                crosshairActive={crosshairActive}
                                setShowTooltip={props.setShowTooltip}
                            />
                        </>
                    )}

                    {showTvl && (
                        <>
                            <hr />
                            <TvlSubChart
                                tvlData={unparsedCandleData.sort(
                                    (a, b) => b.time - a.time,
                                )}
                                period={period}
                                crosshairForSubChart={crosshairData}
                                setCrosshairData={setCrosshairData}
                                scaleData={scaleData}
                                getNewCandleData={getNewCandleData}
                                setZoomAndYdragControl={setZoomAndYdragControl}
                                zoomAndYdragControl={zoomAndYdragControl}
                                subChartValues={subChartValues}
                                render={render}
                                yAxisWidth={yAxisWidth}
                                setCrossHairLocation={
                                    candleOrVolumeDataHoverStatus
                                }
                                setCrosshairActive={setCrosshairActive}
                                crosshairActive={crosshairActive}
                                setShowTooltip={props.setShowTooltip}
                            />
                        </>
                    )}

                    <div className='xAxis'>
                        <hr />
                        <d3fc-canvas
                            ref={d3Xaxis}
                            className='x-axis'
                            style={{
                                height: '2em',
                                width: '100%',
                                gridColumn: 3,
                                gridRow: 4,
                            }}
                        ></d3fc-canvas>
                    </div>
                </div>
            </d3fc-group>
        </div>
    );
}
