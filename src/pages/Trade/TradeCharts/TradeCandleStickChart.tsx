import { DetailedHTMLProps, HTMLAttributes, useEffect, useMemo, useState } from 'react';
import { CandleData, CandlesByPoolAndDuration } from '../../../utils/state/graphDataSlice';
import Chart from '../../Chart/Chart';
import './TradeCandleStickChart.css';

import candleStikPlaceholder from '../../../assets/images/charts/candlestick2.png';
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
    isCandleSelected: boolean | undefined;
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
    const { pool, chainData, baseTokenAddress, chainId /* poolPriceNonDisplay */ } = props;

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

    // Parse liquidtiy data
    const liquidityData = useMemo(() => {
        const liqData: LiquidityData[] = [];

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

            const liquidityScale = d3.scaleLog().domain([domainLeft, domainRight]).range([0, 1000]);

            const barThreshold = props.poolPriceDisplay !== undefined ? props.poolPriceDisplay : 0;

            props.liquidityData.ranges.map((data: any) => {
                const liqPrices = denominationsInBase
                    ? data.upperBoundInvPriceDecimalCorrected
                    : data.upperBoundPriceDecimalCorrected;

                if (liqPrices !== Infinity && liqPrices !== '+inf') {
                    liqData.push({
                        activeLiq: liquidityScale(data.activeLiq),
                        liqPrices: liqPrices,
                        deltaAverageUSD: data.deltaAverageUSD,
                        cumAverageUSD: data.cumAverageUSD,
                    });

                    if (liqPrices > barThreshold) {
                        liqBidData.push({
                            activeLiq: liquidityScale(data.activeLiq),
                            liqPrices: liqPrices,
                            deltaAverageUSD: data.deltaAverageUSD,
                            cumAverageUSD: data.cumAverageUSD,
                        });
                    } else {
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
        }

        // console.log({ liqAskData, liqBidData });

        return {
            liqData: liqData,
            liqAskData: liqAskData,
            liqBidData: liqBidData,
            liqSnapData: liqSnapData,
            liqHighligtedAskSeries: [],
            liqHighligtedBidSeries: [],
            totalLiq: props.liquidityData?.totals?.totalLiq,
        };
    }, [props.liquidityData, denominationsInBase, props.poolPriceDisplay]);

    // Scale
    useEffect(() => {
        if (!isLoading && parsedChartData !== undefined && liquidityData !== undefined) {
            let candleNumber = parsedChartData.chartData;

            if (parsedChartData.chartData.length > 100) {
                candleNumber = parsedChartData.chartData.slice(
                    parsedChartData.chartData.length - 99,
                    parsedChartData.chartData.length,
                );
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

            xScale.domain(xExtent(candleNumber));
            subChartxScale.domain(subChartxExtent(candleNumber));
            yScale.domain(priceRange(candleNumber));

            const xScaleCopy = xScale.copy();
            const yScaleCopy = yScale.copy();

            const yScaleIndicator = yScale.copy();
            const xScaleIndicator = xScale.copy();

            const liquidityScale = d3.scaleLinear();
            const ghostScale = d3.scaleLinear();

            // bar chart
            const liquidityExtent = d3fc
                .extentLinear(liquidityData.liqData)
                .include([0])
                .accessors([(d: any) => parseFloat(d.activeLiq)]);

            const ghostExtent = d3fc
                .extentLinear(liquidityData.liqSnapData)
                .include([0])
                .accessors([(d: any) => parseFloat(d.activeLiq)]);

            liquidityScale.domain(liquidityExtent(liquidityData.liqData));
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
                };
            });
        }
    }, [parsedChartData?.period, denominationsInBase, liquidityData, isLoading]);

    // cursor change----------------------------------------------
    function loadingCursor(event: any) {
        const el = document?.getElementById('hov_text');
        if (el != null) {
            el.style.top = event.clientY + 'px';
            el.style.left = event.clientX + 'px';
        }
    }

    const loadingChartElement = document?.getElementById('loading_chart_hover');
    if (loadingChartElement != null) {
        loadingChartElement?.addEventListener('mousemove', loadingCursor);
    }
    // end of cursor change----------------------------------------------

    const loading = (
        <div className='animatedImg_container' id='loading_chart_hover'>
            <img src={candleStikPlaceholder} className='img_shimmer' />
            <div id='hov_text'>Fetching chart data...</div>
        </div>
    );

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(
                parsedChartData === undefined ||
                    parsedChartData.chartData.length === 0 ||
                    props.poolPriceDisplay === 0,
            );
        }, 500);
        return () => clearTimeout(timer);
    }, [parsedChartData?.chartData, props.poolPriceDisplay]);

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
                        isCandleSelected={props.isCandleSelected}
                        isCandleAdded={isCandleAdded}
                        scaleData={scaleData}
                    />
                ) : (
                    <>{loading}</>
                    // <TradeChartsLoading/>

                    // <Animation animData={candleStickLoading} />
                )}
            </div>
        </>
    );
}
