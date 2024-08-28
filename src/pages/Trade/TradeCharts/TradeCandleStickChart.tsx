import {
    Dispatch,
    SetStateAction,
    memo,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import Chart from '../../Chart/Chart';
import './TradeCandleStickChart.css';

import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import {
    diffHashSigLiquidity,
    getPinnedPriceValuesFromTicks,
} from '../../../ambient-utils/dataLayer';
import { CandleContext } from '../../../contexts/CandleContext';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { PoolContext } from '../../../contexts/PoolContext';
import { ChartContext } from '../../../contexts/ChartContext';
import { TradeTokenContext } from '../../../contexts/TradeTokenContext';
import Spinner from '../../../components/Global/Spinner/Spinner';
import { LiquidityDataLocal } from './TradeCharts';
import {
    CandleDataIF,
    CandleDomainIF,
    CandleScaleIF,
    TransactionIF,
} from '../../../ambient-utils/types';
import {
    chartItemStates,
    getInitialDisplayCandleCount,
    liquidityChartData,
    scaleData,
} from '../../Chart/ChartUtils/chartUtils';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { updatesIF } from '../../../utils/hooks/useUrlParams';
import { GraphDataContext } from '../../../contexts/GraphDataContext';
import { TradeDataContext } from '../../../contexts/TradeDataContext';
import {
    maxRequestCountForCondensed,
    xAxisBuffer,
} from '../../Chart/ChartUtils/chartConstants';
import { filterCandleWithTransaction } from '../../Chart/ChartUtils/discontinuityScaleUtils';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface propsIF {
    changeState: (
        isOpen: boolean | undefined,
        candleData: CandleDataIF | undefined,
    ) => void;
    chartItemStates: chartItemStates;
    selectedDate: number | undefined;
    setSelectedDate: Dispatch<number | undefined>;
    rescale: boolean | undefined;
    setRescale: Dispatch<SetStateAction<boolean>>;
    latest: boolean | undefined;
    setLatest: Dispatch<SetStateAction<boolean>>;
    reset: boolean | undefined;
    setReset: Dispatch<SetStateAction<boolean>>;
    showLatest: boolean | undefined;
    setShowLatest: Dispatch<SetStateAction<boolean>>;
    updateURL: (changes: updatesIF) => void;
}

function TradeCandleStickChart(props: propsIF) {
    const { selectedDate, setSelectedDate, updateURL } = props;

    const {
        candleData,
        isFetchingCandle,
        setCandleScale,
        candleScale,
        timeOfEndCandle,
        isCondensedModeEnabled,
        setIsCondensedModeEnabled,
        candleDomains,
        setCandleDomains,
    } = useContext(CandleContext);
    const { chartSettings, isChangeScaleChart, setSelectedDrawnShape } =
        useContext(ChartContext);
    const { chainData } = useContext(CrocEnvContext);
    const { poolPriceDisplay: poolPriceWithoutDenom, isPoolInitialized } =
        useContext(PoolContext);
    const {
        baseToken: { address: baseTokenAddress },
        quoteToken: { address: quoteTokenAddress },
    } = useContext(TradeTokenContext);

    const period = useMemo(
        () => chartSettings.candleTime.global.time,
        [chartSettings.candleTime.global.time, location.pathname],
    );

    const [currentData, setCurrentData] = useState<CandleDataIF | undefined>();
    const periodToReadableTime = useMemo(() => {
        if (period) {
            const readableTime = chartSettings.candleTime.global.defaults.find(
                (i) => i.seconds === period,
            )?.readable as string;

            let stringTime = '';
            if (readableTime.includes('m')) {
                stringTime = readableTime.slice(0, -1) + ' ' + 'Minute' + ' ';
            }
            if (readableTime.includes('h')) {
                stringTime = readableTime.slice(0, -1) + ' ' + 'Hour' + ' ';
            }
            if (readableTime.includes('d')) {
                stringTime = readableTime.slice(0, -1) + ' ' + 'Day' + ' ';
            }

            return stringTime;
        }

        return undefined;
    }, [period, location.pathname]);

    const unparsedCandleData = candleData?.candles;

    const [scaleData, setScaleData] = useState<scaleData | undefined>();
    const [liquidityScale, setLiquidityScale] = useState<
        d3.ScaleLinear<number, number> | undefined
    >(undefined);
    const [liquidityDepthScale, setLiquidityDepthScale] = useState<
        d3.ScaleLinear<number, number> | undefined
    >();
    const [prevPeriod, setPrevPeriod] = useState<any>();
    const [prevFirstCandle, setPrevFirstCandle] = useState<any>();

    const [isCandleAdded, setIsCandleAdded] = useState<boolean>(false);

    const [isFetchingEnoughData, setIsFetchingEnoughData] = useState(true);

    const [isCompletedFetchData, setIsCompletedFetchData] = useState(true);

    const [fetchCountForEnoughData, setFetchCountForEnoughData] = useState(1);
    const [liqBoundary, setLiqBoundary] = useState<number | undefined>(
        undefined,
    );
    const [prevCandleCount, setPrevCandleCount] = useState<number>(0);

    const [showTooltip, setShowTooltip] = useState(false);

    const [chartResetStatus, setChartResetStatus] = useState<{
        isResetChart: boolean;
    }>({
        isResetChart: false,
    });
    const {
        tokenA,
        tokenB,
        isDenomBase,
        poolPriceNonDisplay,
        currentPoolPriceTick,
    } = useContext(TradeDataContext);

    const { liquidityData: unparsedLiquidityData } =
        useContext(GraphDataContext);

    const tokenPair = useMemo(
        () => ({
            dataTokenA: tokenA,
            dataTokenB: tokenB,
        }),
        [tokenB.address, tokenB.chainId, tokenA.address, tokenA.chainId],
    );

    // TODO: could probably be determined from the isTokenABase in context?
    const isTokenABase = tokenPair?.dataTokenA.address === baseTokenAddress;

    const poolPriceDisplay = poolPriceWithoutDenom
        ? isDenomBase && poolPriceWithoutDenom
            ? 1 / poolPriceWithoutDenom
            : poolPriceWithoutDenom ?? 0
        : 0;

    const _tokenA = tokenPair.dataTokenA;
    const _tokenB = tokenPair.dataTokenB;
    const tokenADecimals = _tokenA.decimals;
    const tokenBDecimals = _tokenB.decimals;
    const baseTokenDecimals = isTokenABase ? tokenADecimals : tokenBDecimals;
    const quoteTokenDecimals = !isTokenABase ? tokenADecimals : tokenBDecimals;

    const mobileView = useMediaQuery('(max-width: 600px)');

    const [userTransactionData, setUserTransactionData] =
        useState<Array<TransactionIF>>();

    const { userTransactionsByPool } = useContext(GraphDataContext);

    useEffect(() => {
        let isMounted = true;
        if (userTransactionsByPool) {
            if (isMounted)
                setUserTransactionData(userTransactionsByPool.changes);
        }
        return () => {
            isMounted = false;
        };
    }, [userTransactionsByPool]);

    useEffect(() => {
        setSelectedDrawnShape(undefined);
        setIsFetchingEnoughData(true);
        setIsCompletedFetchData(true);
        setChartResetStatus({
            isResetChart: false,
        });
        setFetchCountForEnoughData(0);
    }, [period, baseTokenAddress + quoteTokenAddress]);

    useEffect(() => {
        if (candleDomains.isResetRequest) {
            setIsFetchingEnoughData(true);
            setIsCompletedFetchData(true);
            setFetchCountForEnoughData(0);
        }
    }, [candleDomains.isResetRequest]);

    useEffect(() => {
        if (selectedDate) {
            const selectedDateData = unparsedCandleData?.find(
                (i) => i.time * 1000 === selectedDate,
            );
            setCurrentData(selectedDateData);
            setShowTooltip(true);
        }
    }, [selectedDate]);

    useEffect(() => {
        if (isFetchingEnoughData && scaleData) {
            const newDiscontinuityProvider = d3fc.discontinuityRange(...[]);
            scaleData.xScale.discontinuityProvider(newDiscontinuityProvider);
        }
    }, [isFetchingEnoughData]);

    useEffect(() => {
        if (
            unparsedLiquidityData !== undefined &&
            candleData &&
            (
                candleData?.pool.baseAddress + candleData?.pool.quoteAddress
            ).toUpperCase() ===
                (
                    unparsedLiquidityData.curveState.base +
                    unparsedLiquidityData.curveState.quote
                ).toUpperCase()
        ) {
            const barThreshold =
                poolPriceDisplay !== undefined ? poolPriceDisplay : 0;

            const liqBoundaryData = unparsedLiquidityData.ranges.find(
                (liq: any) => {
                    return isDenomBase
                        ? liq.upperBoundInvPriceDecimalCorrected <
                              barThreshold &&
                              liq.lowerBoundInvPriceDecimalCorrected !==
                                  '-inf' &&
                              Number.isFinite(
                                  liq.lowerBoundInvPriceDecimalCorrected,
                              )
                        : liq.upperBoundPriceDecimalCorrected > barThreshold &&
                              liq.upperBoundPriceDecimalCorrected !== '+inf' &&
                              Number.isFinite(
                                  liq.upperBoundPriceDecimalCorrected,
                              );
                },
            );

            const liqBoundaryArg =
                liqBoundaryData !== undefined
                    ? isDenomBase
                        ? liqBoundaryData.lowerBoundInvPriceDecimalCorrected
                        : liqBoundaryData.lowerBoundPriceDecimalCorrected
                    : barThreshold;

            const liqBoundary =
                typeof liqBoundaryArg === 'number'
                    ? liqBoundaryArg
                    : parseFloat(liqBoundaryArg);

            setLiqBoundary(() => liqBoundary);
        }
    }, [
        diffHashSigLiquidity(unparsedLiquidityData),
        isDenomBase,
        poolPriceDisplay !== undefined && poolPriceDisplay > 0,
        candleData?.pool?.baseAddress,
        candleData?.pool?.quoteAddress,
    ]);

    const sumActiveLiq = unparsedLiquidityData
        ? unparsedLiquidityData.ranges.reduce((sum, range) => {
              return sum + (range.activeLiq || 0);
          }, 0)
        : 0;

    // Parse liquidity data
    const liquidityData: liquidityChartData | undefined = useMemo(() => {
        if (
            liqBoundary &&
            unparsedLiquidityData &&
            poolPriceDisplay !== undefined &&
            poolPriceDisplay > 0 &&
            unparsedLiquidityData.curveState.base ===
                baseTokenAddress.toLowerCase() &&
            unparsedLiquidityData.curveState.quote ===
                quoteTokenAddress.toLowerCase() &&
            unparsedLiquidityData.curveState.poolIdx === chainData.poolIndex &&
            unparsedLiquidityData.curveState.chainId === chainData.chainId
        ) {
            const liqAskData: LiquidityDataLocal[] = [];
            const liqBidData: LiquidityDataLocal[] = [];
            const depthLiqBidData: LiquidityDataLocal[] = [];
            const depthLiqAskData: LiquidityDataLocal[] = [];

            let topBoundary = 0;
            let lowBoundary = 0;

            const lowTick = currentPoolPriceTick - 100 * 101;
            const highTick = currentPoolPriceTick + 100 * 101;

            const rangeBoundary = getPinnedPriceValuesFromTicks(
                isDenomBase,
                baseTokenDecimals,
                quoteTokenDecimals,
                lowTick,
                highTick,
                lookupChain(chainData.chainId).gridSize,
            );

            const limitBoundary = parseFloat(
                rangeBoundary.pinnedMaxPriceDisplay,
            );

            const barThreshold =
                poolPriceDisplay !== undefined ? poolPriceDisplay : 0;

            const domainLeft = Math.min(
                ...unparsedLiquidityData.ranges
                    .filter((item) => item.activeLiq > 0)
                    .map((o: any) => {
                        return o.activeLiq !== undefined
                            ? o.activeLiq
                            : Infinity;
                    }),
            );
            const domainRight = Math.max(
                ...unparsedLiquidityData.ranges.map((o: any) => {
                    return o.activeLiq !== undefined ? o.activeLiq : 0;
                }),
            );

            const depthBidLeft = Math.min(
                ...unparsedLiquidityData.ranges.map((o: any) => {
                    return o.cumBidLiq !== undefined && o.cumBidLiq !== 0
                        ? o.cumBidLiq
                        : Infinity;
                }),
            );

            const depthBidRight = Math.max(
                ...unparsedLiquidityData.ranges.map((o: any) => {
                    return o.cumBidLiq !== undefined && o.cumBidLiq !== 0
                        ? o.cumBidLiq
                        : 0;
                }),
            );

            const depthAskLeft = Math.min(
                ...unparsedLiquidityData.ranges.map((o: any) => {
                    return o.cumAskLiq !== undefined && o.cumAskLiq !== 0
                        ? o.cumAskLiq
                        : Infinity;
                }),
            );

            const depthAskRight = Math.max(
                ...unparsedLiquidityData.ranges.map((o: any) => {
                    const price = isDenomBase
                        ? o.upperBoundInvPriceDecimalCorrected
                        : o.upperBoundPriceDecimalCorrected;
                    if (price > barThreshold / 10 && price < limitBoundary) {
                        return o.cumAskLiq !== undefined && o.cumAskLiq !== 0
                            ? o.cumAskLiq
                            : 0;
                    }
                    return 0;
                }),
            );

            const liquidityScale = d3
                .scaleLog()
                .domain([domainLeft, domainRight])
                .range([30, 1000]);

            const depthLiquidityScale = d3
                .scaleLog()
                .domain([
                    depthAskLeft < depthBidLeft ? depthAskLeft : depthBidLeft,
                    depthBidRight > depthAskRight
                        ? depthBidRight
                        : depthAskRight,
                ])
                .range([30, 550]);

            let liqBoundaryDepth = liqBoundary;

            unparsedLiquidityData.ranges.map((data: any) => {
                const liqUpperPrices = isDenomBase
                    ? data.upperBoundInvPriceDecimalCorrected
                    : data.lowerBoundPriceDecimalCorrected;

                const liqLowerPrices = isDenomBase
                    ? data.lowerBoundInvPriceDecimalCorrected
                    : data.upperBoundPriceDecimalCorrected;

                if (
                    liqUpperPrices >= liqBoundary &&
                    liqUpperPrices < liqBoundary * 10
                ) {
                    liqBidData.push({
                        activeLiq: liquidityScale(data.activeLiq),
                        liqPrices: liqUpperPrices,
                        deltaAverageUSD: data.deltaAverageUSD
                            ? data.deltaAverageUSD
                            : 0,
                        cumAverageUSD: data.cumAverageUSD
                            ? data.cumAverageUSD
                            : 0,
                        upperBound:
                            data.upperBound === '+inf'
                                ? data.lowerBound
                                : data.upperBound,
                        lowerBound: data.lowerBound,
                    });
                } else {
                    if (
                        liqLowerPrices <= limitBoundary &&
                        liqLowerPrices > liqBoundary / 10
                    ) {
                        liqAskData.push({
                            activeLiq: liquidityScale(data.activeLiq),
                            liqPrices: liqLowerPrices,
                            deltaAverageUSD: data.deltaAverageUSD
                                ? data.deltaAverageUSD
                                : 0,
                            cumAverageUSD: data.cumAverageUSD
                                ? data.cumAverageUSD
                                : 0,
                            upperBound:
                                data.upperBound === '+inf'
                                    ? data.lowerBound
                                    : data.upperBound,
                            lowerBound: data.lowerBound,
                        });
                    }
                }

                if (!isDenomBase) {
                    if (
                        data.cumAskLiq !== undefined &&
                        data.cumAskLiq !== '0' &&
                        liqUpperPrices !== '+inf' &&
                        !Number.isNaN(depthLiquidityScale(data.cumAskLiq)) &&
                        liqUpperPrices < liqBoundary * 10
                    ) {
                        depthLiqBidData.push({
                            activeLiq: depthLiquidityScale(data.cumAskLiq),
                            liqPrices: liqUpperPrices,
                            deltaAverageUSD: data.deltaAverageUSD,
                            cumAverageUSD: data.cumAverageUSD,
                            upperBound:
                                data.upperBound === '+inf'
                                    ? data.lowerBound
                                    : data.upperBound,
                            lowerBound: data.lowerBound,
                        });
                        liqBoundaryDepth = depthLiqBidData[0].liqPrices;
                    }

                    if (
                        data.cumBidLiq !== undefined &&
                        !Number.isNaN(depthLiquidityScale(data.cumBidLiq)) &&
                        liqLowerPrices > liqBoundary / 10
                    ) {
                        depthLiqAskData.push({
                            activeLiq: depthLiquidityScale(data.cumBidLiq),
                            liqPrices: liqLowerPrices,
                            deltaAverageUSD: data.deltaAverageUSD,
                            cumAverageUSD: data.cumAverageUSD,
                            upperBound:
                                data.upperBound === '+inf'
                                    ? data.lowerBound
                                    : data.upperBound,
                            lowerBound: data.lowerBound,
                        });

                        liqBoundaryDepth = liqLowerPrices;
                    }
                } else {
                    if (
                        data.cumBidLiq !== undefined &&
                        data.cumBidLiq !== '0' &&
                        liqUpperPrices !== '+inf' &&
                        liqUpperPrices < liqBoundary * 10 &&
                        !Number.isNaN(depthLiquidityScale(data.cumBidLiq))
                    ) {
                        depthLiqBidData.push({
                            activeLiq: depthLiquidityScale(data.cumBidLiq),
                            liqPrices: liqUpperPrices,
                            deltaAverageUSD: data.deltaAverageUSD,
                            cumAverageUSD: data.cumAverageUSD,
                            upperBound:
                                data.upperBound === '+inf'
                                    ? data.lowerBound
                                    : data.upperBound,
                            lowerBound: data.lowerBound,
                        });
                        liqBoundaryDepth = liqUpperPrices;
                    }

                    if (
                        data.cumAskLiq !== undefined &&
                        data.cumAskLiq !== '0' &&
                        !Number.isNaN(depthLiquidityScale(data.cumAskLiq)) &&
                        liqUpperPrices <= limitBoundary &&
                        liqUpperPrices > liqBoundary / 10
                    ) {
                        depthLiqAskData.push({
                            activeLiq: depthLiquidityScale(data.cumAskLiq),
                            liqPrices: liqLowerPrices,
                            deltaAverageUSD: data.deltaAverageUSD,
                            cumAverageUSD: data.cumAverageUSD,
                            upperBound:
                                data.upperBound === '+inf'
                                    ? data.lowerBound
                                    : data.upperBound,
                            lowerBound: data.lowerBound,
                        });
                        liqBoundaryDepth = depthLiqAskData[0].liqPrices;
                    }
                }
            });
            if (liqBidData.length > 1 && liqAskData.length > 1) {
                liqBidData.sort((a: any, b: any) => b.liqPrices - a.liqPrices);

                liqAskData.sort((a: any, b: any) => b.liqPrices - a.liqPrices);
                depthLiqBidData.sort(
                    (a: any, b: any) => b.liqPrices - a.liqPrices,
                );

                liqBidData.push({
                    activeLiq: liqBidData.find(
                        (liqData) => liqData.liqPrices < limitBoundary,
                    )?.activeLiq,
                    liqPrices: limitBoundary,
                    deltaAverageUSD: 0,
                    cumAverageUSD: 0,
                    upperBound: 0,
                    lowerBound: 0,
                });

                depthLiqBidData.push({
                    activeLiq: depthLiqBidData.find(
                        (liqData) => liqData.liqPrices < limitBoundary,
                    )?.activeLiq,
                    liqPrices: limitBoundary,
                    deltaAverageUSD: 0,
                    cumAverageUSD: 0,
                    upperBound: 0,
                    lowerBound: 0,
                });

                liqAskData.push({
                    activeLiq: liqAskData[liqAskData.length - 1].activeLiq,
                    liqPrices: 0,
                    deltaAverageUSD: 0,
                    cumAverageUSD: 0,
                    upperBound: 0,
                    lowerBound: 0,
                });

                depthLiqAskData.push({
                    activeLiq:
                        depthLiqAskData[
                            !isDenomBase ? 0 : depthLiqAskData.length - 1
                        ]?.activeLiq,
                    liqPrices: 0,
                    deltaAverageUSD: 0,
                    cumAverageUSD: 0,
                    upperBound: 0,
                    lowerBound: 0,
                });
            }
            topBoundary = limitBoundary;
            lowBoundary = parseFloat(rangeBoundary.pinnedMinPriceDisplay);

            liqAskData.sort((a: any, b: any) => b.liqPrices - a.liqPrices);
            liqBidData.sort((a: any, b: any) => b.liqPrices - a.liqPrices);
            depthLiqBidData.sort((a: any, b: any) => b.liqPrices - a.liqPrices);
            depthLiqAskData.sort((a: any, b: any) => b.liqPrices - a.liqPrices);

            return {
                liqAskData: liqAskData,
                liqBidData: liqBidData,
                depthLiqBidData: depthLiqBidData,
                depthLiqAskData: depthLiqAskData,
                topBoundary: topBoundary,
                lowBoundary: lowBoundary,
                liqTransitionPointforCurve: liqBoundary
                    ? liqBoundary
                    : poolPriceDisplay,
                liqTransitionPointforDepth: liqBoundaryDepth
                    ? liqBoundaryDepth
                    : poolPriceDisplay,
            };
        } else {
            return undefined;
        }
    }, [liqBoundary, baseTokenAddress + quoteTokenAddress, sumActiveLiq]);

    useEffect(() => {
        if (unparsedCandleData) {
            setScaleForChart(unparsedCandleData);
        }
    }, [unparsedCandleData === undefined, mobileView, isDenomBase, period]);

    useEffect(() => {
        if (candleScale.isFetchFirst200Candle === true) {
            scaleData && setScaleData(undefined);
        } else {
            setScaleForChart(unparsedCandleData);
        }
    }, [candleScale.isFetchFirst200Candle]);

    // Liq Scale
    useEffect(() => {
        if (liquidityData !== undefined) {
            if (liquidityScale === undefined) {
                setScaleForChartLiquidity(liquidityData);
            }
        } else {
            setLiquidityScale(() => {
                return undefined;
            });
        }
    }, [liquidityData === undefined, liquidityScale === undefined]);

    const setScaleForChartLiquidity = (liquidityData: any) => {
        if (liquidityData !== undefined) {
            const liquidityScale = d3.scaleLinear();
            const liquidityDepthScale = d3.scaleLinear();

            const liquidityExtent = d3fc
                .extentLinear()
                .include([0])
                .accessors([(d: any) => parseFloat(d.activeLiq)]);

            liquidityScale.domain(
                liquidityExtent(
                    liquidityData.liqBidData.concat(liquidityData.liqAskData),
                ),
            );
            liquidityDepthScale.domain(
                liquidityExtent(
                    liquidityData.depthLiqBidData.concat(
                        liquidityData.depthLiqAskData,
                    ),
                ),
            );

            setLiquidityScale(() => liquidityScale);
            setLiquidityDepthScale(() => liquidityDepthScale);
        }
    };

    // Scale
    const setScaleForChart = (unparsedCandleData: any) => {
        if (
            unparsedCandleData !== undefined &&
            unparsedCandleData.length > 0 &&
            period
        ) {
            const temp = [...unparsedCandleData];
            const boundaryCandles = temp.splice(0, mobileView ? 30 : 99);

            const priceRange = d3fc
                .extentLinear()
                .accessors([
                    (d: any) => {
                        return (
                            isDenomBase
                                ? d.invMinPriceExclMEVDecimalCorrected
                                : d.maxPriceExclMEVDecimalCorrected,
                            isDenomBase
                                ? d.invMaxPriceExclMEVDecimalCorrected
                                : d.minPriceExclMEVDecimalCorrected
                        );
                    },
                ])
                .pad([0.05, 0.05]);

            const xExtent = d3fc
                .extentLinear()
                .accessors([(d: any) => d.time * 1000])
                .padUnit('domain')
                .pad([
                    period * 1000,
                    (period / 2) * (mobileView ? 30 : 80) * 1000,
                ]);

            let xScale: any = undefined;

            const xScaleTime = d3.scaleTime();
            const yScale = d3.scaleLinear();
            xScale = d3fc.scaleDiscontinuous(d3.scaleLinear());
            xScale.domain(xExtent(boundaryCandles));

            resetXScale(xScale);

            yScale.domain(priceRange(boundaryCandles));

            const volumeScale = d3.scaleLinear();

            const yExtentVolume = d3fc
                .extentLinear(candleData?.candles)
                .accessors([(d: any) => d.volumeUSD]);

            volumeScale.domain(yExtentVolume(candleData?.candles));

            if (scaleData === undefined) {
                setScaleData(() => {
                    return {
                        xScale: xScale,
                        xScaleTime: xScaleTime,
                        yScale: yScale,
                        volumeScale: volumeScale,
                        xExtent: xExtent,
                        priceRange: priceRange,
                    };
                });
            } else {
                scaleData.priceRange = priceRange;
            }
        }
    };

    useEffect(() => {
        if (
            unparsedCandleData &&
            unparsedCandleData.length > 0 &&
            period &&
            (prevPeriod === undefined || period !== prevPeriod)
        ) {
            const firstCandleTimeState = d3.max(
                unparsedCandleData,
                (d) => d.time,
            );
            if (
                scaleData &&
                prevPeriod &&
                prevFirstCandle &&
                firstCandleTimeState
            ) {
                const newDiscontinuityProvider = d3fc.discontinuityRange(...[]);
                scaleData.xScale.discontinuityProvider(
                    newDiscontinuityProvider,
                );
                const isShowLatestCandle = candleScale?.isShowLatestCandle;
                // If the last candle is displayed, chart scale according to default values when switch timeframe
                if (isShowLatestCandle) {
                    resetChart();
                } else {
                    let domain = scaleData.xScale.domain();

                    if (
                        timeOfEndCandle &&
                        timeOfEndCandle + 5 * period * 1000 > domain[1]
                    ) {
                        const diffDomain = Math.floor(
                            (domain[1] - domain[0]) / 2,
                        );
                        domain = [
                            timeOfEndCandle - diffDomain,
                            timeOfEndCandle + diffDomain,
                        ];
                    }

                    const diffDomain = Math.abs(domain[1] - domain[0]);
                    const domainCenter =
                        Math.max(domain[1], domain[0]) - diffDomain / 2;

                    const newDiffDomain = period * 1000 * prevCandleCount;

                    const d1 = domainCenter + newDiffDomain / 2;
                    const d0 = domainCenter - newDiffDomain / 2;

                    const domainRight =
                        domain[1] < Date.now()
                            ? d1
                            : Date.now() + (newDiffDomain / 10) * 3;
                    const domainLeft =
                        domain[1] < Date.now()
                            ? d0
                            : Date.now() - (newDiffDomain / 10) * 7;

                    const fethcingCandles =
                        domainRight > Date.now() ? Date.now() : domainRight;
                    const nowDate = Date.now();

                    const snapDiff = nowDate % (period * 1000);
                    const snappedTime = nowDate + (period * 1000 - snapDiff);

                    const isShowLatestCandle =
                        domainLeft < snappedTime && snappedTime < domainRight;

                    const minDate = 1657868400; // 15 July 2022

                    let firstTime = Math.floor(fethcingCandles / 1000);

                    if (
                        firstTime > minDate &&
                        fethcingCandles > domainLeft &&
                        isChangeScaleChart &&
                        !isShowLatestCandle
                    ) {
                        scaleData.xScale.domain([domainLeft, domainRight]);

                        let nCandles = Math.floor(
                            (fethcingCandles - domainLeft) / (period * 1000),
                        );

                        if (nCandles < 139) {
                            const nDiffFirstTime = Math.floor(
                                (Date.now() - firstTime * 1000) /
                                    (period * 1000),
                            );

                            const tempFirstTime =
                                firstTime + period * nDiffFirstTime;
                            if (nDiffFirstTime < 139 && nCandles > 5) {
                                firstTime = tempFirstTime;
                                nCandles = nCandles + (nDiffFirstTime + 100);
                            } else {
                                const nowDateSeconds = Math.floor(
                                    nowDate / 1000,
                                );
                                firstTime = firstTime + period * 100;

                                if (firstTime > nowDateSeconds) {
                                    firstTime = nowDateSeconds;
                                }
                                nCandles =
                                    Math.floor(
                                        Math.abs(
                                            firstTime - domainLeft / 1000,
                                        ) / period,
                                    ) + 10;
                            }
                        }

                        setCandleScale((prev: CandleScaleIF) => {
                            return {
                                isFetchForTimeframe: !prev.isFetchForTimeframe,
                                lastCandleDate: firstTime,
                                nCandles: nCandles,
                                isShowLatestCandle: false,
                                isFetchFirst200Candle: false,
                            };
                        });
                    } else {
                        // resets the graph if the calculated domain is less than the value with min time
                        resetChart();
                    }
                }
            }
            setPrevFirstCandle(() => firstCandleTimeState);
            setPrevPeriod(() => period);
        }
    }, [
        period,
        unparsedCandleData !== undefined
            ? unparsedCandleData[0]?.time
            : undefined,
    ]);

    const resetXScale = (xScale: any) => {
        if (!period) return;
        const localInitialDisplayCandleCount =
            getInitialDisplayCandleCount(mobileView);
        const nowDate = Date.now();

        const snapDiff = nowDate % (period * 1000);
        const snappedTime = nowDate + (period * 1000 - snapDiff);

        const centerX = snappedTime;
        const diff =
            (localInitialDisplayCandleCount * period * 1000) / xAxisBuffer;

        xScale.domain([
            centerX - diff * xAxisBuffer,
            centerX + diff * (1 - xAxisBuffer),
        ]);
    };
    const resetChart = () => {
        if (scaleData && unparsedCandleData) {
            resetXScale(scaleData.xScale);

            setCandleScale((prev: CandleScaleIF) => {
                return {
                    isFetchForTimeframe: !prev.isFetchForTimeframe,
                    lastCandleDate: undefined,
                    nCandles: 200,
                    isShowLatestCandle: true,
                    isFetchFirst200Candle: false,
                };
            });
        }
    };

    useEffect(() => {
        if (
            (unparsedCandleData !== undefined &&
                unparsedCandleData.length === 0) ||
            (scaleData === undefined &&
                unparsedCandleData &&
                unparsedCandleData.length < 7)
        ) {
            setCandleScale((prev: CandleScaleIF) => {
                return {
                    isFetchForTimeframe: !prev.isFetchForTimeframe,
                    lastCandleDate: undefined,
                    nCandles: 200,
                    isShowLatestCandle: true,
                    isFetchFirst200Candle: false,
                };
            });
        }
    }, [period]);

    const isLoading = useMemo(
        () =>
            scaleData === undefined ||
            unparsedCandleData?.length === 0 ||
            poolPriceDisplay === 0 ||
            poolPriceNonDisplay === 0,
        [
            unparsedCandleData === undefined,
            unparsedCandleData?.length,
            poolPriceDisplay,
            poolPriceNonDisplay,
            scaleData === undefined,
            liquidityScale,
            liquidityDepthScale,
        ],
    );

    useEffect(() => {
        if (isCondensedModeEnabled) {
            if (
                unparsedCandleData &&
                unparsedCandleData.length > 0 &&
                period &&
                candleData.duration === period &&
                unparsedCandleData[0].period === period &&
                isFetchingEnoughData
            ) {
                const lastCandleDate = unparsedCandleData?.reduce(
                    function (prev, current) {
                        return prev.time > current.time ? prev : current;
                    },
                ).time;

                const firstCandleDate = unparsedCandleData?.reduce(
                    function (prev, current) {
                        return prev.time < current.time ? prev : current;
                    },
                ).time;

                const maxDom =
                    scaleData !== undefined
                        ? scaleData?.xScale.domain()[1]
                        : lastCandleDate * 1000;
                const candles = filterCandleWithTransaction(
                    unparsedCandleData,
                    period,
                ).filter((i) => i.isShowData && i.time * 1000 < maxDom);
                const minTime = firstCandleDate * 1000;

                const checkDomainData = candles.filter(
                    (i) => i.time * 1000 > scaleData?.xScale.domain()[0],
                );

                if (scaleData !== undefined && checkDomainData.length === 0) {
                    setIsCondensedModeEnabled(false);
                    setFetchCountForEnoughData(1);
                    return;
                }

                if (
                    candles.length < 100 &&
                    !timeOfEndCandle &&
                    fetchCountForEnoughData < maxRequestCountForCondensed
                ) {
                    setIsFetchingEnoughData(true);
                    const dom = {
                        lastCandleDate: minTime,
                        domainBoundry: minTime - 2999 * period * 1000,
                        isAbortedRequest: true,
                        isResetRequest: false,
                    };

                    setFetchCountForEnoughData(fetchCountForEnoughData + 1);
                    setCandleDomains((prev: CandleDomainIF) => {
                        if (prev && prev.domainBoundry && prev.lastCandleDate) {
                            const nCandles = Math.floor(
                                (prev.lastCandleDate - prev.domainBoundry) /
                                    (period * 1000),
                            );

                            const newNCandles = Math.floor(
                                (dom.lastCandleDate - dom.domainBoundry) /
                                    (period * 1000),
                            );
                            if (nCandles === newNCandles) {
                                dom.domainBoundry =
                                    dom.domainBoundry + period * 1000;
                            }
                        }

                        return dom;
                    });
                } else {
                    if (
                        fetchCountForEnoughData ===
                            maxRequestCountForCondensed &&
                        period !== 86400 &&
                        candles.length < 100
                    ) {
                        setIsCondensedModeEnabled(false);
                    } else {
                        if (!candleDomains.isResetRequest) {
                            setFetchCountForEnoughData(
                                maxRequestCountForCondensed,
                            );
                            setIsFetchingEnoughData(false);

                            if (candles.length < 7) {
                                setIsCondensedModeEnabled(false);
                            }
                        }
                    }
                }
            }
        } else {
            setFetchCountForEnoughData(maxRequestCountForCondensed);
            setIsFetchingEnoughData(false);
        }
    }, [
        unparsedCandleData,
        period === undefined,
        isCondensedModeEnabled,
        isDenomBase,
    ]);

    const isOpenChart =
        !isLoading &&
        candleData !== undefined &&
        isPoolInitialized !== undefined &&
        prevPeriod === period &&
        scaleData &&
        period === candleData?.duration &&
        !isFetchingCandle &&
        !isFetchingEnoughData;

    const loadingText = (
        <div
            style={{ height: '100%', width: '100%' }}
            className='animatedImg_container'
        >
            <div className='fetching_text'>
                Loading {periodToReadableTime}
                Candle Chart...
            </div>
        </div>
    );
    return (
        <>
            <div
                style={{
                    marginTop: '2px',
                    height: '100%',
                    width: '100%',
                    display: 'grid',
                    gridTemplateRows: 'auto auto',
                }}
            >
                {(!isOpenChart || isCompletedFetchData) && (
                    <>
                        <div
                            style={{
                                gridColumn: 1,
                                gridRowStart: 1,
                                gridRowEnd: 2,
                            }}
                        >
                            <Spinner
                                size={100}
                                bg='var(--dark2)'
                                centered
                                style={{
                                    alignItems: 'end',
                                }}
                            />
                        </div>
                        <div
                            style={{
                                gridColumn: 1,
                                gridRowStart: 2,
                                gridRowEnd: 2,
                            }}
                        >
                            {periodToReadableTime && loadingText}
                        </div>
                    </>
                )}
                {isOpenChart && (
                    <Chart
                        isTokenABase={isTokenABase}
                        liquidityData={liquidityData}
                        changeState={props.changeState}
                        denomInBase={isDenomBase}
                        chartItemStates={props.chartItemStates}
                        setCurrentData={setCurrentData}
                        currentData={currentData}
                        isCandleAdded={isCandleAdded}
                        setIsCandleAdded={setIsCandleAdded}
                        scaleData={scaleData}
                        prevPeriod={prevPeriod}
                        candleTimeInSeconds={period}
                        poolPriceNonDisplay={poolPriceNonDisplay}
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        rescale={props.rescale}
                        setRescale={props.setRescale}
                        latest={props.latest}
                        setLatest={props.setLatest}
                        reset={props.reset}
                        setReset={props.setReset}
                        showLatest={props.showLatest}
                        setShowLatest={props.setShowLatest}
                        setShowTooltip={setShowTooltip}
                        liquidityScale={liquidityScale}
                        liquidityDepthScale={liquidityDepthScale}
                        candleTime={chartSettings.candleTime.global}
                        unparsedData={candleData}
                        updateURL={updateURL}
                        userTransactionData={userTransactionData}
                        setPrevCandleCount={setPrevCandleCount}
                        isFetchingEnoughData={isFetchingEnoughData}
                        setIsFetchingEnoughData={setIsFetchingEnoughData}
                        isCompletedFetchData={isCompletedFetchData}
                        setIsCompletedFetchData={setIsCompletedFetchData}
                        setChartResetStatus={setChartResetStatus}
                        chartResetStatus={chartResetStatus}
                        showTooltip={showTooltip}
                    />
                )}
            </div>
        </>
    );
}

export default memo(TradeCandleStickChart);
