import React, { createContext } from 'react';
import {
    FetchAddrFn,
    memoizeFetchEnsAddress,
} from '../App/functions/fetchAddress';
import {
    FetchContractDetailsFn,
    memoizeFetchContractDetails,
} from '../App/functions/fetchContractDetails';
import {
    TokenBalancesQueryFn,
    memoizeFetchTokenBalances,
} from '../App/functions/fetchTokenBalances';
import {
    TokenPriceFn,
    memoizeTokenPrice,
} from '../App/functions/fetchTokenPrice';
import { PoolStatsFn, memoizePoolStats } from '../App/functions/getPoolStats';
import {
    SpotPriceFn,
    memoizeQuerySpotPrice,
} from '../App/functions/querySpotPrice';

interface CachedDataIF {
    cachedFetchTokenBalances: TokenBalancesQueryFn;
    cachedFetchTokenPrice: TokenPriceFn;
    cachedPoolStatsFetch: PoolStatsFn;
    cachedQuerySpotPrice: SpotPriceFn;
    cachedTokenDetails: FetchContractDetailsFn;
    cachedEnsResolve: FetchAddrFn;
}

export const CachedDataContext = createContext<CachedDataIF>(
    {} as CachedDataIF,
);

// TODO: refactor to cache in context and use other contexts as dependencies
export const CachedDataContextProvider = (props: {
    children: React.ReactNode;
}) => {
    const cachedDataState = {
        cachedFetchTokenBalances: memoizeFetchTokenBalances(),
        cachedFetchTokenPrice: memoizeTokenPrice(),
        cachedPoolStatsFetch: memoizePoolStats(),
        cachedQuerySpotPrice: memoizeQuerySpotPrice(),
        cachedTokenDetails: memoizeFetchContractDetails(),
        cachedEnsResolve: memoizeFetchEnsAddress(),
    };

    return (
        <CachedDataContext.Provider value={cachedDataState}>
            {props.children}
        </CachedDataContext.Provider>
    );
};
