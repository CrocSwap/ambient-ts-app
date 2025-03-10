import { CrocEnv } from '@crocswap-libs/sdk';
import { Provider } from 'ethers';
import { getPositionData, SpotPriceFn } from '../dataLayer/functions';
import { PositionServerIF, TokenIF } from '../types';
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

export const fetchPoolPositions = (args: argsIF) => {
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

    const poolPositionStatesCacheEndpoint = GCGO_URL + '/pool_positions?';

    const poolLimitOrders = fetch(
        timeBefore
            ? poolPositionStatesCacheEndpoint +
                  new URLSearchParams({
                      base: base.toLowerCase(),
                      quote: quote.toLowerCase(),
                      poolIdx: poolIdx.toString(),
                      chainId: chainId.toLowerCase(),
                      n: n ? n.toString() : '',
                      timeBefore: timeBefore.toString(),
                  })
            : poolPositionStatesCacheEndpoint +
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
            const poolPositionStates = json?.data;

            if (!poolPositionStates) {
                return [];
            }

            return Promise.all(
                poolPositionStates.map((position: PositionServerIF) => {
                    return getPositionData(
                        position,
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
            ).then((updatedPositions) => {
                return updatedPositions;
            });
        })
        .catch(console.error);

    return poolLimitOrders;
};
