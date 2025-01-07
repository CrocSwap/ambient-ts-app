/* eslint-disable no-irregular-whitespace */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useContext } from 'react';
import { LimitOrderIF } from '../../../ambient-utils/types/limitOrder';
import {
    AppStateContext,
    CachedDataContext,
    CrocEnvContext,
    TokenContext,
    TradeDataContext,
} from '../../../contexts';
import { fetchPoolLimitOrders } from '../../../ambient-utils/api/fetchPoolLimitOrders';
import { fetchPoolPositions } from '../../../ambient-utils/api/fetchPoolPositions';
import { PositionIF } from '../../../ambient-utils/types/position';
import { TransactionIF } from '../../../ambient-utils/types';
import {
    fetchPoolRecentChanges,
    fetchUserRecentChanges,
} from '../../../ambient-utils/api';
import { fetchPoolUserChanges } from '../../../ambient-utils/api/fetchPoolUserChanges';

const useInfiniteScrollFetchers = () => {
    const {
        cachedQuerySpotPrice,
        cachedFetchTokenPrice,
        cachedTokenDetails,
        cachedEnsResolve,
    } = useContext(CachedDataContext);

    const {
        activeNetwork: { chainId, poolIndex, GCGO_URL },
    } = useContext(AppStateContext);

    const { crocEnv, provider } = useContext(CrocEnvContext);

    const {
        tokens: { tokenUniv: tokenList },
    } = useContext(TokenContext);

    const { baseToken, quoteToken } = useContext(TradeDataContext);

    const fetchLimitOrders = async (
        OLDEST_TIME: number,
        fetchCount: number,
    ): Promise<LimitOrderIF[]> => {
        return new Promise((resolve) => {
            if (!crocEnv || !provider) resolve([]);
            else {
                fetchPoolLimitOrders({
                    tokenList: tokenList,
                    base: baseToken.address,
                    quote: quoteToken.address,
                    poolIdx: poolIndex,
                    chainId: chainId,
                    n: fetchCount,
                    timeBefore: OLDEST_TIME,
                    crocEnv: crocEnv,
                    GCGO_URL: GCGO_URL,
                    provider: provider,
                    cachedFetchTokenPrice: cachedFetchTokenPrice,
                    cachedQuerySpotPrice: cachedQuerySpotPrice,
                    cachedTokenDetails: cachedTokenDetails,
                    cachedEnsResolve: cachedEnsResolve,
                }).then((poolChangesJsonData) => {
                    if (poolChangesJsonData && poolChangesJsonData.length > 0) {
                        resolve(poolChangesJsonData as LimitOrderIF[]);
                    } else {
                        resolve([]);
                    }
                });
            }
        });
    };

    const fetchPositions = async (
        OLDEST_TIME: number,
        fetchCount: number,
    ): Promise<PositionIF[]> => {
        return new Promise((resolve) => {
            if (!crocEnv || !provider) resolve([]);
            else {
                fetchPoolPositions({
                    tokenList: tokenList,
                    base: baseToken.address,
                    quote: quoteToken.address,
                    poolIdx: poolIndex,
                    chainId: chainId,
                    n: fetchCount,
                    timeBefore: OLDEST_TIME,
                    crocEnv: crocEnv,
                    GCGO_URL: GCGO_URL,
                    provider: provider,
                    cachedFetchTokenPrice: cachedFetchTokenPrice,
                    cachedQuerySpotPrice: cachedQuerySpotPrice,
                    cachedTokenDetails: cachedTokenDetails,
                    cachedEnsResolve: cachedEnsResolve,
                }).then((poolChangesJsonData) => {
                    if (poolChangesJsonData && poolChangesJsonData.length > 0) {
                        resolve(poolChangesJsonData as PositionIF[]);
                        // resolve((poolChangesJsonData as PositionIF[]).filter(e=>e.positionLiq !== 0));
                    } else {
                        resolve([]);
                    }
                });
            }
        });
    };

    const fetchTxsPool = async (
        OLDEST_TIME: number,
        fetchCount: number,
    ): Promise<TransactionIF[]> => {
        return new Promise((resolve) => {
            if (!crocEnv || !provider) resolve([]);
            else {
                fetchPoolRecentChanges({
                    tokenList: tokenList,
                    base: baseToken.address,
                    quote: quoteToken.address,
                    poolIdx: poolIndex,
                    chainId: chainId,
                    n: fetchCount,
                    timeBefore: OLDEST_TIME,
                    crocEnv: crocEnv,
                    GCGO_URL: GCGO_URL,
                    provider: provider,
                    cachedFetchTokenPrice: cachedFetchTokenPrice,
                    cachedQuerySpotPrice: cachedQuerySpotPrice,
                    cachedTokenDetails: cachedTokenDetails,
                    cachedEnsResolve: cachedEnsResolve,
                }).then((poolChangesJsonData) => {
                    if (poolChangesJsonData && poolChangesJsonData.length > 0) {
                        resolve(poolChangesJsonData as TransactionIF[]);
                    } else {
                        resolve([]);
                    }
                });
            }
        });
    };

    const fetchTxsUser = async (
        OLDEST_TIME: number,
        fetchCount: number,
        user: string,
    ): Promise<TransactionIF[]> => {
        return new Promise((resolve) => {
            if (!crocEnv || !provider) resolve([]);
            else {
                fetchUserRecentChanges({
                    tokenList: tokenList,
                    chainId: chainId,
                    user: user,
                    n: fetchCount,
                    timeBefore: OLDEST_TIME,
                    crocEnv: crocEnv,
                    GCGO_URL: GCGO_URL,
                    provider: provider,
                    cachedFetchTokenPrice: cachedFetchTokenPrice,
                    cachedQuerySpotPrice: cachedQuerySpotPrice,
                    cachedTokenDetails: cachedTokenDetails,
                    cachedEnsResolve: cachedEnsResolve,
                }).then((userChangesJsonData) => {
                    if (userChangesJsonData && userChangesJsonData.length > 0) {
                        resolve(userChangesJsonData as TransactionIF[]);
                    } else {
                        resolve([]);
                    }
                });
            }
        });
    };

    const fetchTxsUserPool = async (
        OLDEST_TIME: number,
        fetchCount: number,
        user: `0x${string}`,
    ): Promise<TransactionIF[]> => {
        return new Promise((resolve) => {
            if (!crocEnv || !provider) resolve([]);
            else {
                fetchPoolUserChanges({
                    tokenList: tokenList,
                    base: baseToken.address,
                    quote: quoteToken.address,
                    poolIdx: poolIndex,
                    chainId: chainId,
                    user: user,
                    n: fetchCount,
                    timeBefore: OLDEST_TIME,
                    crocEnv: crocEnv,
                    GCGO_URL: GCGO_URL,
                    provider: provider,
                    cachedFetchTokenPrice: cachedFetchTokenPrice,
                    cachedQuerySpotPrice: cachedQuerySpotPrice,
                    cachedTokenDetails: cachedTokenDetails,
                    cachedEnsResolve: cachedEnsResolve,
                }).then((poolChangesJsonData) => {
                    if (poolChangesJsonData && poolChangesJsonData.length > 0) {
                        resolve(poolChangesJsonData as TransactionIF[]);
                    } else {
                        resolve([]);
                    }
                });
            }
        });
    };

    return {
        fetchLimitOrders,
        fetchPositions,
        fetchTxsPool,
        fetchTxsUser,
        fetchTxsUserPool,
    };
};

export default useInfiniteScrollFetchers;
