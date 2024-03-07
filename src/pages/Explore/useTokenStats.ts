import { CrocEnv } from '@crocswap-libs/sdk';
import { useEffect, useState } from 'react';
import { TokenPriceFn, fetchContractDetails } from '../../ambient-utils/api';
import {
    DexTokenAggServerIF,
    getChainStats,
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
    tokenMethods: tokenMethodsIF,
    provider: ethers.providers.Provider,
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
                            );
                        setDexTokens(fulfilledResults);
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            }
        };

        fetchData();
    }, [crocEnv]);

    const decorate = async (t: DexTokenAggServerIF): Promise<dexTokenData> => {
        const tokenLocal = tokenMethods.getTokenByAddress(t.tokenAddr);
        const getFromChain = async (a: string): Promise<TokenIF> => {
            try {
                const tokenPromise = await fetchContractDetails(
                    provider,
                    a,
                    chainId,
                );
                console.log(tokenPromise);
                return tokenPromise;
            } catch (error) {
                console.error(
                    'Error fetching token details from chain:',
                    error,
                );
                throw error;
            }
        };
        const tokenMeta = tokenLocal ?? (await getFromChain(t.tokenAddr));
        return {
            ...t,
            tokenMeta,
        };
    };

    return dexTokens;
};
