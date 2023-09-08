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
    nativeTokenBalanceFn,
    Erc20TokenBalanceFn,
    memoizeFetchNativeTokenBalance,
    memoizeFetchErc20TokenBalances,
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
import {
    FetchBlockTimeFn,
    memoizeFetchBlockTime,
} from '../App/functions/fetchBlockTime';

interface CachedDataIF {
    cachedFetchNativeTokenBalance: nativeTokenBalanceFn;
    cachedFetchErc20TokenBalances: Erc20TokenBalanceFn;
    cachedFetchTokenPrice: TokenPriceFn;
    cachedPoolStatsFetch: PoolStatsFn;
    cachedQuerySpotPrice: SpotPriceFn;
    cachedTokenDetails: FetchContractDetailsFn;
    cachedEnsResolve: FetchAddrFn;
    cachedFetchBlockTime: FetchBlockTimeFn;
}

export const CachedDataContext = createContext<CachedDataIF>(
    {} as CachedDataIF,
);

// TODO: refactor to cache in context and use other contexts as dependencies
export const CachedDataContextProvider = (props: {
    children: React.ReactNode;
}) => {
    const cachedDataState = {
        cachedFetchNativeTokenBalance: memoizeFetchNativeTokenBalance(),
        cachedFetchErc20TokenBalances: memoizeFetchErc20TokenBalances(),
        cachedFetchTokenPrice: memoizeTokenPrice(),
        cachedPoolStatsFetch: memoizePoolStats(),
        cachedQuerySpotPrice: memoizeQuerySpotPrice(),
        cachedTokenDetails: memoizeFetchContractDetails(),
        cachedEnsResolve: memoizeFetchEnsAddress(),
        cachedFetchBlockTime: memoizeFetchBlockTime(),
    };

    return (
        <CachedDataContext.Provider value={cachedDataState}>
            {props.children}
        </CachedDataContext.Provider>
    );
};
