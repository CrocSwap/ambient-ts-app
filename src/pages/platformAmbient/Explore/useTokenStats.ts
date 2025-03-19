import { CrocEnv, toDisplayPrice } from '@crocswap-libs/sdk';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import {
    FetchContractDetailsFn,
    TokenPriceFn,
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
import { PoolIF, TokenIF } from '../../../ambient-utils/types';
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
    activePoolList: PoolIF[] | undefined,
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
                activePoolList &&
                userIsOnExplorePage &&
                crocEnv &&
                (await crocEnv.context).chain.chainId === chainId
            ) {
                await fetchData();
            }
        })();
    }, [crocEnv, chainId, providerUrl, userIsOnExplorePage, !!activePoolList]);

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
                                return undefined;
                            }
                        },
                    );

                    const settledPromises = await Promise.allSettled(promises);

                    const fulfilledResults = settledPromises
                        .filter(
                            (result) =>
                                result.status === 'fulfilled' && result.value,
                        )
                        .map((result) => {
                            return (result as { value: dexTokenData }).value;
                        })
                        .filter((t) => !isWrappedNativeToken(t.tokenAddr));
                    setDexTokens(fulfilledResults);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
    }

    function findTokenPriceByAddress(poolList: PoolIF[], address: string) {
        const normalizedAddress = address.toLowerCase();

        for (const pool of poolList) {
            if (pool.baseToken.address.toLowerCase() === normalizedAddress) {
                return pool.baseUsdPrice;
            }
            if (pool.quoteToken.address.toLowerCase() === normalizedAddress) {
                return pool.quoteUsdPrice;
            }
        }

        return undefined;
    }

    const decorate = async (t: DexTokenAggServerIF): Promise<dexTokenData> => {
        const tokenMeta =
            tokenMethods.getTokenByAddress(t.tokenAddr) ??
            (await cachedTokenDetails(provider, t.tokenAddr, chainId));
        if (
            !activePoolList ||
            !crocEnv ||
            !tokenMeta ||
            (await crocEnv.context).chain.chainId !== chainId
        ) {
            return { ...t, tokenMeta, normalized: undefined };
        }

        // Attempt to get prices from activePoolList first
        let canonicalTokenPrice = findTokenPriceByAddress(
            activePoolList,
            t.tokenAddr,
        );
        let defaultBaseTokenPrice = findTokenPriceByAddress(
            activePoolList,
            defaultTokensForChain[0].address,
        );

        // Fetch missing data only if necessary
        const [
            fetchedTokenPrice,
            fetchedNativeTokenPrice,
            poolWithNativeTokenPrice,
        ] =
            canonicalTokenPrice && defaultBaseTokenPrice
                ? [undefined, undefined, undefined] // Skip async calls if prices exist
                : await Promise.all([
                      canonicalTokenPrice
                          ? undefined
                          : cachedFetchTokenPrice(t.tokenAddr, chainId),
                      defaultBaseTokenPrice
                          ? undefined
                          : cachedFetchTokenPrice(
                                defaultTokensForChain[0].address,
                                chainId,
                            ),
                      tokenMeta.address === defaultTokensForChain[0].address
                          ? Promise.resolve(1)
                          : cachedQuerySpotPrice(
                                crocEnv,
                                defaultTokensForChain[0].address,
                                tokenMeta.address,
                                chainId,
                                Math.floor(
                                    Date.now() / CACHE_UPDATE_FREQ_IN_MS,
                                ),
                            ),
                  ]);

        // Use fetched prices if not found in activePoolList
        canonicalTokenPrice ||= fetchedTokenPrice?.usdPrice;
        defaultBaseTokenPrice ||= fetchedNativeTokenPrice?.usdPrice;

        // Determine final price
        const price =
            canonicalTokenPrice ||
            toDisplayPrice(
                poolWithNativeTokenPrice || 0,
                defaultTokensForChain[0].decimals,
                tokenMeta.decimals,
            ) * (defaultBaseTokenPrice || 0) ||
            0;

        // Utility function for USD normalization
        const normalizeToUSD = (num: number, decimals: number, price: number) =>
            (num / 10 ** decimals) * price;

        const tvlUSD = normalizeToUSD(t.dexTvl, tokenMeta.decimals, price);
        const feesUSD = normalizeToUSD(t.dexFees, tokenMeta.decimals, price);
        const volumeUSD =
            normalizeToUSD(t.dexVolume, tokenMeta.decimals, price) / 2;

        return {
            ...t,
            tokenMeta,
            normalized: {
                dexTvlNorm: {
                    raw: tvlUSD,
                    display: getFormattedNumber({
                        value: tvlUSD,
                        isTvl: true,
                        prefix: '$',
                    }),
                },
                dexFeesNorm: {
                    raw: feesUSD,
                    display: getFormattedNumber({
                        value: feesUSD,
                        isTvl: true,
                        prefix: '$',
                    }),
                },
                dexVolNorm: {
                    raw: volumeUSD,
                    display: getFormattedNumber({
                        value: volumeUSD,
                        isTvl: true,
                        prefix: '$',
                    }),
                },
            },
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
