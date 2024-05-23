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
import { IS_LOCAL_ENV } from '../../../ambient-utils/constants';
import {
    diffHashSig,
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
import { xAxisBuffer } from '../../Chart/ChartUtils/chartConstants';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface propsIF {
    changeState: (
        isOpen: boolean | undefined,
        candleData: CandleDataIF | undefined,
    ) => void;
    chartItemStates: chartItemStates;
    setCurrentData: Dispatch<SetStateAction<CandleDataIF | undefined>>;
    setCurrentVolumeData: Dispatch<SetStateAction<number | undefined>>;
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
    setShowTooltip: Dispatch<SetStateAction<boolean>>;
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

    const unparsedCandleData = candleData?.candles;

    const [scaleData, setScaleData] = useState<scaleData | undefined>();
    const [liquidityScale, setLiquidityScale] = useState<
        d3.ScaleLinear<number, number> | undefined
    >(undefined);
    const [liquidityDepthScale, setLiquidityDepthScale] = useState<
        d3.ScaleLinear<number, number> | undefined
    >();
    const [prevPeriod, setPrevPeriod] = useState<any>();
    const [prevFirsCandle, setPrevFirsCandle] = useState<any>();

    const [isCandleAdded, setIsCandleAdded] = useState<boolean>(false);

    const [liqBoundary, setLiqBoundary] = useState<number | undefined>(
        undefined,
    );

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
        if (userTransactionsByPool) {
            setUserTransactionData(userTransactionsByPool.changes);
        }
    }, [userTransactionsByPool]);

    useEffect(() => {
        setSelectedDrawnShape(undefined);
    }, [period, tokenPair]);

    useEffect(() => {
        if (unparsedLiquidityData !== undefined) {
            const barThreshold =
                poolPriceDisplay !== undefined ? poolPriceDisplay : 0;

            const liqBoundaryData = unparsedLiquidityData.ranges.find(
                (liq: any) => {
                    return isDenomBase
                        ? liq.upperBoundInvPriceDecimalCorrected <
                              barThreshold &&
                              liq.lowerBoundInvPriceDecimalCorrected !== '-inf'
                        : liq.upperBoundPriceDecimalCorrected > barThreshold &&
                              liq.upperBoundPriceDecimalCorrected !== '+inf';
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
    ]);

    // temporarily commented to prevent unexpected scaling of liquidity curve after pool change

    // useEffect(() => {
    //     if (unparsedCandleData === undefined) {
    //         clearLiquidityData();
    //     }
    // }, [baseTokenAddress + quoteTokenAddress]);

    // const clearLiquidityData = () => {
    //     if (liquidityData) {
    //         liquidityData.liqAskData = [];
    //         liquidityData.liqBidData = [];
    //         liquidityData.depthLiqBidData = [];
    //         liquidityData.depthLiqAskData = [];
    //         liquidityData.topBoundary = 0;
    //         liquidityData.lowBoundary = 0;
    //         liquidityData.liqTransitionPointforCurve = 0;
    //         liquidityData.liqTransitionPointforDepth = 0;
    //     }
    // };

    // Parse liquidtiy data
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
    }, [liqBoundary, baseTokenAddress + quoteTokenAddress]);

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
    }, [liquidityData, liquidityScale]);

    const setScaleForChartLiquidity = (liquidityData: any) => {
        IS_LOCAL_ENV && console.debug('parse Liq Scale');
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
            xScale = d3.scaleLinear();
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
            const firtCandleTimeState = d3.max(
                unparsedCandleData,
                (d) => d.time,
            );
            if (
                scaleData &&
                prevPeriod &&
                prevFirsCandle &&
                firtCandleTimeState
            ) {
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
                    const factorDomain = diffDomain / (prevPeriod * 1000);

                    const domainCenter =
                        Math.max(domain[1], domain[0]) - diffDomain / 2;

                    const newDiffDomain = period * 1000 * factorDomain;

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
            setPrevFirsCandle(() => firtCandleTimeState);
            setPrevPeriod(() => period);
        }
    }, [period, diffHashSig(unparsedCandleData)]);

    const resetXScale = (xScale: d3.ScaleLinear<number, number, never>) => {
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
        if (prevPeriod === undefined) {
            setCandleScale((prev: CandleScaleIF) => {
                return {
                    isFetchForTimeframe: !prev.isFetchForTimeframe,
                    lastCandleDate: prev.lastCandleDate,
                    nCandles: prev.nCandles,
                    isShowLatestCandle: true,
                    isFetchFirst200Candle: prev.isFetchFirst200Candle,
                };
            });
        }
    }, [chartSettings.candleTime.global.defaults.length]);

    return (
        <>
            <div style={{ height: '100%', width: '100%' }}>
                {!isLoading &&
                candleData !== undefined &&
                isPoolInitialized !== undefined &&
                prevPeriod === period &&
                period === candleData?.duration &&
                !isFetchingCandle ? (
                    <Chart
                        isTokenABase={isTokenABase}
                        liquidityData={liquidityData}
                        changeState={props.changeState}
                        denomInBase={isDenomBase}
                        chartItemStates={props.chartItemStates}
                        setCurrentData={props.setCurrentData}
                        setCurrentVolumeData={props.setCurrentVolumeData}
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
                        setShowTooltip={props.setShowTooltip}
                        liquidityScale={liquidityScale}
                        liquidityDepthScale={liquidityDepthScale}
                        candleTime={chartSettings.candleTime.global}
                        unparsedData={candleData}
                        updateURL={updateURL}
                        userTransactionData={userTransactionData}
                    />
                ) : (
                    <Spinner size={100} bg='var(--dark2)' centered />
                )}
            </div>
        </>
    );
}

export default memo(TradeCandleStickChart);
