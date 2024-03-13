import { CrocEnv } from '@crocswap-libs/sdk';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { FetchContractDetailsFn, TokenPriceFn } from '../../ambient-utils/api';
import {
    DexTokenAggServerIF,
    getChainStats,
    isWethToken,
} from '../../ambient-utils/dataLayer';
import { TokenIF } from '../../ambient-utils/types';
import { tokenMethodsIF } from '../../App/hooks/useTokens';
import { ethers } from 'ethers';

export interface dexTokenData extends DexTokenAggServerIF {
    tokenMeta: TokenIF | undefined;
}

export const useTokenStats = (
    chainId: string,
    crocEnv: CrocEnv | undefined,
    backupEndpoint: string,
    cachedFetchTokenPrice: TokenPriceFn,
    cachedTokenDetails: FetchContractDetailsFn,
    tokenMethods: tokenMethodsIF,
    provider: ethers.providers.Provider,
    shouldDexTokensUpdate: boolean,
    setShouldDexTokensUpdate: Dispatch<SetStateAction<boolean>>,
): dexTokenData[] => {
    const [dexTokens, setDexTokens] = useState<dexTokenData[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (crocEnv) {
                try {
                    const tokenStats = await getChainStats(
                        'expanded',
                        chainId,
                        crocEnv,
                        backupEndpoint,
                        cachedFetchTokenPrice,
                        20,
                        tokenMethods.allDefaultTokens,
                    );

                    if (tokenStats) {
                        const promises = tokenStats.map(
                            async (ts: DexTokenAggServerIF) => {
                                try {
                                    const decoratedToken = await decorate(ts);
                                    return decoratedToken;
                                } catch (error) {
                                    console.error(
                                        'Error decorating token:',
                                        error,
                                    );
                                    return null;
                                }
                            },
                        );

                        const settledPromises = await Promise.allSettled(
                            promises,
                        );
                        const fulfilledResults = settledPromises
                            .filter((result) => result.status === 'fulfilled')
                            .map(
                                (result) =>
                                    (result as { value: dexTokenData }).value,
                            )
                            .filter((t) => !isWethToken(t.tokenAddr));
                        setDexTokens(fulfilledResults);
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            }
        };
        if (shouldDexTokensUpdate) {
            setDexTokens([]);
            fetchData();
            setShouldDexTokensUpdate(false);
        }
    }, [crocEnv, shouldDexTokensUpdate]);

    const decorate = async (t: DexTokenAggServerIF): Promise<dexTokenData> => {
        const tokenLocal = tokenMethods.getTokenByAddress(t.tokenAddr);

        const tokenMeta =
            tokenLocal ??
            (await cachedTokenDetails(provider, t.tokenAddr, chainId));
        return {
            ...t,
            tokenMeta,
        };
    };

    return dexTokens;
};
