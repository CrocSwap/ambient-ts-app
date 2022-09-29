import { DetailedHTMLProps, HTMLAttributes, useEffect, useMemo, useState } from 'react';
import { CandleData, CandlesByPoolAndDuration } from '../../../utils/state/graphDataSlice';
import Chart from '../../Chart/Chart';
import './TradeCandleStickChart.css';
import logo from '../../../assets/images/logos/ambient_logo.svg';
import {
    CandleChartData,
    LiqSnap,
    LiquidityData,
    TvlChartData,
    VolumeChartData,
} from './TradeCharts';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { getPinnedPriceValuesFromDisplayPrices } from '../Range/rangeFunctions';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';

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
    tvlData: any[];
    volumeData: any[];
    feeData: any[];
    priceData: CandlesByPoolAndDuration | undefined;
    changeState: (isOpen: boolean | undefined, candleData: CandleData | undefined) => void;
    chartItemStates: chartItemStates;
    denomInBase: boolean;
    limitPrice: string | undefined;
    liquidityData: any;
    isAdvancedModeActive: boolean | undefined;
    simpleRangeWidth: number | undefined;
    pinnedMinPriceDisplayTruncated: number | undefined;
    pinnedMaxPriceDisplayTruncated: number | undefined;
    truncatedPoolPrice: number | undefined;
    spotPriceDisplay: string | undefined;
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
    chartData: CandleChartData[];
    tvlChartData: TvlChartData[];
    volumeChartData: VolumeChartData[];
}

type chartItemStates = {
    showTvl: boolean;
    showVolume: boolean;
    showFeeRate: boolean;
};

export default function TradeCandleStickChart(props: ChartData) {
    const data = {
        tvlData: props.tvlData,
        volumeData: props.volumeData,
        feeData: props.feeData,
        priceData: props.priceData,
        liquidityData: props.liquidityData,
    };

    const { denomInBase, baseTokenAddress, chainId /* poolPriceNonDisplay */ } = props;

    const [isLoading, setIsLoading] = useState<boolean>(true);
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

    // const currentPoolPriceTick =
    //     poolPriceNonDisplay === undefined ? 0 : Math.log(poolPriceNonDisplay) / Math.log(1.0001);

    // const defaultMinPriceDifferencePercentage = -15;
    // const defaultMaxPriceDifferencePercentage = 15;

    // const defaultLowTick =
    //     tradeData.advancedLowTick === 0
    //         ? currentPoolPriceTick + defaultMinPriceDifferencePercentage * 100
    //         : tradeData.advancedLowTick;

    // const defaultHighTick =
    //     tradeData.advancedHighTick === 0
    //         ? currentPoolPriceTick + defaultMaxPriceDifferencePercentage * 100
    //         : tradeData.advancedHighTick;

    // Parse price data
    useEffect(() => {
        // setIsLoading(true);
        const chartData: CandleChartData[] = [];
        const tvlChartData: TvlChartData[] = [];
        const volumeChartData: VolumeChartData[] = [];

        console.log(props.priceData);

        props.priceData?.candles.map((data) => {
            chartData.push({
                date: new Date(data.time * 1000),
                open: denomInBase
                    ? data.invPriceOpenExclMEVDecimalCorrected
                    : data.priceOpenExclMEVDecimalCorrected,
                close: denomInBase
                    ? data.invPriceCloseExclMEVDecimalCorrected
                    : data.priceCloseExclMEVDecimalCorrected,
                high: denomInBase
                    ? data.invMinPriceExclMEVDecimalCorrected
                    : data.maxPriceExclMEVDecimalCorrected,
                low: denomInBase
                    ? data.invMaxPriceExclMEVDecimalCorrected
                    : data.minPriceExclMEVDecimalCorrected,
                time: data.time,
                allSwaps: [],
            });

            tvlChartData.push({
                time: new Date(data.tvlData.time * 1000),
                value: data.tvlData.interpDistHigher,
            });

            volumeChartData.push({
                time: new Date(data.time * 1000),
                value: data.volumeUSD,
            });
        });

        const chartUtils: ChartUtils = {
            period: props.priceData?.duration,
            chartData: chartData,
            tvlChartData: tvlChartData,
            volumeChartData: volumeChartData,
        };
        setParsedChartData(() => {
            return chartUtils;
        });
    }, [activeChartPeriod, denomInBase, props.priceData]);
    // }, [activeChartPeriod, denomInBase]);

    // Parse liquidtiy data
    const liquidityData = useMemo(() => {
        const liqData: LiquidityData[] = [];
        const liqSnapData: LiqSnap[] = [];

        if (props.liquidityData) {
            props.liquidityData.ranges.map((data: any) => {
                if (data.upperBoundInvPriceDecimalCorrected > 1) {
                    liqData.push({
                        activeLiq: data.activeLiq,
                        upperBoundPriceDecimalCorrected: denomInBase
                            ? data.upperBoundInvPriceDecimalCorrected
                            : data.upperBoundInvPriceDecimalCorrected,
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
                }
            });
        }

        return { liqData: liqData, liqSnapData: liqSnapData };
    }, [props.liquidityData, denomInBase]);

    const loading = (
        <div className='animatedImg'>
            <img src={logo} width={110} alt='logo' />
        </div>
    );

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(parsedChartData === undefined || parsedChartData.chartData.length === 0);
        }, 100);
        return () => clearTimeout(timer);
    }, [parsedChartData?.chartData]);

    return (
        <>
            <div style={{ height: '100%', width: '100%' }}>
                {!isLoading ? (
                    <Chart
                        priceData={parsedChartData}
                        expandTradeTable={expandTradeTable}
                        liquidityData={liquidityData}
                        changeState={props.changeState}
                        limitPrice={props.limitPrice}
                        denomInBase={props.denomInBase}
                        isAdvancedModeActive={props.isAdvancedModeActive}
                        simpleRangeWidth={props.simpleRangeWidth}
                        pinnedMinPriceDisplayTruncated={props.pinnedMinPriceDisplayTruncated}
                        pinnedMaxPriceDisplayTruncated={props.pinnedMaxPriceDisplayTruncated}
                        spotPriceDisplay={props.spotPriceDisplay}
                        truncatedPoolPrice={props.truncatedPoolPrice}
                        feeData={data.feeData}
                        volumeData={data.volumeData}
                        tvlData={data.tvlData}
                        chartItemStates={props.chartItemStates}
                        setCurrentData={props.setCurrentData}
                        upBodyColor={props.upBodyColor}
                        upBorderColor={props.upBorderColor}
                        downBodyColor={props.downBodyColor}
                        downBorderColor={props.downBorderColor}
                    />
                ) : (
                    <>{loading}</>
                )}
            </div>
        </>
    );
}
