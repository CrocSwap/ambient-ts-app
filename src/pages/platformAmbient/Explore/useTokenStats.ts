import { CrocEnv, toDisplayPrice } from '@crocswap-libs/sdk';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import {
    FetchContractDetailsFn,
    TokenPriceFn,
    TokenPriceFnReturn,
} from '../../../ambient-utils/api';
import {
    CACHE_UPDATE_FREQ_IN_MS,
    getDefaultPairForChain,
} from '../../../ambient-utils/constants';
import { tokens as AMBIENT_TOKEN_LIST } from '../../../ambient-utils/constants/ambient-token-list.json';
import {
    DexTokenAggServerIF,
    getChainStats,
    getFormattedNumber,
    isWrappedNativeToken,
} from '../../../ambient-utils/dataLayer';
import { TokenIF } from '../../../ambient-utils/types';
import { tokenMethodsIF } from '../../../App/hooks/useTokens';
import { AppStateContext } from '../../../contexts';
import { CachedDataContext } from '../../../contexts/CachedDataContext';
import { BatchedJsonRpcProvider } from '../../../utils/batchedProvider';

interface dexDataGeneric {
    raw: number;
    display: string;
}

export interface dexTokenData extends DexTokenAggServerIF {
    tokenMeta: TokenIF | undefined;
    normalized:
        | {
              dexTvlNorm: dexDataGeneric;
              dexFeesNorm: dexDataGeneric;
              dexVolNorm: dexDataGeneric;
          }
        | undefined;
}

export interface useTokenStatsIF {
    data: dexTokenData[];
    update: () => Promise<void>;
}

export const useTokenStats = (
    chainId: string,
    crocEnv: CrocEnv | undefined,
    backupEndpoint: string,
    cachedFetchTokenPrice: TokenPriceFn,
    cachedTokenDetails: FetchContractDetailsFn,
    tokenMethods: tokenMethodsIF,
    provider: BatchedJsonRpcProvider,
): useTokenStatsIF => {
    const [dexTokens, setDexTokens] = useState<dexTokenData[]>([]);
    const { activeNetwork } = useContext(AppStateContext);
    const pathname = useLocation().pathname;
    const userIsOnExplorePage = pathname.includes('/explore');

    const { cachedQuerySpotPrice } = useContext(CachedDataContext);
    const defaultTokensForChain: [TokenIF, TokenIF] =
        getDefaultPairForChain(chainId);

    const providerUrl = useMemo(
        () => provider._getConnection().url,
        [provider],
    );

    // reset pool data when switching networks
    useEffect(() => {
        if (
            dexTokens.length &&
            dexTokens[0].tokenMeta?.chainId !== parseInt(activeNetwork.chainId)
        ) {
            setDexTokens([]);
        }
    }, [activeNetwork.chainId]);

    // redecorate token data when token lists are pulled for the first time
    useEffect(() => {
        (async () => {
            if (
                userIsOnExplorePage &&
                crocEnv &&
                (await crocEnv.context).chain.chainId === chainId
            ) {
                await fetchData();
            }
        })();
    }, [crocEnv, chainId, providerUrl, userIsOnExplorePage]);

    async function fetchData(): Promise<void> {
        if (crocEnv) {
            try {
                const tokenStats = await getChainStats(
                    'expanded',
                    chainId,
                    crocEnv,
                    backupEndpoint,
                    cachedFetchTokenPrice,
                    20,
                    AMBIENT_TOKEN_LIST,
                );

                if (tokenStats) {
                    const promises = tokenStats.map(
                        async (ts: DexTokenAggServerIF) => {
                            try {
                                const decoratedToken = await decorate(ts);
                                return decoratedToken;
                            } catch (error) {
                                console.error('Error decorating token:', error);
                                return null;
                            }
                        },
                    );

                    const settledPromises = await Promise.allSettled(promises);
                    const fulfilledResults = settledPromises
                        .filter((result) => result.status === 'fulfilled')
                        .map(
                            (result) =>
                                (result as { value: dexTokenData }).value,
                        )
                        .filter((t) => !isWrappedNativeToken(t.tokenAddr));
                    setDexTokens(fulfilledResults);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
    }

    const decorate = async (t: DexTokenAggServerIF): Promise<dexTokenData> => {
        const tokenMeta: TokenIF | undefined =
            tokenMethods.getTokenByAddress(t.tokenAddr) ??
            (await cachedTokenDetails(provider, t.tokenAddr, chainId));

        const tokenStatsNormalized = await expandTokenStats(t);

        async function expandTokenStats(token: DexTokenAggServerIF) {
            if (
                !crocEnv ||
                !tokenMeta ||
                (await crocEnv.context).chain.chainId !== chainId
            )
                return;
            const tokenPricePromise: Promise<TokenPriceFnReturn> =
                cachedFetchTokenPrice(token.tokenAddr, chainId);
            const ethPricePromise: Promise<TokenPriceFnReturn> =
                cachedFetchTokenPrice(
                    defaultTokensForChain[0].address,
                    chainId,
                );
            const poolWithETHNonDisplayPricePromise: Promise<number> =
                tokenMeta.address === defaultTokensForChain[0].address
                    ? Promise.resolve(1)
                    : cachedQuerySpotPrice(
                          crocEnv,
                          defaultTokensForChain[0].address,
                          tokenMeta.address,
                          chainId,
                          Math.floor(Date.now() / CACHE_UPDATE_FREQ_IN_MS),
                      );

            let price: number;

            const canonicalTokenPrice = (await tokenPricePromise)?.usdPrice;
            if (canonicalTokenPrice) {
                price = canonicalTokenPrice;
            } else {
                price =
                    toDisplayPrice(
                        await poolWithETHNonDisplayPricePromise,
                        18,
                        tokenMeta.decimals,
                    ) * ((await ethPricePromise)?.usdPrice || 0) || 0;
            }

            const tvlUSD: number = normalizeToUSD(
                token.dexTvl,
                tokenMeta.decimals,
                price,
            );
            const tvlDisplay: string = getFormattedNumber({
                value: tvlUSD,
                isTvl: true,
                prefix: '$',
            });

            const feesUSD: number = normalizeToUSD(
                token.dexFees,
                tokenMeta.decimals,
                price,
            );
            const feesDisplay: string = getFormattedNumber({
                value: feesUSD,
                isTvl: true,
                prefix: '$',
            });

            const volumeUSD: number =
                normalizeToUSD(token.dexVolume, tokenMeta.decimals, price) / 2;
            const volumeDisplay: string = getFormattedNumber({
                value: volumeUSD,
                isTvl: true,
                prefix: '$',
            });

            function normalizeToUSD(
                num: number,
                decimals: number,
                price: number,
            ): number {
                return (num / Math.pow(10, decimals)) * price;
            }

            return {
                dexTvlNorm: {
                    raw: tvlUSD,
                    display: tvlDisplay,
                },
                dexFeesNorm: {
                    raw: feesUSD,
                    display: feesDisplay,
                },
                dexVolNorm: {
                    raw: volumeUSD,
                    display: volumeDisplay,
                },
            };
        }

        return {
            ...t,
            tokenMeta,
            normalized: tokenStatsNormalized,
        };
    };

    return {
        data: dexTokens,
        update: () => {
            setDexTokens([]);
            return fetchData();
        },
    };
};
