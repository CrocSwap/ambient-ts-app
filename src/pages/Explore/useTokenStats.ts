import { CrocEnv } from '@crocswap-libs/sdk';
import { useEffect } from 'react';
import { TokenPriceFn } from '../../ambient-utils/api';
import { getChainStats } from '../../ambient-utils/dataLayer';
import { TokenIF } from '../../ambient-utils/types';

export const useTokenStats = (
    chainId: string,
    crocEnv: CrocEnv | undefined,
    backupEndpoint: string,
    cachedFetchTokenPrice: TokenPriceFn,
    allDefaultTokens: TokenIF[],
) => {
    console.log('ran hook useTokenStats');
    useEffect(() => {
        if (crocEnv) {
            getChainStats(
                'expanded',
                chainId,
                crocEnv,
                backupEndpoint,
                cachedFetchTokenPrice,
                allDefaultTokens,
            ).then((dexStats) => {
                console.log(dexStats);
            });
        }
    }, [crocEnv]);
};
