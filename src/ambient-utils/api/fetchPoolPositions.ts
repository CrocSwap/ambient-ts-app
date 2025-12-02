import { CrocEnv } from '@crocswap-libs/sdk';
import { Provider } from 'ethers';
import { getPositionData, SpotPriceFn } from '../dataLayer/functions';
import { PoolIF, PositionServerIF, TokenIF } from '../types';
import { FetchContractDetailsFn } from './fetchContractDetails';
import { TokenPriceFn } from './fetchTokenPrice';
import { GcgoFetcher } from '../../utils/gcgoFetcher';

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
    gcgo: GcgoFetcher;
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
        gcgo,
        provider,
        analyticsPoolList,
        cachedFetchTokenPrice,
        cachedQuerySpotPrice,
        cachedTokenDetails,
    } = args;

    const poolPositionStatesCacheEndpoint = '/pool_positions?';

    const poolLimitOrders = gcgo
        .fetch(
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
        .then((poolPositionStates: PositionServerIF[]) => {
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
