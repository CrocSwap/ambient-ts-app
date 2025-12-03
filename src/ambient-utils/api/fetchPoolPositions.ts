import { CrocEnv } from '@crocswap-libs/sdk';
import { Provider } from 'ethers';
import { getPositionData, SpotPriceFn } from '../dataLayer/functions';
import { PoolIF, PositionServerIF, TokenIF } from '../types';
import { FetchContractDetailsFn } from './fetchContractDetails';
import { TokenPriceFn } from './fetchTokenPrice';
import { GcgoProvider } from '../../utils/gcgoProvider';

interface argsIF {
    tokenList: TokenIF[];
    base: string;
    quote: string;
    poolIdx: number;
    chainId: string;
    n: number;
    page?: number;
    period?: number;
    time?: number;
    timeBefore?: number;
    crocEnv: CrocEnv;
    gcgo: GcgoProvider;
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

    const poolLimitOrders = gcgo
        .poolPositions({
            base: base,
            quote: quote,
            poolIdx: poolIdx,
            chainId: chainId,
            count: n,
            timeBefore: timeBefore,
        })
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
