import { useContext, useEffect, useRef, useState, useMemo } from 'react';
import {
    CandleDataChart,
    chartItemStates,
    renderCanvasArray,
    scaleData,
    setCanvasResolution,
} from '../ChartUtils/chartUtils';
import { IS_LOCAL_ENV } from '../../../../ambient-utils/constants';
import {
    diffHashSigScaleData,
    diffHashSig,
} from '../../../../ambient-utils/dataLayer';
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { CandleDataIF } from '../../../../ambient-utils/types';
import { ChartContext, ChartThemeIF } from '../../../../contexts/ChartContext';
import { defaultCandleBandwith } from '../ChartUtils/chartConstants';

interface candlePropsIF {
    chartItemStates: chartItemStates;
    setBandwidth: React.Dispatch<number>;
    scaleData: scaleData | undefined;
    selectedDate: number | undefined;
    showLatest: boolean | undefined;
    denomInBase: boolean;
    data: CandleDataChart[];
    period: number;
    lastCandleData: CandleDataIF;
    prevlastCandleTime: number;
    setPrevLastCandleTime: React.Dispatch<React.SetStateAction<number>>;
    isDiscontinuityScaleEnabled: boolean;
    visibleDateForCandle: number;
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
        isDiscontinuityScaleEnabled,
        visibleDateForCandle,
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

                const count = data.filter(
                    (i: CandleDataChart) =>
                        i.time <= lastCandleData.time - period &&
                        i.time >= prevlastCandleTime,
                ).length;
                setPrevLastCandleTime(lastCandleData.time - period);

                scaleData?.xScale.domain([
                    domainLeft + count * period * 1000,
                    domainRight + count * period * 1000,
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
                (context: CanvasRenderingContext2D, d: CandleDataChart) => {
                    const close = denomInBase
                        ? d.invPriceCloseExclMEVDecimalCorrected
                        : d.priceCloseExclMEVDecimalCorrected;

                    const open = denomInBase
                        ? d.invPriceOpenExclMEVDecimalCorrected
                        : d.priceOpenExclMEVDecimalCorrected;

                    const crocColor =
                        close > open
                            ? chartThemeColors.upCandleBodyColor
                                ? chartThemeColors.upCandleBodyColor.toString()
                                : crocCandleLightColor
                            : chartThemeColors.downCandleBodyColor
                              ? chartThemeColors.downCandleBodyColor.toString()
                              : crocCandleDarkColor;

                    const crocBorderColor =
                        close > open
                            ? chartThemeColors.upCandleBorderColor
                                ? chartThemeColors.upCandleBorderColor.toString()
                                : crocCandleBorderLightColor
                            : chartThemeColors.downCandleBorderColor
                              ? chartThemeColors.downCandleBorderColor.toString()
                              : crocCandleBorderDarkColor;

                    context.fillStyle =
                        selectedDate !== undefined &&
                        selectedDate === d.time * 1000
                            ? chartThemeColors.selectedDateFillColor
                                ? chartThemeColors.selectedDateFillColor.toString()
                                : selectedCandleColor
                            : crocColor;

                    context.strokeStyle =
                        selectedDate !== undefined &&
                        selectedDate === d.time * 1000
                            ? chartThemeColors.selectedDateFillColor
                                ? chartThemeColors.selectedDateFillColor.toString()
                                : selectedCandleColor
                            : crocBorderColor;

                    if (d.time * 1000 > visibleDateForCandle) {
                        context.fillStyle = 'transparent';
                        context.strokeStyle = 'transparent';
                    }
                },
            );
        }
    }, [
        candlestick,
        selectedDate,
        isDiscontinuityScaleEnabled,
        visibleDateForCandle,
        chartThemeColors,
    ]);

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
