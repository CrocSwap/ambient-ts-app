import { CrocEnv } from '@crocswap-libs/sdk';
import { Provider } from 'ethers';
import { getLimitOrderData, SpotPriceFn } from '../dataLayer/functions';
import { LimitOrderServerIF, PoolIF, TokenIF } from '../types';
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
        gcgo,
        provider,
        activePoolList,
        cachedFetchTokenPrice,
        cachedQuerySpotPrice,
        cachedTokenDetails,
    } = args;

    const poolLimitOrders = gcgo
        .poolLimitOrders({
            base: base,
            quote: quote,
            poolIdx: poolIdx,
            chainId: chainId,
            count: n,
            timeBefore: timeBefore,
        })
        .then((poolLimitOrderStates: LimitOrderServerIF[]) => {
            if (!poolLimitOrderStates) {
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
