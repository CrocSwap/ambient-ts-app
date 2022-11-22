import { DetailedHTMLProps, HTMLAttributes, useEffect, useMemo, useState } from 'react';
import { CandleData, CandlesByPoolAndDuration } from '../../../utils/state/graphDataSlice';
import Chart from '../../Chart/Chart';
import './TradeCandleStickChart.css';

// import candleStikPlaceholder from '../../../assets/images/charts/candlestick.png';
import {
    CandleChartData,
    FeeChartData,
    LiqSnap,
    LiquidityData,
    TvlChartData,
    VolumeChartData,
} from './TradeCharts';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { getPinnedPriceValuesFromDisplayPrices } from '../Range/rangeFunctions';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { ChainSpec, CrocPoolView } from '@crocswap-libs/sdk';
import ChartSkeleton from './ChartSkeleton/ChartSkeleton';

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

interface ChartData {
    pool: CrocPoolView | undefined;
    chainData: ChainSpec;
    expandTradeTable: boolean;
    // tvlData: any[];
    // volumeData: any[];
    // feeData: any[];
    candleData: CandlesByPoolAndDuration | undefined;
    changeState: (isOpen: boolean | undefined, candleData: CandleData | undefined) => void;
    chartItemStates: chartItemStates;
    limitTick: number;
    liquidityData: any;
    isAdvancedModeActive: boolean | undefined;
    simpleRangeWidth: number | undefined;
    pinnedMinPriceDisplayTruncated: number | undefined;
    pinnedMaxPriceDisplayTruncated: number | undefined;
    truncatedPoolPrice: number | undefined;
    poolPriceDisplay: number | undefined;
    setCurrentData: React.Dispatch<React.SetStateAction<CandleChartData | undefined>>;
    upBodyColor: string;
    upBorderColor: string;
    downBodyColor: string;
    downBorderColor: string;
    baseTokenAddress: string;
    chainId: string;
    poolPriceNonDisplay: number | undefined;
}

export interface ChartUtils {
    period: any;
    bandwidth: any;
    chartData: CandleChartData[];
    tvlChartData: TvlChartData[];
    feeChartData: FeeChartData[];
    volumeChartData: VolumeChartData[];
}

type chartItemStates = {
    showTvl: boolean;
    showVolume: boolean;
    showFeeRate: boolean;
};

