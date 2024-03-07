import { CrocEnv } from '@crocswap-libs/sdk';
import { useEffect, useState } from 'react';
import { TokenPriceFn } from '../../ambient-utils/api';
import {
    DexTokenAggServerIF,
    getChainStats,
} from '../../ambient-utils/dataLayer';
import { TokenIF } from '../../ambient-utils/types';

export const useTokenStats = (
    chainId: string,
    crocEnv: CrocEnv | undefined,
    backupEndpoint: string,
    cachedFetchTokenPrice: TokenPriceFn,
    allDefaultTokens: TokenIF[],
): DexTokenAggServerIF[] => {
    const [dexTokens, setDexTokens] = useState<DexTokenAggServerIF[]>([]);

    useEffect(() => {
        if (crocEnv) {
            getChainStats(
                'expanded',
                chainId,
                crocEnv,
                backupEndpoint,
                cachedFetchTokenPrice,
                allDefaultTokens,
            ).then((dexStats) => dexStats && setDexTokens(dexStats));
        }
    }, [crocEnv]);

    return dexTokens;
};
