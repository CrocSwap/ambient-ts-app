import React, {
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import {
    TokenPriceFn,
    fetchPoolLiquidity,
} from '../../../../ambient-utils/api';
import { CrocEnv, toDisplayPrice } from '@crocswap-libs/sdk';
import { CachedDataContext } from '../../../../contexts/CachedDataContext';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import {
    LiquidityDataIF,
    LiquidityRangeIF,
} from '../../../../ambient-utils/types';
import { CACHE_UPDATE_FREQ_IN_MS } from '../../../../ambient-utils/constants';
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { diffHashSig } from '../../../../ambient-utils/dataLayer';
import { setCanvasResolution } from '../../../../pages/Chart/ChartUtils/chartUtils';
import { createAreaSeriesLiquidity } from './LiquiditySeries1';

interface TransactionDetailsLiquidityGraphIF {
    tx: any;
    isDenomBase: boolean;
    yScale: d3.ScaleLinear<number, number> | undefined;
}

export default function TransactionDetailsLiquidityGraph(
    props: TransactionDetailsLiquidityGraphIF,
) {
    const { cachedFetchTokenPrice, cachedQuerySpotPrice } =
        useContext(CachedDataContext);

    const { crocEnv, activeNetwork } = useContext(CrocEnvContext);

    const { chainId, base, quote, poolIdx, baseDecimals, quoteDecimals } =
        props.tx;

    const { isDenomBase, yScale } = props;

    const [liqSeries, setLiqSeries] = useState<any>();
    const [liquidityScale, setLiquidityScale] = useState<any>();
    const d3CanvasLiq = useRef<HTMLCanvasElement | null>(null);

    const [liquidityData] = useState<any>({
        liquidityDataAsk: [],
        liquidityDataBid: [],
    });

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

            console.log({ poolPriceDisplay });

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
                    liqCurve.ranges.forEach((element) => {
                        const liqUpperPrices = isDenomBase
                            ? element.upperBoundInvPriceDecimalCorrected
                            : element.lowerBoundPriceDecimalCorrected;

                        const liqLowerPrices = isDenomBase
                            ? element.lowerBoundInvPriceDecimalCorrected
                            : element.upperBoundPriceDecimalCorrected;

                        // if (liqLowerPrices <= poolPriceDisplay) {
                        //     liquidityData.liquidityDataAsk.push(element);
                        // }

                        // if (liqUpperPrices >= poolPriceDisplay) {
                        liquidityData.liquidityDataBid.push(element);
                        // }
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
                    .filter((item: any) => item.activeLiq > 0)
                    .map((o: any) => {
                        return o.activeLiq !== undefined
                            ? o.activeLiq
                            : Infinity;
                    }),
            );
            const domainRight = Math.max(
                ...unparsedLiquidityData.map((o: any) => {
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
                .accessors([(d: any) => parseFloat(d.activeLiq)]);

            liquidityScale.domain(
                liquidityExtent(
                    liquidityData.liquidityDataBid.concat(
                        liquidityData.liquidityDataAsk,
                    ),
                ),
            );

            setLiquidityScale(() => liquidityScale);

            const d3CanvasLiqChart = createAreaSeriesLiquidity(
                liquidityScaleTemp,
                liquidityScale,
                yScale,
                'ask',
                isDenomBase,
                d3.curveBasis,
                'curve',
            );
            setLiqSeries(() => d3CanvasLiqChart);
        }
    }, [yScale, diffHashSig(liquidityData)]);

    const render = useCallback(() => {
        const nd = d3.select(d3CanvasLiq.current).node() as any;
        nd?.requestRedraw();
    }, []);

    useEffect(() => {
        const canvas = d3
            .select(d3CanvasLiq.current)
            .select('canvas')
            .node() as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');
        console.log({ liqSeries, liquidityScale });

        if (liqSeries && liquidityScale) {
            d3.select(d3CanvasLiq.current)
                .on('draw', () => {
                    console.log({ liquidityData });

                    setCanvasResolution(canvas);

                    liqSeries(
                        liquidityData.liquidityDataAsk.concat(
                            liquidityData.liquidityDataBid,
                        ),
                    ).sort(
                        (a: LiquidityRangeIF, b: LiquidityRangeIF) =>
                            b.upperBoundInvPriceDecimalCorrected -
                            a.upperBoundInvPriceDecimalCorrected,
                    );
                    // liqSeries(liquidityData.liquidityDataBid);
                })
                .on('measure', (event: CustomEvent) => {
                    liquidityScale.range([
                        event.detail.width,
                        (event.detail.width / 10) * 6,
                    ]);

                    liqSeries?.context(ctx);
                });
        }

        render();
    }, [diffHashSig(liquidityData), liqSeries, liquidityScale, yScale]);

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
