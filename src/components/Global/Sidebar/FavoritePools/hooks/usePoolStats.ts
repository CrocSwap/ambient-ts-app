import { useEffect, useState } from 'react';
import { PoolIF } from '../../../../../utils/interfaces/exports';
import { PoolStatsFn } from '../../../../../App/functions/getPoolStats';
import { CrocEnv } from '@crocswap-libs/sdk';
import { TokenPriceFn } from '../../../../../App/functions/fetchTokenPrice';
import { getFormattedNumber } from '../../../../../App/functions/getFormattedNumber';

export const usePoolStats = (
    pool: PoolIF,
    lastBlockNumber: number,
    cachedPoolStatsFetch: PoolStatsFn,
    cachedFetchTokenPrice: TokenPriceFn,
    crocEnv?: CrocEnv,
): [string, string] => {
    const [poolVolume, setPoolVolume] = useState<string | undefined>();
    const [poolTvl, setPoolTvl] = useState<string | undefined>();

    const fetchPoolStats = () => {
        (async () => {
            if (!crocEnv) {
                return;
            }
            const poolStatsFresh = await cachedPoolStatsFetch(
                pool.chainId,
                pool.base.address,
                pool.quote.address,
                pool.poolId,
                Math.floor(Date.now() / 60000),
                crocEnv,
                cachedFetchTokenPrice,
            );
            const volume = poolStatsFresh?.volumeTotalUsd; // display the total volume for all time
            const volumeString = volume
                ? getFormattedNumber({ value: volume, prefix: '$' })
                : undefined;
            setPoolVolume(volumeString);
            const tvl = poolStatsFresh?.tvlTotalUsd;
            const tvlString = tvl
                ? getFormattedNumber({ value: tvl, prefix: '$', isTvl: true })
                : undefined;
            setPoolTvl(tvlString);
        })();
    };

    useEffect(() => {
        fetchPoolStats(); // NOTE: we assume that a block occurs more frequently than once a minute
    }, [lastBlockNumber]);

    return [poolVolume ?? '…', poolTvl ?? '…'];
};
