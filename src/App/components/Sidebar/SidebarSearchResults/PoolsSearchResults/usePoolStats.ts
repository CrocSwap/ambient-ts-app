import { useEffect, useState } from 'react';
import { formatAmountOld } from '../../../../../utils/numbers';
import { PoolStatsFn } from '../../../../functions/getPoolStats';
import { TempPoolIF } from '../../../../../utils/interfaces/exports';

export interface poolStatsIF {
    volume: string | undefined;
    tvl: string | undefined;
}

export const usePoolStats = (
    pool: TempPoolIF,
    chainId: string,
    cachedPoolStatsFetch: PoolStatsFn,
): poolStatsIF => {
    // volume of pool to be displayed in the DOM
    const [volume, setVolume] = useState<string | undefined>();
    // TVL of pool to be displayed in the DOM
    const [tvl, setTvl] = useState<string | undefined>();

    // logic to pull current values of volume and TVL for pool
    // this runs once and does not update after initial load
    useEffect(() => {
        (async () => {
            const poolStatsFresh = await cachedPoolStatsFetch(
                chainId,
                pool.base,
                pool.quote,
                pool.poolIdx,
                1,
            );
            const volume = poolStatsFresh?.volumeTotal; // display the total volume for all time
            const volumeString = volume
                ? '$' + formatAmountOld(volume)
                : undefined;
            setVolume(volumeString);
            const tvl = poolStatsFresh?.tvl;
            const tvlString = tvl ? '$' + formatAmountOld(tvl) : undefined;
            setTvl(tvlString);
        })();
    }, []);

    return { volume, tvl };
};
