import { useContext, useEffect, useRef, useState, useMemo } from 'react';
import {
    chartItemStates,
    renderCanvasArray,
    scaleData,
    setCanvasResolution,
} from '../ChartUtils/chartUtils';
import { IS_LOCAL_ENV } from '../../../ambient-utils/constants';
import {
    diffHashSig,
    diffHashSigScaleData,
} from '../../../ambient-utils/dataLayer';
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { CandleDataIF } from '../../../ambient-utils/types';
import { ChartContext, ChartThemeIF } from '../../../contexts/ChartContext';
import { defaultCandleBandwith } from '../ChartUtils/chartConstants';

interface candlePropsIF {
    chartItemStates: chartItemStates;
    setBandwidth: React.Dispatch<number>;
    scaleData: scaleData | undefined;
    selectedDate: number | undefined;
    showLatest: boolean | undefined;
    denomInBase: boolean;
    data: CandleDataIF[];
    period: number;
    lastCandleData: CandleDataIF;
    prevlastCandleTime: number;
    setPrevLastCandleTime: React.Dispatch<React.SetStateAction<number>>;
    chartThemeColors: ChartThemeIF | undefined;
}

export default function CandleChart(props: candlePropsIF) {
    const {
        setBandwidth,
        scaleData,
        selectedDate,
        showLatest,
        denomInBase,
        data,
        period,
        lastCandleData,
        prevlastCandleTime,
        setPrevLastCandleTime,
        chartThemeColors,
    } = props;
    const d3CanvasCandle = useRef<HTMLCanvasElement | null>(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [candlestick, setCandlestick] = useState<any>();
    const selectedCandleColor = '#E480FF';
    const crocCandleLightColor = '#CDC1FF';
    const crocCandleBorderLightColor = '#CDC1FF';
    const crocCandleDarkColor = '#24243e';
    const crocCandleBorderDarkColor = '#7371FC';

    const uniswapCandleLightColor = '#4a5a76';
    const uniswapCandleBorderLightColor = '#4a5a76';
    const uniswapCandleDarkColor = '#252f40';
    const uniswapCandleBorderDarkColor = '#5e6b81';

    const bandwidth = useMemo(() => {
        if (candlestick) {
            const bandwidthFunction = candlestick?.bandwidth();

            return parseInt(bandwidthFunction());
        }
        return defaultCandleBandwith;
    }, [candlestick?.bandwidth()]);
    const { tradeTableState } = useContext(ChartContext);

    useEffect(() => {
        IS_LOCAL_ENV && console.debug('re-rending chart');
        if (tradeTableState === 'Expanded') return;
        if (data && data.length > 0 && scaleData) {
            if (!showLatest) {
                const domainLeft = scaleData?.xScale.domain()[0];
                const domainRight = scaleData?.xScale.domain()[1];

                const diff =
                    (lastCandleData.time - prevlastCandleTime) / period;

                setPrevLastCandleTime(lastCandleData.time);

                scaleData?.xScale.domain([
                    domainLeft + diff * period * 1000,
                    domainRight + diff * period * 1000,
                ]);
            }
        }
    }, [tradeTableState, lastCandleData?.time]);

    useEffect(() => {
        renderCanvasArray([d3CanvasCandle]);
    }, [diffHashSigScaleData(scaleData), diffHashSig(chartThemeColors)]);

    useEffect(() => {
        if (scaleData !== undefined) {
            const canvasCandlestick = d3fc
                .autoBandwidth(d3fc.seriesCanvasCandlestick())
                .xScale(scaleData?.xScale)
                .yScale(scaleData?.yScale)
                .crossValue((d: CandleDataIF) => d.time * 1000)
                .highValue((d: CandleDataIF) =>
                    denomInBase
                        ? d.invMinPriceExclMEVDecimalCorrected
                        : d.maxPriceExclMEVDecimalCorrected,
                )
                .lowValue((d: CandleDataIF) =>
                    denomInBase
                        ? d.invMaxPriceExclMEVDecimalCorrected
                        : d.minPriceExclMEVDecimalCorrected,
                )
                .openValue((d: CandleDataIF) =>
                    denomInBase
                        ? d.invPriceOpenExclMEVDecimalCorrected
                        : d.priceOpenExclMEVDecimalCorrected,
                )
                .closeValue((d: CandleDataIF) =>
                    denomInBase
                        ? d.invPriceCloseExclMEVDecimalCorrected
                        : d.priceCloseExclMEVDecimalCorrected,
                );

            setCandlestick(() => canvasCandlestick);
        }
    }, [scaleData, denomInBase]);

    useEffect(() => {
        if (candlestick && chartThemeColors) {
            candlestick.decorate(
                (context: CanvasRenderingContext2D, d: CandleDataIF) => {
                    const nowDate = new Date();

                    const close = denomInBase
                        ? d.invPriceCloseExclMEVDecimalCorrected
                        : d.priceCloseExclMEVDecimalCorrected;

                    const open = denomInBase
                        ? d.invPriceOpenExclMEVDecimalCorrected
                        : d.priceOpenExclMEVDecimalCorrected;

                    const crocColor =
                        close > open
                            ? chartThemeColors.lightFillColor
                                ? chartThemeColors.lightFillColor.toString()
                                : crocCandleLightColor
                            : chartThemeColors.darkFillColor
                            ? chartThemeColors.darkFillColor.toString()
                            : crocCandleDarkColor;

                    const uniswapColor =
                        close > open
                            ? uniswapCandleLightColor
                            : uniswapCandleDarkColor;

                    const crocBorderColor =
                        close > open
                            ? chartThemeColors.lightStrokeColor
                                ? chartThemeColors.lightStrokeColor.toString()
                                : crocCandleBorderLightColor
                            : chartThemeColors.darkStrokeColor
                            ? chartThemeColors.darkStrokeColor.toString()
                            : crocCandleBorderDarkColor;

                    const uniswapBorderColor =
                        close > open
                            ? uniswapCandleBorderLightColor
                            : uniswapCandleBorderDarkColor;

                    context.fillStyle =
                        selectedDate !== undefined &&
                        selectedDate === d.time * 1000
                            ? chartThemeColors.selectedDateFillColor
                                ? chartThemeColors.selectedDateFillColor.toString()
                                : selectedCandleColor
                            : d.tvlData.tvl === 0 &&
                              d.time * 1000 < nowDate.getTime()
                            ? uniswapColor
                            : crocColor;

                    context.strokeStyle =
                        selectedDate !== undefined &&
                        selectedDate === d.time * 1000
                            ? chartThemeColors.selectedDateFillColor
                                ? chartThemeColors.selectedDateFillColor.toString()
                                : selectedCandleColor
                            : d.tvlData.tvl === 0 &&
                              d.time * 1000 < nowDate.getTime()
                            ? uniswapBorderColor
                            : crocBorderColor;
                },
            );
        }
    }, [candlestick, selectedDate, chartThemeColors]);

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
                    if (data !== undefined) {
                        candlestick(data);
                    }
                })
                .on('measure', (event: CustomEvent) => {
                    scaleData?.xScale.range([0, event.detail.width]);
                    scaleData?.yScale.range([event.detail.height, 0]);
                    candlestick.context(ctx);
                });
        }
    }, [data, candlestick]);

    useEffect(() => {
        setBandwidth(bandwidth);
    }, [bandwidth]);

    return (
        <d3fc-canvas
            ref={d3CanvasCandle}
            className='candle-canvas'
        ></d3fc-canvas>
    );
}
