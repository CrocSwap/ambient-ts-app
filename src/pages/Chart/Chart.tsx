/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable quotes */
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import moment from 'moment';

import {
    DetailedHTMLProps,
    Dispatch,
    HTMLAttributes,
    SetStateAction,
    useCallback,
    useContext,
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
import {
    ChainSpec,
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
import { correctStyleForData } from './calcuteAxisDate';
import useHandleSwipeBack from '../../utils/hooks/useHandleSwipeBack';
import { candleTimeIF } from '../../App/hooks/useChartSettings';
import { IS_LOCAL_ENV } from '../../constants';
import {
    diffHashSig,
    diffHashSigChart,
} from '../../utils/functions/diffHashSig';
import { AppStateContext } from '../../contexts/AppStateContext';
import { CandleContext } from '../../contexts/CandleContext';

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
    isUserLoggedIn: boolean | undefined;
    chainData: ChainSpec;
    isTokenABase: boolean;
    expandTradeTable: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        React.SetStateAction<CandleData | undefined>
    >;
    setCurrentVolumeData: React.Dispatch<
        React.SetStateAction<number | undefined>
    >;
    upBodyColor: string;
    upBorderColor: string;
    upVolumeColor: string;
    downVolumeColor: string;
    downBodyColor: string;
    downBorderColor: string;
    isCandleAdded: boolean | undefined;
    setIsCandleAdded: React.Dispatch<boolean>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    scaleData: any;
    chainId: string;
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
    handlePulseAnimation: (type: string) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    liquidityScale: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    liquidityDepthScale: any;
    minPrice: number;
    maxPrice: number;
    setMaxPrice: React.Dispatch<React.SetStateAction<number>>;
    setMinPrice: React.Dispatch<React.SetStateAction<number>>;
    rescaleRangeBoundariesWithSlider: boolean;
    setRescaleRangeBoundariesWithSlider: Dispatch<SetStateAction<boolean>>;
    setRangeSimpleRangeWidth: Dispatch<SetStateAction<number>>;
    rangeSimpleRangeWidth: number | undefined;
    setRepositionRangeWidth: Dispatch<SetStateAction<number>>;
    repositionRangeWidth: number;
    setChartTriggeredBy: React.Dispatch<React.SetStateAction<string>>;
    chartTriggeredBy: string;
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

export default function Chart(props: propsIF) {
    const {
        isUserLoggedIn,
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
        setRangeSimpleRangeWidth,
        rangeSimpleRangeWidth,
        setRepositionRangeWidth,
        repositionRangeWidth,
        setChartTriggeredBy,
        chartTriggeredBy,
        unparsedData,
        prevPeriod,
        candleTimeInSeconds,
        // candleTime,
    } = props;

    const unparsedCandleData = unparsedData.candles;

    const period = unparsedData.duration;

    const poolAdressComb = unparsedData.pool.baseAddress
        ? unparsedData.pool.baseAddress
        : '' + unparsedData.pool.quoteAddress;

    const pool = useContext(PoolContext);
    const {
        sidebar: { isOpen: isSidebarOpen },
    } = useContext(AppStateContext);

    const {
        candleDomains: { setValue: setCandleDomains },
        candleScale: { setValue: setCandleScale },
    } = useContext(CandleContext);

    const tradeData = useAppSelector((state) => state.tradeData);

    const [minTickForLimit, setMinTickForLimit] = useState<any>();
    const [maxTickForLimit, setMaxTickForLimit] = useState<any>();

    const isDenomBase = tradeData.isDenomBase;
    const isBid = tradeData.isTokenABase;
    const side =
        (isDenomBase && !isBid) || (!isDenomBase && isBid) ? 'buy' : 'sell';
    const sellOrderStyle = side === 'sell' ? 'order_sell' : 'order_buy';

    const { showFeeRate, showTvl, showVolume, liqMode } = props.chartItemStates;

    const d3Container = useRef<HTMLInputElement | null>(null);
    const d3CanvasCandle = useRef<HTMLInputElement | null>(null);
    const d3CanvasBar = useRef<HTMLInputElement | null>(null);
    const d3CanvasLiqBid = useRef<HTMLInputElement | null>(null);
    const d3CanvasLiqAsk = useRef<HTMLInputElement | null>(null);

    const d3CanvasLiqBidDepth = useRef<HTMLInputElement | null>(null);
    const d3CanvasLiqAskDepth = useRef<HTMLInputElement | null>(null);

    const d3CanvasLiqBidLine = useRef<HTMLInputElement | null>(null);
    const d3CanvasLiqAskLine = useRef<HTMLInputElement | null>(null);
    const d3CanvasLiqBidDepthLine = useRef<HTMLInputElement | null>(null);
    const d3CanvasLiqAskDepthLine = useRef<HTMLInputElement | null>(null);

    const d3CanvasBand = useRef<HTMLInputElement | null>(null);
    const d3CanvasCrosshair = useRef<HTMLInputElement | null>(null);
    const d3CanvasMarketLine = useRef<HTMLInputElement | null>(null);
    const d3CanvasLimitLine = useRef<HTMLInputElement | null>(null);
    const d3CanvasRangeLine = useRef<HTMLInputElement | null>(null);

    const d3Xaxis = useRef<HTMLInputElement | null>(null);
    const d3Yaxis = useRef<HTMLInputElement | null>(null);
    const dispatch = useAppDispatch();

    const location = useLocation();
    const position = location?.state?.position;

    const simpleRangeWidth = location.pathname.includes('reposition')
        ? repositionRangeWidth
        : rangeSimpleRangeWidth;
    const setSimpleRangeWidth = location.pathname.includes('reposition')
        ? setRepositionRangeWidth
        : setRangeSimpleRangeWidth;

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
    const [isMouseMoveCrosshair, setIsMouseMoveCrosshair] = useState(false);

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
    const [horizontalBandData, setHorizontalBandData] = useState([[0, 0]]);
    const [firstCandle, setFirstCandle] = useState<number>();

    // d3

    const lastCandleData = unparsedCandleData.find(
        (item: any) =>
            item.time === d3.max(unparsedCandleData, (data: any) => data.time),
    );

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
    const [triangle, setTriangle] = useState<any>();

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
    const [dragEvent, setDragEvent] = useState('zoom');

    const [yAxisWidth, setYaxisWidth] = useState('4rem');
    const [bandwidth, setBandwidth] = useState(5);
    const [yAxisCanvasWidth, setYaxisCanvasWidth] = useState(70);

    const [gradientForAsk, setGradientForAsk] = useState();
    const [gradientForBid, setGradientForBid] = useState();

    const [yAxisLabels] = useState<yLabel[]>([]);

    // Subcharts
    const currentPoolPriceTick =
        poolPriceNonDisplay === undefined
            ? 0
            : Math.log(poolPriceNonDisplay) / Math.log(1.0001);

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
                )[0].value = maxPrice;
                newTargets.filter(
                    (target: lineValue) => target.name === 'Min',
                )[0].value =
                    !isAdvancedModeActive && simpleRangeWidth === 100
                        ? 0
                        : minPrice;

                setLiqHighlightedLinesAndArea(newTargets, true);
                scaleWithButtons(minPrice, maxPrice);

                return newTargets;
            });

            // setTriangleRangeValues(maxPrice, minPrice);
        }
    }, [minPrice, maxPrice, isAdvancedModeActive]);

    const scaleWithButtons = (minPrice: number, maxPrice: number) => {
        if (
            poolPriceDisplay !== undefined &&
            rescaleRangeBoundariesWithSlider &&
            rescale
        ) {
            const xmin = scaleData?.xScale.domain()[0];
            const xmax = scaleData?.xScale.domain()[1];

            const filtered = unparsedCandleData?.filter(
                (data: any) =>
                    data.time * 1000 >= xmin && data.time * 1000 <= xmax,
            );

            if (filtered !== undefined) {
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

                if (maxYBoundary && minYBoundary) {
                    const min =
                        minYBoundary < minPrice ? minYBoundary : minPrice;
                    const max =
                        maxYBoundary > maxPrice ? maxYBoundary : maxPrice;

                    const buffer = Math.abs((max - min) / 6);
                    const domain = [
                        Math.min(min, max) - buffer,
                        Math.max(max, min) + buffer / 2,
                    ];
                    scaleData?.yScale.domain(domain);
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

                setLiqHighlightedLinesAndArea(newTargets);

                return newTargets;
            });

            // setTriangleRangeValues(maxPrice, 0);

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
                const diff = Math.abs(firstCandle - unparsedCandleData[0].time);
                setFirstCandle(() => {
                    return unparsedCandleData[0].time;
                });

                const domainLeft = scaleData?.xScale.domain()[0];
                const domainRight = scaleData?.xScale.domain()[1];

                scaleData?.xScale.domain([
                    domainLeft + diff,
                    domainRight + diff,
                ]);
            } else if (firstCandle === undefined) {
                setFirstCandle(() => {
                    return unparsedCandleData[0].time;
                });
            }
        }

        render();
        renderCanvas();
    }, [
        diffHashSig(props.chartItemStates),
        expandTradeTable,
        diffHashSigChart(unparsedCandleData),
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

    function changeyAxisWidth() {
        let yTickValueLength = scaleData?.yScale.ticks()[0]?.toString().length;
        let result = false;
        scaleData?.yScale.ticks().forEach((element: any) => {
            if (element.toString().length > 4) {
                result = true;
                yTickValueLength =
                    yTickValueLength > element.toString().length
                        ? yTickValueLength
                        : element.toString().length;
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
            showHighlightedLines();

            d3.select(d3Container.current)
                .select('.limit')
                .select('.horizontal')
                .style('visibility', 'hidden');
        } else if (location.pathname.includes('/limit')) {
            hideHighlightedLines();

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

            hideHighlightedLines();

            d3.select(d3CanvasRangeLine.current)
                .select('canvas')
                .style('display', 'none');
        }
    }, [
        location,
        location.pathname,
        period,
        simpleRangeWidth,
        isAdvancedModeActive,
    ]);

    useEffect(() => {
        if (
            zoomUtils !== undefined &&
            d3CanvasMarketLine !== null &&
            d3CanvasLimitLine !== null &&
            d3CanvasRangeLine !== null &&
            zoomUtils.zoom !== undefined &&
            dragLimit !== undefined &&
            dragRange !== undefined
        ) {
            d3.select(d3CanvasMarketLine.current).call(zoomUtils?.zoom);
            d3.select(d3Xaxis.current)
                .call(zoomUtils?.xAxisZoom)
                .on('dblclick.zoom', null);

            if (location.pathname.includes('market')) {
                d3.select(d3CanvasBand.current)
                    .select('canvas')
                    .style('display', 'none');
                d3.select(d3CanvasRangeLine.current)
                    .select('canvas')
                    .style('display', 'none');
                d3.select(d3CanvasLimitLine.current)
                    .select('canvas')
                    .style('display', 'none');

                d3.select(d3CanvasMarketLine.current).raise();
            } else {
                d3.select(d3CanvasBand.current)
                    .select('canvas')
                    .style(
                        'display',
                        location.pathname.includes('range') ||
                            location.pathname.includes('reposition')
                            ? 'inline'
                            : 'none',
                    );

                d3.select(d3CanvasLimitLine.current)
                    .select('canvas')
                    .style(
                        'display',
                        location.pathname.includes('/limit')
                            ? 'inline'
                            : 'none',
                    );

                d3.select(d3CanvasLimitLine.current).call(dragLimit);
                d3.select(d3CanvasRangeLine.current).call(dragRange);

                if (dragEvent === 'zoom') {
                    d3.select(d3CanvasMarketLine.current).raise();
                } else if (dragEvent === 'drag') {
                    if (
                        location.pathname.includes('range') ||
                        location.pathname.includes('reposition')
                    ) {
                        d3.select(d3CanvasRangeLine.current).raise();
                    } else if (location.pathname.includes('/limit')) {
                        d3.select(d3CanvasLimitLine.current).raise();
                    }
                }
            }
        }
    }, [
        zoomUtils,
        zoomUtils && zoomUtils.zoom,
        d3CanvasLimitLine,
        d3CanvasRangeLine,
        location.pathname,
        dragEvent,
        dragLimit,
        rescale,
    ]);

    useEffect(() => {
        setRescale(true);
    }, [location.pathname, period]);

    useEffect(() => {
        setLiqHighlightedLinesAndArea(ranges);
    }, [poolAdressComb]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const snapForCandle = (point: any) => {
        if (point == undefined) return [];
        const series = candlestick;
        const data = unparsedCandleData as Array<CandleData>;
        const xScale = series.xScale(),
            xValue = series.crossValue();

        const filtered =
            data.length > 1
                ? data.filter((d: CandleData) => xValue(d) != null)
                : data;

        if (filtered.length > 1) {
            const nearest = minimum(filtered, (d: CandleData) =>
                Math.abs(point.offsetX - xScale(xValue(d))),
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

                const rescaleYAxis = () => {
                    const xmin = scaleData?.xScale.domain()[0];
                    const xmax = scaleData?.xScale.domain()[1];

                    const filtered = unparsedCandleData.filter(
                        (data: CandleData) =>
                            data.time * 1000 >= xmin &&
                            data.time * 1000 <= xmax,
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
                                (d: CandleData) =>
                                    denomInBase
                                        ? d.invMaxPriceExclMEVDecimalCorrected
                                        : d.minPriceExclMEVDecimalCorrected,
                            );
                            const maxYBoundary: any = d3.max(
                                filtered,
                                (d: CandleData) =>
                                    denomInBase
                                        ? d.invMinPriceExclMEVDecimalCorrected
                                        : d.maxPriceExclMEVDecimalCorrected,
                            );

                            if (
                                (location.pathname.includes('range') ||
                                    location.pathname.includes('reposition')) &&
                                (simpleRangeWidth !== 100 ||
                                    isAdvancedModeActive)
                            ) {
                                if (
                                    maxYBoundary !== undefined &&
                                    minYBoundary !== undefined
                                ) {
                                    const buffer = Math.abs(
                                        (Math.min(
                                            Math.min(low, high),
                                            minYBoundary,
                                        ) -
                                            Math.max(
                                                Math.max(low, high),
                                                maxYBoundary,
                                            )) /
                                            6,
                                    );

                                    const domain = [
                                        Math.min(
                                            Math.min(low, high),
                                            minYBoundary,
                                        ) - buffer,
                                        Math.max(
                                            Math.max(low, high),
                                            maxYBoundary,
                                        ) +
                                            buffer / 2,
                                    ];
                                    scaleData?.yScale.domain(domain);
                                }
                            } else if (location.pathname.includes('/limit')) {
                                if (
                                    maxYBoundary !== undefined &&
                                    minYBoundary !== undefined &&
                                    poolPriceDisplay
                                ) {
                                    const value = limit[0].value;
                                    if (rescale) {
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
                                        const bufferForLimit = Math.abs(
                                            (low - high) / 6,
                                        );
                                        if (value > 0) {
                                            const domain = [
                                                Math.min(low, high) -
                                                    bufferForLimit,
                                                Math.max(low, high) +
                                                    bufferForLimit / 2,
                                            ];

                                            scaleData?.yScale.domain(domain);
                                        }
                                    } else {
                                        if (value > 0) {
                                            const low =
                                                minYBoundary < value
                                                    ? minYBoundary
                                                    : value;

                                            const high =
                                                maxYBoundary > value
                                                    ? maxYBoundary
                                                    : value;

                                            const buffer = Math.abs(
                                                (low - high) / 6,
                                            );

                                            const domain = [
                                                Math.min(low, high) - buffer,
                                                Math.max(low, high) +
                                                    buffer / 2,
                                            ];
                                            scaleData?.yScale.domain(domain);
                                        } else {
                                            const buffer = Math.abs(
                                                (minYBoundary - maxYBoundary) /
                                                    6,
                                            );

                                            const domain = [
                                                Math.min(
                                                    minYBoundary,
                                                    maxYBoundary,
                                                ) - buffer,
                                                Math.max(
                                                    minYBoundary,
                                                    maxYBoundary,
                                                ) +
                                                    buffer / 2,
                                            ];
                                            scaleData?.yScale.domain(domain);
                                        }
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
                                        Math.min(minYBoundary, maxYBoundary) -
                                            buffer,
                                        Math.max(minYBoundary, maxYBoundary) +
                                            buffer / 2,
                                    ];

                                    scaleData?.yScale.domain(domain);
                                }
                            }
                        }
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
                                d3.select(d3CanvasMarketLine.current).style(
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
                                    if (rescale) {
                                        crosshairData[0].y = Number(
                                            formatAmountChartData(
                                                scaleData?.yScale.invert(
                                                    event.sourceEvent.layerY,
                                                ),
                                            ),
                                        );
                                    }

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

                                rescaleYAxis();

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

                                    if (isAdvancedModeActive && liquidityData) {
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

                                        setLiqHighlightedLinesAndArea(ranges);
                                    }
                                }

                                clickedForLine = true;
                                if (candlestick) {
                                    setBandwidth(candlestick.bandwidth());
                                }
                                render();
                                renderCanvas();

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
                        if (isAdvancedModeActive && liquidityData) {
                            const liqAllBidPrices =
                                liquidityData?.liqBidData.map(
                                    (liqPrices: any) => liqPrices.liqPrices,
                                );
                            const liqBidDeviation =
                                standardDeviation(liqAllBidPrices);

                            fillLiqAdvanced(liqBidDeviation, scaleData);

                            setLiqHighlightedLinesAndArea(ranges);
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
                        rescaleYAxis();

                        setBandwidth(candlestick.bandwidth());
                        render();
                        renderCanvas();

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
        limit,
        dragEvent,
        isLineDrag,
        diffHashSig(yAxisLabels),
        minTickForLimit,
        maxTickForLimit,
    ]);

    useEffect(() => {
        IS_LOCAL_ENV && console.debug('timeframe changed');
        setShowLatest(false);
    }, [period]);

    useEffect(() => {
        if (scaleData !== undefined && liquidityData !== undefined) {
            if (rescale) {
                const xmin = scaleData?.xScale.domain()[0];
                const xmax = scaleData?.xScale.domain()[1];

                const filtered = unparsedCandleData.filter(
                    (data: any) =>
                        data.time * 1000 >= xmin && data.time * 1000 <= xmax,
                );

                if (filtered !== undefined) {
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
                                (Math.max(Math.max(low, high), maxYBoundary) -
                                    Math.min(
                                        Math.min(low, high),
                                        minYBoundary,
                                    )) /
                                    6,
                            );

                            const domain = [
                                Math.min(Math.min(low, high), minYBoundary) -
                                    buffer,
                                Math.max(Math.max(low, high), maxYBoundary) +
                                    buffer / 2,
                            ];

                            scaleData?.yScale.domain(domain);
                        }

                        const liqAllBidPrices = liquidityData?.liqBidData.map(
                            (liqPrices: any) => liqPrices.liqPrices,
                        );
                        const liqBidDeviation =
                            standardDeviation(liqAllBidPrices);

                        fillLiqAdvanced(liqBidDeviation, scaleData);

                        setLiqHighlightedLinesAndArea(ranges);
                    } else if (location.pathname.includes('/limit')) {
                        if (
                            maxYBoundary !== undefined &&
                            minYBoundary !== undefined &&
                            poolPriceDisplay
                        ) {
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
                            if (value > 0) {
                                const domain = [
                                    Math.min(low, high) - bufferForLimit,
                                    Math.max(low, high) + bufferForLimit / 2,
                                ];

                                scaleData?.yScale.domain(domain);
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
                                Math.min(minYBoundary, maxYBoundary) - buffer,
                                Math.max(minYBoundary, maxYBoundary) +
                                    buffer / 2,
                            ];

                            scaleData?.yScale.domain(domain);

                            setLiqHighlightedLinesAndArea(ranges);
                        }
                    }
                }
            }
        }
    }, [unparsedCandleData.length, rescale, minTickForLimit, maxTickForLimit]);

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
            // setTriangleLimitValues(denomInBase ? limit : 1 / limit || 0);
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

        // setTriangleRangeValues(maxPrice, minPrice);
    }, [denomInBase]);

    useEffect(() => {
        if (position !== undefined) {
            setBalancedLines(true);
        }
    }, [position?.positionId]);

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

                const pinnedMinPriceDisplayTruncated =
                    pinnedDisplayPrices.pinnedMinPriceDisplayTruncated;
                const pinnedMaxPriceDisplayTruncated =
                    pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated;

                setRanges((prevState) => {
                    const newTargets = [...prevState];

                    newTargets.filter(
                        (target: any) => target.name === 'Max',
                    )[0].value =
                        parseFloat(pinnedMaxPriceDisplayTruncated) || 0.0;

                    newTargets.filter(
                        (target: any) => target.name === 'Min',
                    )[0].value =
                        parseFloat(pinnedMinPriceDisplayTruncated) || 0.0;

                    setLiqHighlightedLinesAndArea(newTargets, true);

                    return newTargets;
                });

                // setTriangleRangeValues(
                //     parseFloat(pinnedMaxPriceDisplayTruncated),
                //     parseFloat(pinnedMinPriceDisplayTruncated),
                // );
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

                        // setTriangleRangeValues(maxPrice, minPrice);

                        if (
                            poolPriceDisplay !== undefined &&
                            rescaleRangeBoundariesWithSlider &&
                            rescale
                        ) {
                            const xmin = scaleData?.xScale.domain()[0];
                            const xmax = scaleData?.xScale.domain()[1];

                            const filtered = unparsedCandleData.filter(
                                (data: CandleData) =>
                                    data.time * 1000 >= xmin &&
                                    data.time * 1000 <= xmax,
                            );

                            if (filtered !== undefined) {
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

                                if (maxYBoundary && minYBoundary) {
                                    const low =
                                        minPrice !== undefined ? minPrice : 0;
                                    const high =
                                        maxPrice !== undefined ? maxPrice : 0;

                                    const min =
                                        minYBoundary < low ? minYBoundary : low;
                                    const max =
                                        maxYBoundary > high
                                            ? maxYBoundary
                                            : high;

                                    const buffer = Math.abs((max - min) / 6);

                                    const domain = [
                                        Math.min(min, max) - buffer,
                                        Math.max(min, max) + buffer / 2,
                                    ];

                                    scaleData?.yScale.domain(domain);

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
                        parseFloat(
                            pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated,
                        ) || 0.0;

                    newTargets.filter(
                        (target: any) => target.name === 'Min',
                    )[0].value =
                        parseFloat(
                            pinnedDisplayPrices.pinnedMinPriceDisplayTruncated,
                        ) || 0.0;

                    setLiqHighlightedLinesAndArea(newTargets, true);

                    return newTargets;
                });

                // setTriangleRangeValues(
                //     parseFloat(
                //         pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated,
                //     ),
                //     parseFloat(
                //         pinnedDisplayPrices.pinnedMinPriceDisplayTruncated,
                //     ),
                // );
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

                setLiqHighlightedLinesAndArea(newTargets);

                return newTargets;
            });

            // setTriangleRangeValues(maxPrice, minPrice);

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
        IS_LOCAL_ENV && console.debug('setting range lines');
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
            const liqAllBidPrices = liquidityData?.liqBidData.map(
                (liqPrices: any) => liqPrices.liqPrices,
            );
            const liqBidDeviation = standardDeviation(liqAllBidPrices);

            fillLiqAdvanced(liqBidDeviation, scaleData);

            setLiqHighlightedLinesAndArea(ranges);
        } else {
            setBoundaries(denomInBase);
        }
    }, [isAdvancedModeActive, ranges, liquidityData?.liqBidData, scaleData]);

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
                    setIsMouseMoveCrosshair(false);
                    document.addEventListener('keydown', cancelDragEvent);
                    d3.select(d3CanvasRangeLine.current).style(
                        'cursor',
                        'none',
                    );

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
                            !isAdvancedModeActive ||
                            location.pathname.includes('reposition')
                        ) {
                            if (
                                dragedValue === 0 ||
                                dragedValue === liquidityData?.topBoundary
                            ) {
                                rangeWidthPercentage = 100;

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

                                const rangesF = [
                                    {
                                        name: 'Min',
                                        value: pinnedDisplayPrices.pinnedMinPriceDisplayTruncated,
                                    },
                                    {
                                        name: 'Max',
                                        value: pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated,
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
                                            (target: any) =>
                                                target.name === 'Min',
                                        )[0].value = parseFloat(
                                            pinnedDisplayPrices.pinnedMinPriceDisplayTruncated,
                                        );

                                        newTargets.filter(
                                            (target: any) =>
                                                target.name === 'Max',
                                        )[0].value = parseFloat(
                                            pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated,
                                        );

                                        newRangeValue = newTargets;

                                        return newTargets;
                                    });

                                    // setTriangleRangeValues(
                                    //     pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated,
                                    //     pinnedDisplayPrices.pinnedMinPriceDisplayTruncated,
                                    // );
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

                                setLiqHighlightedLinesAndArea(newTargets);

                                // const minPrice = newTargets.filter(
                                //     (target: any) => target.name === 'Min',
                                // )[0].value;
                                // const maxPrice = newTargets.filter(
                                //     (target: any) => target.name === 'Max',
                                // )[0].value;

                                // setTriangleRangeValues(maxPrice, minPrice);
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

                            setHorizontalBandData([
                                [
                                    simpleRangeWidth === 100 &&
                                    (oldRangeMinValue === 0 ||
                                        oldRangeMaxValue === 0) &&
                                    (!isAdvancedModeActive ||
                                        location.pathname.includes(
                                            'reposition',
                                        ))
                                        ? 0
                                        : oldRangeMinValue,
                                    simpleRangeWidth === 100 &&
                                    (oldRangeMinValue === 0 ||
                                        oldRangeMaxValue === 0) &&
                                    (!isAdvancedModeActive ||
                                        location.pathname.includes(
                                            'reposition',
                                        ))
                                        ? 0
                                        : oldRangeMaxValue,
                                ],
                            ]);
                        }
                    }
                })
                .on('end', (event: any) => {
                    setCrosshairData([
                        {
                            x: crosshairData[0].x,
                            y: scaleData?.yScale.invert(
                                event.sourceEvent.layerY,
                            ),
                        },
                    ]);
                    setIsLineDrag(false);

                    if (!cancelDrag) {
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

                            setHorizontalBandData([
                                [
                                    simpleRangeWidth === 100 &&
                                    (oldRangeMinValue === 0 ||
                                        oldRangeMaxValue === 0) &&
                                    (!isAdvancedModeActive ||
                                        location.pathname.includes(
                                            'reposition',
                                        ))
                                        ? 0
                                        : oldRangeMinValue,
                                    simpleRangeWidth === 100 &&
                                    (oldRangeMinValue === 0 ||
                                        oldRangeMaxValue === 0) &&
                                    (!isAdvancedModeActive ||
                                        location.pathname.includes(
                                            'reposition',
                                        ))
                                        ? 0
                                        : oldRangeMaxValue,
                                ],
                            ]);
                        }
                    }
                    d3.select(d3CanvasRangeLine.current).style(
                        'cursor',
                        'default',
                    );

                    d3.select(d3Yaxis.current).style('cursor', 'default');

                    setCrosshairActive('none');
                    setIsMouseMoveCrosshair(false);
                });

            let oldLimitValue: number | undefined = undefined;
            const dragLimit = d3
                .drag()
                .on('start', () => {
                    d3.select(d3CanvasLimitLine.current).style(
                        'cursor',
                        'none',
                    );

                    document.addEventListener('keydown', cancelDragEvent);

                    d3.select(d3Yaxis.current).style('cursor', 'none');

                    oldLimitValue = limit[0].value;
                })
                .on('drag', function (event) {
                    if (!cancelDrag) {
                        setIsMouseMoveCrosshair(false);
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
                                    } else {
                                        const limitRateTruncated =
                                            displayPriceWithDenom < 0.0001
                                                ? displayPriceWithDenom.toExponential(
                                                      2,
                                                  )
                                                : displayPriceWithDenom < 2
                                                ? displayPriceWithDenom.toLocaleString(
                                                      undefined,
                                                      {
                                                          minimumFractionDigits: 2,
                                                          maximumFractionDigits: 6,
                                                      },
                                                  )
                                                : displayPriceWithDenom.toLocaleString(
                                                      undefined,
                                                      {
                                                          minimumFractionDigits: 2,
                                                          maximumFractionDigits: 2,
                                                      },
                                                  );

                                        const limitValue = parseFloat(
                                            limitRateTruncated.replace(',', ''),
                                        );

                                        newLimitValue = limitValue;
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
                                        // setTriangleLimitValues(limitValue);
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
                .on('end', (event: any) => {
                    setIsLineDrag(false);

                    draggingLine = undefined;
                    setCrosshairData([
                        {
                            x: crosshairData[0].x,
                            y: scaleData?.yScale.invert(
                                event.sourceEvent.layerY,
                            ),
                        },
                    ]);

                    if (!cancelDrag) {
                        d3.select(d3Container.current).style(
                            'cursor',
                            'row-resize',
                        );
                        if (rescale) {
                            const xmin = scaleData?.xScale.domain()[0];
                            const xmax = scaleData?.xScale.domain()[1];

                            const filtered = unparsedCandleData.filter(
                                (data: CandleData) =>
                                    data.time * 1000 >= xmin &&
                                    data.time * 1000 <= xmax,
                            );

                            if (filtered !== undefined) {
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
                                    const value = newLimitValue;

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

                                    const min = scaleData?.yScale.domain()[0];
                                    const max = scaleData?.yScale.domain()[1];

                                    if (min > low || max < high) {
                                        const bufferForLimit = Math.abs(
                                            (low - high) / 6,
                                        );

                                        const domain = [
                                            Math.min(low, high) -
                                                bufferForLimit,
                                            Math.max(high, low) +
                                                bufferForLimit / 2,
                                        ];

                                        scaleData?.yScale.domain(domain);
                                    }
                                }
                            }
                        }

                        if (oldLimitValue)
                            onBlurLimitRate(oldLimitValue, newLimitValue);
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

                    d3.select(d3CanvasLimitLine.current).style(
                        'cursor',
                        'default',
                    );

                    d3.select(d3Yaxis.current).style('cursor', 'default');

                    setIsMouseMoveCrosshair(false);
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
        isAdvancedModeActive,
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

    // Axis's
    useEffect(() => {
        if (scaleData) {
            const _yAxis = d3fc
                .axisRight()
                .scale(scaleData?.yScale)
                .tickFormat((d: any) => {
                    const digit = d.toString().split('.')[1]?.length;
                    return formatAmountChartData(d, digit ? digit : 2);
                });

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
                        d3YaxisCanvas.width / 6,
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
        }
    }, [
        diffHashSig(scaleData),
        market,
        diffHashSig(crosshairData),
        isMouseMoveCrosshair,
        limit,
        isLineDrag,
        ranges,
        simpleRangeWidth !== 100 || isAdvancedModeActive,
        yAxisCanvasWidth,
        bandwidth,
        reset,
        sellOrderStyle,
        checkLimitOrder,
        location,
        d3CanvasCrosshair,
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
    ) {
        const rectPadding = text.length > 8 ? 15 : 5;
        context.beginPath();
        context.fillStyle = color;
        context.fillRect(0, y - 10, yAxisWidth + rectPadding, 20);
        context.fillStyle = textColor;
        context.fontSize = '13';
        context.textAlign = 'left';
        context.textBaseline = 'middle';
        context.fillText(text, x, y + 2);

        if (stroke !== undefined) {
            context.strokeStyle = stroke;
            context.strokeRect(1, y - 10, yAxisWidth + rectPadding, 20);
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
        if (yAxis) {
            d3.select(d3Yaxis.current)
                .call(zoomUtils?.yAxisZoom)
                .on('dblclick.zoom', null);
            if (location.pathname.includes('market')) {
                d3.select(d3Yaxis.current).on('.drag', null);
            }

            if (
                location.pathname.includes('range') ||
                location.pathname.includes('reposition')
            ) {
                d3.select(d3Yaxis.current).call(dragRange);
            }
            if (location.pathname.includes('/limit')) {
                d3.select(d3Yaxis.current).call(dragLimit);
            }

            render();
        }
    }, [yAxis, location]);

    function toSubscript(number: number) {
        let subscriptString = '';
        const baseCodePoint = 8320; // Unicode code point for subscript 0

        const numberString = number.toString();
        for (let i = 0; i < numberString.length; i++) {
            const digit = parseInt(numberString[i]);
            const subscriptCodePoint = baseCodePoint + digit;
            subscriptString += String.fromCharCode(subscriptCodePoint);
        }

        return subscriptString;
    }

    const drawYaxis = (context: any, yScale: any, X: any) => {
        if (unparsedCandleData !== undefined) {
            yAxisLabels.length = 0;
            const tickSize = 6;
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
                context.textAlign = 'left';
                context.textBaseline = 'middle';
                context.fillStyle = 'rgba(189,189,189,0.8)';
                context.font = '11.425px Lexend Deca';

                const yScaleTicks = yScale.ticks(factor);

                yScaleTicks.forEach((d: number) => {
                    const digit = d.toString().split('.')[1]?.length;

                    const isScientific = d.toString().includes('e');

                    let axisTick: number | string = formatAmountChartData(
                        d,
                        digit ? digit : 2,
                    );

                    if (isScientific) {
                        const splitNumber = d.toString().split('e');
                        const factor = Math.abs(Number(splitNumber[1]));

                        axisTick =
                            '0.0' +
                            toSubscript(factor) +
                            splitNumber[0].toString();
                    }

                    context.beginPath();
                    context.fillText(axisTick, X - tickSize, yScale(d));
                });

                const isScientificMarketTick = market[0].value
                    .toString()
                    .includes('e');

                let marketTick: number | string = formatAmountChartData(
                    market[0].value,
                    undefined,
                );

                if (isScientificMarketTick) {
                    const splitNumber = market[0].value.toString().split('e');
                    const factor = Math.abs(Number(splitNumber[1]));

                    marketTick =
                        '0.0' +
                        toSubscript(factor) +
                        formatAmountChartData(
                            Number(splitNumber[0]),
                            undefined,
                        ).toString();
                }

                createRectLabel(
                    context,
                    yScale(market[0].value),
                    X - tickSize,
                    'white',
                    'black',
                    marketTick,
                    undefined,
                    yAxisCanvasWidth,
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
                            ? liquidityData?.liqBoundaryCurve
                            : liquidityData?.liqBoundaryDepth;

                    if (simpleRangeWidth !== 100 || isAdvancedModeActive) {
                        const isScientificlowTick = low
                            .toString()
                            .includes('e');

                        let lowTick: number | string = formatAmountChartData(
                            low,
                            undefined,
                        );

                        if (isScientificlowTick) {
                            const splitNumber = low.toString().split('e');
                            const factor = Math.abs(Number(splitNumber[1]));

                            lowTick =
                                '0.0' +
                                toSubscript(factor) +
                                formatAmountChartData(
                                    Number(splitNumber[0]),
                                    undefined,
                                ).toString();
                        }

                        createRectLabel(
                            context,
                            isSameLocationMin
                                ? sameLocationDataMin
                                : yScale(low),
                            X - tickSize,
                            low > passValue ? '#7371fc' : 'rgba(205, 193, 255)',
                            low > passValue ? 'white' : 'black',
                            lowTick,
                            undefined,
                            yAxisCanvasWidth,
                        );
                        addYaxisLabel(
                            isSameLocationMin
                                ? sameLocationDataMin
                                : yScale(low),
                        );

                        const isScientificHighTick = high
                            .toString()
                            .includes('e');

                        let highTick: number | string = formatAmountChartData(
                            high,
                            undefined,
                        );

                        if (isScientificHighTick) {
                            const splitNumber = high.toString().split('e');
                            const factor = Math.abs(Number(splitNumber[1]));

                            highTick =
                                '0.0' +
                                toSubscript(factor) +
                                formatAmountChartData(
                                    Number(splitNumber[0]),
                                    undefined,
                                ).toString();
                        }

                        createRectLabel(
                            context,
                            isSameLocationMax
                                ? sameLocationDataMax
                                : yScale(high),
                            X - tickSize,
                            high > passValue
                                ? '#7371fc'
                                : 'rgba(205, 193, 255)',
                            high > passValue ? 'white' : 'black',
                            highTick,
                            undefined,
                            yAxisCanvasWidth,
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

                    let limitTick: number | string = formatAmountChartData(
                        limit[0].value,
                        undefined,
                    );

                    if (isScientificLimitTick) {
                        const splitNumber = limit[0].value
                            .toString()
                            .split('e');
                        const factor = Math.abs(Number(splitNumber[1]));

                        limitTick =
                            '0.0' +
                            toSubscript(factor) +
                            formatAmountChartData(
                                Number(splitNumber[0]),
                                undefined,
                            ).toString();
                    }

                    if (checkLimitOrder) {
                        createRectLabel(
                            context,
                            isSameLocation
                                ? sameLocationData
                                : yScale(limit[0].value),
                            X - tickSize,
                            sellOrderStyle === 'order_sell'
                                ? '#e480ff'
                                : '#7371fc',
                            sellOrderStyle === 'order_sell' ? 'black' : 'white',
                            limitTick,
                            undefined,
                            yAxisCanvasWidth,
                        );
                    } else {
                        createRectLabel(
                            context,
                            isSameLocation
                                ? sameLocationData
                                : yScale(limit[0].value),
                            X - tickSize,
                            '#7772FE',
                            'white',
                            limitTick,
                            undefined,
                            yAxisCanvasWidth,
                        );
                    }
                    addYaxisLabel(
                        isSameLocation
                            ? sameLocationData
                            : yScale(limit[0].value),
                    );
                }

                if (isMouseMoveCrosshair && crosshairActive === 'chart') {
                    const isScientificCrTick = crosshairData[0].y
                        .toString()
                        .includes('e');

                    let crTick: number | string = formatAmountChartData(
                        Number(crosshairData[0].y),
                        undefined,
                    );

                    if (isScientificCrTick) {
                        const splitNumber = crosshairData[0].y
                            .toString()
                            .split('e');
                        const factor = Math.abs(Number(splitNumber[1]));

                        crTick =
                            '0.0' +
                            toSubscript(factor) +
                            formatAmountChartData(
                                Number(splitNumber[0]),
                                undefined,
                            ).toString();
                    }

                    createRectLabel(
                        context,
                        yScale(crosshairData[0].y),
                        X - tickSize,
                        '#242F3F',
                        'white',
                        crTick,
                        undefined,
                        yAxisCanvasWidth,
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
                return (
                    d1.date === d.date &&
                    d1.date.getMinutes() === d.date.getMinutes()
                );
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
                    isMouseMoveCrosshair &&
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
                    if (
                        !d.style &&
                        indexValue !== filteredData.length - 1 &&
                        indexValue !== 0
                    ) {
                        const lastData = filteredData[indexValue + 1];

                        const beforeData = filteredData[indexValue - 1];

                        if (
                            (beforeData.style || lastData.style,
                            xScale(d.date.getTime()))
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

        if (
            dateCrosshair &&
            isMouseMoveCrosshair &&
            crosshairActive !== 'none'
        ) {
            context.fillText(
                dateCrosshair,
                xScale(crosshairData[0].x),
                Y + tickSize,
            );
        }

        context.restore();
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

            const triangle = d3fc
                .seriesCanvasPoint()
                .xScale(scaleData?.xScale)
                .yScale(scaleData?.yScale)
                .crossValue((d: any, index: any) => {
                    return !(index % 2)
                        ? scaleData?.xScale.domain()[0]
                        : scaleData?.xScale.domain()[1];
                })
                .mainValue((d: any) => d.value)
                .size(270)
                .type(d3.symbolTriangle)
                .decorate((context: any, datum: any, index: any) => {
                    const rotateDegree = !(index % 2) ? 90 : -90;
                    context.rotate((rotateDegree * Math.PI) / 180);
                    context.strokeStyle = 'rgba(235, 235, 255)';
                    context.fillStyle = 'rgba(235, 235, 255)';
                });

            setTriangle(() => {
                return triangle;
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
                    selection.strokeStyle = 'rgba(205, 193, 255)';
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
                    selection.strokeStyle = 'rgba(205, 193, 255)';
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
                    selection.strokeStyle = '#7371FC';
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
                    selection.strokeStyle = '#7371FC';
                });

            setLineBidDepthSeries(() => {
                return lineBidDepthSeries;
            });
        }
    }, [
        unparsedCandleData,
        scaleData,
        market,
        checkLimitOrder,
        limit,
        isUserLoggedIn,
        liqMode,
    ]);

    useEffect(() => {
        const passValue = poolPriceDisplay ?? 0;

        if (triangle !== undefined) {
            let color = 'rgba(235, 235, 255)';

            triangle.decorate((context: any, datum: any, index: any) => {
                if (location.pathname.includes('/limit')) {
                    if (checkLimitOrder) {
                        color =
                            sellOrderStyle === 'order_sell'
                                ? '#e480ff'
                                : '#7371FC';
                    }
                } else {
                    color =
                        datum.value > passValue
                            ? '#7371fc'
                            : 'rgba(205, 193, 255)';
                }

                const rotateDegree = !(index % 2) ? 90 : -90;
                context.rotate((rotateDegree * Math.PI) / 180);
                context.strokeStyle = color;
                context.fillStyle = color;
            });
        }

        if (limitLine !== undefined && location.pathname.includes('/limit')) {
            limitLine.decorate((context: any) => {
                context.strokeStyle = checkLimitOrder
                    ? sellOrderStyle === 'order_sell'
                        ? '#e480ff'
                        : '#7371FC'
                    : 'rgba(235, 235, 255)';
                context.pointerEvents = 'none';
                context.lineWidth = 1.5;
                context.fillStyle = 'transparent';
            });

            renderCanvas();
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
                    datum.value > passValue ? '#7371fc' : 'rgba(205, 193, 255)';
                context.pointerEvents = 'none';
                context.lineWidth = 1.5;
                context.fillStyle = 'transparent';
            });
        }
    }, [
        limitLine,
        horizontalLine,
        ranges,
        triangle,
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
            scaleData?.xScale.domain(scaleData?.xScaleCopy.domain());

            const xmin = scaleData?.xScale.domain()[0];
            const xmax = scaleData?.xScale.domain()[1];

            const filtered = unparsedCandleData.filter(
                (data: CandleData) =>
                    data.time * 1000 >= xmin && data.time * 1000 <= xmax,
            );

            if (filtered !== undefined) {
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
                            (Math.max(Math.max(low, high), maxYBoundary) -
                                Math.min(Math.min(low, high), minYBoundary)) /
                                6,
                        );

                        const domain = [
                            Math.min(Math.min(low, high), minYBoundary) -
                                buffer,
                            Math.max(Math.max(low, high), maxYBoundary) +
                                buffer / 2,
                        ];

                        scaleData?.yScale.domain(domain);
                    }
                } else if (location.pathname.includes('/limit')) {
                    if (
                        maxYBoundary !== undefined &&
                        minYBoundary !== undefined
                    ) {
                        const value = limit[0].value;

                        if (rescale) {
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
                            if (value > 0) {
                                const domain = [
                                    Math.min(low, high) - bufferForLimit,
                                    Math.max(low, high) + bufferForLimit / 2,
                                ];

                                scaleData?.yScale.domain(domain);
                            }
                        } else {
                            const low =
                                minYBoundary < value ? minYBoundary : value;
                            const high =
                                maxYBoundary > value ? maxYBoundary : value;

                            if (value > 0) {
                                const buffer = Math.abs((low - high) / 6);
                                const domain = [
                                    Math.min(low, high) - buffer,
                                    Math.max(low, high) + buffer / 2,
                                ];

                                scaleData?.yScale.domain(domain);
                            } else {
                                const buffer = Math.abs(
                                    (maxYBoundary - minYBoundary) / 6,
                                );

                                const domain = [
                                    Math.min(minYBoundary, maxYBoundary) -
                                        buffer,
                                    Math.max(minYBoundary, maxYBoundary) +
                                        buffer / 2,
                                ];

                                scaleData?.yScale.domain(domain);
                            }
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
                            Math.min(minYBoundary, maxYBoundary) - buffer,
                            Math.max(minYBoundary, maxYBoundary) + buffer / 2,
                        ];

                        scaleData?.yScale.domain(domain);
                    }
                }
            }

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
                if (poolPriceDisplay) {
                    const xmin = scaleData?.xScaleCopy.domain()[0];
                    const xmax = scaleData?.xScaleCopy.domain()[1];

                    const filtered = unparsedCandleData.filter(
                        (data: CandleData) =>
                            data.time * 1000 >= xmin &&
                            data.time * 1000 <= xmax,
                    );

                    if (filtered !== undefined && filtered.length > 0) {
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
                                    (Math.max(
                                        Math.max(low, high),
                                        maxYBoundary,
                                    ) -
                                        Math.min(
                                            Math.min(low, high),
                                            minYBoundary,
                                        )) /
                                        6,
                                );

                                const domain = [
                                    Math.min(
                                        Math.min(low, high),
                                        minYBoundary,
                                    ) - buffer,
                                    Math.max(
                                        Math.max(low, high),
                                        maxYBoundary,
                                    ) +
                                        buffer / 2,
                                ];

                                scaleData?.yScale.domain(domain);
                            }
                        } else if (location.pathname.includes('/limit')) {
                            if (
                                maxYBoundary !== undefined &&
                                minYBoundary !== undefined
                            ) {
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

                                const bufferForLimit = Math.abs(
                                    (low - high) / 6,
                                );
                                if (value > 0) {
                                    const domain = [
                                        Math.min(low, high) - bufferForLimit,
                                        Math.max(low, high) +
                                            bufferForLimit / 2,
                                    ];

                                    scaleData?.yScale.domain(domain);
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
                                    Math.min(minYBoundary, maxYBoundary) -
                                        buffer,
                                    Math.max(minYBoundary, maxYBoundary) +
                                        buffer / 2,
                                ];

                                scaleData?.yScale.domain(domain);
                            }
                        }
                    }
                }
                scaleData?.xScale.domain([
                    centerX - diff * 0.8,
                    centerX + diff * 0.2,
                ]);
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
                isUserLoggedIn
                    ? sellOrderStyle === 'order_sell'
                        ? limit[0].value > poolPriceDisplay
                        : limit[0].value < poolPriceDisplay
                    : false,
            );
        }
    }, [limit, sellOrderStyle, isUserLoggedIn, poolPriceDisplay]);

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

        if (!isAdvancedModeActive || location.pathname.includes('reposition')) {
            let rangeWidthPercentage;
            let tickValue;
            let pinnedDisplayPrices: any;

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

                    setLiqHighlightedLinesAndArea(newTargets);
                    return newTargets;
                });

                // setTriangleRangeValues(liquidityData?.topBoundary, 0);
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
                            pinnedDisplayPrices.pinnedMinPriceDisplayTruncated,
                        );

                        newTargets.filter(
                            (target: any) => target.name === 'Max',
                        )[0].value = parseFloat(
                            pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated,
                        );

                        newRangeValue = newTargets;

                        setLiqHighlightedLinesAndArea(newTargets);
                        return newTargets;
                    });

                    // setTriangleRangeValues(
                    //     pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated,
                    //     pinnedDisplayPrices.pinnedMinPriceDisplayTruncated,
                    // );
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

                // setTriangleRangeValues(
                //     pinnedMaxPriceDisplayTruncated,
                //     pinnedMinPriceDisplayTruncated,
                // );
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
                            ? props.upBodyColor
                            : props.downBodyColor;

                    context.strokeStyle =
                        selectedDate !== undefined &&
                        selectedDate === d.time * 1000
                            ? '#E480FF'
                            : close > open
                            ? props.upBorderColor
                            : props.downBorderColor;

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
            renderCanvas();
            render();
        }
    }, [scaleData, selectedDate]);

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
    }, [unparsedCandleData, candlestick, unparsedData, unparsedCandleData]);

    useEffect(() => {
        if (d3CanvasCandle) {
            const canvasDiv = d3.select(d3CanvasCandle.current) as any;

            const resizeObserver = new ResizeObserver(() => {
                render();
                renderCanvas();
            });

            resizeObserver.observe(canvasDiv.node());

            return () => resizeObserver.unobserve(canvasDiv.node());
        }
    }, []);

    useEffect(() => {
        const canvas = d3
            .select(d3CanvasBand.current)
            .select('canvas')
            .node() as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');

        if (horizontalBand) {
            d3.select(d3CanvasBand.current)
                .on('draw', () => {
                    setCanvasResolution(canvas);
                    horizontalBand(horizontalBandData);
                })
                .on('measure', () => {
                    horizontalBand.context(ctx);
                });
        }
    }, [horizontalBandData, horizontalBand]);

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
                            // triangle(limitTriangleData);
                        }
                    })
                    .on('measure', () => {
                        ctx.setLineDash([20, 18]);
                        limitLine.context(ctx);
                        // triangle.context(ctx);
                    });
            }
        }
    }, [limit, limitLine, dragEvent, location.pathname]);

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

            if (horizontalLine) {
                d3.select(d3CanvasRangeLine.current)
                    .on('draw', () => {
                        if (
                            location.pathname.includes('range') ||
                            location.pathname.includes('reposition')
                        ) {
                            setCanvasResolution(canvas);
                            ctx.setLineDash([20, 18]);
                            horizontalLine(ranges);
                            // triangle(rangeTriangleData);
                        }
                    })
                    .on('measure', () => {
                        ctx.setLineDash([20, 18]);
                        horizontalLine.context(ctx);
                        // triangle.context(ctx);
                    });
            }
        }
    }, [ranges, horizontalLine, dragEvent, location.pathname]);

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
                            ? props.upVolumeColor
                            : props.downVolumeColor;

                    context.strokeStyle =
                        d.volumeUSD === null
                            ? 'transparent'
                            : selectedDate !== undefined &&
                              selectedDate === d.time * 1000
                            ? '#E480FF'
                            : close > open
                            ? props.upVolumeColor
                            : props.downVolumeColor;

                    context.cursorStyle = 'pointer';
                })
                .xScale(scaleData?.xScale)
                .yScale(scaleData?.volumeScale)
                .crossValue((d: any) => d.time * 1000)
                .mainValue((d: any) => (d.volumeUSD ? d.volumeUSD : 0));

            setBarSeries(() => canvasBarChart);
            renderCanvas();
            render();
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

    const hideHighlightedLines = () => {
        hideHighlightedLinesCurve();
        hideHighlightedLinesDepth();
    };

    const showHighlightedLinesCurve = () => {
        d3.select(d3CanvasLiqAskLine.current)
            .select('canvas')
            .style('display', 'inline');
        d3.select(d3CanvasLiqBidLine.current)
            .select('canvas')
            .style('display', 'inline');
    };

    const hideHighlightedLinesCurve = () => {
        d3.select(d3CanvasLiqAskLine.current)
            .select('canvas')
            .style('display', 'none');
        d3.select(d3CanvasLiqBidLine.current)
            .select('canvas')
            .style('display', 'none');
    };

    const showHighlightedLinesDepth = () => {
        d3.select(d3CanvasLiqAskDepthLine.current)
            .select('canvas')
            .style('display', 'inline');
        d3.select(d3CanvasLiqBidDepthLine.current)
            .select('canvas')
            .style('display', 'inline');
    };

    const hideHighlightedLinesDepth = () => {
        d3.select(d3CanvasLiqAskDepthLine.current)
            .select('canvas')
            .style('display', 'none');
        d3.select(d3CanvasLiqBidDepthLine.current)
            .select('canvas')
            .style('display', 'none');
    };
    const showHighlightedLines = () => {
        if (liqMode === 'curve') {
            showHighlightedLinesCurve();
            hideHighlightedLinesDepth();
        }

        if (liqMode === 'depth') {
            showHighlightedLinesDepth();
            hideHighlightedLinesCurve();
        }
    };
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

            hideHighlightedLines();
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

            if (
                location.pathname.includes('range') ||
                location.pathname.includes('reposition')
            ) {
                showHighlightedLines();
            }
        }
    }, [liqMode, location]);

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

        if (d3CanvasLiqAskDepth) {
            const container = d3
                .select(d3CanvasLiqAskDepth.current)
                .node() as any;
            if (container) container.requestRedraw();
        }

        if (d3CanvasLiqBidDepth) {
            const container = d3
                .select(d3CanvasLiqBidDepth.current)
                .node() as any;
            if (container) container.requestRedraw();
        }

        if (d3CanvasLiqAskLine) {
            const container = d3
                .select(d3CanvasLiqAskLine.current)
                .node() as any;
            if (container) container.requestRedraw();
        }

        if (d3CanvasLiqBidLine) {
            const container = d3
                .select(d3CanvasLiqBidLine.current)
                .node() as any;
            if (container) container.requestRedraw();
        }

        if (d3CanvasLiqAskDepthLine) {
            const container = d3
                .select(d3CanvasLiqAskDepthLine.current)
                .node() as any;
            if (container) container.requestRedraw();
        }

        if (d3CanvasLiqBidDepthLine) {
            const container = d3
                .select(d3CanvasLiqBidDepthLine.current)
                .node() as any;
            if (container) container.requestRedraw();
        }

        if (d3CanvasBand) {
            const container = d3.select(d3CanvasBand.current).node() as any;
            if (container) container.requestRedraw();
        }

        if (d3CanvasCrosshair) {
            const container = d3
                .select(d3CanvasCrosshair.current)
                .node() as any;
            if (container) container.requestRedraw();
        }

        if (d3CanvasMarketLine) {
            const container = d3
                .select(d3CanvasMarketLine.current)
                .node() as any;
            if (container) container.requestRedraw();
        }

        if (d3CanvasLimitLine) {
            const container = d3
                .select(d3CanvasLimitLine.current)
                .node() as any;
            if (container) container.requestRedraw();
        }
        if (d3CanvasRangeLine) {
            const container = d3
                .select(d3CanvasRangeLine.current)
                .node() as any;
            if (container) container.requestRedraw();
        }
    }

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
            const low = ranges.filter((target: any) => target.name === 'Min')[0]
                .value;
            const high = ranges.filter(
                (target: any) => target.name === 'Max',
            )[0].value;

            setHorizontalBandData([
                [
                    simpleRangeWidthGra === 100 &&
                    (low === 0 || high === 0) &&
                    (!isAdvancedModeActive ||
                        location.pathname.includes('reposition'))
                        ? 0
                        : low,
                    simpleRangeWidthGra === 100 &&
                    (low === 0 || high === 0) &&
                    (!isAdvancedModeActive ||
                        location.pathname.includes('reposition'))
                        ? 0
                        : high,
                ],
            ]);

            horizontalBandData[0] = [
                simpleRangeWidthGra === 100 &&
                (low === 0 || high === 0) &&
                (!isAdvancedModeActive ||
                    location.pathname.includes('reposition'))
                    ? 0
                    : low,
                simpleRangeWidthGra === 100 &&
                (low === 0 || high === 0) &&
                (!isAdvancedModeActive ||
                    location.pathname.includes('reposition'))
                    ? 0
                    : high,
            ];

            d3.select(d3CanvasRangeLine.current)
                .select('canvas')
                .style(
                    'display',
                    (location.pathname.includes('reposition') ||
                        location.pathname.includes('range')) &&
                        (isAdvancedModeActive || simpleRangeWidthGra !== 100)
                        ? 'inline'
                        : 'none',
                );

            if (autoScale && rescale) {
                const xmin = scaleData?.xScale.domain()[0];
                const xmax = scaleData?.xScale.domain()[1];

                const filtered = unparsedCandleData.filter(
                    (data: CandleData) =>
                        data.time * 1000 >= xmin && data.time * 1000 <= xmax,
                );

                if (filtered !== undefined) {
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

                    if (maxYBoundary && minYBoundary) {
                        const buffer = Math.abs(
                            (Math.min(Math.min(low, high), minYBoundary) -
                                Math.max(Math.max(low, high), maxYBoundary)) /
                                6,
                        );

                        const domain = [
                            Math.min(Math.min(low, high), minYBoundary) -
                                buffer,
                            Math.max(Math.max(low, high), maxYBoundary) +
                                buffer / 2,
                        ];

                        scaleData?.yScale.domain(domain);
                    }
                }
            }

            render();
            renderCanvas();
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
                .curve(d3.curveBasis)
                .mainValue((d: any) => d.activeLiq)
                .crossValue((d: any) => d.liqPrices)
                .xScale(liquidityScale)
                .yScale(scaleData?.yScale);

            setLiqAskSeries(() => d3CanvasLiqAskChart);

            const d3CanvasLiqAskDepthChart = d3fc
                .seriesCanvasArea()
                .decorate((context: any) => {
                    context.fillStyle = gradientForAsk;
                    context.strokeWidth = 2;
                })
                .orient('horizontal')
                .curve(d3.curveStepBefore)
                .mainValue((d: any) => d.activeLiq)
                .crossValue((d: any) => d.liqPrices)
                .xScale(liquidityDepthScale)
                .yScale(scaleData?.yScale);

            setLiqAskDepthSeries(() => d3CanvasLiqAskDepthChart);

            renderCanvas();
            render();
        }
    }, [
        diffHashSig(scaleData),
        gradientForAsk,
        liqMode,
        liquidityScale,
        liquidityDepthScale,
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
                .curve(d3.curveBasis)
                .mainValue((d: any) => d.activeLiq)
                .crossValue((d: any) => d.liqPrices)
                .xScale(liquidityScale)
                .yScale(scaleData?.yScale);

            setLiqBidSeries(() => d3CanvasLiqBidChart);

            const d3CanvasLiqBidDepthChart = d3fc
                .seriesCanvasArea()
                .decorate((context: any) => {
                    context.fillStyle = gradientForBid;
                    context.strokeWidth = 2;
                })
                .orient('horizontal')
                .curve(d3.curveStepAfter)
                .mainValue((d: any) => d.activeLiq)
                .crossValue((d: any) => d.liqPrices)
                .xScale(liquidityDepthScale)
                .yScale(scaleData?.yScale);

            setLiqBidDepthSeries(() => d3CanvasLiqBidDepthChart);

            renderCanvas();
            render();
        }
    }, [
        diffHashSig(scaleData),
        liqMode,
        gradientForBid,
        liquidityScale,
        liquidityDepthScale,
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
                })
                .on('measure', (event: any) => {
                    liqAskSeries.context(ctx);
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
                })
                .on('measure', (event: any) => {
                    liquidityDepthScale.range([
                        event.detail.width,
                        event.detail.width * 0.5,
                    ]);
                    liqAskDepthSeries.context(ctxDepth);
                });
        }
    }, [
        liquidityData?.liqAskData,
        liquidityData?.depthLiqAskData,
        liqAskSeries,
        liqAskDepthSeries,
        liqMode,
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
                })
                .on('measure', (event: any) => {
                    liqBidSeries.context(ctx);
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
                        isAdvancedModeActive
                            ? liquidityData?.depthLiqBidData
                            : liquidityData?.depthLiqBidData.filter(
                                  (d: any) =>
                                      d.liqPrices <= liquidityData?.topBoundary,
                              ),
                    );
                })
                .on('measure', (event: any) => {
                    liquidityDepthScale.range([
                        event.detail.width,
                        event.detail.width * 0.5,
                    ]);
                    liqBidDepthSeries.context(ctxDepth);
                });
        }
    }, [
        liquidityData?.liqBidData,
        liquidityData?.depthLiqBidData,
        isAdvancedModeActive,
        liqBidSeries,
        liqMode,
    ]);

    useEffect(() => {
        if (scaleData !== undefined) {
            renderCanvas();
            render();
        }
    }, [scaleData, liquidityData, location]);

    useEffect(() => {
        if (liquidityData) {
            const liqDataBidCurve = liquidityData?.liqBidData;

            const liqDataBidDepth = isAdvancedModeActive
                ? liquidityData?.depthLiqBidData
                : liquidityData?.depthLiqBidData.filter(
                      (d: any) => d.liqPrices <= liquidityData?.topBoundary,
                  );

            const canvas = d3
                .select(d3CanvasLiqBidLine.current)
                .select('canvas')
                .node() as HTMLCanvasElement;
            const ctx = canvas.getContext('2d');

            const canvasDepth = d3
                .select(d3CanvasLiqBidDepthLine.current)
                .select('canvas')
                .node() as HTMLCanvasElement;
            const ctxDepth = canvasDepth.getContext('2d');

            if (lineBidSeries && liquidityData?.liqBidData && liqBidSeries) {
                d3.select(d3CanvasLiqBidLine.current)
                    .on('draw', () => {
                        setCanvasResolution(canvas);
                        clipBidHighlightedLines(
                            ctx,
                            canvas.width,
                            liquidityData?.liqBoundaryCurve,
                        );

                        lineBidSeries(liqDataBidCurve);
                    })
                    .on('measure', () => {
                        lineBidSeries.context(ctx);
                    });
            }

            if (
                lineBidDepthSeries &&
                liquidityData?.liqBidData &&
                liqBidDepthSeries
            ) {
                d3.select(d3CanvasLiqBidDepthLine.current)
                    .on('draw', () => {
                        setCanvasResolution(canvasDepth);
                        clipBidHighlightedLines(
                            ctxDepth,
                            canvas.width,
                            liquidityData?.liqBoundaryDepth,
                        );

                        lineBidDepthSeries(liqDataBidDepth);
                    })
                    .on('measure', () => {
                        lineBidDepthSeries.context(ctxDepth);
                    });
            }

            render();
            renderCanvas();
        }
    }, [
        diffHashSig(scaleData),
        liquidityData?.liqBidData,
        liquidityData?.depthLiqBidData,
        lineBidSeries,
        liqBidSeries,
        liqBidDepthSeries,
        liqMode,
        ranges,
        reset,
    ]);

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

    useEffect(() => {
        const liqDataAskCurve = liquidityData?.liqAskData;

        const liqDataAskDepth = liquidityData?.depthLiqAskData;

        const canvas = d3
            .select(d3CanvasLiqAskLine.current)
            .select('canvas')
            .node() as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');

        const canvasDepth = d3
            .select(d3CanvasLiqAskDepthLine.current)
            .select('canvas')
            .node() as HTMLCanvasElement;
        const ctxDepth = canvasDepth.getContext('2d');

        if (lineAskSeries && liqAskSeries) {
            d3.select(d3CanvasLiqAskLine.current)
                .on('draw', () => {
                    setCanvasResolution(canvas);
                    clipAskHighlightedLines(
                        ctx,
                        canvas.width,
                        liquidityData?.liqBoundaryCurve,
                    );
                    lineAskSeries(liqDataAskCurve);
                })
                .on('measure', () => {
                    lineAskSeries.context(ctx);
                });
        }

        if (lineAskDepthSeries && liqAskDepthSeries) {
            d3.select(d3CanvasLiqAskDepthLine.current)
                .on('draw', () => {
                    setCanvasResolution(canvasDepth);
                    clipAskHighlightedLines(
                        ctxDepth,
                        canvas.width,
                        liquidityData?.liqBoundaryDepth,
                    );
                    lineAskDepthSeries(liqDataAskDepth);
                })
                .on('measure', () => {
                    lineAskDepthSeries.context(ctxDepth);
                });
        }

        render();
        renderCanvas();
    }, [
        diffHashSig(scaleData),
        liquidityData?.liqAskData,
        liquidityData?.depthLiqAskData,
        lineAskSeries,
        lineAskDepthSeries,
        liqAskSeries,
        liqAskDepthSeries,
        ranges,
        reset,
        liquidityScale,
        liquidityDepthScale,
    ]);

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
        if (poolPriceDisplay && scaleData) {
            const xmin = scaleData?.xScale.domain()[0];
            const xmax = scaleData?.xScale.domain()[1];

            const filtered = unparsedCandleData.filter(
                (data: any) =>
                    data.time * 1000 >= xmin && data.time * 1000 <= xmax,
            );

            if (filtered !== undefined && filtered.length > 0) {
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
                            min !== 0
                                ? Math.min(Math.min(min, max), minYBoundary)
                                : minYBoundary;

                        const high =
                            max !== 0
                                ? Math.max(Math.max(min, max), maxYBoundary)
                                : maxYBoundary;

                        const bufferForRange = Math.abs((low - high) / 6);

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
            unparsedCandleData !== undefined &&
            scaleData !== undefined &&
            zoomUtils !== undefined &&
            liqTooltip !== undefined
        ) {
            drawChart(unparsedCandleData, scaleData, zoomUtils, selectedDate);
        }
    }, [
        unparsedCandleData,
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

        const arr = unparsedCandleData.map((d: CandleData) =>
            Math.abs(
                (denomInBase
                    ? d.invPriceCloseExclMEVDecimalCorrected
                    : d.priceCloseExclMEVDecimalCorrected) -
                    (denomInBase
                        ? d.invPriceOpenExclMEVDecimalCorrected
                        : d.priceOpenExclMEVDecimalCorrected),
            ),
        );

        let minHeight = 0;

        if (arr) minHeight = arr.reduce((a, b) => a + b, 0) / arr.length;

        const xmin = scaleData?.xScale.domain()[0];
        const xmax = scaleData?.xScale.domain()[1];

        const filtered = unparsedCandleData?.filter(
            (data: any) => data.time * 1000 >= xmin && data.time * 1000 <= xmax,
        );

        const longestValue = d3.max(filtered, (d: any) => d.volumeUSD) / 2;

        const nearest = snapForCandle(event);
        const dateControl =
            nearest?.time * 1000 > startDate && nearest?.time * 1000 < lastDate;
        const yValue = scaleData?.yScale.invert(event.offsetY);

        const yValueVolume = scaleData?.volumeScale.invert(event.offsetY / 2);
        const selectedVolumeData = unparsedCandleData.find(
            (item: any) => item.time === nearest?.time,
        );
        const selectedVolumeDataValue = selectedVolumeData?.volumeUSD;

        const isSelectedVolume = selectedVolumeDataValue
            ? yValueVolume <=
                  (selectedVolumeDataValue < longestValue
                      ? longestValue
                      : selectedVolumeDataValue) && yValueVolume !== 0
                ? true
                : false
            : false;

        const close = denomInBase
            ? nearest.invPriceCloseExclMEVDecimalCorrected
            : nearest.priceCloseExclMEVDecimalCorrected;

        const open = denomInBase
            ? nearest.invPriceOpenExclMEVDecimalCorrected
            : nearest.priceOpenExclMEVDecimalCorrected;

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
        if (liqTooltip) liqTooltip.style('visibility', 'hidden');

        setAskGradientDefault();
        setBidGradientDefault();
    };

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

            gradient.addColorStop(1 - ratioBid, 'rgba(115, 113, 252, 0.3)');

            gradient.addColorStop(1 - ratioBid, 'rgba(115, 113, 252, 0.6)');

            setGradientForBid(gradient);
        }

        renderCanvas();
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

                gradient.addColorStop(ratioAsk, 'rgba(205, 193, 255, 0.3)');

                setGradientForAsk(gradient);
            }
        }

        renderCanvas();
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

    const findTvlNearest = (point: any) => {
        if (point == undefined) return 0;
        if (unparsedCandleData) {
            const xScale = scaleData?.xScale;

            const filtered =
                unparsedCandleData.length > 1
                    ? unparsedCandleData.filter(
                          (d: CandleData) => d.time != null,
                      )
                    : unparsedCandleData;

            const nearest = minimum(filtered, (d: CandleData) =>
                Math.abs(point.layerX - xScale(d.time * 1000)),
            )[1];

            if (nearest) {
                return nearest.tvlData.tvl;
            } else {
                return 0;
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

    const snap = (data: Array<CandleData>, point: any) => {
        if (
            point == undefined ||
            unparsedCandleData === undefined ||
            scaleData === undefined
        )
            return [];
        const xScale = scaleData?.xScale;

        const filtered =
            data.length > 1
                ? data.filter((d: CandleData) => d.time != null)
                : data;
        const nearest = minimum(filtered, (d: CandleData) =>
            Math.abs(point.layerX - xScale(d.time * 1000)),
        )[1];

        if (selectedDate === undefined) {
            props.setCurrentData(nearest);

            props.setCurrentVolumeData(
                unparsedCandleData.find(
                    (item: CandleData) => item.time === nearest?.time,
                )?.volumeUSD,
            );
        } else if (selectedDate) {
            props.setCurrentVolumeData(
                unparsedCandleData.find(
                    (item: any) => item.time * 1000 === selectedDate,
                )?.volumeUSD,
            );
        }

        setsubChartValues((prevState: any) => {
            const newData = [...prevState];

            newData.filter((target: any) => target.name === 'tvl')[0].value =
                findTvlNearest(point);

            newData.filter(
                (target: any) => target.name === 'feeRate',
            )[0].value = unparsedCandleData.find(
                (item: CandleData) => item.time === nearest?.time,
            )?.averageLiquidityFee;

            return newData;
        });

        const returnXdata =
            unparsedCandleData[0].time * 1000 <=
            scaleData?.xScale.invert(point.offsetX)
                ? scaleData?.xScale.invert(point.offsetX)
                : nearest?.time * 1000;

        return [
            {
                x: returnXdata,
                y: scaleData?.yScale.invert(point.offsetY),
            },
        ];
    };

    const setCrossHairLocation = (event: any, showHr = true) => {
        if (snap(unparsedCandleData, event)[0] !== undefined) {
            crosshairData[0] = snap(unparsedCandleData, event)[0];
            if (!isLineDrag) {
                setIsMouseMoveCrosshair(true);

                setCrosshairData([
                    {
                        x: crosshairData[0].x,
                        y: !showHr
                            ? NaN
                            : scaleData?.yScale.invert(event.layerY),
                    },
                ]);
            }

            render();
        }
    };

    useEffect(() => {
        d3.select(d3CanvasCrosshair.current).style(
            'visibility',
            crosshairActive !== 'none' ? 'visible' : 'hidden',
        );
    }, [crosshairActive]);

    // Draw Chart
    const drawChart = useCallback(
        (
            unparsedCandleData: Array<CandleData>,
            scaleData: any,
            zoomUtils: any,
            selectedDate: any,
        ) => {
            if (unparsedCandleData.length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars

                const onClickCanvas = (event: any) => {
                    setIsMouseMoveCrosshair(false);
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
                        let newLimitValue = scaleData?.yScale.invert(
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
                            onBlurLimitRate(limit[0].value, newLimitValue);
                        }
                    }
                };

                d3.select(d3CanvasMarketLine.current).on(
                    'click',
                    (event: any) => {
                        onClickCanvas(event);
                    },
                );

                d3.select(d3CanvasLimitLine.current).on(
                    'click',
                    (event: any) => {
                        onClickCanvas(event);
                    },
                );

                d3.select(d3CanvasRangeLine.current).on(
                    'click',
                    (event: any) => {
                        onClickCanvas(event);
                    },
                );

                const mousemove = (event: any) => {
                    setCrossHairLocation(event);
                    const { isHoverCandleOrVolumeData } =
                        candleOrVolumeDataHoverStatus(event);

                    if (liqMode !== 'none') {
                        liqDataHover(event);
                    }

                    const mousePlacement = scaleData?.yScale.invert(
                        event.offsetY,
                    );
                    const limitLineValue = limit[0].value;

                    const rangeLowLineValue = ranges.filter(
                        (target: any) => target.name === 'Min',
                    )[0].value;
                    const rangeHighLineValue = ranges.filter(
                        (target: any) => target.name === 'Max',
                    )[0].value;

                    const lineBuffer =
                        (scaleData?.yScale.domain()[1] -
                            scaleData?.yScale.domain()[0]) /
                        30;

                    const canUserDragLimit =
                        mousePlacement < limitLineValue + lineBuffer &&
                        mousePlacement > limitLineValue - lineBuffer;

                    const canUserDragRange =
                        (mousePlacement < rangeLowLineValue + lineBuffer &&
                            mousePlacement > rangeLowLineValue - lineBuffer) ||
                        (mousePlacement < rangeHighLineValue + lineBuffer &&
                            mousePlacement > rangeHighLineValue - lineBuffer);

                    if (
                        (location.pathname.includes('/limit') &&
                            canUserDragLimit) ||
                        ((location.pathname.includes('range') ||
                            location.pathname.includes('reposition')) &&
                            canUserDragRange)
                    ) {
                        d3.select(event.currentTarget).style(
                            'cursor',
                            'row-resize',
                        );

                        setDragEvent('drag');
                    } else {
                        setDragEvent('zoom');

                        d3.select(event.currentTarget).style(
                            'cursor',
                            isHoverCandleOrVolumeData ? 'pointer' : 'default',
                        );
                    }
                };

                d3.select(d3CanvasMarketLine.current).on(
                    'mousemove',
                    function (event: any) {
                        mousemove(event);
                    },
                );
                d3.select(d3CanvasLimitLine.current).on(
                    'mousemove',
                    function (event: any) {
                        mousemove(event);
                    },
                );
                d3.select(d3CanvasRangeLine.current).on(
                    'mousemove',
                    function (event: any) {
                        mousemove(event);
                    },
                );

                d3.select(d3Yaxis.current).on('mouseover', (event: any) => {
                    d3.select(event.currentTarget).style(
                        'cursor',
                        'row-resize',
                    );
                    mouseLeaveCanvas();
                });

                d3.select(d3Xaxis.current).on('mouseover', (event: any) => {
                    d3.select(event.currentTarget).style(
                        'cursor',
                        'col-resize',
                    );
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
                    setIsMouseMoveCrosshair(false);

                    mouseOutFuncForLiq();
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

                    setIsMouseMoveCrosshair(false);
                    mouseOutFuncForLiq();

                    render();
                };

                d3.select(d3CanvasMarketLine.current).on('mouseleave', () => {
                    mouseLeaveCanvas();
                });
                d3.select(d3CanvasLimitLine.current).on('mouseleave', () => {
                    mouseLeaveCanvas();
                });
                d3.select(d3CanvasRangeLine.current).on('mouseleave', () => {
                    mouseLeaveCanvas();
                });

                const mouseEnterCanvas = () => {
                    if (!isLineDrag) {
                        setCrosshairActive('chart');
                        setIsMouseMoveCrosshair(true);
                    }

                    props.setShowTooltip(true);
                };

                d3.select(d3CanvasMarketLine.current).on('mouseenter', () => {
                    mouseEnterCanvas();
                });
                d3.select(d3CanvasLimitLine.current).on('mouseenter', () => {
                    mouseEnterCanvas();
                });
                d3.select(d3CanvasRangeLine.current).on('mouseenter', () => {
                    mouseEnterCanvas();
                });
            }
        },
        [
            candlestick,
            bandwidth,
            limit,
            ranges,
            location.pathname,
            unparsedCandleData,
            liquidityData?.liqBidData,
            liquidityData?.liqAskData,
            liquidityData?.depthLiqBidData,
            liquidityData?.depthLiqAskData,
            showTvl,
            showVolume,
            showFeeRate,
            liqMode,
            liquidityScale,
            liquidityDepthScale,
            crosshairActive,
            isLineDrag,
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
                // setTriangleLimitValues(newLimitValue);
            } else {
                tickDispPrice.then((tp) => {
                    const displayPriceWithDenom = denomInBase ? tp : 1 / tp;

                    if (displayPriceWithDenom.toString().includes('e')) {
                        newLimitValue = displayPriceWithDenom;
                    } else {
                        const limitRateTruncated =
                            displayPriceWithDenom < 2
                                ? displayPriceWithDenom.toLocaleString(
                                      undefined,
                                      {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 6,
                                      },
                                  )
                                : displayPriceWithDenom.toLocaleString(
                                      undefined,
                                      {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                      },
                                  );

                        const limitValue = parseFloat(
                            limitRateTruncated.replace(',', ''),
                        );

                        newLimitValue = limitValue;
                    }

                    reverseTokenForChart(limitPreviousData, newLimitValue);
                    setLimit(() => {
                        return [
                            {
                                name: 'Limit',
                                value: newLimitValue,
                            },
                        ];
                    });
                    // setTriangleLimitValues(limitValue);
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
                                top: '50%',
                            }}
                        ></d3fc-canvas>
                        <d3fc-canvas
                            ref={d3CanvasLiqBidLine}
                            className='plot-canvas'
                            style={{
                                position: 'relative',
                                width: '20%',
                                left: '80%',
                            }}
                        ></d3fc-canvas>
                        <d3fc-canvas
                            ref={d3CanvasLiqAskLine}
                            className='plot-canvas'
                            style={{
                                position: 'relative',
                                width: '20%',
                                left: '80%',
                            }}
                        ></d3fc-canvas>
                        <d3fc-canvas
                            ref={d3CanvasLiqBidDepthLine}
                            className='plot-canvas'
                            style={{
                                position: 'relative',
                                width: '20%',
                                left: '80%',
                            }}
                        ></d3fc-canvas>
                        <d3fc-canvas
                            ref={d3CanvasLiqAskDepthLine}
                            className='plot-canvas'
                            style={{
                                position: 'relative',
                                width: '20%',
                                left: '80%',
                            }}
                        ></d3fc-canvas>
                        <d3fc-canvas
                            ref={d3CanvasLiqBid}
                            className='liq-bid-canvas'
                            style={{
                                position: 'relative',
                                width: '20%',
                                left: '80%',
                            }}
                        ></d3fc-canvas>

                        <d3fc-canvas
                            ref={d3CanvasLiqBidDepth}
                            className='liq-bid-canvas'
                            style={{
                                position: 'relative',
                                width: '20%',
                                left: '80%',
                            }}
                        ></d3fc-canvas>

                        <d3fc-canvas
                            ref={d3CanvasLiqAsk}
                            className='liq-ask-canvas'
                            style={{
                                position: 'relative',
                                width: '20%',
                                left: '80%',
                            }}
                        ></d3fc-canvas>
                        <d3fc-canvas
                            ref={d3CanvasLiqAskDepth}
                            className='liq-ask-canvas'
                            style={{
                                position: 'relative',
                                width: '20%',
                                left: '80%',
                            }}
                        ></d3fc-canvas>
                        <d3fc-canvas
                            ref={d3CanvasBand}
                            className='band-canvas'
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
                                setCrossHairLocation={setCrossHairLocation}
                                setCrosshairActive={setCrosshairActive}
                                crosshairActive={crosshairActive}
                                setShowTooltip={props.setShowTooltip}
                                isMouseMoveCrosshair={isMouseMoveCrosshair}
                                setIsMouseMoveCrosshair={
                                    setIsMouseMoveCrosshair
                                }
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
                                scaleData={scaleData}
                                getNewCandleData={getNewCandleData}
                                setZoomAndYdragControl={setZoomAndYdragControl}
                                zoomAndYdragControl={zoomAndYdragControl}
                                subChartValues={subChartValues}
                                render={render}
                                yAxisWidth={yAxisWidth}
                                setCrossHairLocation={setCrossHairLocation}
                                setCrosshairActive={setCrosshairActive}
                                crosshairActive={crosshairActive}
                                setShowTooltip={props.setShowTooltip}
                                isMouseMoveCrosshair={isMouseMoveCrosshair}
                                setIsMouseMoveCrosshair={
                                    setIsMouseMoveCrosshair
                                }
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
