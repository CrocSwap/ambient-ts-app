import React, { useContext, useEffect, useState } from 'react';
import {
    TokenPriceFn,
    fetchPoolLiquidity,
} from '../../../../ambient-utils/api';
import { CrocEnv, toDisplayPrice } from '@crocswap-libs/sdk';
import { CachedDataContext } from '../../../../contexts/CachedDataContext';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { LiquidityDataIF } from '../../../../ambient-utils/types';
import { CACHE_UPDATE_FREQ_IN_MS } from '../../../../ambient-utils/constants';

interface TransactionDetailsLiquidityGraphIF {
    tx: any;
}

export default function TransactionDetailsLiquidityGraph(
    props: TransactionDetailsLiquidityGraphIF,
) {
    const { cachedFetchTokenPrice, cachedQuerySpotPrice } =
        useContext(CachedDataContext);

    const { crocEnv, activeNetwork } = useContext(CrocEnvContext);

    const { chainId, base, quote, poolIdx, baseDecimals, quoteDecimals } =
        props.tx;

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

            const poolPriceDisplay = 1 / poolPrice;

            const tempLiquidityData = await fetchPoolLiquidity(
                chainId,
                base,
                quote,
                poolIdx,
                crocEnv,
                activeNetwork.graphCacheUrl,
                cachedFetchTokenPrice,
            ).then((liqCurve) => {
                if (liqCurve) {
                    const isDenomBase = true;
                    liqCurve.ranges.forEach((element) => {
                        const liqUpperPrices = isDenomBase
                            ? element.upperBoundInvPriceDecimalCorrected
                            : element.lowerBoundPriceDecimalCorrected;

                        const liqLowerPrices = isDenomBase
                            ? element.lowerBoundInvPriceDecimalCorrected
                            : element.upperBoundPriceDecimalCorrected;

                        if (liqUpperPrices > poolPriceDisplay) {
                            liquidityData.liquidityDataBid.push(element);
                        } else {
                            liquidityData.liquidityDataAsk.push(element);
                        }
                    });
                }
            });
        })();
    }, []);

    return <div>TransactionDetailsGraphLiquidity</div>;
}
