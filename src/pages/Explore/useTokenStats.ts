import { CrocEnv } from '@crocswap-libs/sdk';
import { useEffect, useState } from 'react';
import { TokenPriceFn, fetchContractDetails } from '../../ambient-utils/api';
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
    dexTvlNorm: number;
    dexVolNorm: number;
    dexFeesNorm: number;
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
                return tokenPromise;
            } catch (error) {
                console.error(
                    'Error fetching token details from chain:',
                    error,
                );
                throw error;
            }
        };
        const tokenMeta: TokenIF =
            tokenLocal ?? (await getFromChain(t.tokenAddr));
        function normalize(num: number, decimals: number): number {
            return num / Math.pow(10, decimals);
        }
        return {
            ...t,
            tokenMeta,
            dexTvlNorm: normalize(t.dexTvl, tokenMeta.decimals),
            dexFeesNorm: normalize(t.dexFees, tokenMeta.decimals),
            dexVolNorm: normalize(t.dexVolume, tokenMeta.decimals),
        };
    };

    return dexTokens;
};
