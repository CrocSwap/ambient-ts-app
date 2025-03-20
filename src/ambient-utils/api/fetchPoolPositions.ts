import { CrocEnv } from '@crocswap-libs/sdk';
import { Provider } from 'ethers';
import { getPositionData, SpotPriceFn } from '../dataLayer/functions';
import { PoolIF, PositionServerIF, TokenIF } from '../types';
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
    analyticsPoolList?: PoolIF[] | undefined;
    cachedFetchTokenPrice: TokenPriceFn;
    cachedQuerySpotPrice: SpotPriceFn;
    cachedTokenDetails: FetchContractDetailsFn;
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
        analyticsPoolList,
        cachedFetchTokenPrice,
        cachedQuerySpotPrice,
        cachedTokenDetails,
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
                        analyticsPoolList,
                        cachedFetchTokenPrice,
                        cachedQuerySpotPrice,
                        cachedTokenDetails,
                    );
                }),
            ).then((updatedPositions) => {
                return updatedPositions;
            });
        })
        .catch(console.error);

    return poolLimitOrders;
};
