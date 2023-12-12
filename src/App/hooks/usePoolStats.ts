import { useContext, useEffect, useState } from 'react';
import { PoolIF } from '../../ambient-utils/types';
import { PoolStatsFn, getFormattedNumber } from '../../ambient-utils/dataLayer';
import { TokenPriceFn } from '../../ambient-utils/api';
import { CrocEnv } from '@crocswap-libs/sdk';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';
import { CACHE_UPDATE_FREQ_IN_MS } from '../../ambient-utils/constants';

export const usePoolStats = (
    pool: PoolIF,
    lastBlockNumber: number | undefined,
    cachedPoolStatsFetch: PoolStatsFn,
    cachedFetchTokenPrice: TokenPriceFn,
    crocEnv?: CrocEnv,
): [string, string] => {
    const [poolVolume, setPoolVolume] = useState<string | undefined>();
    const [poolTvl, setPoolTvl] = useState<string | undefined>();

    const { activeNetwork } = useContext(CrocEnvContext);

    const fetchPoolStats = () => {
        (async () => {
            if (!crocEnv) {
                return;
            }
            const poolStatsFresh = await cachedPoolStatsFetch(
                pool.chainId,
                pool.base.address,
                pool.quote.address,
                pool.poolIdx,
                Math.floor(Date.now() / CACHE_UPDATE_FREQ_IN_MS),
                crocEnv,
                activeNetwork.graphCacheUrl,
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
    }, [lastBlockNumber ?? []]);

    return [poolVolume ?? '…', poolTvl ?? '…'];
};
