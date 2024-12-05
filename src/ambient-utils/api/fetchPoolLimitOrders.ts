import { CrocEnv } from '@crocswap-libs/sdk';
import { Provider } from 'ethers';
import { getLimitOrderData, SpotPriceFn } from '../dataLayer/functions';
import { LimitOrderServerIF, TokenIF } from '../types';
import { FetchAddrFn } from './fetchAddress';
import { FetchContractDetailsFn } from './fetchContractDetails';
import { TokenPriceFn } from './fetchTokenPrice';

interface argsIF {
    tokenList: TokenIF[];
    base: string;
    quote: string;
    poolIdx: number;
    chainId: string;
    n?: number;
    page?: number;
    period?: number;
    time?: number;
    timeBefore?: number;
    crocEnv: CrocEnv;
    GCGO_URL: string;
    provider: Provider;
    cachedFetchTokenPrice: TokenPriceFn;
    cachedQuerySpotPrice: SpotPriceFn;
    cachedTokenDetails: FetchContractDetailsFn;
    cachedEnsResolve: FetchAddrFn;
}

export const fetchPoolLimitOrders = (args: argsIF) => {
    const {
        tokenList,
        base,
        quote,
        poolIdx,
        chainId,
        n,
        timeBefore,
        crocEnv,
        GCGO_URL,
        provider,
        cachedFetchTokenPrice,
        cachedQuerySpotPrice,
        cachedTokenDetails,
        cachedEnsResolve,
    } = args;

    const poolLimitOrderStatesCacheEndpoint = GCGO_URL + '/pool_limit_orders?';

    const poolLimitOrders = fetch(
        timeBefore
            ? poolLimitOrderStatesCacheEndpoint +
                  new URLSearchParams({
                      base: base.toLowerCase(),
                      quote: quote.toLowerCase(),
                      poolIdx: poolIdx.toString(),
                      chainId: chainId,
                      n: n ? n.toString() : '',
                      timeBefore: timeBefore.toString(),
                  })
            : poolLimitOrderStatesCacheEndpoint +
                  new URLSearchParams({
                      base: base.toLowerCase(),
                      quote: quote.toLowerCase(),
                      poolIdx: poolIdx.toString(),
                      chainId: chainId,
                      n: n ? n.toString() : '',
                  }),
    )
        .then((response) => response?.json())
        .then((json) => {
            const poolLimitOrderStates = json?.data;

            if (!poolLimitOrders) {
                return [];
            }

            return Promise.all(
                poolLimitOrderStates.map((limitOrder: LimitOrderServerIF) => {
                    return getLimitOrderData(
                        limitOrder,
                        tokenList,
                        crocEnv,
                        provider,
                        chainId,
                        cachedFetchTokenPrice,
                        cachedQuerySpotPrice,
                        cachedTokenDetails,
                        cachedEnsResolve,
                    );
                }),
            ).then((updatedLimitOrders) => {
                return updatedLimitOrders;
            });
        })
        .catch(console.error);

    return poolLimitOrders;
};
