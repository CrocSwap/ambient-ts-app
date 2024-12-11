import React, { createContext } from 'react';
import {
    memoizeFetchAmbientListWalletBalances,
    memoizeFetchBlockTime,
    memoizeFetchContractDetails,
    memoizeFetchDexBalances,
    memoizeFetchEnsAddress,
    memoizeFetchTopPairedToken,
    memoizeTokenPrice,
} from '../ambient-utils/api';

import { memoizeFetchNFT } from '../ambient-utils/api/fetchNft';
import {
    memoizeAllPoolStats,
    memoizeGet24hChange,
    memoizeGetAuctionStatus,
    memoizeGetGlobalAuctionsList,
    memoizeGetLiquidityFee,
    memoizeGetUserAuctionsList,
    memoizePoolStats,
    memoizeQuerySpotPrice,
    memoizeQuerySpotTick,
} from '../ambient-utils/dataLayer';
import { CachedDataContextIF } from '../ambient-utils/types/contextTypes';

export const CachedDataContext = createContext({} as CachedDataContextIF);

// TODO: refactor to cache in context and use other contexts as dependencies
export const CachedDataContextProvider = (props: {
    children: React.ReactNode;
}) => {
    const cachedDataState: CachedDataContextIF = {
        cachedFetchAmbientListWalletBalances:
            memoizeFetchAmbientListWalletBalances(),
        cachedFetchDexBalances: memoizeFetchDexBalances(),
        cachedFetchTokenPrice: memoizeTokenPrice(),
        cachedPoolStatsFetch: memoizePoolStats(),
        cachedAllPoolStatsFetch: memoizeAllPoolStats(),
        cachedGet24hChange: memoizeGet24hChange(),
        cachedGetLiquidityFee: memoizeGetLiquidityFee(),
        cachedGetGlobalAuctionsList: memoizeGetGlobalAuctionsList(),
        cachedGetAuctionStatus: memoizeGetAuctionStatus(),
        cachedGetUserAuctionsList: memoizeGetUserAuctionsList(),
        cachedQuerySpotPrice: memoizeQuerySpotPrice(),
        cachedQuerySpotTick: memoizeQuerySpotTick(),
        cachedTokenDetails: memoizeFetchContractDetails(),
        cachedEnsResolve: memoizeFetchEnsAddress(),
        cachedFetchTopPairedToken: memoizeFetchTopPairedToken(),
        cachedFetchBlockTime: memoizeFetchBlockTime(),
        cachedFetchNFT: memoizeFetchNFT(),
    };

    return (
        <CachedDataContext.Provider value={cachedDataState}>
            {props.children}
        </CachedDataContext.Provider>
    );
};
