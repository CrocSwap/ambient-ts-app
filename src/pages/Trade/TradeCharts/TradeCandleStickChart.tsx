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
    expandTradeTable: boolean;
    // tvlData: any[];
    // volumeData: any[];
    // feeData: any[];
    candleData: CandlesByPoolAndDuration | undefined;
    changeState: (isOpen: boolean | undefined, candleData: CandleData | undefined) => void;
    chartItemStates: chartItemStates;
    limitPrice: string | undefined;
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
    const { baseTokenAddress, chainId /* poolPriceNonDisplay */ } = props;

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
        const liqSnapData: LiqSnap[] = [];

        if (props.liquidityData) {
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

            console.log({ domainLeft, domainRight });

            const liquidityScale = d3.scaleLog().domain([domainLeft, domainRight]).range([0, 1000]);

            props.liquidityData.ranges.map((data: any) => {
                liqData.push({
                    activeLiq: liquidityScale(data.activeLiq),
                    upperBoundPriceDecimalCorrected: denominationsInBase
                        ? data.upperBoundInvPriceDecimalCorrected
                        : data.upperBoundPriceDecimalCorrected,
                });

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

        return { liqData: liqData, liqSnapData: liqSnapData };
    }, [props.liquidityData, denominationsInBase]);

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
                        candleData={parsedChartData}
                        expandTradeTable={expandTradeTable}
                        liquidityData={liquidityData}
                        changeState={props.changeState}
                        limitPrice={props.limitPrice}
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
