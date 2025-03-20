import { CrocEnv } from '@crocswap-libs/sdk';
import { Provider } from 'ethers';
import { getLimitOrderData, SpotPriceFn } from '../dataLayer/functions';
import { LimitOrderServerIF, PoolIF, TokenIF } from '../types';
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
    activePoolList: PoolIF[] | undefined;
    cachedFetchTokenPrice: TokenPriceFn;
    cachedQuerySpotPrice: SpotPriceFn;
    cachedTokenDetails: FetchContractDetailsFn;
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
        activePoolList,
        cachedFetchTokenPrice,
        cachedQuerySpotPrice,
        cachedTokenDetails,
    } = args;

    const poolLimitOrderStatesCacheEndpoint = GCGO_URL + '/pool_limit_orders?';

    const poolLimitOrders = fetch(
        timeBefore
            ? poolLimitOrderStatesCacheEndpoint +
                  new URLSearchParams({
                      base: base.toLowerCase(),
                      quote: quote.toLowerCase(),
                      poolIdx: poolIdx.toString(),
                      chainId: chainId.toLowerCase(),
                      n: n ? n.toString() : '',
                      timeBefore: timeBefore.toString(),
                  })
            : poolLimitOrderStatesCacheEndpoint +
                  new URLSearchParams({
                      base: base.toLowerCase(),
                      quote: quote.toLowerCase(),
                      poolIdx: poolIdx.toString(),
                      chainId: chainId.toLowerCase(),
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
                        activePoolList,
                        cachedFetchTokenPrice,
                        cachedQuerySpotPrice,
                        cachedTokenDetails,
                    );
                }),
            ).then((updatedLimitOrders) => {
                return updatedLimitOrders;
            });
        })
        .catch(console.error);

    return poolLimitOrders;
};
