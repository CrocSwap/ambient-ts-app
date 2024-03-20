import React, {
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import { fetchPoolLiquidity } from '../../../../ambient-utils/api';
import { toDisplayPrice } from '@crocswap-libs/sdk';
import { CachedDataContext } from '../../../../contexts/CachedDataContext';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import {
    LiquidityRangeIF,
    TransactionIF,
} from '../../../../ambient-utils/types';
import { CACHE_UPDATE_FREQ_IN_MS } from '../../../../ambient-utils/constants';
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import {
    clipCanvas,
    setCanvasResolution,
} from '../../../../pages/Chart/ChartUtils/chartUtils';
import { createAreaSeriesLiquidity } from '../../../../pages/Chart/Liquidity/LiquiditySeries/AreaSeries';
import { createLiquidityLineSeries } from '../../../../pages/Chart/Liquidity/LiquiditySeries/LineSeries';

interface TransactionDetailsLiquidityGraphIF {
    tx: TransactionIF;
    isDenomBase: boolean;
    yScale: d3.ScaleLinear<number, number> | undefined;
    transactionType: string;
}

type liquidityChartData = {
    liquidityDataAsk: LiquidityRangeIF[];
    liquidityDataBid: LiquidityRangeIF[];
};

export default function TransactionDetailsLiquidityGraph(
    props: TransactionDetailsLiquidityGraphIF,
) {
    const { cachedFetchTokenPrice, cachedQuerySpotPrice } =
        useContext(CachedDataContext);

    const { crocEnv, activeNetwork } = useContext(CrocEnvContext);

    const {
        chainId,
        base,
        quote,
        poolIdx,
        baseDecimals,
        quoteDecimals,
        bidTickInvPriceDecimalCorrected,
        bidTickPriceDecimalCorrected,
        askTickInvPriceDecimalCorrected,
        askTickPriceDecimalCorrected,
        positionType,
    } = props.tx;

    const { isDenomBase, yScale, transactionType } = props;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [liqAskSeries, setLiqAskSeries] = useState<any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [liqBidSeries, setLiqBidSeries] = useState<any>();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [liquidityScale, setLiquidityScale] = useState<any>();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [lineAskSeries, setLineAskSeries] = useState<any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [lineBidSeries, setLineBidSeries] = useState<any>();

    const d3CanvasLiq = useRef<HTMLCanvasElement | null>(null);

    const [liquidityData, setLiquidityData] = useState<liquidityChartData>({
        liquidityDataAsk: [],
        liquidityDataBid: [],
    });

    const clipHighlightedLines = (canvas: HTMLCanvasElement) => {
        const bidPrice = !isDenomBase
            ? bidTickInvPriceDecimalCorrected
            : bidTickPriceDecimalCorrected;

        const askPrice = !isDenomBase
            ? askTickInvPriceDecimalCorrected
            : askTickPriceDecimalCorrected;

        const _low = askPrice;
        const _high = bidPrice;
        const low = _low > _high ? _high : _low;
        const high = _low > _high ? _low : _high;

        if (yScale) {
            clipCanvas(
                0,
                yScale(high),
                canvas.width,
                yScale(low) - yScale(high),
                canvas,
            );
        }
    };

    const drawCurveHighlighted = (canvas: HTMLCanvasElement) => {
        if (transactionType === 'liqchange') {
            if (positionType !== 'ambient') {
                clipHighlightedLines(canvas);
                if (liqAskSeries) {
                    liqAskSeries(liquidityData.liquidityDataAsk);
                }
                if (liqBidSeries) {
                    liqBidSeries(liquidityData.liquidityDataBid);
                }
            }

            lineAskSeries(liquidityData.liquidityDataAsk);
            lineBidSeries(liquidityData.liquidityDataBid);
        }
    };

    useEffect(() => {
        (async () => {
            if (!crocEnv) {
                return;
            }

            const poolPriceNonDisplay = cachedQuerySpotPrice(
                crocEnv,
                base,
                quote,
                chainId,
                Math.floor(Date.now() / CACHE_UPDATE_FREQ_IN_MS),
            );

            const poolPrice = toDisplayPrice(
                await poolPriceNonDisplay,
                baseDecimals,
                quoteDecimals,
            );

            const poolPriceDisplay = isDenomBase ? poolPrice : 1 / poolPrice;

            await fetchPoolLiquidity(
                chainId,
                base,
                quote,
                poolIdx,
                crocEnv,
                activeNetwork.graphCacheUrl,
                cachedFetchTokenPrice,
            ).then((liqCurve) => {
                if (liqCurve) {
                    const liqAsk: LiquidityRangeIF[] = [];
                    const liqBid: LiquidityRangeIF[] = [];
                    liqCurve.ranges.forEach((element) => {
                        const liqUpperPrices = isDenomBase
                            ? element.lowerBoundPriceDecimalCorrected
                            : element.upperBoundInvPriceDecimalCorrected;

                        const liqLowerPrices = isDenomBase
                            ? element.upperBoundPriceDecimalCorrected
                            : element.lowerBoundInvPriceDecimalCorrected;

                        if (liqLowerPrices <= poolPriceDisplay) {
                            liqAsk.push(element);
                        } else {
                            if (liqUpperPrices < poolPriceDisplay * 10)
                                liqBid.push(element);
                        }
                    });

                    liqAsk.sort(
                        (a: LiquidityRangeIF, b: LiquidityRangeIF) =>
                            b.upperBoundInvPriceDecimalCorrected -
                            a.upperBoundInvPriceDecimalCorrected,
                    );

                    liqBid.sort(
                        (a: LiquidityRangeIF, b: LiquidityRangeIF) =>
                            b.upperBoundInvPriceDecimalCorrected -
                            a.upperBoundInvPriceDecimalCorrected,
                    );

                    setLiquidityData({
                        liquidityDataAsk: liqAsk,
                        liquidityDataBid: liqBid,
                    });
                }
            });
        })();
    }, []);

    useEffect(() => {
        if (yScale) {
            const unparsedLiquidityData = liquidityData.liquidityDataAsk.concat(
                liquidityData.liquidityDataBid,
            );
            const domainLeft = Math.min(
                ...unparsedLiquidityData
                    .filter((item: LiquidityRangeIF) => item.activeLiq > 0)
                    .map((o: LiquidityRangeIF) => {
                        return o.activeLiq !== undefined
                            ? o.activeLiq
                            : Infinity;
                    }),
            );
            const domainRight = Math.max(
                ...unparsedLiquidityData.map((o: LiquidityRangeIF) => {
                    return o.activeLiq !== undefined ? o.activeLiq : 0;
                }),
            );

            const liquidityScaleTemp = d3
                .scaleLog()
                .domain([domainLeft, domainRight])
                .range([30, 1000]);

            const liquidityScale = d3.scaleLinear();

            const liquidityExtent = d3fc
                .extentLinear()
                .include([0])
                .accessors([
                    (d: LiquidityRangeIF) => liquidityScaleTemp(d.activeLiq),
                ]);

            liquidityScale.domain(liquidityExtent(unparsedLiquidityData));

            setLiquidityScale(() => liquidityScale);

            const d3CanvasLiqAskChart = createAreaSeriesLiquidity(
                liquidityScaleTemp,
                liquidityScale,
                yScale,
                'ask',
                isDenomBase,
                d3.curveBasis,
                'curve',
            );

            setLiqAskSeries(() => d3CanvasLiqAskChart);

            const d3CanvasLiqBidChart = createAreaSeriesLiquidity(
                liquidityScaleTemp,
                liquidityScale,
                yScale,
                'bid',
                isDenomBase,
                d3.curveBasis,
                'curve',
            );
            setLiqBidSeries(() => d3CanvasLiqBidChart);

            const d3CanvasLiqChartAskLine = createLiquidityLineSeries(
                liquidityScaleTemp,
                liquidityScale,
                yScale,
                'ask',
                isDenomBase,
                d3.curveBasis,
                'curve',
            );
            setLineAskSeries(() => d3CanvasLiqChartAskLine);

            const d3CanvasLiqChartBidLine = createLiquidityLineSeries(
                liquidityScaleTemp,
                liquidityScale,
                yScale,
                'bid',
                isDenomBase,
                d3.curveBasis,
                'curve',
            );
            setLineBidSeries(() => d3CanvasLiqChartBidLine);
        }
    }, [yScale, liquidityData, isDenomBase]);

    const render = useCallback(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const nd = d3.select(d3CanvasLiq.current).node() as any;
        nd?.requestRedraw();
    }, []);

    useEffect(() => {
        const canvas = d3
            .select(d3CanvasLiq.current)
            .select('canvas')
            .node() as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');
        if (liquidityScale) {
            d3.select(d3CanvasLiq.current)
                .on('draw', () => {
                    setCanvasResolution(canvas);

                    if (liqAskSeries) {
                        liqAskSeries(liquidityData.liquidityDataAsk);
                    }
                    if (liqBidSeries) {
                        liqBidSeries(liquidityData.liquidityDataBid);
                    }

                    drawCurveHighlighted(canvas);
                })
                .on('measure', (event: CustomEvent) => {
                    liquidityScale.range([
                        event.detail.width,
                        (event.detail.width / 10) * 6,
                    ]);

                    liqAskSeries?.context(ctx);
                    liqBidSeries?.context(ctx);
                    lineAskSeries?.context(ctx);
                    lineBidSeries?.context(ctx);
                });
        }

        render();
    }, [
        liquidityData,
        liqAskSeries,
        liqBidSeries,
        lineBidSeries,
        lineAskSeries,
        liquidityScale,
        yScale,
    ]);

    return (
        <d3fc-canvas
            ref={d3CanvasLiq}
            style={{
                position: 'relative',
                width: '20%',
                marginLeft: '80%',
            }}
        ></d3fc-canvas>
    );
}
