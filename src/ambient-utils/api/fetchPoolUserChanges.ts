import { CrocEnv } from '@crocswap-libs/sdk';
import { Provider } from 'ethers';
import { getTransactionData, SpotPriceFn } from '../dataLayer/functions';
import { PoolIF, TokenIF, TransactionServerIF } from '../types';
import { FetchContractDetailsFn } from './fetchContractDetails';
import { TokenPriceFn } from './fetchTokenPrice';
import { GcgoProvider } from '../../utils/gcgoProvider';

interface argsIF {
    tokenList: TokenIF[];
    base: string;
    quote: string;
    poolIdx: number;
    chainId: string;
    user: `0x${string}`;
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

export const fetchPoolUserChanges = (args: argsIF) => {
    const {
        tokenList,
        base,
        quote,
        poolIdx,
        chainId,
        user,
        n,
        period,
        time,
        timeBefore,
        crocEnv,
        gcgo,
        provider,
        activePoolList,
        cachedFetchTokenPrice,
        cachedQuerySpotPrice,
        cachedTokenDetails,
    } = args;

    const poolChanges = gcgo
        .userPoolTxs({
            base: base,
            quote: quote,
            poolIdx: poolIdx,
            chainId: chainId,
            user: user,
            count: n,
            period: period,
            time: time,
            timeBefore: timeBefore,
        })
        .then((poolTransactions: TransactionServerIF[]) => {
            if (!poolTransactions) {
                return [];
            }

            return Promise.all(
                poolTransactions.map((tx: TransactionServerIF) => {
                    return getTransactionData(
                        tx,
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
            ).then((updatedTransactions) => {
                return updatedTransactions;
            });
        })
        .catch(console.error);

    return poolChanges;
};
