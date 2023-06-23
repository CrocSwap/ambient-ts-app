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
    MouseEvent,
} from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../utils/hooks/reduxToolkit';
import {
    formatAmountChartData,
    formatPoolPriceAxis,
} from '../../utils/numbers';
import { CandlesByPoolAndDuration } from '../../utils/state/graphDataSlice';
import {
    setLimitTick,
    setIsLinesSwitched,
    // setIsTokenAPrimary,
    setShouldLimitDirectionReverse,
    candleScale,
} from '../../utils/state/tradeDataSlice';
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
import { CandleData } from '../../App/functions/fetchCandleSeries';
import CandleChart from './CandleChart';
import LiquidityChart from './Liquidity/LiquidityChart';
import { scaleData } from '../Trade/TradeCharts/TradeCandleStickChart';
import VolumeBarCanvas from './SubChartComponents/VolumeBarCanvas';
import RangeLineCanvas from './SubChartComponents/RangeLineCanvas';
import LimitLineCanvas from './SubChartComponents/LimitLineCanvas';
import YaxisCanvas from './SubChartComponents/Yaxis/YaxisCanvas';

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

export type crosshair = {
    x: number | Date;
    y: number | string;
};
export type chartItemStates = {
    showTvl: boolean;
    showVolume: boolean;
    showFeeRate: boolean;
    liqMode: string;
};

