import { useEffect, useState } from 'react';
import { formatAmountOld } from '../../../../../utils/numbers';
import { PoolStatsFn } from '../../../../functions/getPoolStats';
import { TempPoolIF } from '../../../../../utils/interfaces/exports';
import { TokenPriceFn } from '../../../../functions/fetchTokenPrice';
import { CrocEnv } from '@crocswap-libs/sdk';

export interface poolStatsIF {
    volume: string | undefined;
    tvl: string | undefined;
}

export const usePoolStats = (
    pool: TempPoolIF,
    cachedPoolStatsFetch: PoolStatsFn,
    cachedFetchTokenPrice: TokenPriceFn,
    crocEnv?: CrocEnv,
): poolStatsIF => {
    // volume of pool to be displayed in the DOM
    const [volume, setVolume] = useState<string | undefined>();
    // TVL of pool to be displayed in the DOM
    const [tvl, setTvl] = useState<string | undefined>();

    // logic to pull current values of volume and TVL for pool
    // this runs once and does not update after initial load
    useEffect(() => {
        (async () => {
            if (!crocEnv) {
                return;
            }
            const poolStatsFresh = await cachedPoolStatsFetch(
                pool.chainId,
                pool.base,
                pool.quote,
                pool.poolIdx,
                0, // Only runs once after initital
                crocEnv,
                cachedFetchTokenPrice,
            );

            const volume = poolStatsFresh?.volumeTotalUsd; // display the total volume for all time
            const volumeString = volume
                ? '$' + formatAmountOld(volume)
                : undefined;
            setVolume(volumeString);
            const tvl = poolStatsFresh?.tvlTotalUsd;
            const tvlString = tvl ? '$' + formatAmountOld(tvl) : undefined;
            setTvl(tvlString);
        })();
    }, []);

    return { volume, tvl };
};
