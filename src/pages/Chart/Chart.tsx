import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import {
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
import { CandlesByPoolAndDuration } from '../../utils/state/graphDataSlice';
import {
    setLimitTick,
    setIsLinesSwitched,
    // setIsTokenAPrimary,
    setShouldLimitDirectionReverse,
    candleScale,
    candleDomain,
} from '../../utils/state/tradeDataSlice';

import { PoolContext } from '../../contexts/PoolContext';
import './Chart.css';
import { pinTickLower, pinTickUpper, tickToPrice } from '@crocswap-libs/sdk';
import {
    getPinnedPriceValuesFromDisplayPrices,
    getPinnedPriceValuesFromTicks,
    getPinnedTickFromDisplayPrice,
} from '../Trade/Range/rangeFunctions';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import useHandleSwipeBack from '../../utils/hooks/useHandleSwipeBack';
import { candleTimeIF } from '../../App/hooks/useChartSettings';
import { IS_LOCAL_ENV } from '../../constants';
import {
    diffHashSig,
    diffHashSigChart,
    diffHashSigScaleData,
} from '../../utils/functions/diffHashSig';
import { CandleContext } from '../../contexts/CandleContext';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';
import { SidebarContext } from '../../contexts/SidebarContext';
import { TradeTableContext } from '../../contexts/TradeTableContext';
import { RangeContext } from '../../contexts/RangeContext';
import { CandleData } from '../../App/functions/fetchCandleSeries';
import CandleChart from './Candle/CandleChart';
import LiquidityChart from './Liquidity/LiquidityChart';
import VolumeBarCanvas from './Volume/VolumeBarCanvas';
import { LiquidityDataLocal } from '../Trade/TradeCharts/TradeCharts';
import { createIndicatorLine } from './ChartUtils/indicatorLineSeries';
import { CSSTransition } from 'react-transition-group';
import Divider from '../../components/Global/Divider/Divider';
import YAxisCanvas from './Axes/yAxis/YaxisCanvas';
import TvlChart from './Tvl/TvlChart';
import LimitLineChart from './LimitLine/LimitLineChart';
import FeeRateChart from './FeeRate/FeeRateChart';
import RangeLinesChart from './RangeLine/RangeLinesChart';
import {
    CandleDataChart,
    SubChartValue,
    bandLineData,
    chartItemStates,
    crosshair,
    defaultCandleBandwith,
    drawDataHistory,
    fillLiqAdvanced,
    lineData,
    lineValue,
    liquidityChartData,
    renderCanvasArray,
    renderSubchartCrCanvas,
    scaleData,
    selectedDrawnData,
    setCanvasResolution,
    standardDeviation,
} from './ChartUtils/chartUtils';
import { Zoom } from './ChartUtils/zoom';
import XAxisCanvas from './Axes/xAxis/XaxisCanvas';
import useMediaQuery from '../../utils/hooks/useMediaQuery';
import useDebounce from '../../App/hooks/useDebounce';
import DrawCanvas from './Draw/DrawCanvas/DrawCanvas';
import {
    createLinearLineSeries,
    distanceToLine,
} from './Draw/DrawCanvas/LinearLineSeries';
import { useUndoRedo } from './ChartUtils/useUndoRedo';
import { createPointsOfBandLine } from './Draw/DrawCanvas/BandArea';
import { checkCricleLocation, createCircle } from './ChartUtils/circle';
import DragCanvas from './Draw/DrawCanvas/DragCanvas';
import Toolbar from './Draw/Toolbar/Toolbar';

interface propsIF {
    isTokenABase: boolean;
    liquidityData: liquidityChartData | undefined;
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
    drawnShapeHistory: drawDataHistory[];
    setDrawnShapeHistory: React.Dispatch<
        React.SetStateAction<drawDataHistory[]>
    >;
    isDrawActive: boolean;
    setIsDrawActive: React.Dispatch<React.SetStateAction<boolean>>;
    activeDrawingType: string;
    setActiveDrawingType: React.Dispatch<React.SetStateAction<string>>;
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
        drawnShapeHistory,
        setDrawnShapeHistory,
        isDrawActive,
        setIsDrawActive,
        activeDrawingType,
        setActiveDrawingType,
    } = props;

    const {
        sidebar: { isOpen: isSidebarOpen },
    } = useContext(SidebarContext);
    const { chainData } = useContext(CrocEnvContext);
    const chainId = chainData.chainId;
    const { setCandleDomains, setCandleScale, timeOfEndCandle } =
        useContext(CandleContext);
    const { pool, poolPriceDisplay: poolPriceWithoutDenom } =
        useContext(PoolContext);

    const [isUpdatingShape, setIsUpdatingShape] = useState(false);

    const [isDragActive, setIsDragActive] = useState(false);

    const [localCandleDomains, setLocalCandleDomains] = useState<candleDomain>({
        lastCandleDate: undefined,
        domainBoundry: undefined,
    });
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

    const [isChartZoom, setIsChartZoom] = useState(false);

    const [chartHeights, setChartHeights] = useState(0);
    const { isLoggedIn: isUserConnected } = useAppSelector(
        (state) => state.userData,
    );

    const tradeData = useAppSelector((state) => state.tradeData);

    const [minTickForLimit, setMinTickForLimit] = useState<number>(0);
    const [maxTickForLimit, setMaxTickForLimit] = useState<number>(0);

    const period = unparsedData.duration;

    const isDenomBase = tradeData.isDenomBase;
    const isBid = tradeData.isTokenABase;
    const side =
        (isDenomBase && !isBid) || (!isDenomBase && isBid) ? 'buy' : 'sell';
    const sellOrderStyle = side === 'sell' ? 'order_sell' : 'order_buy';

    const [chartMousemoveEvent, setChartMousemoveEvent] = useState<
        MouseEvent<HTMLDivElement> | undefined
    >(undefined);
    const [mouseLeaveEvent, setMouseLeaveEvent] =
        useState<MouseEvent<HTMLDivElement>>();
    const [chartZoomEvent, setChartZoomEvent] = useState('');

    const lineSellColor = 'rgba(115, 113, 252)';
    const lineBuyColor = 'rgba(205, 193, 255)';

    const { showFeeRate, showTvl, showVolume, liqMode } = props.chartItemStates;

    const poolPriceDisplay = poolPriceWithoutDenom
        ? isDenomBase && poolPriceWithoutDenom
            ? 1 / poolPriceWithoutDenom
            : poolPriceWithoutDenom ?? 0
        : 0;

    const d3Container = useRef<HTMLDivElement | null>(null);

    const d3CanvasCrosshair = useRef<HTMLCanvasElement | null>(null);
    const d3CanvasMarketLine = useRef<HTMLCanvasElement | null>(null);
    const d3CanvasMain = useRef<HTMLDivElement | null>(null);
    const d3CanvasCrIndicator = useRef<HTMLInputElement | null>(null);

    const dispatch = useAppDispatch();

    const location = useLocation();

    const simpleRangeWidth = rangeSimpleRangeWidth;
    const setSimpleRangeWidth = setRangeSimpleRangeWidth;

    const { tokenA, tokenB } = tradeData;
    const tokenADecimals = tokenA.decimals;
    const tokenBDecimals = tokenB.decimals;
    const baseTokenDecimals = isTokenABase ? tokenADecimals : tokenBDecimals;
    const quoteTokenDecimals = !isTokenABase ? tokenADecimals : tokenBDecimals;

    const [isShowLastCandleTooltip, setIsShowLastCandleTooltip] =
        useState(false);
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

    const [limit, setLimit] = useState<number>(0);

    const [market, setMarket] = useState<number>(0);

    const [boundaries, setBoundaries] = useState<boolean>();

    const [isLineDrag, setIsLineDrag] = useState(false);

    // Data
    const [crosshairData, setCrosshairData] = useState<crosshair[]>([
        { x: 0, y: 0 },
    ]);

    // Draw
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [lineSeries, setLineSeries] = useState<any>();

    const [selectedDrawnShape, setSelectedDrawnShape] = useState<
        selectedDrawnData | undefined
    >(undefined);

    const [hoveredDrawnShape, setHoveredDrawnShape] = useState<
        selectedDrawnData | undefined
    >(undefined);

    const [isShapeSelected, setIsShapeSelected] = useState(false);
    const { undo, redo } = useUndoRedo(drawnShapeHistory, setDrawnShapeHistory);

    const mobileView = useMediaQuery('(max-width: 600px)');

    const [isToolbarOpen, setIsToolbarOpen] = useState(true);

    const unparsedCandleData = useMemo(() => {
        const data = unparsedData.candles
            .sort((a, b) => b.time - a.time)
            .map((item) => ({
                ...item,
                isFakeData: false,
            }));
        if (poolPriceWithoutDenom && data && data.length > 0) {
            const fakeData = {
                time: data[0].time + period,
                invMinPriceExclMEVDecimalCorrected:
                    data[0].invPriceOpenExclMEVDecimalCorrected,
                maxPriceExclMEVDecimalCorrected:
                    data[0].priceOpenExclMEVDecimalCorrected,
                invMaxPriceExclMEVDecimalCorrected: 1 / poolPriceWithoutDenom,
                minPriceExclMEVDecimalCorrected: poolPriceWithoutDenom,
                invPriceOpenExclMEVDecimalCorrected:
                    data[0].invPriceOpenExclMEVDecimalCorrected,
                priceOpenExclMEVDecimalCorrected:
                    data[0].priceOpenExclMEVDecimalCorrected,
                invPriceCloseExclMEVDecimalCorrected: 1 / poolPriceWithoutDenom,
                priceCloseExclMEVDecimalCorrected: poolPriceWithoutDenom,
                period: period,
                tvlData: {
                    time: data[0].time,
                    tvl: data[0].tvlData.tvl,
                },
                volumeUSD: 0,
                averageLiquidityFee: data[0].averageLiquidityFee,
                minPriceDecimalCorrected:
                    data[0].priceOpenExclMEVDecimalCorrected,
                maxPriceDecimalCorrected: 0,
                priceOpenDecimalCorrected:
                    data[0].priceOpenExclMEVDecimalCorrected,
                priceCloseDecimalCorrected:
                    data[0].priceOpenExclMEVDecimalCorrected,
                invMinPriceDecimalCorrected:
                    data[0].invPriceOpenExclMEVDecimalCorrected,
                invMaxPriceDecimalCorrected: 0,
                invPriceOpenDecimalCorrected:
                    data[0].invPriceOpenExclMEVDecimalCorrected,
                invPriceCloseDecimalCorrected:
                    data[0].invPriceOpenExclMEVDecimalCorrected,
                isCrocData: false,
                isFakeData: true,
            };

            // added candle for pool price market price match
            if (!data[0].isFakeData) {
                data.unshift(fakeData);
            } else {
                data[0] = fakeData;
            }
        }

        return data;
    }, [diffHashSigChart(unparsedData.candles), poolPriceWithoutDenom]);

    const calculateVisibleCandles = (
        scaleData: scaleData | undefined,
        unparsedCandleData: CandleDataChart[],
        period: number,
        mobileView: boolean,
    ) => {
        const numberOfCandlesToDisplay = mobileView ? 300 : 100;

        if (scaleData) {
            const xmin =
                scaleData.xScale.domain()[0] -
                period * 1000 * numberOfCandlesToDisplay;
            const xmax =
                scaleData.xScale.domain()[1] +
                period * 1000 * numberOfCandlesToDisplay;

            const filtered = unparsedCandleData.filter(
                (data: CandleDataChart) =>
                    data.time * 1000 >= xmin && data.time * 1000 <= xmax,
            );

            return filtered;
        }
        return unparsedCandleData;
    };

    const visibleCandleData = useMemo(() => {
        return calculateVisibleCandles(
            scaleData,
            unparsedCandleData,
            period,
            mobileView,
        );
    }, [diffHashSigScaleData(scaleData), unparsedCandleData]);

    const lastCandleData = unparsedCandleData?.reduce(function (prev, current) {
        return prev.time > current.time ? prev : current;
    });

    const firstCandleData = unparsedCandleData?.reduce(function (
        prev,
        current,
    ) {
        return prev.time < current.time ? prev : current;
    });

    const [lastCandleDataCenter, setLastCandleDataCenter] = useState(0);
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
    const [liqTooltip, setLiqTooltip] =
        useState<d3.Selection<HTMLDivElement, unknown, null, undefined>>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [xAxisTooltip, setXaxisTooltip] = useState<any>();
    const [crosshairActive, setCrosshairActive] = useState<string>('none');
    const [isCrDataIndActive, setIsCrDataIndActive] = useState<boolean>(false);
    const [xAxisActiveTooltip, setXaxisActiveTooltip] = useState('');

    // Crosshairs
    const [crosshairVerticalCanvas, setCrosshairVerticalCanvas] =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        useState<any>();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [crDataIndicator, setCrDataIndicator] = useState<any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [crosshairHorizontal, setCrosshairHorizontal] = useState<any>();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [marketLine, setMarketLine] = useState<any>();

    // NoGoZone
    const [noGoZoneBoudnaries, setNoGoZoneBoudnaries] = useState([[0, 0]]);

    const [mainZoom, setMainZoom] =
        useState<d3.ZoomBehavior<Element, unknown>>();

    // Drag
    const initialDragState: d3.DragBehavior<
        d3.DraggedElementBaseType,
        unknown,
        d3.SubjectPosition
    > | null = null;
    const [dragRange, setDragRange] = useState<d3.DragBehavior<
        d3.DraggedElementBaseType,
        unknown,
        d3.SubjectPosition
    > | null>(initialDragState);
    const [dragLimit, setDragLimit] = useState<d3.DragBehavior<
        d3.DraggedElementBaseType,
        unknown,
        d3.SubjectPosition
    > | null>(initialDragState);

    const [bandwidth, setBandwidth] = useState(5);
    const [mainCanvasBoundingClientRect, setMainCanvasBoundingClientRect] =
        useState<DOMRect | undefined>();

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

    const debouncedGetNewCandleDataRight = useDebounce(localCandleDomains, 500);

    const zoomBase = useMemo(() => {
        return new Zoom(setLocalCandleDomains, period);
    }, [period]);

    useEffect(() => {
        useHandleSwipeBack(d3Container);
    }, [d3Container === null]);

    useEffect(() => {
        setCandleDomains(localCandleDomains);
    }, [debouncedGetNewCandleDataRight]);

    // calculates time croc icon will be found
    const lastCrDate = useMemo(() => {
        const nowDate = new Date();

        const lastCrocDate = Math.max(
            ...unparsedCandleData
                .filter((item) => {
                    return (
                        item.tvlData.tvl === 0 &&
                        item.time * 1000 < nowDate.getTime()
                    );
                })
                .map((o) => {
                    return o.time;
                }),
        );

        if (lastCrocDate) {
            return lastCrocDate * 1000;
        }
    }, [diffHashSigChart(unparsedCandleData)]);

    const render = useCallback(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const nd = d3.select('#d3fc_group').node() as any;
        if (nd) nd.requestRedraw();
    }, []);

    // controls the distance of the mouse to the range lines, if close, activates the dragRange event
    const canUserDragRange = useMemo<boolean>(() => {
        if (
            chartMousemoveEvent &&
            mainCanvasBoundingClientRect &&
            (location.pathname.includes('pool') ||
                location.pathname.includes('reposition')) &&
            !(!tradeData.advancedMode && simpleRangeWidth === 100) &&
            scaleData
        ) {
            const offsetY =
                chartMousemoveEvent.clientY - mainCanvasBoundingClientRect?.top;
            const mousePlacement = scaleData?.yScale.invert(offsetY);
            const lineBuffer =
                (scaleData?.yScale.domain()[1] -
                    scaleData?.yScale.domain()[0]) /
                30;

            const rangeLowLineValue = ranges.filter(
                (target: lineValue) => target.name === 'Min',
            )[0].value;
            const rangeHighLineValue = ranges.filter(
                (target: lineValue) => target.name === 'Max',
            )[0].value;

            return (
                (mousePlacement < rangeLowLineValue + lineBuffer &&
                    mousePlacement > rangeLowLineValue - lineBuffer) ||
                (mousePlacement < rangeHighLineValue + lineBuffer &&
                    mousePlacement > rangeHighLineValue - lineBuffer)
            );
        }

        return false;
    }, [
        ranges,
        chartMousemoveEvent,
        mainCanvasBoundingClientRect,
        location.pathname,
        tradeData.advancedMode,
        simpleRangeWidth,
    ]);

    // controls the distance of the mouse to the limit line, if close, activates the dragLimit event
    const canUserDragLimit = useMemo<boolean>(() => {
        if (
            chartMousemoveEvent &&
            mainCanvasBoundingClientRect &&
            location.pathname.includes('/limit') &&
            scaleData
        ) {
            const lineBuffer =
                (scaleData?.yScale.domain()[1] -
                    scaleData?.yScale.domain()[0]) /
                30;

            const offsetY =
                chartMousemoveEvent.clientY - mainCanvasBoundingClientRect?.top;

            const mousePlacement = scaleData?.yScale.invert(offsetY);
            const limitLineValue = limit;

            return (
                mousePlacement < limitLineValue + lineBuffer &&
                mousePlacement > limitLineValue - lineBuffer
            );
        }
        return false;
    }, [
        limit,
        chartMousemoveEvent,
        mainCanvasBoundingClientRect,
        location.pathname,
    ]);

    const canUserDragDrawnShape = useMemo<boolean>(() => {
        if (
            chartMousemoveEvent &&
            mainCanvasBoundingClientRect &&
            scaleData &&
            hoveredDrawnShape
        ) {
            return true;
        }

        return false;
    }, [hoveredDrawnShape, chartMousemoveEvent, mainCanvasBoundingClientRect]);

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
    }, [
        canUserDragLimit,
        canUserDragRange,
        isLineDrag,
        isOnCandleOrVolumeMouseLocation,
    ]);

    useEffect(() => {
        if (isChartZoom && chartZoomEvent !== 'wheel') {
            d3.select(d3CanvasMain.current).style('cursor', 'grabbing');
        } else {
            d3.select(d3CanvasMain.current).style(
                'cursor',
                isOnCandleOrVolumeMouseLocation ? 'pointer' : 'default',
            );
        }
    }, [chartZoomEvent, isChartZoom, isOnCandleOrVolumeMouseLocation]);

    useEffect(() => {
        // auto zoom active
        setRescale(true);
    }, [location.pathname, period, denomInBase]);

    // finds candle closest to the mouse
    const snapForCandle = (point: number, filtered: Array<CandleData>) => {
        if (scaleData) {
            if (point == undefined) return [];
            if (filtered.length > 1) {
                const nearest = minimum(filtered, point)[1];
                return nearest;
            }
        }

        return filtered[0];
    };

    // calculates first fetch candle domain for time and pool change
    useEffect(() => {
        if (scaleData && !isChartZoom) {
            const xDomain = scaleData?.xScale.domain();
            const isFutureDay =
                new Date(xDomain[1]).getTime() > new Date().getTime();

            let domainMax = isFutureDay
                ? new Date().getTime()
                : new Date(xDomain[1]).getTime();

            const nCandles = Math.floor(
                (xDomain[1] - xDomain[0]) / (period * 1000),
            );

            const minDate = 1657868400; // 15 July 2022

            domainMax = domainMax < minDate ? minDate : domainMax;

            const isShowLatestCandle =
                xDomain[0] < lastCandleData?.time * 1000 &&
                lastCandleData?.time * 1000 < xDomain[1];

            setCandleScale((prev: candleScale) => {
                return {
                    isFetchForTimeframe: prev.isFetchForTimeframe,
                    lastCandleDate: Math.floor(domainMax / 1000),
                    nCandles: nCandles,
                    isShowLatestCandle: isShowLatestCandle,
                };
            });
        }
    }, [
        diffHashSigScaleData(scaleData, 'x'),
        lastCandleData,
        period,
        isChartZoom,
    ]);

    // Zoom
    useEffect(() => {
        if (
            scaleData !== undefined &&
            unparsedCandleData !== undefined &&
            !isChartZoom
        ) {
            let clickedForLine = false;
            let zoomTimeout: number | undefined = undefined;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let previousTouch: any | undefined = undefined; // event
            let previousDeltaTouch: number | undefined = undefined;
            let previousDeltaTouchLocation: number | undefined = undefined;
            const lastCandleDate = lastCandleData?.time * 1000;
            const firstCandleDate = firstCandleData?.time * 1000;

            let scrollTimeout: NodeJS.Timeout | null = null; // Declare scrollTimeout

            if (lastCandleDate && firstCandleDate) {
                d3.select(d3CanvasMain.current).on(
                    'wheel',
                    function (event) {
                        if (scrollTimeout === null) {
                            setIsChartZoom(true);
                        }

                        zoomBase.zoomWithWheel(
                            event,
                            scaleData,
                            firstCandleDate,
                            lastCandleDate,
                        );
                        render();

                        if (rescale) {
                            changeScale();
                        }

                        if (scrollTimeout) {
                            clearTimeout(scrollTimeout);
                        }
                        // check wheel end
                        scrollTimeout = setTimeout(() => {
                            setIsChartZoom(false);
                        }, 200);
                    },
                    { passive: true },
                );

                const zoom = d3
                    .zoom()
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                                previousDeltaTouchLocation =
                                    event.sourceEvent.touches[0].pageX;
                            }
                        }
                        zoomTimeout = event.sourceEvent.timeStamp;
                        if (
                            event.sourceEvent &&
                            event.sourceEvent.type !== 'dblclick'
                        ) {
                            clickedForLine = false;
                            setChartZoomEvent(event.sourceEvent.type);
                        }
                    })
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .on('zoom', (event: any) => {
                        async function newDomains() {
                            if (
                                event.sourceEvent &&
                                event.sourceEvent.type !== 'dblclick' &&
                                scaleData?.xScale
                            ) {
                                if (event.sourceEvent.type === 'touchmove') {
                                    if (event.sourceEvent.touches.length > 1) {
                                        // if a second finger touches after one finger touches it
                                        if (
                                            !previousDeltaTouch ||
                                            !previousDeltaTouchLocation
                                        ) {
                                            previousDeltaTouch = Math.hypot(
                                                event.sourceEvent.touches[0]
                                                    .pageX -
                                                    event.sourceEvent.touches[1]
                                                        .pageX,
                                                event.sourceEvent.touches[0]
                                                    .pageY -
                                                    event.sourceEvent.touches[1]
                                                        .pageY,
                                            );

                                            previousDeltaTouchLocation =
                                                event.sourceEvent.touches[0]
                                                    .pageX;
                                        }

                                        if (
                                            previousDeltaTouch &&
                                            previousDeltaTouchLocation
                                        ) {
                                            zoomBase.handlePanningMultiTouch(
                                                event.sourceEvent,
                                                scaleData,
                                                previousDeltaTouch,
                                                previousDeltaTouchLocation,
                                            );
                                        }
                                    } else {
                                        zoomBase.handlePanningOneTouch(
                                            event.sourceEvent,
                                            scaleData,
                                            previousTouch,
                                            bandwidth,
                                            firstCandleDate,
                                            lastCandleDate,
                                        );
                                    }
                                } else {
                                    zoomBase.handlePanning(
                                        event.sourceEvent,
                                        scaleData,
                                        firstCandleDate,
                                        lastCandleDate,
                                    );
                                }

                                render();

                                if (rescale) {
                                    changeScale();
                                } else {
                                    let domain = undefined;
                                    if (
                                        event.sourceEvent.type === 'touchmove'
                                    ) {
                                        domain = zoomBase.handlePanningYMobile(
                                            event.sourceEvent,
                                            scaleData,
                                            previousTouch,
                                        );
                                    } else {
                                        domain = zoomBase.handlePanningY(
                                            event.sourceEvent,
                                            scaleData,
                                        );
                                    }

                                    if (domain) {
                                        setYaxisDomain(domain[0], domain[1]);
                                    }

                                    if (
                                        tradeData.advancedMode &&
                                        liquidityData
                                    ) {
                                        const liqAllBidPrices =
                                            liquidityData?.liqBidData.map(
                                                (
                                                    liqPrices: LiquidityDataLocal,
                                                ) => liqPrices.liqPrices,
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
                            }
                        }

                        newDomains().then(() => {
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
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .on('end', (event: any) => {
                        if (event.sourceEvent.type !== 'wheel') {
                            setIsChartZoom(false);
                            setChartZoomEvent('');
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
                                // fires click event when zoom takes too short
                                if (
                                    zoomTimeout &&
                                    event.sourceEvent.timeStamp - zoomTimeout <
                                        1
                                ) {
                                    const {
                                        isHoverCandleOrVolumeData,
                                        nearest,
                                    } = candleOrVolumeDataHoverStatus(
                                        event.sourceEvent.offsetX,
                                        event.sourceEvent.offsetY,
                                    );
                                    selectedDateEvent(
                                        isHoverCandleOrVolumeData,
                                        nearest,
                                    );
                                }
                            }

                            showLatestActive();

                            props.setShowTooltip(true);
                        }
                    })
                    .filter((event) => {
                        setIsShapeSelected(false);

                        if (location.pathname.includes('/market')) {
                            return !canUserDragDrawnShape;
                        } else {
                            if (event.type.includes('touch')) {
                                const canvas = d3
                                    .select(d3CanvasMain.current)
                                    .select('canvas')
                                    .node() as HTMLCanvasElement;

                                const rectCanvas =
                                    canvas.getBoundingClientRect();

                                const lineBuffer =
                                    (scaleData?.yScale.domain()[1] -
                                        scaleData?.yScale.domain()[0]) /
                                    15;

                                const eventPoint =
                                    event.targetTouches[0].clientY -
                                    rectCanvas?.top;

                                const mousePlacement =
                                    scaleData?.yScale.invert(eventPoint);

                                const limitLineValue = limit;

                                const minRangeValue = ranges.filter(
                                    (target: lineValue) =>
                                        target.name === 'Min',
                                )[0].value;
                                const maxRangeValue = ranges.filter(
                                    (target: lineValue) =>
                                        target.name === 'Max',
                                )[0].value;

                                const isOnLimit =
                                    location.pathname.includes('/limit') &&
                                    mousePlacement <
                                        limitLineValue + lineBuffer &&
                                    mousePlacement >
                                        limitLineValue - lineBuffer;

                                const isOnRangeMin =
                                    location.pathname.includes('/pool') &&
                                    mousePlacement <
                                        minRangeValue + lineBuffer &&
                                    mousePlacement > minRangeValue - lineBuffer;

                                const isOnRangeMax =
                                    location.pathname.includes('/pool') &&
                                    mousePlacement <
                                        maxRangeValue + lineBuffer &&
                                    mousePlacement > maxRangeValue - lineBuffer;

                                return (
                                    !isOnLimit && !isOnRangeMin && !isOnRangeMax
                                );
                            } else {
                                return !canUserDragRange && !canUserDragLimit;
                            }
                        }
                    });

                setMainZoom(() => zoom);
            }
        }
    }, [
        firstCandleData,
        lastCandleData,
        rescale,
        location,
        diffHashSigScaleData(scaleData),
        showLatest,
        liquidityData,
        simpleRangeWidth,
        ranges,
        limit,
        isLineDrag,
        minTickForLimit,
        maxTickForLimit,
        canUserDragRange,
        canUserDragLimit,
        canUserDragDrawnShape,
        unparsedCandleData,
        period,
        tradeData.advancedMode,
        isChartZoom,
    ]);

    useEffect(() => {
        if (!isChartZoom) {
            render();
        }
    }, [diffHashSigScaleData(scaleData)]);

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

    // when the auto button is clicked, the chart is auto scale
    useEffect(() => {
        if (scaleData !== undefined && liquidityData !== undefined) {
            if (rescale) {
                changeScale();

                if (
                    location.pathname.includes('pool') ||
                    location.pathname.includes('reposition')
                ) {
                    const liqAllBidPrices = liquidityData?.liqBidData.map(
                        (liqData: LiquidityDataLocal) => liqData.liqPrices,
                    );
                    // enlarges data to the end of the domain
                    const liqBidDeviation = standardDeviation(liqAllBidPrices);

                    // liq for advance mod is drawn forever
                    fillLiqAdvanced(liqBidDeviation, scaleData, liquidityData);
                }
            }
        }
    }, [rescale]);

    useEffect(() => {
        setMarketLineValue();
    }, [poolPriceWithoutDenom, denomInBase]);

    const setMarketLineValue = useCallback(() => {
        if (poolPriceWithoutDenom !== undefined) {
            const lastCandlePrice = denomInBase
                ? 1 / poolPriceWithoutDenom
                : poolPriceWithoutDenom;

            setMarket(() => {
                return lastCandlePrice !== undefined ? lastCandlePrice : 0;
            });
        }
    }, [poolPriceWithoutDenom, denomInBase]);
    // set default limit tick
    useEffect(() => {
        if (tradeData.limitTick && Math.abs(tradeData.limitTick) === Infinity)
            dispatch(setLimitTick(undefined));
    }, []);

    // calculate range value for denom
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
        location.pathname,
        denomInBase,
        minPrice,
        maxPrice,
        rescaleRangeBoundariesWithSlider,
        tradeData.advancedMode,
        chartTriggeredBy,
    ]);

    useEffect(() => {
        if (
            tradeData.advancedMode &&
            scaleData &&
            liquidityData &&
            denomInBase === boundaries
        ) {
            const liqAllBidPrices = liquidityData?.liqBidData.map(
                (liqData: LiquidityDataLocal) => liqData.liqPrices,
            );
            const liqBidDeviation = standardDeviation(liqAllBidPrices);

            fillLiqAdvanced(liqBidDeviation, scaleData, liquidityData);
        } else {
            setBoundaries(denomInBase);
        }
    }, [
        tradeData.advancedMode,
        ranges,
        liquidityData?.liqBidData,
        diffHashSigScaleData(scaleData, 'y'),
    ]);

    // performs reverse token function when limit line position (sell /buy) changes
    function reverseTokenForChart(
        limitPreviousData: number,
        newLimitValue: number,
    ) {
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

    // finds border ticks of nogozone
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

    // If the limit is set to no gozone, it will jump to the nearest tick
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

    function calculateLimit(newLimitValue: number) {
        if (newLimitValue < 0) newLimitValue = 0;

        newLimitValue = setLimitForNoGoZone(newLimitValue);
        const { noGoZoneMin, noGoZoneMax } = getNoZoneData();

        const limitNonDisplay = denomInBase
            ? pool?.fromDisplayPrice(newLimitValue)
            : pool?.fromDisplayPrice(1 / newLimitValue);
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

            const tickDispPrice = pool?.toDisplayPrice(tickPrice);

            if (tickDispPrice) {
                tickDispPrice.then((tp) => {
                    const displayPriceWithDenom = denomInBase ? tp : 1 / tp;

                    newLimitValue = displayPriceWithDenom;
                    if (
                        !(
                            newLimitValue >= noGoZoneMin &&
                            newLimitValue <= noGoZoneMax
                        )
                    ) {
                        setLimit(() => {
                            return newLimitValue;
                        });
                    }
                });
            }
        });
    }

    function calculateRangeWhenDragged(
        rangeValue: number,
        draggingLine: string | undefined,
    ) {
        if (liquidityData) {
            let rangeWidthPercentage: number;
            let dragSwitched = false;

            const displayValue =
                poolPriceDisplay !== undefined ? poolPriceDisplay : 0;

            const low = ranges.filter(
                (target: lineValue) => target.name === 'Min',
            )[0].value;
            const high = ranges.filter(
                (target: lineValue) => target.name === 'Max',
            )[0].value;

            const draggedValue = rangeValue;

            const lineToBeSet = draggedValue > displayValue ? 'Max' : 'Min';

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let pinnedDisplayPrices: any;

            if (
                !tradeData.advancedMode ||
                location.pathname.includes('reposition')
            ) {
                if (
                    draggedValue === 0 ||
                    draggedValue === liquidityData?.topBoundary
                ) {
                    const minValue =
                        draggedValue === 0
                            ? 0
                            : draggedValue < liquidityData?.lowBoundary
                            ? draggedValue
                            : 0;

                    return [minValue, liquidityData?.topBoundary];
                } else {
                    if (lineToBeSet === 'Max') {
                        const pinnedTick = getPinnedTickFromDisplayPrice(
                            isDenomBase,
                            baseTokenDecimals,
                            quoteTokenDecimals,
                            false, // isMinPrice
                            draggedValue.toString(),
                            lookupChain(chainId).gridSize,
                        );

                        rangeWidthPercentage = Math.floor(
                            Math.abs(pinnedTick - currentPoolPriceTick) / 100,
                        );

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
                    } else {
                        const pinnedTick = getPinnedTickFromDisplayPrice(
                            isDenomBase,
                            baseTokenDecimals,
                            quoteTokenDecimals,
                            true, // isMinPrice
                            draggedValue.toString(),
                            lookupChain(chainId).gridSize,
                        );

                        rangeWidthPercentage = Math.floor(
                            Math.abs(currentPoolPriceTick - pinnedTick) / 100,
                        );

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
                        return [
                            Number(
                                pinnedDisplayPrices.pinnedMinPriceDisplayTruncated,
                            ),
                            Number(
                                pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated,
                            ),
                        ];
                    }
                }
            } else {
                const advancedValue = rangeValue;

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

                let returnMaxValue = high;
                let returnMinValue = low;

                // to:do fix when advanced is fixed AdvancedPepe
                if (draggingLine === 'Max') {
                    if (
                        dragSwitched ||
                        pinnedMaxPriceDisplayTruncated <
                            pinnedMinPriceDisplayTruncated
                    ) {
                        returnMinValue = pinnedMaxPriceDisplayTruncated;

                        dragSwitched = true;
                    } else {
                        returnMaxValue = pinnedMaxPriceDisplayTruncated;
                    }
                } else {
                    if (
                        dragSwitched ||
                        pinnedMinPriceDisplayTruncated >
                            pinnedMaxPriceDisplayTruncated
                    ) {
                        returnMaxValue = pinnedMinPriceDisplayTruncated;

                        dragSwitched = true;
                    } else {
                        returnMinValue = pinnedMinPriceDisplayTruncated;
                    }
                }

                return [returnMinValue, returnMaxValue];
            }
        }
    }

    // create drag events
    useEffect(() => {
        if (scaleData) {
            let newLimitValue: number;
            let newRangeValue: lineValue[];

            let lowLineMoved: boolean;
            let highLineMoved: boolean;

            let rangeWidthPercentage: number;

            let dragSwitched = false;
            let draggingLine: string | undefined = undefined;

            let cancelDrag = false;

            // clicking esc while dragging the line sets the line to the last value
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                .node() as HTMLCanvasElement;

            const rectCanvas = canvas.getBoundingClientRect();

            let oldRangeMinValue: number | undefined = undefined;
            let oldRangeMaxValue: number | undefined = undefined;

            const dragRange = d3
                .drag<d3.DraggedElementBaseType, unknown, d3.SubjectPosition>()
                .on('start', (event) => {
                    setCrosshairActive('none');
                    document.addEventListener('keydown', cancelDragEvent);
                    d3.select(d3CanvasMain.current).style('cursor', 'none');

                    d3.select('#y-axis-canvas').style('cursor', 'none');

                    const advancedValue = scaleData?.yScale.invert(
                        event.sourceEvent.clientY - rectCanvas.top,
                    );

                    const low = ranges.filter(
                        (target: lineValue) => target.name === 'Min',
                    )[0].value;
                    const high = ranges.filter(
                        (target: lineValue) => target.name === 'Max',
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
                    if (!event.sourceEvent.type.includes('touch')) {
                        if (!cancelDrag && liquidityData) {
                            setIsLineDrag(true);
                            setCrosshairActive('none');

                            let draggedValue =
                                scaleData?.yScale.invert(
                                    event.sourceEvent.clientY - rectCanvas.top,
                                ) >= liquidityData?.topBoundary
                                    ? liquidityData?.topBoundary
                                    : scaleData?.yScale.invert(
                                          event.sourceEvent.clientY -
                                              rectCanvas.top,
                                      );

                            draggedValue = draggedValue < 0 ? 0 : draggedValue;

                            const displayValue =
                                poolPriceDisplay !== undefined
                                    ? poolPriceDisplay
                                    : 0;

                            const low = ranges.filter(
                                (target: lineValue) => target.name === 'Min',
                            )[0].value;
                            const high = ranges.filter(
                                (target: lineValue) => target.name === 'Max',
                            )[0].value;

                            const lineToBeSet =
                                draggedValue > displayValue ? 'Max' : 'Min';

                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            let pinnedDisplayPrices: any;

                            if (
                                !tradeData.advancedMode ||
                                location.pathname.includes('reposition')
                            ) {
                                if (
                                    draggedValue === 0 ||
                                    draggedValue === liquidityData?.topBoundary
                                ) {
                                    const minValue =
                                        draggedValue === 0
                                            ? 0
                                            : draggedValue <
                                              liquidityData?.lowBoundary
                                            ? draggedValue
                                            : 0;

                                    setRanges((prevState) => {
                                        const newTargets = [...prevState];

                                        newTargets.filter(
                                            (target: lineValue) =>
                                                target.name === 'Min',
                                        )[0].value = minValue;

                                        newTargets.filter(
                                            (target: lineValue) =>
                                                target.name === 'Max',
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
                                                draggedValue.toString(),
                                                lookupChain(chainId).gridSize,
                                            );

                                        rangeWidthPercentage = Math.floor(
                                            Math.abs(
                                                pinnedTick -
                                                    currentPoolPriceTick,
                                            ) / 100,
                                        );

                                        rangeWidthPercentage =
                                            rangeWidthPercentage < 1
                                                ? 1
                                                : rangeWidthPercentage;

                                        const offset =
                                            rangeWidthPercentage * 100;

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
                                                draggedValue.toString(),
                                                lookupChain(chainId).gridSize,
                                            );

                                        rangeWidthPercentage = Math.floor(
                                            Math.abs(
                                                currentPoolPriceTick -
                                                    pinnedTick,
                                            ) / 100,
                                        );

                                        rangeWidthPercentage =
                                            rangeWidthPercentage < 1
                                                ? 1
                                                : rangeWidthPercentage;
                                        const offset =
                                            rangeWidthPercentage * 100;

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
                                                (target: lineValue) =>
                                                    target.name === 'Min',
                                            )[0].value = Number(
                                                pinnedDisplayPrices.pinnedMinPriceDisplayTruncated,
                                            );
                                            newTargets.filter(
                                                (target: lineValue) =>
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
                                                    lookupChain(chainId)
                                                        .gridSize,
                                                );
                                        } else {
                                            pinnedDisplayPrices =
                                                getPinnedPriceValuesFromDisplayPrices(
                                                    denomInBase,
                                                    baseTokenDecimals,
                                                    quoteTokenDecimals,
                                                    low.toString(),
                                                    advancedValue.toString(),
                                                    lookupChain(chainId)
                                                        .gridSize,
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
                                                (target: lineValue) =>
                                                    target.name === 'Min',
                                            )[0].value =
                                                pinnedMaxPriceDisplayTruncated;

                                            dragSwitched = true;
                                            highLineMoved = false;
                                            lowLineMoved = true;
                                        } else {
                                            newTargets.filter(
                                                (target: lineValue) =>
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
                                                (target: lineValue) =>
                                                    target.name === 'Max',
                                            )[0].value =
                                                pinnedMinPriceDisplayTruncated;

                                            dragSwitched = true;
                                            highLineMoved = true;
                                            lowLineMoved = false;
                                        } else {
                                            newTargets.filter(
                                                (target: lineValue) =>
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
                .drag<d3.DraggedElementBaseType, unknown, d3.SubjectPosition>()
                .on('start', () => {
                    d3.select(d3CanvasMain.current).style('cursor', 'none');

                    document.addEventListener('keydown', cancelDragEvent);

                    d3.select('#y-axis-canvas').style('cursor', 'none');

                    oldLimitValue = limit;
                })
                .on('drag', function (event) {
                    if (!event.sourceEvent.type.includes('touch')) {
                        if (!cancelDrag) {
                            setCrosshairActive('none');
                            setIsLineDrag(true);
                            const eventPoint =
                                event.sourceEvent.type === 'mousemove'
                                    ? event.sourceEvent.clientY
                                    : event.sourceEvent.targetTouches[0]
                                          .clientY;

                            newLimitValue = scaleData?.yScale.invert(
                                eventPoint - rectCanvas.top,
                            );

                            calculateLimit(newLimitValue);
                        } else {
                            if (oldLimitValue !== undefined) {
                                setLimit(() => {
                                    return oldLimitValue as number;
                                });
                            }
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
                        if (oldLimitValue !== undefined) {
                            onBlurLimitRate(oldLimitValue, newLimitValue);
                        }
                    } else {
                        if (oldLimitValue !== undefined) {
                            setLimit(() => {
                                return oldLimitValue as number;
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
        tradeData.advancedMode,
        ranges,
        limit,
        minPrice,
        maxPrice,
        minTickForLimit,
        maxTickForLimit,
        simpleRangeWidth,
        liquidityData?.topBoundary,
        liquidityData?.lowBoundary,
        scaleData,
        isDenomBase,
        baseTokenDecimals,
        quoteTokenDecimals,
        currentPoolPriceTick,
        denomInBase,
        isTokenABase,
        chainData.gridSize,
        rescale,
    ]);

    useEffect(() => {
        setBandwidth(defaultCandleBandwith);

        if (reset) {
            const candleDomain = {
                lastCandleDate: new Date().getTime(),
                domainBoundry: lastCandleData?.time * 1000,
            };

            setCandleDomains(candleDomain);
        }
    }, [reset]);

    // create x axis
    useEffect(() => {
        if (mainZoom && d3CanvasMain.current) {
            d3.select<Element, unknown>(d3CanvasMain.current)
                .call(mainZoom)
                .on('wheel.zoom', null);
            if (location.pathname.includes('market')) {
                d3.select(d3CanvasMain.current).on('.drag', null);
            }
            if (
                location.pathname.includes('pool') ||
                location.pathname.includes('reposition')
            ) {
                if (dragRange) {
                    d3.select<d3.DraggedElementBaseType, unknown>(
                        d3CanvasMain.current,
                    ).call(dragRange);
                }
            }
            if (location.pathname.includes('/limit')) {
                if (dragLimit) {
                    d3.select<d3.DraggedElementBaseType, unknown>(
                        d3CanvasMain.current,
                    ).call(dragLimit);
                }
            }
            renderCanvasArray([d3CanvasMain]);
        }
    }, [
        location.pathname,
        mainZoom,
        dragLimit,
        dragRange,
        // d3.select('#range-line-canvas')?.node(),
        // d3.select('#limit-line-canvas')?.node(),
    ]);

    // create market line and liquidity tooltip
    useEffect(() => {
        if (scaleData !== undefined) {
            const marketLine = d3fc
                .annotationCanvasLine()
                .value((d: number) => d)
                .xScale(scaleData?.xScale)
                .yScale(scaleData?.yScale);

            marketLine.decorate((context: CanvasRenderingContext2D) => {
                context.strokeStyle = 'var(--text2)';
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
    }, [scaleData, liquidityDepthScale, liquidityScale, isUserConnected]);

    // when click reset chart should be auto scale
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
    }, [reset, minTickForLimit, maxTickForLimit]);

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

                setYaxisDomain(domain[0], domain[1]);

                scaleData?.xScale.domain([
                    centerX - diff * 0.8,
                    centerX + diff * 0.2,
                ]);
            }

            setLatest(false);
            setShowLatest(false);
        }
    }, [
        // diffHashSigScaleData(scaleData),
        latest,
        unparsedCandleData,
        denomInBase,
        rescale,
        location.pathname,
    ]);

    const onClickRange = async (event: PointerEvent) => {
        if (scaleData && liquidityData) {
            let newRangeValue: lineValue[];

            const low = ranges.filter(
                (target: lineValue) => target.name === 'Min',
            )[0].value;
            const high = ranges.filter(
                (target: lineValue) => target.name === 'Max',
            )[0].value;

            let clickedValue =
                scaleData?.yScale.invert(d3.pointer(event)[1]) >=
                liquidityData?.topBoundary
                    ? liquidityData?.topBoundary
                    : scaleData?.yScale.invert(d3.pointer(event)[1]);

            clickedValue = clickedValue < 0 ? 0.01 : clickedValue;

            const displayValue =
                poolPriceDisplay !== undefined ? poolPriceDisplay : 0;

            let lineToBeSet: string;

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
                            (target: lineValue) => target.name === 'Min',
                        )[0].value = 0;

                        newTargets.filter(
                            (target: lineValue) => target.name === 'Max',
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
                            clickedValue.toString(),
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
                            clickedValue.toString(),
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
                                (target: lineValue) => target.name === 'Max',
                            )[0].value = isScientific
                                ? Number(
                                      pinnedDisplayPrices.pinnedMaxPriceDisplay,
                                  )
                                : pinnedMaxPriceDisplayTruncated;
                        } else {
                            newTargets.filter(
                                (target: lineValue) => target.name === 'Min',
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
                .value((d: crosshair) => d.x)
                .xScale(scaleData?.xScale)
                .yScale(scaleData?.yScale)
                .label('');

            crosshairVerticalCanvas.decorate(
                (context: CanvasRenderingContext2D) => {
                    context.strokeStyle = 'rgba(235, 235, 255)';
                    context.lineWidth = 0.3;
                    context.fillStyle = 'transparent';
                },
            );

            setCrosshairVerticalCanvas(() => {
                return crosshairVerticalCanvas;
            });

            const crosshairHorizontal = d3fc
                .annotationCanvasLine()
                .value((d: crosshair) => d.y)
                .xScale(scaleData?.xScale)
                .yScale(scaleData?.yScale);

            crosshairHorizontal.decorate(
                (context: CanvasRenderingContext2D) => {
                    context.strokeStyle = 'rgba(235, 235, 255)';
                    context.lineWidth = 0.3;
                    context.fillStyle = 'transparent';
                },
            );

            setCrosshairHorizontal(() => {
                return crosshairHorizontal;
            });

            const crDataIndicator = createIndicatorLine(
                scaleData?.xScale,
                scaleData.yScale,
            );

            setCrDataIndicator(() => {
                return crDataIndicator;
            });

            if (
                d3
                    .select(d3Container.current)
                    .select('.xAxisTooltip')
                    .node() === null
            ) {
                const xAxisTooltip = d3
                    .select(d3Container.current)
                    .append('div')
                    .attr('class', 'xAxisTooltip')
                    .style('visibility', 'hidden');

                setXaxisTooltip(() => {
                    return xAxisTooltip;
                });
            }
        }
    }, [scaleData]);

    useEffect(() => {
        if (d3CanvasMain) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const canvasDiv = d3.select(d3CanvasMain.current) as any;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const resizeObserver = new ResizeObserver((result: any) => {
                const canvas = canvasDiv
                    .select('canvas')
                    .node() as HTMLCanvasElement;
                setMainCanvasBoundingClientRect(canvas.getBoundingClientRect());

                const height = result[0].contentRect.height;

                setChartHeights(height);
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
                .on('measure', (event: CustomEvent) => {
                    scaleData?.xScale.range([0, event.detail.width]);
                    scaleData?.yScale.range([event.detail.height, 0]);
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

    const circleSeries = createCircle(
        scaleData?.xScale,
        scaleData?.yScale,
        60,
        0.5,
    );

    const selectedCircleSeries = createCircle(
        scaleData?.xScale,
        scaleData?.yScale,
        80,
        0.5,
        true,
    );

    useEffect(() => {
        const canvas = d3
            .select(d3CanvasMain.current)
            .select('canvas')
            .node() as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');

        if (scaleData && lineSeries) {
            d3.select(d3CanvasMain.current)
                .on('draw', () => {
                    setCanvasResolution(canvas);
                    drawnShapeHistory?.forEach((item) => {
                        if (item.type === 'Brush') {
                            lineSeries(item?.data);
                            if (
                                (hoveredDrawnShape &&
                                    hoveredDrawnShape.data.time ===
                                        item.time) ||
                                (selectedDrawnShape &&
                                    selectedDrawnShape.data.time === item.time)
                            ) {
                                item.data.forEach((element) => {
                                    if (
                                        (selectedDrawnShape &&
                                            selectedDrawnShape.selectedCircle ===
                                                element) ||
                                        (hoveredDrawnShape &&
                                            hoveredDrawnShape.selectedCircle ===
                                                element)
                                    ) {
                                        if (!isUpdatingShape) {
                                            selectedCircleSeries([element]);
                                        }
                                    } else {
                                        circleSeries([element]);
                                    }
                                });
                            }
                        }

                        if (item.type === 'Square') {
                            item.data[1].ctx
                                .xScale()
                                .domain(scaleData.xScale.domain());

                            const range = [
                                scaleData?.xScale(item.data[0].x),
                                scaleData.xScale(item.data[1].x),
                            ];

                            item.data[1].ctx.xScale().range(range);

                            const bandData = {
                                fromValue: item.data[0].y,
                                toValue: item.data[1].y,
                            } as bandLineData;

                            item.data[1].ctx([bandData]);

                            const lineOfBand = createPointsOfBandLine(
                                item.data,
                            );

                            lineOfBand?.forEach((line) => {
                                lineSeries(line);
                                if (
                                    (hoveredDrawnShape &&
                                        hoveredDrawnShape.data.time ===
                                            item.time) ||
                                    (selectedDrawnShape &&
                                        selectedDrawnShape.data.time ===
                                            item.time)
                                ) {
                                    line.forEach((element) => {
                                        const selectedShape = selectedDrawnShape
                                            ? selectedDrawnShape
                                            : hoveredDrawnShape;

                                        const selectedCircleIsActive =
                                            selectedShape &&
                                            selectedShape.selectedCircle &&
                                            selectedShape.selectedCircle.x ===
                                                element.x &&
                                            selectedShape.selectedCircle.y ===
                                                element.y;

                                        if (selectedCircleIsActive) {
                                            if (!isUpdatingShape) {
                                                selectedCircleSeries([element]);
                                            }
                                        } else {
                                            circleSeries([element]);
                                        }
                                    });
                                }
                            });
                        }
                    });
                })
                .on('measure', () => {
                    drawnShapeHistory?.forEach((item) => {
                        if (item.type === 'Square') {
                            item.data[1].ctx.context(ctx);
                        }
                    });
                    lineSeries.context(ctx);
                    circleSeries.context(ctx);
                    selectedCircleSeries.context(ctx);
                });

            render();
        }
    }, [
        diffHashSig(drawnShapeHistory),
        lineSeries,
        hoveredDrawnShape,
        selectedDrawnShape,
        isUpdatingShape,
    ]);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handleKeyDown = function (event: any) {
            if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
                event.preventDefault();

                undo();
            } else if ((event.ctrlKey || event.metaKey) && event.key === 'y') {
                event.preventDefault();
                redo();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [undo, redo]);

    useEffect(() => {
        const canvas = d3
            .select(d3CanvasCrIndicator.current)
            .select('canvas')
            .node() as HTMLCanvasElement;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

        if (crDataIndicator) {
            d3.select(d3CanvasCrIndicator.current)
                .on('draw', () => {
                    setCanvasResolution(canvas);
                    ctx.setLineDash([0.6, 0.6]);

                    if (isCrDataIndActive || xAxisActiveTooltip === 'croc') {
                        crDataIndicator([lastCrDate]);
                    }
                })
                .on('measure', () => {
                    ctx.setLineDash([0.6, 0.6]);
                    crDataIndicator.context(ctx);
                });
        }
        renderCanvasArray([d3CanvasCrIndicator]);
    }, [crDataIndicator, isCrDataIndActive, xAxisActiveTooltip]);

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
                    marketLine([market]);
                })
                .on('measure', (event: CustomEvent) => {
                    scaleData?.xScale.range([0, event.detail.width]);
                    scaleData?.yScale.range([event.detail.height, 0]);
                    ctx.setLineDash([5, 3]);
                    marketLine.context(ctx);
                });
        }
        renderCanvasArray([d3CanvasMarketLine]);
    }, [market, marketLine]);

    function noGoZone(poolPrice: number) {
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
                (data: CandleData) =>
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

                const marketPrice = market;

                if (minYBoundary && maxYBoundary) {
                    const diffBoundray = Math.abs(maxYBoundary - minYBoundary);
                    const buffer = diffBoundray
                        ? diffBoundray / 6
                        : minYBoundary / 2;
                    if (
                        location.pathname.includes('pool') ||
                        location.pathname.includes('reposition')
                    ) {
                        if (
                            simpleRangeWidth !== 100 ||
                            tradeData.advancedMode
                        ) {
                            const min = ranges.filter(
                                (target: lineValue) => target.name === 'Min',
                            )[0].value;
                            const max = ranges.filter(
                                (target: lineValue) => target.name === 'Max',
                            )[0].value;

                            const low = Math.min(
                                min,
                                max,
                                minYBoundary,
                                marketPrice,
                            );

                            const high = Math.max(
                                min,
                                max,
                                maxYBoundary,
                                marketPrice,
                            );

                            const bufferForRange = Math.abs(
                                (low - high) /
                                    (simpleRangeWidth !== 100 ? 6 : 90),
                            );

                            const domain = [
                                Math.min(low, high) - bufferForRange,
                                Math.max(low, high) + bufferForRange / 2,
                            ];

                            setYaxisDomain(domain[0], domain[1]);
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
                        const value = limit;
                        const low = Math.min(
                            minYBoundary,
                            value,
                            minTickForLimit,
                            marketPrice,
                        );

                        const high = Math.max(
                            maxYBoundary,
                            value,
                            maxTickForLimit,
                            marketPrice,
                        );

                        const bufferForLimit = Math.abs((low - high) / 6);
                        if (value > 0 && Math.abs(value) !== Infinity) {
                            const domain = [
                                Math.min(low, high) - bufferForLimit,
                                Math.max(low, high) + bufferForLimit / 2,
                            ];

                            setYaxisDomain(domain[0], domain[1]);
                        }
                    } else {
                        const domain = [
                            Math.min(minYBoundary, maxYBoundary, marketPrice) -
                                buffer,
                            Math.max(minYBoundary, maxYBoundary, marketPrice) +
                                buffer / 2,
                        ];

                        setYaxisDomain(domain[0], domain[1]);
                    }
                }
            }
            render();
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
        isLineDrag,
    ]);

    function setYaxisDomain(minDomain: number, maxDomain: number) {
        if (scaleData) {
            if (minDomain === maxDomain) {
                const delta = minDomain / 8;
                const tempMinDomain = minDomain - delta;
                const tempMaxDomain = minDomain + delta;

                scaleData.yScale.domain([tempMinDomain, tempMaxDomain]);
            } else {
                scaleData.yScale.domain([minDomain, maxDomain]);
            }
        }
    }

    const mouseLeaveCanvas = () => {
        if (crosshairActive !== 'none') {
            setCrosshairActive('none');
        }
        setXaxisActiveTooltip('');
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isTouchOnLine = (event: any, rectCanvas: any) => {
        if (scaleData !== undefined) {
            const lineBuffer =
                (scaleData?.yScale.domain()[1] -
                    scaleData?.yScale.domain()[0]) /
                15;

            const eventPoint = event.targetTouches[0].clientY - rectCanvas?.top;

            const mousePlacement = scaleData?.yScale.invert(eventPoint);

            const limitLineValue = limit;

            const minRangeValue = ranges.filter(
                (target: lineValue) => target.name === 'Min',
            )[0].value;
            const maxRangeValue = ranges.filter(
                (target: lineValue) => target.name === 'Max',
            )[0].value;

            const isOnLimit =
                location.pathname.includes('/limit') &&
                mousePlacement < limitLineValue + lineBuffer &&
                mousePlacement > limitLineValue - lineBuffer;

            const isOnRangeMin =
                location.pathname.includes('/pool') &&
                mousePlacement < minRangeValue + lineBuffer &&
                mousePlacement > minRangeValue - lineBuffer;

            const isOnRangeMax =
                location.pathname.includes('/pool') &&
                mousePlacement < maxRangeValue + lineBuffer &&
                mousePlacement > maxRangeValue - lineBuffer;

            return { isOnLimit, isOnRangeMin, isOnRangeMax };
        }
    };

    // mousemove
    useEffect(() => {
        if (!isChartZoom) {
            d3.select(d3CanvasMain.current).on(
                'mousemove',
                function (event: MouseEvent<HTMLDivElement>) {
                    mousemove(event);
                },
            );

            const canvas = d3
                .select(d3CanvasMain.current)
                .select('canvas')
                .node() as HTMLCanvasElement;

            const rectCanvas = canvas.getBoundingClientRect();

            let isTouchToDrag = isLineDrag;
            let isMaxDragged = false;

            d3.select(d3CanvasMain.current).on(
                'touchstart',
                function (event: TouchEvent) {
                    if (
                        scaleData !== undefined &&
                        mainCanvasBoundingClientRect
                    ) {
                        const offsetY =
                            event.targetTouches[0].clientY -
                            mainCanvasBoundingClientRect?.top;
                        const offsetX =
                            event.targetTouches[0].clientX -
                            mainCanvasBoundingClientRect?.left;
                        drawnShapesHoverStatus(offsetX, offsetY);

                        const isTouchOnLineValues = isTouchOnLine(
                            event,
                            rectCanvas,
                        );

                        if (isTouchOnLineValues) {
                            isMaxDragged = isTouchOnLineValues?.isOnRangeMax;
                            if (
                                isTouchOnLineValues?.isOnLimit ||
                                isTouchOnLineValues?.isOnRangeMax ||
                                isTouchOnLineValues?.isOnRangeMin
                            ) {
                                isTouchToDrag = true;
                                setIsLineDrag(true);
                            }
                        }
                    }
                },
            );

            d3.select(d3CanvasMain.current).on(
                'touchmove',
                function (event: TouchEvent) {
                    if (scaleData !== undefined) {
                        const eventPoint =
                            event.targetTouches[0].clientY - rectCanvas?.top;

                        if (isTouchToDrag && !isChartZoom) {
                            if (location.pathname.includes('/limit')) {
                                const newLimitValue =
                                    scaleData?.yScale.invert(eventPoint);

                                if (newLimitValue !== undefined) {
                                    calculateLimit(newLimitValue);
                                }
                            }
                            if (location.pathname.includes('/pool')) {
                                const newRangeValue =
                                    scaleData?.yScale.invert(eventPoint);

                                if (newRangeValue !== undefined) {
                                    const calculatedRangeValues =
                                        calculateRangeWhenDragged(
                                            newRangeValue,
                                            isMaxDragged ? 'Max' : 'Min',
                                        );

                                    if (calculatedRangeValues) {
                                        setRanges(() => {
                                            const newTargets = [
                                                {
                                                    name: 'Min',
                                                    value: calculatedRangeValues[0],
                                                },
                                                {
                                                    name: 'Max',
                                                    value: calculatedRangeValues[1],
                                                },
                                            ];

                                            return newTargets;
                                        });
                                    }
                                }
                            }
                        }
                    }
                },
            );

            d3.select(d3CanvasMain.current).on('touchend', function () {
                isTouchToDrag = false;
                setIsLineDrag(false);
            });
        }
    }, [
        diffHashSigChart(visibleCandleData),
        lastCandleData,
        mainCanvasBoundingClientRect,
        selectedDate,
        bandwidth,
        isChartZoom,
        diffHashSig(drawnShapeHistory),
        isLineDrag,
        isShapeSelected,
    ]);

    // mouseleave
    useEffect(() => {
        d3.select(d3CanvasMain.current).on(
            'mouseleave',
            (event: MouseEvent<HTMLDivElement>) => {
                if (!isChartZoom) {
                    mouseLeaveCanvas();
                    setChartMousemoveEvent(undefined);
                    setMouseLeaveEvent(event);
                }
            },
        );
    }, [isChartZoom]);

    // mouseenter
    useEffect(() => {
        const mouseEnterCanvas = () => {
            props.setShowTooltip(true);
        };

        d3.select(d3CanvasMain.current).on('mouseenter', () => {
            if (!isChartZoom) {
                mouseEnterCanvas();
            }
        });
    }, [isChartZoom]);

    useEffect(() => {
        if (scaleData !== undefined) {
            const onClickCanvas = (event: PointerEvent) => {
                const { isHoverCandleOrVolumeData, nearest } =
                    candleOrVolumeDataHoverStatus(event.offsetX, event.offsetY);

                selectedDateEvent(isHoverCandleOrVolumeData, nearest);

                setCrosshairActive('none');

                setIsShapeSelected(false);

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
                        onBlurLimitRate(limit, newLimitValue);
                    }
                }
            };

            d3.select(d3CanvasMain.current).on(
                'click',
                (event: PointerEvent) => {
                    onClickCanvas(event);
                },
            );
            render();

            d3.select(d3Container.current).on(
                'mouseleave',
                (event: MouseEvent<HTMLDivElement>) => {
                    if (!isChartZoom) {
                        setCrosshairActive('none');
                        setMouseLeaveEvent(event);
                        setChartMousemoveEvent(undefined);
                        if (unparsedCandleData) {
                            const lastData = unparsedCandleData.find(
                                (item: CandleData) =>
                                    item.time ===
                                    d3.max(
                                        unparsedCandleData,
                                        (data: CandleData) => data.time,
                                    ),
                            );

                            setsubChartValues((prevState: SubChartValue[]) => {
                                const newData = [...prevState];

                                newData.filter(
                                    (target: SubChartValue) =>
                                        target.name === 'tvl',
                                )[0].value = lastData
                                    ? lastData.tvlData.tvl
                                    : undefined;

                                newData.filter(
                                    (target: SubChartValue) =>
                                        target.name === 'feeRate',
                                )[0].value = lastData
                                    ? lastData.averageLiquidityFee
                                    : undefined;
                                return newData;
                            });
                        }

                        if (selectedDate === undefined) {
                            props.setShowTooltip(false);
                        }
                    }
                },
            );
        }
    }, [
        denomInBase,
        selectedDate,
        isSidebarOpen,
        liqMode,
        location.pathname,
        isChartZoom,
        limit,
        ranges,
        liquidityScale,
        liquidityDepthScale,
        isLineDrag,
        unparsedCandleData?.length,
        tradeData.advancedMode,
        lastCrDate,
        showVolume,
        xAxisActiveTooltip,
        timeOfEndCandle,
        isCrDataIndActive,
        bandwidth,
        diffHashSigChart(unparsedCandleData),
        liquidityData,
        hoveredDrawnShape,
    ]);

    function checkLineLocation(
        element: lineData[],
        mouseX: number,
        mouseY: number,
    ) {
        if (scaleData) {
            const threshold = 10;
            const distance = distanceToLine(
                mouseX,
                mouseY,
                scaleData.xScale(element[0].x),
                scaleData.yScale(element[0].y),
                scaleData.xScale(element[1].x),
                scaleData.yScale(element[1].y),
            );

            return distance < threshold;
        }

        return false;
    }

    function checkRectLocation(
        element: lineData[],
        mouseX: number,
        mouseY: number,
    ) {
        let isOverLine = false;

        if (scaleData) {
            const threshold = 10;

            const allBandLines = createPointsOfBandLine(element);

            allBandLines.forEach((item: { x: number; y: number }[]) => {
                const distance = distanceToLine(
                    mouseX,
                    mouseY,
                    scaleData.xScale(item[0].x),
                    scaleData.yScale(item[0].y),
                    scaleData.xScale(item[1].x),
                    scaleData.yScale(item[1].y),
                );

                if (distance < threshold) {
                    isOverLine = true;
                }
            });
        }

        return isOverLine;
    }

    const drawnShapesHoverStatus = (mouseX: number, mouseY: number) => {
        let resElement = undefined;

        drawnShapeHistory.forEach((element) => {
            if (element.type === 'Brush') {
                if (checkLineLocation(element.data, mouseX, mouseY)) {
                    resElement = element;
                }
            }

            if (element.type === 'Square') {
                if (checkRectLocation(element.data, mouseX, mouseY)) {
                    resElement = element;
                }
            }
        });

        if (resElement && scaleData) {
            const selectedCircle = checkCricleLocation(
                resElement,
                mouseX,
                mouseY,
                scaleData,
            );

            setHoveredDrawnShape({
                data: resElement,
                selectedCircle: selectedCircle,
            });

            setIsDragActive(true);
        } else {
            setIsDragActive(false);
            setHoveredDrawnShape(undefined);
        }
    };
    const candleOrVolumeDataHoverStatus = (mouseX: number, mouseY: number) => {
        const lastDate = scaleData?.xScale.invert(
            mouseX + bandwidth / 2,
        ) as number;
        const startDate = scaleData?.xScale.invert(
            mouseX - bandwidth / 2,
        ) as number;

        let avaregeHeight = 1;
        const filtered: Array<CandleData> = [];
        let longestValue = 0;

        const xmin = scaleData?.xScale.domain()[0] as number;
        const xmax = scaleData?.xScale.domain()[1] as number;
        const ymin = scaleData?.yScale.domain()[0] as number;
        const ymax = scaleData?.yScale.domain()[1] as number;

        visibleCandleData.map((d: CandleData) => {
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

        const nearest = snapForCandle(mouseX, filtered);
        const dateControl =
            nearest?.time * 1000 > startDate && nearest?.time * 1000 < lastDate;

        const tempFilterData = filtered.filter(
            (item) => item.time === nearest?.time,
        );

        const yValue = scaleData?.yScale.invert(mouseY) as number;

        const yValueVolume = scaleData?.volumeScale.invert(
            mouseY / 2,
        ) as number;
        const selectedVolumeDataValue = nearest?.volumeUSD;

        const isSelectedVolume =
            selectedVolumeDataValue && showVolume
                ? yValueVolume <=
                      (selectedVolumeDataValue < longestValue
                          ? longestValue
                          : selectedVolumeDataValue) && yValueVolume !== 0
                    ? true
                    : false
                : false;

        let close = denomInBase
            ? nearest?.invMinPriceExclMEVDecimalCorrected
            : nearest?.minPriceExclMEVDecimalCorrected;

        let open = denomInBase
            ? nearest?.invMaxPriceExclMEVDecimalCorrected
            : nearest?.maxPriceExclMEVDecimalCorrected;

        if (tempFilterData.length > 1) {
            close = d3.max(tempFilterData, (d: CandleData) =>
                denomInBase
                    ? d?.invMinPriceExclMEVDecimalCorrected
                    : d?.minPriceExclMEVDecimalCorrected,
            );

            open = d3.min(tempFilterData, (d: CandleData) =>
                denomInBase
                    ? d?.invMaxPriceExclMEVDecimalCorrected
                    : d?.maxPriceExclMEVDecimalCorrected,
            );
        }

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

        setsubChartValues((prevState: SubChartValue[]) => {
            const newData = [...prevState];

            newData.filter(
                (target: SubChartValue) => target.name === 'tvl',
            )[0].value = nearest?.tvlData.tvl;

            newData.filter(
                (target: SubChartValue) => target.name === 'feeRate',
            )[0].value = nearest?.averageLiquidityFee;

            return newData;
        });

        if (selectedDate === undefined) {
            props.setCurrentData(nearest);
            props.setCurrentVolumeData(nearest?.volumeUSD);
        } else if (selectedDate) {
            props.setCurrentVolumeData(
                unparsedCandleData.find(
                    (item: CandleData) => item.time * 1000 === selectedDate,
                )?.volumeUSD,
            );
        }

        const checkYLocation =
            limitTop > limitBot
                ? limitTop > yValue && limitBot < yValue
                : limitTop < yValue && limitBot > yValue;
        if (
            nearest &&
            nearest?.time === lastCandleData?.time &&
            dateControl &&
            checkYLocation &&
            scaleData
        ) {
            const canvas = d3
                .select(d3CanvasMain.current)
                .select('canvas')
                .node() as HTMLCanvasElement;

            const rect = canvas.getBoundingClientRect();

            const rectTop = rect.top / 2.5;

            const maxValue = Math.max(open, close);
            const minValue = Math.min(open, close);

            const checkDomain = maxValue > ymax && minValue < ymin;

            if (checkDomain || chartHeights < 250) {
                setLastCandleDataCenter(scaleData.yScale((ymin + ymax) / 2));
            } else if (
                scaleData.yScale(ymin) - scaleData?.yScale(maxValue) < 100 ||
                ymin > minValue
            ) {
                setLastCandleDataCenter(scaleData.yScale(maxValue) - rectTop);
            } else if (
                scaleData?.yScale(maxValue) - scaleData.yScale(ymax) <
                5
            ) {
                setLastCandleDataCenter(scaleData.yScale(minValue));
            } else {
                setLastCandleDataCenter(scaleData.yScale((open + close) / 2));
            }
            setIsShowLastCandleTooltip(true);
        } else {
            setIsShowLastCandleTooltip(false);
        }

        /**
         * isHoverCandleOrVolumeData : mouse over candle or volume data
         * nearest : data information closest to the mouse
         */
        return {
            isHoverCandleOrVolumeData:
                nearest &&
                dateControl &&
                nearest.time !== lastCandleData?.time &&
                (checkYLocation || isSelectedVolume),
            nearest: nearest,
        };
    };

    const selectedDateEvent = (
        isHoverCandleOrVolumeData: boolean,
        nearest: CandleData | undefined,
    ) => {
        if (isHoverCandleOrVolumeData && nearest) {
            const _selectedDate = nearest?.time * 1000;
            if (selectedDate === undefined || selectedDate !== _selectedDate) {
                props.setCurrentData(nearest);

                const volumeData = unparsedCandleData.find(
                    (item: CandleData) => item.time * 1000 === _selectedDate,
                ) as CandleData;

                props.setCurrentVolumeData(volumeData?.volumeUSD);

                setSelectedDate(_selectedDate);
            } else {
                setSelectedDate(undefined);
            }
        }
    };

    const minimum = (data: CandleData[], mouseX: number) => {
        const xScale = scaleData?.xScale;
        if (xScale) {
            const accessor = (d: CandleData) =>
                Math.abs(mouseX - xScale(d.time * 1000));

            return data
                .map(function (dataPoint: CandleData) {
                    return [accessor(dataPoint), dataPoint];
                })
                .reduce(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    function (accumulator: any, dataPoint: any) {
                        return accumulator[0] > dataPoint[0]
                            ? dataPoint
                            : accumulator;
                    },
                    [Number.MAX_VALUE, null],
                );
        }
    };

    useEffect(() => {
        d3.select(d3CanvasCrosshair.current).style(
            'visibility',
            crosshairActive !== 'none' ? 'visible' : 'hidden',
        );
        renderSubchartCrCanvas();
    }, [crosshairActive]);

    const setCrossHairDataFunc = (offsetX: number, offsetY: number) => {
        if (scaleData) {
            const snapDiff =
                scaleData?.xScale.invert(offsetX) % (period * 1000);

            const snappedTime =
                scaleData?.xScale.invert(offsetX) -
                (snapDiff > period * 1000 - snapDiff
                    ? -1 * (period * 1000 - snapDiff)
                    : snapDiff);

            setCrosshairActive('chart');

            setCrosshairData([
                {
                    x: snappedTime,
                    y: scaleData?.yScale.invert(offsetY),
                },
            ]);
        }
    };
    const mousemove = (event: MouseEvent<HTMLDivElement>) => {
        if (scaleData && mainCanvasBoundingClientRect) {
            const offsetY = event.clientY - mainCanvasBoundingClientRect?.top;
            const offsetX = event.clientX - mainCanvasBoundingClientRect?.left;
            if (!isLineDrag) {
                setChartMousemoveEvent(event);
                setCrossHairDataFunc(offsetX, offsetY);
                const { isHoverCandleOrVolumeData } =
                    candleOrVolumeDataHoverStatus(offsetX, offsetY);
                setIsOnCandleOrVolumeMouseLocation(isHoverCandleOrVolumeData);

                drawnShapesHoverStatus(offsetX, offsetY);
            }
        }
    };

    useEffect(() => {
        renderCanvasArray([d3CanvasCrosshair]);
    }, [crosshairData]);

    useEffect(() => {
        if (xAxisTooltip) {
            xAxisTooltip.html('<p> 🐊 Beginning of Ambient Data </p>');

            xAxisTooltip.style(
                'visibility',
                xAxisActiveTooltip === 'croc' ? 'visible' : 'hidden',
            );

            if (lastCrDate) {
                relocateTooltip(xAxisTooltip, lastCrDate);
            }
        }
    }, [xAxisActiveTooltip, xAxisTooltip, isCrDataIndActive, lastCrDate]);

    useEffect(() => {
        if (xAxisTooltip && scaleData && xAxisActiveTooltip === 'egg') {
            xAxisTooltip.html('<p> 🥚 Beginning of Historical Data </p>');

            xAxisTooltip.style(
                'visibility',
                xAxisActiveTooltip === 'egg' ? 'visible' : 'hidden',
            );

            if (timeOfEndCandle) {
                relocateTooltip(xAxisTooltip, timeOfEndCandle);
            }
        }
    }, [xAxisTooltip, xAxisActiveTooltip, timeOfEndCandle]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const relocateTooltip = (tooltip: any, data: number) => {
        if (tooltip && scaleData) {
            const width = tooltip.style('width').split('p')[0] / 2;
            const d3ContainerCanvas = d3
                .select(d3Container.current)
                .node() as HTMLDivElement;

            const rectContainer = d3ContainerCanvas.getBoundingClientRect();
            tooltip
                .style('top', rectContainer.height + 'px')
                .style('left', scaleData.xScale(data) - width + 'px');
        }
    };
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
    }, [
        diffHashSigScaleData(scaleData, 'x'),
        diffHashSigChart(unparsedCandleData),
    ]);

    // Candle transactions
    useEffect(() => {
        if (selectedDate !== undefined) {
            const candle = unparsedCandleData.find(
                (candle: CandleData) => candle.time * 1000 === selectedDate,
            );

            if (candle !== undefined) {
                props.changeState(true, candle);
            }
        } else {
            props.changeState(false, undefined);
        }
    }, [selectedDate, unparsedCandleData]);

    const onBlurRange = (
        range: lineValue[],
        highLineMoved: boolean,
        lowLineMoved: boolean,
        isLinesSwitched: boolean,
    ) => {
        if (range !== undefined) {
            const low = range.filter(
                (target: lineValue) => target.name === 'Min',
            )[0].value;
            const high = range.filter(
                (target: lineValue) => target.name === 'Max',
            )[0].value;

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

    const onBlurLimitRate = (
        limitPreviousData: number,
        newLimitValue: number,
    ) => {
        if (newLimitValue === undefined) {
            return;
        }
        const limitNonDisplay = denomInBase
            ? pool?.fromDisplayPrice(newLimitValue)
            : pool?.fromDisplayPrice(1 / newLimitValue);

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
                    return newLimitValue;
                });
            } else {
                tickDispPrice.then((tp) => {
                    const displayPriceWithDenom = denomInBase ? tp : 1 / tp;

                    newLimitValue = displayPriceWithDenom;
                    reverseTokenForChart(limitPreviousData, newLimitValue);
                    setLimit(() => {
                        return newLimitValue;
                    });
                });
            }
        });
    };

    useEffect(() => {
        if (scaleData) {
            const lineSeries = createLinearLineSeries(
                scaleData?.xScale,
                scaleData?.yScale,
            );

            setLineSeries(() => lineSeries);
        }
    }, [scaleData]);

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
        liqTransitionPointforCurve: liquidityData
            ? liquidityData?.liqTransitionPointforCurve
            : poolPriceDisplay,
        liqTransitionPointforDepth: liquidityData
            ? liquidityData?.liqTransitionPointforDepth
            : poolPriceDisplay,
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
        liqTransitionPointforCurve: liquidityData
            ? liquidityData?.liqTransitionPointforCurve
            : poolPriceDisplay,
        liqTransitionPointforDepth: liquidityData
            ? liquidityData?.liqTransitionPointforDepth
            : poolPriceDisplay,
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
        simpleRangeWidth,
        poolPriceDisplay,
        isChartZoom,
        isShapeSelected,
        selectedDrawnShape,
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
                    <div className='chart_grid'>
                        <Toolbar
                            isDrawActive={isDrawActive}
                            setIsDrawActive={setIsDrawActive}
                            activeDrawingType={activeDrawingType}
                            setActiveDrawingType={setActiveDrawingType}
                            isToolbarOpen={isToolbarOpen}
                            setIsToolbarOpen={setIsToolbarOpen}
                        />

                        <CandleChart
                            chartItemStates={props.chartItemStates}
                            data={visibleCandleData}
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

                        {liquidityData && (
                            <LiquidityChart
                                liqMode={liqMode}
                                liquidityData={liquidityData}
                                liquidityScale={liquidityScale}
                                scaleData={scaleData}
                                liquidityDepthScale={liquidityDepthScale}
                                ranges={ranges}
                                chartMousemoveEvent={chartMousemoveEvent}
                                liqTooltip={liqTooltip}
                                mouseLeaveEvent={mouseLeaveEvent}
                                isActiveDragOrZoom={isChartZoom || isLineDrag}
                                mainCanvasBoundingClientRect={
                                    mainCanvasBoundingClientRect
                                }
                            />
                        )}
                        <d3fc-canvas
                            ref={d3CanvasCrosshair}
                            className='cr-canvas'
                        ></d3fc-canvas>
                        <d3fc-canvas
                            ref={d3CanvasCrIndicator}
                            className='cr-indicator-canvas'
                        ></d3fc-canvas>

                        <d3fc-canvas
                            ref={d3CanvasMarketLine}
                            className='market-line-canvas'
                        ></d3fc-canvas>

                        <RangeLinesChart {...rangeCanvasProps} />

                        <LimitLineChart {...limitCanvasProps} />

                        <d3fc-canvas
                            ref={d3CanvasMain}
                            className='main-canvas'
                        ></d3fc-canvas>

                        {isDrawActive && scaleData && (
                            <DrawCanvas
                                scaleData={scaleData}
                                setDrawnShapeHistory={setDrawnShapeHistory}
                                setCrossHairDataFunc={setCrossHairDataFunc}
                                setIsDrawActive={setIsDrawActive}
                                activeDrawingType={activeDrawingType}
                                setActiveDrawingType={setActiveDrawingType}
                            />
                        )}

                        {isDragActive && scaleData && (
                            <DragCanvas
                                scaleData={scaleData}
                                canUserDragDrawnShape={canUserDragDrawnShape}
                                hoveredDrawnShape={hoveredDrawnShape}
                                drawnShapeHistory={drawnShapeHistory}
                                render={render}
                                mousemove={mousemove}
                                setCrossHairDataFunc={setCrossHairDataFunc}
                                setIsShapeSelected={setIsShapeSelected}
                                setSelectedDrawnShape={setSelectedDrawnShape}
                                setIsUpdatingShape={setIsUpdatingShape}
                            />
                        )}
                        <YAxisCanvas {...yAxisCanvasProps} />
                    </div>
                    {showFeeRate && (
                        <>
                            <hr />
                            <FeeRateChart
                                feeData={visibleCandleData.sort(
                                    (a, b) => b.time - a.time,
                                )}
                                period={period}
                                crosshairForSubChart={crosshairData}
                                setCrosshairData={setCrosshairData}
                                subChartValues={subChartValues}
                                scaleData={scaleData}
                                render={render}
                                yAxisWidth={yAxisWidth}
                                setCrossHairLocation={
                                    candleOrVolumeDataHoverStatus
                                }
                                setCrosshairActive={setCrosshairActive}
                                crosshairActive={crosshairActive}
                                setShowTooltip={props.setShowTooltip}
                                lastCrDate={lastCrDate}
                                isCrDataIndActive={isCrDataIndActive}
                                xAxisActiveTooltip={xAxisActiveTooltip}
                                zoomBase={zoomBase}
                                mainZoom={mainZoom}
                                setIsChartZoom={setIsChartZoom}
                                isChartZoom={isChartZoom}
                                lastCandleData={lastCandleData}
                                firstCandleData={firstCandleData}
                            />
                        </>
                    )}

                    {showTvl && (
                        <>
                            <hr />
                            <TvlChart
                                tvlData={visibleCandleData.sort(
                                    (a, b) => b.time - a.time,
                                )}
                                period={period}
                                crosshairForSubChart={crosshairData}
                                setCrosshairData={setCrosshairData}
                                scaleData={scaleData}
                                subChartValues={subChartValues}
                                render={render}
                                yAxisWidth={yAxisWidth}
                                setCrossHairLocation={
                                    candleOrVolumeDataHoverStatus
                                }
                                setCrosshairActive={setCrosshairActive}
                                crosshairActive={crosshairActive}
                                setShowTooltip={props.setShowTooltip}
                                lastCrDate={lastCrDate}
                                isCrDataIndActive={isCrDataIndActive}
                                xAxisActiveTooltip={xAxisActiveTooltip}
                                mainZoom={mainZoom}
                                lastCandleData={lastCandleData}
                                firstCandleData={firstCandleData}
                                isChartZoom={isChartZoom}
                                zoomBase={zoomBase}
                                setIsChartZoom={setIsChartZoom}
                            />
                        </>
                    )}

                    <div className='xAxis'>
                        <hr />

                        <XAxisCanvas
                            changeScale={changeScale}
                            crosshairActive={crosshairActive}
                            crosshairData={crosshairData}
                            firstCandleData={firstCandleData}
                            isCrDataIndActive={isCrDataIndActive}
                            isLineDrag={isLineDrag}
                            lastCandleData={lastCandleData}
                            lastCrDate={lastCrDate}
                            mouseLeaveCanvas={mouseLeaveCanvas}
                            period={period}
                            render={render}
                            scaleData={scaleData}
                            reset={reset}
                            setCrosshairActive={setCrosshairActive}
                            setIsCrDataIndActive={setIsCrDataIndActive}
                            setXaxisActiveTooltip={setXaxisActiveTooltip}
                            showLatestActive={showLatestActive}
                            unparsedCandleData={unparsedCandleData}
                            xAxisActiveTooltip={xAxisActiveTooltip}
                            zoomBase={zoomBase}
                            isChartZoom={isChartZoom}
                            isToolbarOpen={isToolbarOpen}
                            isShapeSelected={isShapeSelected}
                            selectedDrawnShape={selectedDrawnShape}
                        />
                    </div>
                </div>
            </d3fc-group>

            {scaleData && (
                <CSSTransition
                    in={isShowLastCandleTooltip}
                    timeout={500}
                    classNames='lastCandleTooltip'
                    unmountOnExit
                >
                    <div
                        className='lastCandleDiv'
                        style={{
                            fontSize: chartHeights > 280 ? 'medium' : '12px',
                            top: lastCandleDataCenter,
                            left:
                                scaleData?.xScale(lastCandleData?.time * 1000) +
                                bandwidth * 2,
                        }}
                    >
                        <div>
                            A placeholder candle to align the latest candle
                            close price with the current pool price{' '}
                        </div>
                        <Divider />
                        <div>
                            Click any other price candle or volume bar to view
                            transactions
                        </div>
                    </div>
                </CSSTransition>
            )}
        </div>
    );
}