export type lineValue = {
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
    scaleData: scaleData | undefined;
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
    liquidityScale: d3.ScaleLinear<number, number> | undefined;
    liquidityDepthScale: d3.ScaleLinear<number, number> | undefined;
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

export const renderSubchartCrCanvas = () => {
    const feeRateCrCanvas = d3
        .select('#fee_rate_chart')
        .select('#d3CanvasCrosshair');

    if (feeRateCrCanvas) {
        const nd = feeRateCrCanvas.node() as any;
        if (nd) nd.requestRedraw();
    }

    const tvlCrCanvas = d3.select('#tvl_chart').select('#d3CanvasCrosshair');

    if (tvlCrCanvas) {
        const nd = tvlCrCanvas.node() as any;
        if (nd) nd.requestRedraw();
    }

    const tvlYaxisCanvas = d3.select('#tvl_chart').select('#y-axis-canvas_tvl');

    if (tvlYaxisCanvas) {
        const nd = tvlYaxisCanvas.node() as any;
        if (nd) nd.requestRedraw();
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function standardDeviation(arr: any, usePopulation = false) {
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
}

export function fillLiqAdvanced(
    standardDeviation: number,
    scaleData: any,
    liquidityData: any,
) {
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
}

export default function Chart(props: propsIF) {
    const {
        isTokenABase,
        denomInBase,
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
    const { handlePulseAnimation } = useContext(TradeTableContext);

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

    const [liqDataHoverEvent, setLiqDataHoverEvent] = useState<
        MouseEvent<HTMLDivElement> | undefined
    >(undefined);
    const [mouseLeaveEvent, setMouseLeaveEvent] =
        useState<MouseEvent<HTMLDivElement>>();

    const lineSellColor = 'rgba(115, 113, 252)';
    const lineBuyColor = 'rgba(205, 193, 255)';

    const { showFeeRate, showTvl, showVolume, liqMode } = props.chartItemStates;

    const poolPriceDisplay = poolPriceWithoutDenom
        ? isDenomBase && poolPriceWithoutDenom
            ? 1 / poolPriceWithoutDenom
            : poolPriceWithoutDenom ?? 0
        : 0;

    const d3Container = useRef<HTMLInputElement | null>(null);

    const d3CanvasCrosshair = useRef<HTMLInputElement | null>(null);
    const d3CanvasMarketLine = useRef<HTMLInputElement | null>(null);
    const d3CanvasMain = useRef<HTMLInputElement | null>(null);

    const d3Xaxis = useRef<HTMLInputElement | null>(null);
    const dispatch = useAppDispatch();

    const location = useLocation();

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

    const [market, setMarket] = useState<lineValue[]>([
        {
            name: 'Market Value',
            value: 0,
        },
    ]);

    // Axes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [xAxis, setXaxis] = useState<any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [boundaries, setBoundaries] = useState<any>();

    // Rules
    const [zoomAndYdragControl, setZoomAndYdragControl] = useState();

    const [isLineDrag, setIsLineDrag] = useState(false);
    const [isChartZoom, setIsChartZoom] = useState(false);

    // Data
    const [crosshairData, setCrosshairData] = useState<crosshair[]>([
        { x: 0, y: 0 },
    ]);

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
    const [liqTooltip, setLiqTooltip] =
        useState<d3.Selection<HTMLDivElement, unknown, null, undefined>>();
    const [crosshairActive, setCrosshairActive] = useState<string>('chart');

    const [crosshairVerticalCanvas, setCrosshairVerticalCanvas] =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        useState<any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [crosshairHorizontal, setCrosshairHorizontal] = useState<any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [marketLine, setMarketLine] = useState<any>();

    // NoGoZone Joins
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [noGoZoneBoudnaries, setNoGoZoneBoudnaries] = useState([[0, 0]]);

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
    const [bandwidth, setBandwidth] = useState(5);
    const [mainCanvasBoundingClientRect, setMainCanvasBoundingClientRect] =
        useState<any>();

    const [yAxisWidth, setYaxisWidth] = useState('4rem');

    const [
        isOnCandleOrVolumeMouseLocation,
        setIsOnCandleOrVolumeMouseLocation,
    ] = useState(false);

    const [checkLimitOrder, setCheckLimitOrder] = useState<boolean>(false);

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

    useEffect(() => {
        setRescale(true);
    }, [denomInBase]);

    const render = useCallback(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const nd = d3.select('#d3fc_group').node() as any;
        if (nd) nd.requestRedraw();
    }, []);

    const canUserDragRange = useMemo<boolean>(() => {
        if (
            mouseLocationY &&
            (location.pathname.includes('pool') ||
                location.pathname.includes('reposition')) &&
            !(!tradeData.advancedMode && simpleRangeWidth === 100) &&
            scaleData
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
        if (
            mouseLocationY &&
            location.pathname.includes('/limit') &&
            scaleData
        ) {
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

    useEffect(() => {
        setRescale(true);
    }, [location.pathname, period]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const snapForCandle = (point: any, filtered: Array<CandleData>) => {
        if (scaleData) {
            if (point == undefined) return [];
            const xScale = scaleData?.xScale;

            if (filtered.length > 1) {
                const nearest = minimum(filtered, (d: CandleData) =>
                    Math.abs(point.offsetX - xScale(d.time * 1000)),
                )[1];
                return nearest;
            }
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
                                event.sourceEvent.type !== 'dblclick' &&
                                scaleData
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

                                    if (liqTooltip) {
                                        liqTooltip
                                            .style(
                                                'top',
                                                topPlacement > 500
                                                    ? 500
                                                    : (topPlacement < 115
                                                          ? 115
                                                          : topPlacement) +
                                                          'px',
                                            )
                                            .style(
                                                'left',
                                                event.sourceEvent.offsetX -
                                                    80 +
                                                    'px',
                                            );
                                    }
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
                                            liquidityData,
                                        );
                                    }
                                }

                                clickedForLine = true;
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

                        showLatestActive();

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

                const xAxisZoom = d3
                    .zoom()
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
                        render();

                        setZoomAndYdragControl(event);
                    })
                    .on('end', () => {
                        showLatestActive();
                    });

                setZoomUtils(() => {
                    return {
                        zoom: zoom,
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
        diffHashSig(scaleData?.xScale.domain()[0]),
        diffHashSig(scaleData?.xScale?.domain()[1]),
        showLatest,
        liquidityData?.liqBidData,
        simpleRangeWidth,
        ranges,
        diffHashSig(limit),
        isLineDrag,
        minTickForLimit,
        maxTickForLimit,
        canUserDragRange,
        canUserDragLimit,
    ]);

    useEffect(() => {
        IS_LOCAL_ENV && console.debug('timeframe changed');
        showLatestActive();
    }, [period]);

    const showLatestActive = () => {
        const today = new Date();

        if (today !== undefined && scaleData !== undefined) {
            if (
                !showLatest &&
                today &&
                (scaleData?.xScale.domain()[1] < today.getTime() ||
                    scaleData?.xScale.domain()[0] > today.getTime())
            ) {
                setShowLatest(true);
            } else if (
                showLatest &&
                !(scaleData?.xScale.domain()[1] < today.getTime()) &&
                !(scaleData?.xScale.domain()[0] > today.getTime())
            ) {
                setShowLatest(false);
            }
        }
    };

    useEffect(() => {
        if (scaleData !== undefined && liquidityData !== undefined) {
            if (rescale) {
                changeScale();

                if (
                    location.pathname.includes('pool') ||
                    location.pathname.includes('reposition')
                ) {
                    const liqAllBidPrices = liquidityData?.liqBidData.map(
                        (liqPrices: any) => liqPrices.liqPrices,
                    );
                    const liqBidDeviation = standardDeviation(liqAllBidPrices);

                    fillLiqAdvanced(liqBidDeviation, scaleData, liquidityData);
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
    // set default limit tick
    useEffect(() => {
        if (tradeData.limitTick && Math.abs(tradeData.limitTick) === Infinity)
            dispatch(setLimitTick(undefined));
    }, []);

    useEffect(() => {
        if (!tradeData.advancedMode && simpleRangeWidth === 100) {
            const lowTick = currentPoolPriceTick - simpleRangeWidth * 100;
            const highTick = currentPoolPriceTick + simpleRangeWidth * 100;

            const pinnedDisplayPrices = getPinnedPriceValuesFromTicks(
                isDenomBase,
                baseTokenDecimals,
                quoteTokenDecimals,
                lowTick,
                highTick,
                lookupChain(chainId).gridSize,
            );

            const low = 0;
            const high = parseFloat(
                pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated,
            );
            setRanges(() => {
                const newTargets = [
                    {
                        name: 'Min',
                        value: low,
                    },
                    {
                        name: 'Max',
                        value: high,
                    },
                ];

                return newTargets;
            });
        }
    }, [denomInBase]);

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
    }, [location, denomInBase]);

    useEffect(() => {
        if (
            (location.pathname.includes('pool') ||
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

            fillLiqAdvanced(liqBidDeviation, scaleData, liquidityData);
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

            const canvas = d3
                .select(d3CanvasMain.current)
                .select('canvas')
                .node() as any;

            const rectCanvas = canvas.getBoundingClientRect();

            let oldRangeMinValue: number | undefined = undefined;
            let oldRangeMaxValue: number | undefined = undefined;

            const dragRange = d3
                .drag()
                .on('start', (event) => {
                    setCrosshairActive('none');
                    document.addEventListener('keydown', cancelDragEvent);
                    d3.select(d3CanvasMain.current).style('cursor', 'none');

                    d3.select('#y-axis-canvas').style('cursor', 'none');

                    const advancedValue = scaleData?.yScale.invert(
                        event.sourceEvent.clientY - rectCanvas.top,
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
                                event.sourceEvent.clientY - rectCanvas.top,
                            ) >= liquidityData?.topBoundary
                                ? liquidityData?.topBoundary
                                : scaleData?.yScale.invert(
                                      event.sourceEvent.clientY -
                                          rectCanvas.top,
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

                                    rangeWidthPercentage = Math.floor(
                                        Math.abs(
                                            pinnedTick - currentPoolPriceTick,
                                        ) / 100,
                                    );

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

                                    rangeWidthPercentage = Math.floor(
                                        Math.abs(
                                            currentPoolPriceTick - pinnedTick,
                                        ) / 100,
                                    );

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
                                event.sourceEvent.clientY - rectCanvas.top,
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
                                                advancedValue.toString(),
                                                lookupChain(chainId).gridSize,
                                            );
                                    } else {
                                        pinnedDisplayPrices =
                                            getPinnedPriceValuesFromDisplayPrices(
                                                denomInBase,
                                                baseTokenDecimals,
                                                quoteTokenDecimals,
                                                low.toString(),
                                                advancedValue.toString(),
                                                lookupChain(chainId).gridSize,
                                            );
                                    }
                                } else {
                                    pinnedDisplayPrices =
                                        getPinnedPriceValuesFromDisplayPrices(
                                            denomInBase,
                                            baseTokenDecimals,
                                            quoteTokenDecimals,
                                            advancedValue.toString(),
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

                    d3.select('#y-axis-canvas').style('cursor', 'default');

                    setCrosshairActive('none');
                });

            let oldLimitValue: number | undefined = undefined;
            const dragLimit = d3
                .drag()
                .on('start', () => {
                    d3.select(d3CanvasMain.current).style('cursor', 'none');

                    document.addEventListener('keydown', cancelDragEvent);

                    d3.select('#y-axis-canvas').style('cursor', 'none');

                    oldLimitValue = limit[0].value;
                })
                .on('drag', function (event) {
                    if (!cancelDrag) {
                        setCrosshairActive('none');
                        setIsLineDrag(true);

                        newLimitValue = scaleData?.yScale.invert(
                            event.sourceEvent.clientY - rectCanvas.top,
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

                    d3.select('#y-axis-canvas').style('cursor', 'default');

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
            const canvas = d3
                .select(d3Xaxis.current)
                .select('canvas')
                .node() as HTMLCanvasElement;
            const context = canvas.getContext('2d') as CanvasRenderingContext2D;

            d3.select(d3Xaxis.current).on('draw', function () {
                if (xAxis && scaleData) {
                    setCanvasResolution(canvas);
                    drawXaxis(context, scaleData?.xScale, 3);
                }
            });

            renderCanvasArray([d3CanvasCrosshair, d3Xaxis]);
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
        bandwidth,
        reset,
        sellOrderStyle,
        checkLimitOrder,
        location,
        crosshairActive,
    ]);

    useEffect(() => {
        if (xAxis && zoomUtils && zoomUtils?.zoom && zoomUtils?.xAxisZoom) {
            d3.select(d3CanvasMain.current).call(zoomUtils?.zoom);
            d3.select(d3Xaxis.current).call(zoomUtils?.xAxisZoom);

            if (location.pathname.includes('market')) {
                d3.select(d3CanvasMain.current).on('.drag', null);
            }
            if (
                location.pathname.includes('pool') ||
                location.pathname.includes('reposition')
            ) {
                d3.select(d3CanvasMain.current).call(dragRange);
            }
            if (location.pathname.includes('/limit')) {
                d3.select(d3CanvasMain.current).call(dragLimit);
            }
            renderCanvasArray([d3CanvasMain]);
        }
    }, [
        location.pathname,
        zoomUtils,
        dragLimit,
        dragRange,
        d3.select('#range-line-canvas')?.node(),
        d3.select('#limit-line-canvas')?.node(),
    ]);

    const drawXaxis = (context: any, xScale: any, Y: any) => {
        if (scaleData) {
            const _width = 65; // magic number of pixels to blur surrounding price
            const tickSize = 6;

            scaleData?.xScaleTime.domain(xScale.domain());

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
                dateCrosshair = moment(crosshairData[0].x).format(
                    'MMM DD HH:mm',
                );
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
        }
    };

    // Horizontal Lines
    useEffect(() => {
        if (scaleData !== undefined) {
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

            setMarketLine(() => {
                return marketLine;
            });
        }
    }, [
        diffHashSig(scaleData),
        liquidityDepthScale,
        liquidityScale,
        isUserConnected,
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

    const onClickRange = async (event: any) => {
        if (scaleData) {
            let newRangeValue: any;

            const low = ranges.filter((target: any) => target.name === 'Min')[0]
                .value;
            const high = ranges.filter(
                (target: any) => target.name === 'Max',
            )[0].value;

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

                        rangeWidthPercentage = Math.floor(
                            Math.abs(tickValue - currentPoolPriceTick) / 100,
                        );

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

                        rangeWidthPercentage = Math.floor(
                            Math.abs(currentPoolPriceTick - tickValue) / 100,
                        );

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
                                ? Number(
                                      pinnedDisplayPrices.pinnedMaxPriceDisplay,
                                  )
                                : pinnedMaxPriceDisplayTruncated;
                        } else {
                            newTargets.filter(
                                (target: any) => target.name === 'Min',
                            )[0].value = isScientific
                                ? Number(
                                      pinnedDisplayPrices.pinnedMinPriceDisplay,
                                  )
                                : pinnedMinPriceDisplayTruncated;
                        }

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
        if (d3CanvasMain) {
            const canvasDiv = d3.select(d3CanvasMain.current) as any;

            const resizeObserver = new ResizeObserver(() => {
                const canvas = canvasDiv.select('canvas').node() as any;
                setMainCanvasBoundingClientRect(canvas.getBoundingClientRect());
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
                        location.pathname.includes('pool') ||
                        location.pathname.includes('reposition')
                    ) {
                        if (
                            simpleRangeWidth !== 100 ||
                            tradeData.advancedMode
                        ) {
                            const min = ranges.filter(
                                (target: any) => target.name === 'Min',
                            )[0].value;
                            const max = ranges.filter(
                                (target: any) => target.name === 'Max',
                            )[0].value;

                            const low = Math.min(min, max, minYBoundary);

                            const high = Math.max(min, max, maxYBoundary);

                            const bufferForRange = Math.abs(
                                (low - high) /
                                    (simpleRangeWidth !== 100 ? 6 : 90),
                            );

                            const domain = [
                                Math.min(low, high) - bufferForRange,
                                Math.max(low, high) + bufferForRange / 2,
                            ];

                            scaleData?.yScale.domain(domain);
                        } else {
                            const lowTick =
                                currentPoolPriceTick - simpleRangeWidth * 100;
                            const highTick =
                                currentPoolPriceTick + simpleRangeWidth * 100;

                            const pinnedDisplayPrices =
                                getPinnedPriceValuesFromTicks(
                                    isDenomBase,
                                    baseTokenDecimals,
                                    quoteTokenDecimals,
                                    lowTick,
                                    highTick,
                                    lookupChain(chainId).gridSize,
                                );

                            const low = 0;
                            const high = parseFloat(
                                pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated,
                            );

                            const bufferForRange = Math.abs(
                                (low - high) /
                                    (simpleRangeWidth !== 100 ? 6 : 90),
                            );

                            const domain = [
                                Math.min(low, high) - bufferForRange,
                                Math.max(low, high) + bufferForRange / 2,
                            ];

                            scaleData?.yScale.domain(domain);
                        }
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

                    render();
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
        if (scaleData !== undefined) {
            drawChart(scaleData, selectedDate);
        }
    }, [
        denomInBase,
        selectedDate,
        isSidebarOpen,
        liqMode,
        location.pathname,
        tradeData.advancedMode,
    ]);

    const candleOrVolumeDataHoverStatus = (event: any) => {
        const lastDate = scaleData?.xScale.invert(
            event.offsetX + bandwidth / 2,
        ) as number;
        const startDate = scaleData?.xScale.invert(
            event.offsetX - bandwidth / 2,
        ) as number;

        let avaregeHeight = 1;
        const filtered: Array<CandleData> = [];
        let longestValue = 0;

        const xmin = scaleData?.xScale.domain()[0] as number;
        const xmax = scaleData?.xScale.domain()[1] as number;

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
        const yValue = scaleData?.yScale.invert(event.offsetY) as number;

        const yValueVolume = scaleData?.volumeScale.invert(
            event.offsetY / 2,
        ) as number;
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
        const domainMin = scaleData?.yScale.domain()[0] as number;
        const domainMax = scaleData?.yScale.domain()[1] as number;
        const scale = Math.abs(domainMax - domainMin);

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
        if (scaleData) {
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

                renderCanvasArray([d3CanvasCrosshair]);
            }
            if (liqMode !== 'none') {
                setLiqDataHoverEvent(event);
            }

            const { isHoverCandleOrVolumeData } =
                candleOrVolumeDataHoverStatus(event);
            setIsOnCandleOrVolumeMouseLocation(isHoverCandleOrVolumeData);
        }
    };

    // Draw Chart
    const drawChart = useCallback(
        (scaleData: any, selectedDate: any) => {
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
                    (location.pathname.includes('pool') ||
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

            d3.select(d3Xaxis.current).on('mouseover', (event: any) => {
                d3.select(event.currentTarget).style('cursor', 'col-resize');
                setCrosshairActive('none');
            });

            render();

            d3.select(d3Container.current).on(
                'mouseleave',
                (event: MouseEvent<HTMLDivElement>) => {
                    setCrosshairActive('none');
                    setMouseLeaveEvent(event);
                    setLiqDataHoverEvent(undefined);
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
                },
            );

            const mouseLeaveCanvas = () => {
                setCrosshairActive('none');
            };

            d3.select(d3CanvasMain.current).on('mouseleave', (event: any) => {
                mouseLeaveCanvas();
                setLiqDataHoverEvent(undefined);
                setMouseLeaveEvent(event);
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

    const rangeCanvasProps = {
        scaleData: scaleData,
        tokenA: tokenA,
        tokenB: tokenB,
        isDenomBase: isDenomBase,
        rescale: rescale,
        currentPoolPriceTick: currentPoolPriceTick,
        poolPriceDisplay: poolPriceDisplay,
        changeScale: changeScale,
        isTokenABase: isTokenABase,
        chainId: chainId,
        topBoundary: liquidityData?.topBoundary,
        d3Container: d3Container,
        period: period,
        ranges: ranges,
        setRanges: setRanges,
        liqMode: liqMode,
        liqTransitionPointforCurve: liquidityData?.liqTransitionPointforCurve,
        liqTransitionPointforDepth: liquidityData?.liqTransitionPointforDepth,
        lineSellColor: lineSellColor,
        lineBuyColor: lineBuyColor,
    };

    const limitCanvasProps = {
        scaleData,
        isDenomBase,
        period,
        lineSellColor,
        lineBuyColor,
        isUserConnected,
        setLimit,
        limit,
        poolPriceDisplay,
        sellOrderStyle,
        checkLimitOrder,
        setCheckLimitOrder,
    };

    const yAxisCanvasProps = {
        scaleData,
        market,
        liqMode,
        liqTransitionPointforCurve: liquidityData?.liqTransitionPointforCurve,
        liqTransitionPointforDepth: liquidityData?.liqTransitionPointforDepth,
        lineSellColor,
        lineBuyColor,
        ranges,
        limit,
        isAmbientOrAdvanced: simpleRangeWidth !== 100 || tradeData.advancedMode,
        checkLimitOrder,
        sellOrderStyle,
        crosshairActive,
        crosshairData,
        reset,
        isLineDrag,
        setZoomAndYdragControl,
        setRescale,
        setMarketLineValue,
        render,
        liquidityData,
        dragRange,
        dragLimit,
        setCrosshairActive,
        denomInBase,
        setYaxisWidth,
        yAxisWidth,
    };

    return (
        <div
            ref={d3Container}
            className='main_layout_chart'
            data-testid={'chart'}
            id={'chartContainer'}
        >
            <d3fc-group id='d3fc_group' auto-resize>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                    }}
                >
                    {scaleData && (
                        <div className='chart_grid'>
                            <CandleChart
                                chartItemStates={props.chartItemStates}
                                data={unparsedCandleData}
                                denomInBase={denomInBase}
                                lastCandleData={lastCandleData}
                                period={period}
                                scaleData={scaleData}
                                selectedDate={selectedDate}
                                showLatest={showLatest}
                                setBandwidth={setBandwidth}
                            />

                            <VolumeBarCanvas
                                scaleData={scaleData}
                                volumeData={unparsedCandleData}
                                denomInBase={denomInBase}
                                selectedDate={selectedDate}
                                showVolume={showVolume}
                            />

                            <LiquidityChart
                                liqMode={liqMode}
                                liquidityData={liquidityData}
                                liquidityScale={liquidityScale}
                                scaleData={scaleData}
                                liquidityDepthScale={liquidityDepthScale}
                                ranges={ranges}
                                liqDataHoverEvent={liqDataHoverEvent}
                                liqTooltip={liqTooltip}
                                mouseLeaveEvent={mouseLeaveEvent}
                                isActiveDragOrZoom={isChartZoom || isLineDrag}
                                mainCanvasBoundingClientRect={
                                    mainCanvasBoundingClientRect
                                }
                            />

                            <d3fc-canvas
                                ref={d3CanvasCrosshair}
                                className='cr-canvas'
                            ></d3fc-canvas>
                            <d3fc-canvas
                                ref={d3CanvasMarketLine}
                                className='market-line-canvas'
                            ></d3fc-canvas>

                            <RangeLineCanvas {...rangeCanvasProps} />

                            <LimitLineCanvas {...limitCanvasProps} />

                            <d3fc-canvas
                                ref={d3CanvasMain}
                                className='main-canvas'
                            ></d3fc-canvas>

                            <YaxisCanvas {...yAxisCanvasProps} />
                        </div>
                    )}
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
