import React, { createContext } from 'react';
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
    PositionUpdateFn,
    memoizePositionUpdate,
} from '../App/functions/getPositionData';
import {
    SpotPriceFn,
    memoizeQuerySpotPrice,
} from '../App/functions/querySpotPrice';

interface CachedDataIF {
    cachedFetchNativeTokenBalance: nativeTokenBalanceFn;
    cachedFetchErc20TokenBalances: Erc20TokenBalanceFn;
    cachedFetchTokenPrice: TokenPriceFn;
    cachedPositionUpdateQuery: PositionUpdateFn;
    cachedPoolStatsFetch: PoolStatsFn;
    cachedQuerySpotPrice: SpotPriceFn;
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
        cachedPositionUpdateQuery: memoizePositionUpdate(),
        cachedPoolStatsFetch: memoizePoolStats(),
        cachedQuerySpotPrice: memoizeQuerySpotPrice(),
    };

    return (
        <CachedDataContext.Provider value={cachedDataState}>
            {props.children}
        </CachedDataContext.Provider>
    );
};