export default function TradeCandleStickChart(props: ChartData) {
    const { pool, chainData, baseTokenAddress, chainId, poolPriceNonDisplay } = props;

    const [scaleData, setScaleData] = useState<any>();

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isCandleAdded, setIsCandleAdded] = useState<boolean>(false);
    const [parsedChartData, setParsedChartData] = useState<ChartUtils | undefined>(undefined);
    const expandTradeTable = props?.expandTradeTable;

    const tradeData = useAppSelector((state) => state.tradeData);
    const activeChartPeriod = tradeData.activeChartPeriod;

    const tokenPair = {
        dataTokenA: tradeData.tokenA,
        dataTokenB: tradeData.tokenB,
    };

    const denominationsInBase = tradeData.isDenomBase;
    const isTokenABase = tokenPair?.dataTokenA.address === baseTokenAddress;

    const tokenA = tokenPair.dataTokenA;
    const tokenB = tokenPair.dataTokenB;
    const tokenADecimals = tokenA.decimals;
    const tokenBDecimals = tokenB.decimals;
    const baseTokenDecimals = isTokenABase ? tokenADecimals : tokenBDecimals;
    const quoteTokenDecimals = !isTokenABase ? tokenADecimals : tokenBDecimals;

    useEffect(() => {
        setIsLoading(true);

        parseData();
    }, [activeChartPeriod, denominationsInBase]);

    useEffect(() => {
        parseData();
        setIsCandleAdded(true);
    }, [props.candleData]);

    // Parse price data
    const parseData = () => {
        const chartData: CandleChartData[] = [];
        const tvlChartData: TvlChartData[] = [];
        const volumeChartData: VolumeChartData[] = [];
        const feeChartData: FeeChartData[] = [];

        props.candleData?.candles.map((data) => {
            chartData.push({
                date: new Date(data.time * 1000),
                open: denominationsInBase
                    ? data.invPriceOpenExclMEVDecimalCorrected
                    : data.priceOpenExclMEVDecimalCorrected,
                close: denominationsInBase
                    ? data.invPriceCloseExclMEVDecimalCorrected
                    : data.priceCloseExclMEVDecimalCorrected,
                high: denominationsInBase
                    ? data.invMinPriceExclMEVDecimalCorrected
                    : data.maxPriceExclMEVDecimalCorrected,
                low: denominationsInBase
                    ? data.invMaxPriceExclMEVDecimalCorrected
                    : data.minPriceExclMEVDecimalCorrected,
                time: data.time,
                allSwaps: [],
            });

            tvlChartData.push({
                time: new Date(data.tvlData.time * 1000),
                value: data.tvlData.tvl,
            });

            volumeChartData.push({
                time: new Date(data.time * 1000),
                value: data.volumeUSD,
            });

            feeChartData.push({
                time: new Date(data.time * 1000),
                value: data.averageLiquidityFee,
            });
        });

        chartData.sort((a: any, b: any) => b.time - a.time);
        tvlChartData.sort((a: any, b: any) => b.time - a.time);
        volumeChartData.sort((a: any, b: any) => b.time - a.time);
        feeChartData.sort((a: any, b: any) => b.time - a.time);

        const chartUtils: ChartUtils = {
            period: props.candleData?.duration,
            bandwidth: 0,
            chartData: chartData,
            tvlChartData: tvlChartData,
            volumeChartData: volumeChartData,
            feeChartData: feeChartData,
        };

        setParsedChartData(() => {
            return chartUtils;
        });
    };

    const standardDeviation = (arr: any, usePopulation = false) => {
        const mean = arr.reduce((acc: any, val: any) => acc + val, 0) / arr.length;
        return Math.sqrt(
            arr
                .reduce((acc: any, val: any) => acc.concat((val - mean) ** 2), [])
                .reduce((acc: any, val: any) => acc + val, 0) /
                (arr.length - (usePopulation ? 0 : 1)),
        );
    };

    // Parse liquidtiy data
    const liquidityData = useMemo(() => {
        const liqAskData: LiquidityData[] = [];
        const liqBidData: LiquidityData[] = [];

        const liqSnapData: LiqSnap[] = [];

        if (
            props.liquidityData &&
            props.poolPriceDisplay !== undefined &&
            props.poolPriceDisplay > 0
        ) {
            const domainLeft = Math.min(
                ...props.liquidityData.ranges.map((o: any) => {
                    return o.activeLiq !== undefined ? parseFloat(o.activeLiq) : 0;
                }),
            );

            const domainRight = Math.max(
                ...props.liquidityData.ranges.map((o: any) => {
                    return o.activeLiq !== undefined ? parseFloat(o.activeLiq) : 0;
                }),
            );

            const liquidityScale = d3
                .scaleLog()
                .domain([domainLeft, domainRight])
                .range([30, 1000]);

            const barThreshold = props.poolPriceDisplay !== undefined ? props.poolPriceDisplay : 0;

            props.liquidityData.ranges.map((data: any) => {
                const liqPrices = denominationsInBase
                    ? data.upperBoundInvPriceDecimalCorrected
                    : data.upperBoundPriceDecimalCorrected;

                if (liqPrices > barThreshold) {
                    if (barThreshold * 10 > liqPrices) {
                        liqBidData.push({
                            activeLiq: liquidityScale(data.activeLiq),
                            liqPrices: liqPrices,
                            deltaAverageUSD: data.deltaAverageUSD,
                            cumAverageUSD: data.cumAverageUSD,
                        });
                    }
                } else {
                    if (liqPrices < barThreshold * 10 && liqPrices > barThreshold / 10) {
                        liqAskData.push({
                            activeLiq: liquidityScale(data.activeLiq),
                            liqPrices: liqPrices,
                            deltaAverageUSD: data.deltaAverageUSD,
                            cumAverageUSD: data.cumAverageUSD,
                        });
                    }
                }

                const pinnedDisplayPrices = getPinnedPriceValuesFromDisplayPrices(
                    denominationsInBase,
                    baseTokenDecimals,
                    quoteTokenDecimals,
                    data.upperBoundInvPriceDecimalCorrected,
                    data.lowerBoundInvPriceDecimalCorrected,
                    lookupChain(chainId).gridSize,
                );

                if (!isNaN(parseFloat(pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated))) {
                    liqSnapData.push({
                        activeLiq: data.activeLiq,
                        pinnedMaxPriceDisplayTruncated: parseFloat(
                            pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated,
                        ),
                        pinnedMinPriceDisplayTruncated: parseFloat(
                            pinnedDisplayPrices.pinnedMinPriceDisplayTruncated,
                        ),
                    });
                }
            });
            if (liqBidData.length > 2 && liqAskData.length > 2) {
                liqBidData.sort((a: any, b: any) => b.liqPrices - a.liqPrices);

                liqAskData.sort((a: any, b: any) => b.liqPrices - a.liqPrices);

                const liqAllAskPrices = liqAskData.map(({ liqPrices }) => liqPrices);
                const liqAllBidPrices = liqBidData.map(({ liqPrices }) => liqPrices);

                const liqAskDeviation = standardDeviation(liqAllAskPrices);
                const liqBidDeviation = standardDeviation(liqAllBidPrices);

                liqBidData.push({
                    activeLiq: liqBidData[liqBidData.length - 1].activeLiq,
                    liqPrices: barThreshold,
                    deltaAverageUSD: 0,
                    cumAverageUSD: 0,
                });

                if (liqBidData[0].liqPrices < barThreshold * 10) {
                    while (liqBidData[0].liqPrices + liqBidDeviation < barThreshold * 10) {
                        liqBidData.unshift({
                            activeLiq: 30,
                            liqPrices: liqBidData[0].liqPrices + liqBidDeviation,
                            deltaAverageUSD: 0,
                            cumAverageUSD: 0,
                        });
                    }
                }

                liqBidData.unshift({
                    activeLiq: 30,
                    liqPrices: barThreshold * 10,
                    deltaAverageUSD: 0,
                    cumAverageUSD: 0,
                });

                liqAskData.unshift({
                    activeLiq: liqAskData[0].activeLiq,
                    liqPrices: barThreshold,
                    deltaAverageUSD: 0,
                    cumAverageUSD: 0,
                });

                while (liqAskData[liqAskData.length - 1].liqPrices - liqAskDeviation > 0) {
                    liqAskData.push({
                        activeLiq: liqAskData[liqAskData.length - 1].activeLiq,
                        liqPrices:
                            liqAskData[liqAskData.length - 1].liqPrices - liqAskDeviation / 2,
                        deltaAverageUSD: 0,
                        cumAverageUSD: 0,
                    });
                }

                liqAskData.push({
                    activeLiq: liqAskData[liqAskData.length - 1].activeLiq,
                    liqPrices: 0,
                    deltaAverageUSD: 0,
                    cumAverageUSD: 0,
                });
            }
        }

        return {
            liqAskData: liqAskData,
            liqBidData: liqBidData,
            liqSnapData: liqSnapData,
            liqHighligtedAskSeries: [],
            liqHighligtedBidSeries: [],
            lineBidSeries: [],
            lineAskSeries: [],
            totalLiq: props.liquidityData?.totals?.totalLiq,
        };
    }, [props.liquidityData, denominationsInBase, props.poolPriceDisplay]);

    // Scale
    useEffect(() => {
        if (!isLoading && parsedChartData !== undefined && liquidityData !== undefined) {
            if (parsedChartData.chartData.length > 100) {
                parsedChartData.chartData = parsedChartData.chartData.slice(0, 100);
            }

            const priceRange = d3fc
                .extentLinear()
                .accessors([(d: any) => d.high, (d: any) => d.low])
                .pad([0.05, 0.05]);

            const xExtent = d3fc
                .extentDate()
                .accessors([(d: any) => d.date])
                .padUnit('domain')
                // ensure that the scale is padded by one day in either direction
                .pad([parsedChartData.period * 1000, (parsedChartData.period / 2) * 80000]);

            const subChartxExtent = d3fc
                .extentDate()
                .accessors([(d: any) => d.date])
                .padUnit('domain')
                // ensure that the scale is padded by one day in either direction
                .pad([parsedChartData.period * 3000, (parsedChartData.period / 2) * 100000]);

            const xScale = d3.scaleTime();
            const subChartxScale = d3.scaleTime();
            const yScale = d3.scaleLinear();

            xScale.domain(xExtent(parsedChartData.chartData));
            subChartxScale.domain(subChartxExtent(parsedChartData.chartData));
            yScale.domain(priceRange(parsedChartData.chartData));

            const xScaleCopy = xScale.copy();
            const yScaleCopy = yScale.copy();

            const yScaleIndicator = yScale.copy();
            const xScaleIndicator = xScale.copy();

            const liquidityScale = d3.scaleLinear();
            const ghostScale = d3.scaleLinear();

            const yExtent = d3fc
                .extentLinear()
                .include([0])
                .accessors([(d: any) => d.value]);
            const volumeScale = d3.scaleLinear();
            volumeScale.domain(yExtent(parsedChartData.volumeChartData));

            // bar chart
            const liquidityExtent = d3fc
                .extentLinear(liquidityData.liqBidData.concat(liquidityData.liqAskData))
                .include([0])
                .accessors([(d: any) => parseFloat(d.activeLiq)]);

            const ghostExtent = d3fc
                .extentLinear(liquidityData.liqSnapData)
                .include([0])
                .accessors([(d: any) => parseFloat(d.activeLiq)]);

            liquidityScale.domain(
                liquidityExtent(liquidityData.liqBidData.concat(liquidityData.liqAskData)),
            );
            ghostScale.domain(ghostExtent(liquidityData.liqSnapData));

            setScaleData(() => {
                return {
                    xScale: xScale,
                    yScale: yScale,
                    yScaleIndicator: yScaleIndicator,
                    xScaleIndicator: xScaleIndicator,
                    liquidityScale: liquidityScale,
                    xScaleCopy: xScaleCopy,
                    yScaleCopy: yScaleCopy,
                    ghostScale: ghostScale,
                    subChartxScale: subChartxScale,
                    volumeScale: volumeScale,
                    lastY: 0,
                };
            });
        }
    }, [parsedChartData?.period, denominationsInBase, liquidityData, isLoading]);

    const loading = (
        <div style={{ height: '100%', width: '100%' }} className='animatedImg_container'>
            {/* <img src={candleStikPlaceholder} className='img_shimmer' /> */}
            {/* <PulseLoading/> */}
            <ChartSkeleton />
            <div className='fetching_text'>Fetching chart data...</div>
        </div>
    );

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(
                parsedChartData === undefined ||
                    parsedChartData.chartData.length === 0 ||
                    props.poolPriceDisplay === 0 ||
                    poolPriceNonDisplay === 0,
            );
        }, 500);
        return () => clearTimeout(timer);
    }, [parsedChartData?.chartData, props.poolPriceDisplay, poolPriceNonDisplay]);

    return (
        <>
            <div style={{ height: '100%', width: '100%' }}>
                {!isLoading && parsedChartData !== undefined ? (
                    <Chart
                        pool={pool}
                        chainData={chainData}
                        isTokenABase={isTokenABase}
                        candleData={parsedChartData}
                        expandTradeTable={expandTradeTable}
                        liquidityData={liquidityData}
                        changeState={props.changeState}
                        limitTick={props.limitTick}
                        denomInBase={denominationsInBase}
                        isAdvancedModeActive={props.isAdvancedModeActive}
                        simpleRangeWidth={props.simpleRangeWidth}
                        pinnedMinPriceDisplayTruncated={props.pinnedMinPriceDisplayTruncated}
                        pinnedMaxPriceDisplayTruncated={props.pinnedMaxPriceDisplayTruncated}
                        poolPriceDisplay={props.poolPriceDisplay}
                        truncatedPoolPrice={props.truncatedPoolPrice}
                        chartItemStates={props.chartItemStates}
                        setCurrentData={props.setCurrentData}
                        upBodyColor={props.upBodyColor}
                        upBorderColor={props.upBorderColor}
                        downBodyColor={props.downBodyColor}
                        downBorderColor={props.downBorderColor}
                        isCandleAdded={isCandleAdded}
                        scaleData={scaleData}
                        chainId={chainId}
                        poolPriceNonDisplay={poolPriceNonDisplay}
                    />
                ) : (
                    <>{loading}</>
                )}
            </div>
        </>
    );
}
