import { useContext, useEffect, useRef, useState, useMemo } from 'react';
import {
    chartItemStates,
    defaultCandleBandwith,
    renderCanvasArray,
    scaleData,
    setCanvasResolution,
} from '../ChartUtils/chartUtils';
import { IS_LOCAL_ENV } from '../../../constants';
import {
    diffHashSig,
    diffHashSigScaleData,
} from '../../../utils/functions/diffHashSig';
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { TradeTableContext } from '../../../contexts/TradeTableContext';
import { CandleData } from '../../../App/functions/fetchCandleSeries';

interface candlePropsIF {
    chartItemStates: chartItemStates;
    setBandwidth: React.Dispatch<number>;
    scaleData: scaleData | undefined;
    selectedDate: number | undefined;
    showLatest: boolean | undefined;
    denomInBase: boolean;
    data: CandleData[];
    period: number;
    lastCandleData: CandleData;
}

export default function CandleChart(props: candlePropsIF) {
    const {
        chartItemStates,
        setBandwidth,
        scaleData,
        selectedDate,
        showLatest,
        denomInBase,
        data,
        period,
        lastCandleData,
    } = props;
    const d3CanvasCandle = useRef<HTMLCanvasElement | null>(null);
    const [firstCandle, setFirstCandle] = useState<number>();
    const { tradeTableState } = useContext(TradeTableContext);
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

    useEffect(() => {
        IS_LOCAL_ENV && console.debug('re-rending chart');
        if (tradeTableState === 'Expanded') return;

        if (data && data.length > 0 && scaleData) {
            if (!showLatest && firstCandle && data[0].time !== firstCandle) {
                setFirstCandle(() => {
                    return data[0].time;
                });

                const domainLeft = scaleData?.xScale.domain()[0];
                const domainRight = scaleData?.xScale.domain()[1];

                scaleData?.xScale.domain([
                    domainLeft + period * 1000,
                    domainRight + period * 1000,
                ]);
            } else if (firstCandle === undefined) {
                setFirstCandle(() => {
                    return data[0].time;
                });
            }
        }

        // renderCanvasArray([d3CanvasCandle]);
    }, [
        diffHashSig(chartItemStates),
        tradeTableState,
        lastCandleData,
        firstCandle,
    ]);

    useEffect(() => {
        renderCanvasArray([d3CanvasCandle]);
    }, [diffHashSigScaleData(scaleData)]);

    useEffect(() => {
        if (scaleData !== undefined) {
            const canvasCandlestick = d3fc
                .autoBandwidth(d3fc.seriesCanvasCandlestick())
                .xScale(scaleData?.xScale)
                .yScale(scaleData?.yScale)
                .crossValue((d: CandleData) => d.time * 1000)
                .highValue((d: CandleData) =>
                    denomInBase
                        ? d.invMinPriceExclMEVDecimalCorrected
                        : d.maxPriceExclMEVDecimalCorrected,
                )
                .lowValue((d: CandleData) =>
                    denomInBase
                        ? d.invMaxPriceExclMEVDecimalCorrected
                        : d.minPriceExclMEVDecimalCorrected,
                )
                .openValue((d: CandleData) =>
                    denomInBase
                        ? d.invPriceOpenExclMEVDecimalCorrected
                        : d.priceOpenExclMEVDecimalCorrected,
                )
                .closeValue((d: CandleData) =>
                    denomInBase
                        ? d.invPriceCloseExclMEVDecimalCorrected
                        : d.priceCloseExclMEVDecimalCorrected,
                );

            setCandlestick(() => canvasCandlestick);
        }
    }, [scaleData]);

    useEffect(() => {
        if (candlestick) {
            candlestick.decorate(
                (context: CanvasRenderingContext2D, d: CandleData) => {
                    const nowDate = new Date();

                    const close = denomInBase
                        ? d.invPriceCloseExclMEVDecimalCorrected
                        : d.priceCloseExclMEVDecimalCorrected;

                    const open = denomInBase
                        ? d.invPriceOpenExclMEVDecimalCorrected
                        : d.priceOpenExclMEVDecimalCorrected;

                    const crocColor =
                        close > open
                            ? crocCandleLightColor
                            : crocCandleDarkColor;

                    const uniswapColor =
                        close > open
                            ? uniswapCandleLightColor
                            : uniswapCandleDarkColor;

                    const crocBorderColor =
                        close > open
                            ? crocCandleBorderLightColor
                            : crocCandleBorderDarkColor;

                    const uniswapBorderColor =
                        close > open
                            ? uniswapCandleBorderLightColor
                            : uniswapCandleBorderDarkColor;

                    context.fillStyle =
                        selectedDate !== undefined &&
                        selectedDate === d.time * 1000
                            ? selectedCandleColor
                            : d.tvlData.tvl === 0 &&
                              d.time * 1000 < nowDate.getTime()
                            ? uniswapColor
                            : crocColor;

                    context.strokeStyle =
                        selectedDate !== undefined &&
                        selectedDate === d.time * 1000
                            ? selectedCandleColor
                            : d.tvlData.tvl === 0 &&
                              d.time * 1000 < nowDate.getTime()
                            ? uniswapBorderColor
                            : crocBorderColor;
                },
            );
        }
    }, [candlestick, selectedDate]);

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
