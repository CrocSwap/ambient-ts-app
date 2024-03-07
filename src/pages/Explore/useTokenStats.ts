import { CrocEnv } from '@crocswap-libs/sdk';
import { useEffect, useState } from 'react';
import { TokenPriceFn } from '../../ambient-utils/api';
import {
    DexTokenAggServerIF,
    getChainStats,
} from '../../ambient-utils/dataLayer';
import { TokenIF } from '../../ambient-utils/types';
import { tokenMethodsIF } from '../../App/hooks/useTokens';

export interface dexTokenData extends DexTokenAggServerIF {
    tokenMeta: TokenIF | undefined;
}

export const useTokenStats = (
    chainId: string,
    crocEnv: CrocEnv | undefined,
    backupEndpoint: string,
    cachedFetchTokenPrice: TokenPriceFn,
    tokenMethods: tokenMethodsIF,
): dexTokenData[] => {
    const [dexTokens, setDexTokens] = useState<dexTokenData[]>([]);

    useEffect(() => {
        if (crocEnv) {
            getChainStats(
                'expanded',
                chainId,
                crocEnv,
                backupEndpoint,
                cachedFetchTokenPrice,
                tokenMethods.allDefaultTokens,
            ).then((tokenStats) => {
                if (tokenStats) {
                    const expandedTokenStats: dexTokenData[] = tokenStats.map(
                        (ts: DexTokenAggServerIF) => {
                            return {
                                ...ts,
                                tokenMeta: tokenMethods.getTokenByAddress(
                                    ts.tokenAddr,
                                ),
                            };
                        },
                    );
                    setDexTokens(expandedTokenStats);
                }
            });
        }
    }, [crocEnv]);

    return dexTokens;
};
