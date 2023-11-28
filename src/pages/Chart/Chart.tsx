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
import {
    setLimitTick,
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
import {
    CandleContext,
    CandlesByPoolAndDuration,
} from '../../contexts/CandleContext';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';
import { SidebarContext } from '../../contexts/SidebarContext';
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
    CHART_ANNOTATIONS_LS_KEY,
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
    createAnnotationLineSeries,
    createLinearLineSeries,
    distanceToLine,
} from './Draw/DrawCanvas/LinearLineSeries';
import {
    createBandArea,
    createPointsOfBandLine,
} from './Draw/DrawCanvas/BandArea';
import { checkCricleLocation, createCircle } from './ChartUtils/circle';
import DragCanvas from './Draw/DrawCanvas/DragCanvas';
import Toolbar from './Draw/Toolbar/Toolbar';
import FloatingToolbar from './Draw/FloatingToolbar/FloatingToolbar';
import { updatesIF } from '../../utils/hooks/useUrlParams';
import { linkGenMethodsIF, useLinkGen } from '../../utils/hooks/useLinkGen';
import { UserDataContext } from '../../contexts/UserDataContext';
import { TradeDataContext } from '../../contexts/TradeDataContext';
import { actionKeyIF } from './ChartUtils/useUndoRedo';

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
    undo: () => void;
    redo: () => void;
    drawnShapeHistory: drawDataHistory[];
    setDrawnShapeHistory: React.Dispatch<
        React.SetStateAction<drawDataHistory[]>
    >;
    deleteItem: (item: drawDataHistory) => void;
    updateURL: (changes: updatesIF) => void;
    addDrawActionStack: (item: drawDataHistory, isNewShape: boolean) => void;
    drawActionStack: Map<actionKeyIF, drawDataHistory[]>;
    undoStack: Map<actionKeyIF, drawDataHistory[]>;
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
        undo,
        redo,
        drawnShapeHistory,
        setDrawnShapeHistory,
        deleteItem,
        updateURL,
        addDrawActionStack,
        drawActionStack,
        undoStack,
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

    const { setIsTokenAPrimaryRange, setIsLinesSwitched } =
        useContext(RangeContext);
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
    // const { handlePulseAnimation } = useContext(TradeTableContext);

    const currentPool = useContext(TradeDataContext);

    const {
        tokenA,
        tokenB,
        isDenomBase,
        isTokenABase: isBid,
        isTokenAPrimary,
        setIsTokenAPrimary,
    } = currentPool;

    const [isChartZoom, setIsChartZoom] = useState(false);

    const [chartHeights, setChartHeights] = useState(0);
    const { isUserConnected } = useContext(UserDataContext);

    const tradeData = useAppSelector((state) => state.tradeData);
    const { isTokenAPrimaryRange, advancedMode } = useContext(RangeContext);

    const [minTickForLimit, setMinTickForLimit] = useState<number>(0);
    const [maxTickForLimit, setMaxTickForLimit] = useState<number>(0);
    const [isShowFloatingToolbar, setIsShowFloatingToolbar] = useState(false);
    const period = unparsedData.duration;

    const side =
        (isDenomBase && !isBid) || (!isDenomBase && isBid) ? 'buy' : 'sell';
    const sellOrderStyle = side === 'sell' ? 'order_sell' : 'order_buy';
    const [activeDrawingType, setActiveDrawingType] = useState('Cross');

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
    const [isShapeEdited, setIsShapeEdited] = useState<boolean>();

    const [isLineDrag, setIsLineDrag] = useState(false);

    // Data
    const [crosshairData, setCrosshairData] = useState<crosshair[]>([
        { x: 0, y: 0 },
    ]);

    // Draw
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [lineSeries, setLineSeries] = useState<any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [dashedLineSeries, setDashedLineSeries] = useState<any>();

    const [selectedDrawnShape, setSelectedDrawnShape] = useState<
        selectedDrawnData | undefined
    >(undefined);

    const [hoveredDrawnShape, setHoveredDrawnShape] = useState<
        selectedDrawnData | undefined
    >(undefined);

    const mobileView = useMediaQuery('(max-width: 600px)');

    const initialData = localStorage.getItem(CHART_ANNOTATIONS_LS_KEY);

    const initialIsToolbarOpen = initialData
        ? JSON.parse(initialData).isOpenAnnotationPanel
        : true;

    const [isToolbarOpen, setIsToolbarOpen] = useState(initialIsToolbarOpen);

    const unparsedCandleData = useMemo(() => {
        const data = unparsedData.candles
            .sort((a, b) => b.time - a.time)
            .map((item) => ({
                ...item,
                isFakeData: false,
            }));
        if (poolPriceWithoutDenom && data && data.length > 0) {
            const closePriceWithDenom =
                data[0].invPriceCloseExclMEVDecimalCorrected;
            const poolPriceWithDenom = 1 / poolPriceWithoutDenom;

            const fakeDataOpenWithDenom = closePriceWithDenom;

            const fakeDataCloseWithDenom = poolPriceWithDenom;

            const closePrice = data[0].priceCloseExclMEVDecimalCorrected;

            const fakeDataOpen = closePrice;

            const fakeDataClose = poolPriceWithoutDenom;

            const placeHolderCandle = {
                time: data[0].time + period,
                invMinPriceExclMEVDecimalCorrected: fakeDataOpenWithDenom,
                maxPriceExclMEVDecimalCorrected: fakeDataOpen,
                invMaxPriceExclMEVDecimalCorrected: fakeDataCloseWithDenom,
                minPriceExclMEVDecimalCorrected: fakeDataClose,
                invPriceOpenExclMEVDecimalCorrected: fakeDataOpenWithDenom,
                priceOpenExclMEVDecimalCorrected: fakeDataOpen,
                invPriceCloseExclMEVDecimalCorrected: fakeDataCloseWithDenom,
                priceCloseExclMEVDecimalCorrected: fakeDataClose,
                period: period,
                tvlData: {
                    time: data[0].time,
                    tvl: data[0].tvlData.tvl,
                },
                volumeUSD: 0,
                averageLiquidityFee: data[0].averageLiquidityFee,
                minPriceDecimalCorrected: fakeDataClose,
                maxPriceDecimalCorrected: 0,
                priceOpenDecimalCorrected: fakeDataOpen,
                priceCloseDecimalCorrected: fakeDataClose,
                invMinPriceDecimalCorrected: fakeDataCloseWithDenom,
                invMaxPriceDecimalCorrected: 0,
                invPriceOpenDecimalCorrected: fakeDataOpenWithDenom,
                invPriceCloseDecimalCorrected: fakeDataCloseWithDenom,
                isCrocData: false,
                isFakeData: true,
            };

            // added candle for pool price market price match
            if (!data[0].isFakeData) {
                data.unshift(placeHolderCandle);
            } else {
                data[0] = placeHolderCandle;
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
            !(!advancedMode && simpleRangeWidth === 100) &&
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
        advancedMode,
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
        localStorage.setItem(
            CHART_ANNOTATIONS_LS_KEY,
            JSON.stringify({
                isOpenAnnotationPanel: isToolbarOpen,
                drawnShapes: drawnShapeHistory,
            }),
        );
    }, [JSON.stringify(drawnShapeHistory), isToolbarOpen]);

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

            let wheelTimeout: NodeJS.Timeout | null = null; // Declare wheelTimeout

            if (lastCandleDate && firstCandleDate) {
                d3.select(d3CanvasMain.current).on(
                    'wheel',
                    function (event) {
                        if (wheelTimeout === null) {
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

                        if (wheelTimeout) {
                            clearTimeout(wheelTimeout);
                        }
                        // check wheel end
                        wheelTimeout = setTimeout(() => {
                            setIsChartZoom(false);
                            showLatestActive();
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

                                    if (advancedMode && liquidityData) {
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
                        setSelectedDrawnShape(undefined);

                        if (event.type.includes('touch')) {
                            const canvas = d3
                                .select(d3CanvasMain.current)
                                .select('canvas')
                                .node() as HTMLCanvasElement;

                            const rectCanvas = canvas.getBoundingClientRect();

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

                            return !isOnLimit && !isOnRangeMin && !isOnRangeMax;
                        } else {
                            return !canUserDragRange && !canUserDragLimit;
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
        unparsedCandleData,
        period,
        advancedMode,
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
        if (!advancedMode && simpleRangeWidth === 100) {
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
            advancedMode
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
        advancedMode,
        chartTriggeredBy,
    ]);

    useEffect(() => {
        if (
            advancedMode &&
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
        advancedMode,
        ranges,
        liquidityData?.liqBidData,
        diffHashSigScaleData(scaleData, 'y'),
    ]);

    // *** LIMIT ***
    /**
     * This function checks if the limit values trigger a position changes buy /sell .
     * If the conditions are met, it initiates a pulse animation and updates the limit direction accordingly.
     * @param limitPreviousData  limit value before the operation started
     * @param newLimitValue  limit value the operation finished
     */
    function reverseTokenForChart(
        limitPreviousData: number,
        newLimitValue: number,
    ): boolean {
        // output variable
        let needsInversion = false;
        // doesn't exist on initialization
        if (poolPriceDisplay) {
            // logic tree to determine if the limit price crosses the current pool price
            // sell => buy or buy to sell
            if (sellOrderStyle === 'order_sell') {
                // old price > pool price AND new price is < pool price
                // Check if the previous limit was above poolPriceDisplay and the new limit is below it
                if (
                    limitPreviousData > poolPriceDisplay &&
                    newLimitValue < poolPriceDisplay
                ) {
                    needsInversion = true;
                }
            } else {
                // Check if the previous limit was below poolPriceDisplay and the new limit is above it.
                if (
                    limitPreviousData < poolPriceDisplay &&
                    newLimitValue > poolPriceDisplay
                ) {
                    needsInversion = true;
                }
            }
        }
        return needsInversion;
    }

    // *** LIMIT ***
    /**
     * This function retrieves the 'noGoZoneMin' and 'noGoZoneMax' values from the 'noGoZoneBoundaries' array.
     * These values represent the minimum and maximum boundaries of a no-go zone.
     *
     * @returns {Object} An object containing 'noGoZoneMin' and 'noGoZoneMax'.
     */
    const getNoZoneData = () => {
        const noGoZoneMin = noGoZoneBoudnaries[0][0];
        const noGoZoneMax = noGoZoneBoudnaries[0][1];
        return { noGoZoneMin: noGoZoneMin, noGoZoneMax: noGoZoneMax };
    };

    // *** LIMIT ***
    /**
     * finds border ticks of nogozone
     * This function sets the 'minTickForLimit' and 'maxTickForLimit' values
     * tick values are calculated based on the 'low' and 'high' values provided near the no go zone.
     *
     * @param low   The low value for the calculation
     * @param high  The high value for the calculation
     */
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

    // *** LİMİT ***
    // This function calculates a new limit value, and adjusts it as a corrected limit if it falls within the No-Go Zone boundaries.
    function calculateLimit(newLimitValue: number) {
        if (newLimitValue < 0) newLimitValue = 0;

        // If the calculated limit value is within "No Go Zone", it returns the limit value outside the region
        newLimitValue = setLimitForNoGoZone(newLimitValue);

        // Get data for the No-Go Zone (minimum and maximum values)
        const { noGoZoneMin, noGoZoneMax } = getNoZoneData();

        const limitNonDisplay = denomInBase
            ? pool?.fromDisplayPrice(newLimitValue)
            : pool?.fromDisplayPrice(1 / newLimitValue);

        // Check if the newLimitValue matches the No-Go Zone maximum or minimum
        const isNoGoneZoneMax = newLimitValue === noGoZoneMax;
        const isNoGoneZoneMin = newLimitValue === noGoZoneMin;

        limitNonDisplay?.then((limit) => {
            limit = limit !== 0 ? limit : 1;
            let pinnedTick: number = isTokenABase
                ? pinTickLower(limit, chainData.gridSize)
                : pinTickUpper(limit, chainData.gridSize);

            // If it is equal to the minimum value of no go zone, value is rounded lower tick
            if (isNoGoneZoneMin) {
                pinnedTick = isDenomBase
                    ? pinTickUpper(limit, chainData.gridSize)
                    : pinTickLower(limit, chainData.gridSize);
            }

            // If it is equal to the max value of no go zone, value is rounded upper tick
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

                    // Update newLimitValue if it's outside the No-Go Zone
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
        return newLimitValue;
    }

    // dragRange
    useEffect(() => {
        if (scaleData) {
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
            let offsetY = 0;
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
                    if (event.sourceEvent instanceof TouchEvent) {
                        offsetY =
                            event.sourceEvent.touches[0].clientY -
                            rectCanvas?.top;
                    } else {
                        offsetY = event.sourceEvent.clientY - rectCanvas?.top;
                    }

                    if (!cancelDrag && liquidityData) {
                        setIsLineDrag(true);
                        setCrosshairActive('none');

                        let draggedValue =
                            scaleData?.yScale.invert(offsetY) >=
                            liquidityData?.topBoundary
                                ? liquidityData?.topBoundary
                                : scaleData?.yScale.invert(offsetY);

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
                            !advancedMode ||
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
                                            draggedValue.toString(),
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
                            const advancedValue =
                                scaleData?.yScale.invert(offsetY);
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
                })
                .on('end', () => {
                    setIsLineDrag(false);

                    if (!cancelDrag) {
                        if (
                            (!advancedMode ||
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

            setDragRange(() => {
                return dragRange;
            });
        }
    }, [
        poolPriceDisplay,
        location,
        advancedMode,
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

    // dragLimit
    useEffect(() => {
        const canvas = d3
            .select(d3CanvasMain.current)
            .select('canvas')
            .node() as HTMLCanvasElement;
        const rectCanvas = canvas.getBoundingClientRect();
        let offsetY = 0;
        let movemementY = 0;
        let newLimitValue: number | undefined;
        let tempNewLimitValue: number | undefined;

        let tempMovemementY = 0;
        let cancelDrag = false;
        let oldLimitValue: number | undefined = undefined;
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
        const dragLimit = d3
            .drag<d3.DraggedElementBaseType, unknown, d3.SubjectPosition>()
            .on('start', (event) => {
                // When the drag starts:
                // hide the cursor
                d3.select(d3CanvasMain.current).style('cursor', 'none');
                // hide the cursor over the y-axis canvas.
                d3.select('#y-axis-canvas').style('cursor', 'none');

                // add a keydown event listener to cancel the drag.
                document.addEventListener('keydown', cancelDragEvent);

                // Store the initial value of the limit for potential cancellation.
                oldLimitValue = limit;
                newLimitValue = limit;
                tempNewLimitValue = limit;
                if (event.sourceEvent instanceof TouchEvent) {
                    tempMovemementY =
                        event.sourceEvent.touches[0].clientY - rectCanvas?.top;
                }
            })
            .on('drag', function (event) {
                (async () => {
                    // Indicate that line is dragging
                    setIsLineDrag(true);
                    if (event.sourceEvent instanceof TouchEvent) {
                        offsetY =
                            event.sourceEvent.touches[0].clientY -
                            rectCanvas?.top;

                        movemementY = offsetY - tempMovemementY;
                    } else {
                        offsetY = event.sourceEvent.clientY - rectCanvas?.top;

                        movemementY = event.sourceEvent.movementY;
                    }
                    if (!cancelDrag) {
                        // to hide the crosshair when dragging the line set the crosshairActive to 'none'.
                        setCrosshairActive('none');

                        // // Calculate the new limit value based on the Y-coordinate.
                        if (tempNewLimitValue !== undefined) {
                            tempNewLimitValue = scaleData?.yScale.invert(
                                scaleData?.yScale(tempNewLimitValue) +
                                    movemementY,
                            );

                            // Perform calculations based on the new limit value
                            if (tempNewLimitValue) {
                                newLimitValue =
                                    calculateLimit(tempNewLimitValue);
                            }
                        }
                    } else {
                        // If the drag is canceled, restore the previous limit value.
                        if (oldLimitValue !== undefined) {
                            setLimit(() => {
                                return oldLimitValue as number;
                            });
                        }
                    }
                })().then(() => {
                    if (event.sourceEvent instanceof TouchEvent) {
                        tempMovemementY =
                            event.sourceEvent.touches[0].clientY -
                            rectCanvas?.top;
                    }
                });
            })
            .on('end', () => {
                tempMovemementY = 0;
                setIsLineDrag(false);
                // If the drag is not canceled
                if (!cancelDrag) {
                    // Change the cursor to 'row-resize'
                    d3.select(d3Container.current).style(
                        'cursor',
                        'row-resize',
                    );
                    if (
                        oldLimitValue !== undefined &&
                        newLimitValue !== undefined
                    ) {
                        onBlurLimitRate(oldLimitValue, newLimitValue);
                    }
                } else {
                    if (oldLimitValue !== undefined) {
                        setLimit(() => {
                            return oldLimitValue as number;
                        });
                    }
                }

                // Restore default cursor styles
                d3.select(d3CanvasMain.current).style('cursor', 'default');
                d3.select('#y-axis-canvas').style('cursor', 'default');
                setIsLineDrag(false);
            });

        setDragLimit(() => {
            return dragLimit;
        });
    }, [
        poolPriceDisplay,
        location,
        advancedMode,
        limit,
        minPrice,
        maxPrice,
        minTickForLimit,
        maxTickForLimit,
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
                if (dragRange && !isLineDrag) {
                    d3.select<d3.DraggedElementBaseType, unknown>(
                        d3CanvasMain.current,
                    ).call(dragRange);
                }
            }
            if (location.pathname.includes('/limit')) {
                if (dragLimit && !isLineDrag) {
                    d3.select<d3.DraggedElementBaseType, unknown>(
                        d3CanvasMain.current,
                    ).call(dragLimit);
                }
            }
            renderCanvasArray([d3CanvasMain]);
        }
    }, [location.pathname, mainZoom, dragLimit, dragRange, isLineDrag]);

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

            if (!advancedMode || location.pathname.includes('reposition')) {
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

                if (event.pointerType === 'touch') {
                    const lowTick =
                        currentPoolPriceTick - rangeWidthPercentage * 100;
                    const highTick =
                        currentPoolPriceTick + rangeWidthPercentage * 100;

                    const pinnedDisplayPrices = getPinnedPriceValuesFromTicks(
                        isDenomBase,
                        baseTokenDecimals,
                        quoteTokenDecimals,
                        lowTick,
                        highTick,
                        lookupChain(chainId).gridSize,
                    );

                    setMaxPrice(
                        parseFloat(
                            pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated,
                        ),
                    );
                    setMinPrice(
                        parseFloat(
                            pinnedDisplayPrices.pinnedMinPriceDisplayTruncated,
                        ),
                    );
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
        denomInBase,
    );

    const selectedCircleSeries = createCircle(
        scaleData?.xScale,
        scaleData?.yScale,
        80,
        0.5,
        denomInBase,
        true,
    );

    useEffect(() => {
        const canvas = d3
            .select(d3CanvasMain.current)
            .select('canvas')
            .node() as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');

        if (scaleData && lineSeries) {
            const rayLine = createAnnotationLineSeries(
                scaleData?.xScale.copy(),
                scaleData?.yScale,
            );

            const bandArea = createBandArea(
                scaleData?.xScale.copy(),
                scaleData?.yScale,
                denomInBase,
            );

            d3.select(d3CanvasMain.current)
                .on('draw', () => {
                    setCanvasResolution(canvas);

                    drawnShapeHistory?.forEach((item) => {
                        if (item.pool) {
                            const isShapeInCurrentPool =
                                JSON.stringify(currentPool.tokenA) ===
                                    JSON.stringify(
                                        isTokenABase === item.pool.isTokenABase
                                            ? item.pool.tokenA
                                            : item.pool.tokenB,
                                    ) &&
                                JSON.stringify(currentPool.tokenB) ===
                                    JSON.stringify(
                                        isTokenABase === item.pool.isTokenABase
                                            ? item.pool.tokenB
                                            : item.pool.tokenA,
                                    );

                            if (isShapeInCurrentPool) {
                                if (
                                    item.type === 'Brush' ||
                                    item.type === 'Angle'
                                ) {
                                    if (ctx) ctx.setLineDash(item.style);
                                    lineSeries.decorate(
                                        (context: CanvasRenderingContext2D) => {
                                            context.strokeStyle = item.color;
                                            context.lineWidth = item.lineWidth;
                                        },
                                    );

                                    lineSeries(item?.data);
                                    if (
                                        (hoveredDrawnShape &&
                                            hoveredDrawnShape.data.time ===
                                                item.time) ||
                                        (selectedDrawnShape &&
                                            selectedDrawnShape.data.time ===
                                                item.time)
                                    ) {
                                        item.data.forEach((element) => {
                                            if (
                                                hoveredDrawnShape &&
                                                hoveredDrawnShape.selectedCircle &&
                                                hoveredDrawnShape.selectedCircle
                                                    .x === element.x &&
                                                Number(
                                                    element.y.toFixed(12),
                                                ) ===
                                                    (element.denomInBase ===
                                                    denomInBase
                                                        ? Number(
                                                              hoveredDrawnShape?.selectedCircle.y.toFixed(
                                                                  12,
                                                              ),
                                                          )
                                                        : Number(
                                                              (
                                                                  1 /
                                                                  hoveredDrawnShape
                                                                      ?.selectedCircle
                                                                      .y
                                                              ).toFixed(12),
                                                          ))
                                            ) {
                                                if (!isUpdatingShape) {
                                                    selectedCircleSeries([
                                                        element,
                                                    ]);
                                                }
                                            } else {
                                                circleSeries([element]);
                                            }
                                        });
                                    }

                                    if (item.type === 'Angle') {
                                        const opposite = Math.abs(
                                            scaleData.yScale(item?.data[0].y) -
                                                scaleData.yScale(
                                                    item?.data[1].y,
                                                ),
                                        );
                                        const side = Math.abs(
                                            scaleData.xScale(item?.data[0].x) -
                                                scaleData.xScale(
                                                    item?.data[1].x,
                                                ),
                                        );

                                        const distance = opposite / side;

                                        const minAngleLineLength =
                                            side / 4 > 80
                                                ? Math.abs(
                                                      item?.data[0].x -
                                                          item?.data[1].x,
                                                  ) / 4
                                                : scaleData.xScale.invert(
                                                      scaleData.xScale(
                                                          item?.data[0].x,
                                                      ) + 80,
                                                  ) - item?.data[0].x;

                                        const minAngleTextLength =
                                            item?.data[0].x +
                                            minAngleLineLength +
                                            scaleData.xScale.invert(
                                                scaleData.xScale(
                                                    item?.data[0].x,
                                                ) + 20,
                                            ) -
                                            item?.data[0].x;

                                        const angleLineData = [
                                            {
                                                x: item?.data[0].x,
                                                y: item?.data[0].y,
                                                denomInBase:
                                                    item?.data[0].denomInBase,
                                            },
                                            {
                                                x:
                                                    item?.data[0].x +
                                                    minAngleLineLength,
                                                y: item?.data[0].y,
                                                denomInBase:
                                                    item?.data[0].denomInBase,
                                            },
                                        ];

                                        const angle =
                                            Math.atan(distance) *
                                            (180 / Math.PI);

                                        const supplement =
                                            item?.data[1].x > item?.data[0].x
                                                ? -Math.atan(distance)
                                                : Math.PI + Math.atan(distance);

                                        const arcX =
                                            item?.data[1].y > item?.data[0].y
                                                ? supplement
                                                : 0;
                                        const arcY =
                                            item?.data[1].y > item?.data[0].y
                                                ? 0
                                                : -supplement;

                                        const radius =
                                            scaleData.xScale(
                                                item?.data[0].x +
                                                    minAngleLineLength,
                                            ) -
                                            scaleData.xScale(item?.data[0].x);

                                        if (ctx) {
                                            ctx.setLineDash([5, 3]);
                                            dashedLineSeries.decorate(
                                                (
                                                    context: CanvasRenderingContext2D,
                                                ) => {
                                                    context.strokeStyle =
                                                        item.color;
                                                    context.lineWidth = 1;
                                                },
                                            );
                                            dashedLineSeries(angleLineData);

                                            ctx.beginPath();
                                            ctx.arc(
                                                scaleData.xScale(
                                                    item.data[0].x,
                                                ),
                                                scaleData.yScale(
                                                    item.data[0].y,
                                                ),
                                                radius,
                                                arcX,
                                                arcY,
                                            );
                                            ctx.stroke();

                                            ctx.textAlign = 'center';
                                            ctx.textBaseline = 'middle';
                                            ctx.fillStyle = 'white';
                                            ctx.font = '50 12px Lexend Deca';

                                            const angleDisplay =
                                                item?.data[1].x >
                                                item?.data[0].x
                                                    ? angle
                                                    : 180 - angle;

                                            ctx.fillText(
                                                (item?.data[1].y >
                                                item?.data[0].y
                                                    ? ''
                                                    : '-') +
                                                    angleDisplay
                                                        .toFixed(0)
                                                        .toString() +
                                                    'º',
                                                scaleData.xScale(
                                                    minAngleTextLength,
                                                ),
                                                scaleData.yScale(
                                                    item?.data[0].y,
                                                ),
                                            );

                                            ctx.closePath();
                                        }
                                    }
                                }

                                if (item.type === 'Square') {
                                    const range = [
                                        scaleData?.xScale(item.data[0].x),
                                        scaleData?.xScale(item.data[1].x),
                                    ];

                                    bandArea.xScale().range(range);
                                    const checkDenom =
                                        item.data[0].denomInBase ===
                                        denomInBase;
                                    const bandData = {
                                        fromValue: checkDenom
                                            ? item.data[0].y
                                            : 1 / item.data[0].y,
                                        toValue: checkDenom
                                            ? item.data[1].y
                                            : 1 / item.data[1].y,
                                        denomInBase: denomInBase,
                                    } as bandLineData;

                                    const rgbaValues =
                                        item.color.match(/\d+(\.\d+)?/g);

                                    if (rgbaValues) {
                                        const alphaValue =
                                            Number(rgbaValues[3]) < 0.3
                                                ? Number(rgbaValues[3]) / 2
                                                : '0.15';

                                        const rectRgbaFiller =
                                            'rgba(' +
                                            rgbaValues[0] +
                                            ',' +
                                            rgbaValues[1] +
                                            ',' +
                                            rgbaValues[2] +
                                            ',' +
                                            alphaValue +
                                            ')';

                                        bandArea.decorate(
                                            (
                                                context: CanvasRenderingContext2D,
                                            ) => {
                                                context.fillStyle =
                                                    rectRgbaFiller;
                                            },
                                        );
                                    }

                                    bandArea([bandData]);

                                    const lineOfBand = createPointsOfBandLine(
                                        item.data,
                                    );

                                    lineOfBand?.forEach((line) => {
                                        if (ctx) ctx.setLineDash(item.style);
                                        lineSeries.decorate(
                                            (
                                                context: CanvasRenderingContext2D,
                                            ) => {
                                                context.strokeStyle =
                                                    item.color;
                                                context.lineWidth =
                                                    item.lineWidth;
                                            },
                                        );
                                        lineSeries(line);

                                        if (
                                            (hoveredDrawnShape &&
                                                hoveredDrawnShape.data.time ===
                                                    item.time) ||
                                            (selectedDrawnShape &&
                                                selectedDrawnShape.data.time ===
                                                    item.time)
                                        ) {
                                            line.forEach((element, _index) => {
                                                const selectedCircleIsActive =
                                                    hoveredDrawnShape &&
                                                    hoveredDrawnShape.selectedCircle &&
                                                    hoveredDrawnShape
                                                        .selectedCircle.x ===
                                                        element.x &&
                                                    Number(
                                                        element.y.toFixed(12),
                                                    ) ===
                                                        (element.denomInBase ===
                                                        denomInBase
                                                            ? Number(
                                                                  hoveredDrawnShape?.selectedCircle.y.toFixed(
                                                                      12,
                                                                  ),
                                                              )
                                                            : Number(
                                                                  (
                                                                      1 /
                                                                      hoveredDrawnShape
                                                                          ?.selectedCircle
                                                                          .y
                                                                  ).toFixed(12),
                                                              ));

                                                if (selectedCircleIsActive) {
                                                    if (!isUpdatingShape) {
                                                        selectedCircleSeries([
                                                            element,
                                                        ]);
                                                    }
                                                } else {
                                                    circleSeries([element]);
                                                }
                                            });
                                        }
                                    });
                                }

                                if (item.type === 'Ray') {
                                    rayLine
                                        .xScale()
                                        .domain(scaleData.xScale.domain());

                                    rayLine
                                        .yScale()
                                        .domain(scaleData.yScale.domain());

                                    const range = [
                                        scaleData.xScale(item.data[0].x),
                                        scaleData.xScale.range()[1],
                                    ];

                                    rayLine.xScale().range(range);
                                    if (ctx) ctx.setLineDash(item.style);
                                    rayLine.decorate(
                                        (context: CanvasRenderingContext2D) => {
                                            context.strokeStyle = item.color;
                                            context.lineWidth = item.lineWidth;
                                        },
                                    );

                                    rayLine([
                                        {
                                            denomInBase:
                                                item.data[0].denomInBase,
                                            y:
                                                item.data[0].denomInBase ===
                                                denomInBase
                                                    ? item.data[0].y
                                                    : 1 / item.data[0].y,
                                        },
                                    ]);
                                    if (
                                        (hoveredDrawnShape &&
                                            hoveredDrawnShape.data.time ===
                                                item.time) ||
                                        (selectedDrawnShape &&
                                            selectedDrawnShape.data.time ===
                                                item.time)
                                    ) {
                                        if (
                                            hoveredDrawnShape &&
                                            hoveredDrawnShape.selectedCircle &&
                                            hoveredDrawnShape.selectedCircle
                                                .x === item.data[0].x &&
                                            Number(
                                                item.data[0].y.toFixed(12),
                                            ) ===
                                                (item.data[0].denomInBase ===
                                                denomInBase
                                                    ? Number(
                                                          hoveredDrawnShape?.selectedCircle.y.toFixed(
                                                              12,
                                                          ),
                                                      )
                                                    : Number(
                                                          (
                                                              1 /
                                                              hoveredDrawnShape
                                                                  ?.selectedCircle
                                                                  .y
                                                          ).toFixed(12),
                                                      ))
                                        ) {
                                            if (!isUpdatingShape) {
                                                selectedCircleSeries([
                                                    item.data[0],
                                                ]);
                                            }
                                        } else {
                                            circleSeries([
                                                {
                                                    denomInBase:
                                                        item.data[0]
                                                            .denomInBase,
                                                    y: item.data[0].y,
                                                    x: item.data[0].x,
                                                },
                                            ]);
                                        }
                                    }
                                }
                            }
                        }
                    });

                    setIsShapeEdited(false);
                })
                .on('measure', () => {
                    bandArea.context(ctx);
                    rayLine.context(ctx);
                    lineSeries.context(ctx);
                    circleSeries.context(ctx);
                    selectedCircleSeries.context(ctx);
                    dashedLineSeries.context(ctx);
                });

            render();
        }
    }, [
        diffHashSig(drawnShapeHistory),
        lineSeries,
        hoveredDrawnShape,
        selectedDrawnShape,
        isUpdatingShape,
        denomInBase,
        period,
        isShapeEdited,
        // anglePointSeries,
    ]);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handleKeyDown = function (event: any) {
            if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
                undo();
                setSelectedDrawnShape(undefined);
            } else if ((event.ctrlKey || event.metaKey) && event.key === 'y') {
                redo();
                setSelectedDrawnShape(undefined);
            }
            if (event.key === 'Escape') {
                setSelectedDrawnShape(undefined);
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [undo, redo, drawActionStack, undoStack]);

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

            if (
                filtered !== undefined &&
                filtered.length > 10 &&
                poolPriceWithoutDenom
            ) {
                const placeHolderPrice = denomInBase
                    ? 1 / poolPriceWithoutDenom
                    : poolPriceWithoutDenom;

                const filteredMin = d3.min(filtered, (d) =>
                    denomInBase
                        ? d.invMaxPriceExclMEVDecimalCorrected
                        : d.minPriceExclMEVDecimalCorrected,
                );

                const filteredMax = d3.max(filtered, (d) =>
                    denomInBase
                        ? d.invMinPriceExclMEVDecimalCorrected
                        : d.maxPriceExclMEVDecimalCorrected,
                );

                const marketPrice = market;

                if (filteredMin && filteredMax) {
                    const minYBoundary = Math.min(
                        placeHolderPrice,
                        filteredMin,
                    );
                    const maxYBoundary = Math.max(
                        placeHolderPrice,
                        filteredMax,
                    );

                    const diffBoundray = Math.abs(maxYBoundary - minYBoundary);
                    const buffer = diffBoundray
                        ? diffBoundray / 6
                        : minYBoundary / 2;
                    if (
                        location.pathname.includes('pool') ||
                        location.pathname.includes('reposition')
                    ) {
                        if (simpleRangeWidth !== 100 || advancedMode) {
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

                            const bufferForRange = Math.abs((low - high) / 6);

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

                            const bufferForRange = Math.abs((low - high) / 90);

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

    // mousemove
    useEffect(() => {
        if (!isChartZoom) {
            d3.select(d3CanvasMain.current).on(
                'mousemove',
                function (event: MouseEvent<HTMLDivElement>) {
                    mousemove(event);
                },
            );
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
        period,
        currentPool,
    ]);

    useEffect(() => {
        if (selectedDrawnShape) {
            setIsShowFloatingToolbar(true);
        }
    }, [selectedDrawnShape]);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handleDocumentClick = (event: any) => {
            if (
                d3Container.current &&
                !d3Container.current.contains(event.target)
            ) {
                setIsShowFloatingToolbar(false);
            }
        };

        document.addEventListener('click', handleDocumentClick);

        return () => {
            document.removeEventListener('click', handleDocumentClick);
        };
    }, []);

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

    /**
     * This useEffect block handles various interactions with the chart canvas based on user actions and context.
     * It includes logic for handling clicks on the canvas, mouseleave events, and chart rendering.
     */
    useEffect(() => {
        if (scaleData !== undefined) {
            // Define the 'onClickCanvas' event handler for canvas clicks
            const onClickCanvas = (event: PointerEvent) => {
                // If the candle or volume click
                const { isHoverCandleOrVolumeData, nearest } =
                    candleOrVolumeDataHoverStatus(event.offsetX, event.offsetY);
                selectedDateEvent(isHoverCandleOrVolumeData, nearest);

                setCrosshairActive('none');
                // Check if the location pathname includes 'pool' or 'reposition' and handle the click event.

                setSelectedDrawnShape(undefined);

                if (
                    (location.pathname.includes('pool') ||
                        location.pathname.includes('reposition')) &&
                    scaleData !== undefined &&
                    !isHoverCandleOrVolumeData
                ) {
                    onClickRange(event);
                }

                // Check if the location pathname includes '/limit' and handle the click event.
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
        advancedMode,
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
        denomInBase: boolean,
    ) {
        const startX = element[0].x;
        const startY =
            element[0].denomInBase === denomInBase
                ? element[0].y
                : 1 / element[0].y;
        const endX = element[1].x;
        const endY =
            element[1].denomInBase === denomInBase
                ? element[1].y
                : 1 / element[1].y;

        if (scaleData) {
            const threshold = 10;
            const distance = distanceToLine(
                mouseX,
                mouseY,
                scaleData.xScale(startX),
                scaleData.yScale(startY),
                scaleData.xScale(endX),
                scaleData.yScale(endY),
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

            allBandLines.forEach(
                (item: { x: number; y: number; denomInBase: boolean }[]) => {
                    const startX = item[0].x;
                    const startY =
                        item[0].denomInBase === denomInBase
                            ? item[0].y
                            : 1 / item[0].y;
                    const endX = item[1].x;
                    const endY =
                        item[1].denomInBase === denomInBase
                            ? item[1].y
                            : 1 / item[1].y;

                    const distance = distanceToLine(
                        mouseX,
                        mouseY,
                        scaleData.xScale(startX),
                        scaleData.yScale(startY),
                        scaleData.xScale(endX),
                        scaleData.yScale(endY),
                    );

                    if (distance < threshold) {
                        isOverLine = true;
                    }
                },
            );
        }

        return isOverLine;
    }

    function checkRayLineLocation(
        element: lineData[],
        mouseX: number,
        mouseY: number,
        denomInBase: boolean,
    ) {
        if (scaleData) {
            const startX = element[0].x;
            const startY =
                element[0].denomInBase === denomInBase
                    ? element[0].y
                    : 1 / element[0].y;
            const endX = scaleData.xScale.domain()[1];
            const endY =
                element[0].denomInBase === denomInBase
                    ? element[0].y
                    : 1 / element[0].y;

            const threshold = 10;
            const distance = distanceToLine(
                mouseX,
                mouseY,
                scaleData.xScale(startX),
                scaleData.yScale(startY),
                scaleData.xScale(endX),
                scaleData.yScale(endY),
            );

            return distance < threshold;
        }

        return false;
    }

    const drawnShapesHoverStatus = (mouseX: number, mouseY: number) => {
        let resElement = undefined;

        drawnShapeHistory.forEach((element) => {
            const isShapeInCurrentPool =
                JSON.stringify(currentPool.tokenA) ===
                    JSON.stringify(
                        isTokenABase === element.pool.isTokenABase
                            ? element.pool.tokenA
                            : element.pool.tokenB,
                    ) &&
                JSON.stringify(currentPool.tokenB) ===
                    JSON.stringify(
                        isTokenABase === element.pool.isTokenABase
                            ? element.pool.tokenB
                            : element.pool.tokenA,
                    );

            if (isShapeInCurrentPool) {
                if (element.type === 'Brush' || element.type === 'Angle') {
                    if (
                        checkLineLocation(
                            element.data,
                            mouseX,
                            mouseY,
                            denomInBase,
                        )
                    ) {
                        resElement = element;
                    }
                }

                if (element.type === 'Square') {
                    if (checkRectLocation(element.data, mouseX, mouseY)) {
                        resElement = element;
                    }
                }
                if (element.type === 'Ray') {
                    if (
                        checkRayLineLocation(
                            element.data,
                            mouseX,
                            mouseY,
                            denomInBase,
                        )
                    ) {
                        resElement = element;
                    }
                }
            }
        });

        if (resElement && scaleData) {
            const selectedCircle = checkCricleLocation(
                resElement,
                mouseX,
                mouseY,
                scaleData,
                denomInBase,
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
        reset,
        latest,
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
            setIsLinesSwitched(isLinesSwitched);
        }
    };

    // hook to generate navigation actions with pre-loaded path
    const linkGenLimit: linkGenMethodsIF = useLinkGen('limit');

    /**
     *  This method updates the global limitTick value according to local limit value
     *  and It trigger sell or buy changes if necessary
     * @param limitPreviousData  limit value before the operation started
     * @param newLimitValue  limit value the operation finished
     */
    const onBlurLimitRate = (
        limitPreviousData: number,
        newLimitValue: number,
    ): void => {
        if (newLimitValue === undefined) return;

        const limitNonDisplay = denomInBase
            ? pool?.fromDisplayPrice(newLimitValue)
            : pool?.fromDisplayPrice(1 / newLimitValue);

        limitNonDisplay?.then((limit) => {
            limit = limit !== 0 ? limit : 1;

            const pinnedTick: number = isTokenABase
                ? pinTickLower(limit, chainData.gridSize)
                : pinTickUpper(limit, chainData.gridSize);

            dispatch(setLimitTick(pinnedTick));

            // if user moves limit price to other side of the current price
            // ... then redirect to new URL params (to reverse the token
            // ... pair; else just update the `limitTick` value in the URL
            reverseTokenForChart(limitPreviousData, newLimitValue)
                ? (() => {
                      setIsTokenAPrimary(!isTokenAPrimary);
                      setIsTokenAPrimaryRange(!isTokenAPrimaryRange),
                          linkGenLimit.redirect({
                              chain: chainData.chainId,
                              tokenA: tokenB.address,
                              tokenB: tokenA.address,
                              limitTick: pinnedTick,
                          });
                  })()
                : updateURL({ update: [['limitTick', pinnedTick]] });

            const tickPrice = tickToPrice(pinnedTick);

            const tickDispPrice = pool?.toDisplayPrice(tickPrice);
            if (!tickDispPrice) {
                setLimit(() => {
                    return newLimitValue;
                });
            } else {
                tickDispPrice.then((tp) => {
                    const displayPriceWithDenom = denomInBase ? tp : 1 / tp;
                    newLimitValue = displayPriceWithDenom;
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
                denomInBase,
            );

            setLineSeries(() => lineSeries);

            const dashedLineSeries = createLinearLineSeries(
                scaleData?.xScale,
                scaleData?.yScale,
                denomInBase,
            );

            setDashedLineSeries(() => dashedLineSeries);
        }
    }, [scaleData, denomInBase]);

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
        isAmbientOrAdvanced: simpleRangeWidth !== 100 || advancedMode,
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

                        {activeDrawingType !== 'Cross' && scaleData && (
                            <DrawCanvas
                                scaleData={scaleData}
                                setDrawnShapeHistory={setDrawnShapeHistory}
                                setCrossHairDataFunc={setCrossHairDataFunc}
                                activeDrawingType={activeDrawingType}
                                setActiveDrawingType={setActiveDrawingType}
                                setSelectedDrawnShape={setSelectedDrawnShape}
                                denomInBase={denomInBase}
                                addDrawActionStack={addDrawActionStack}
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
                                setSelectedDrawnShape={setSelectedDrawnShape}
                                setIsUpdatingShape={setIsUpdatingShape}
                                denomInBase={denomInBase}
                                addDrawActionStack={addDrawActionStack}
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
                            selectedDrawnShape={selectedDrawnShape}
                        />
                    </div>
                </div>
            </d3fc-group>
            {isShowFloatingToolbar && (
                <FloatingToolbar
                    selectedDrawnShape={selectedDrawnShape}
                    mainCanvasBoundingClientRect={mainCanvasBoundingClientRect}
                    setDrawnShapeHistory={setDrawnShapeHistory}
                    setSelectedDrawnShape={setSelectedDrawnShape}
                    deleteItem={deleteItem}
                    setIsShapeEdited={setIsShapeEdited}
                    addDrawActionStack={addDrawActionStack}
                />
            )}

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
