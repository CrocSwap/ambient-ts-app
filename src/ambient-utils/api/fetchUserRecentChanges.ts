import { CrocEnv } from '@crocswap-libs/sdk';
import { Provider } from 'ethers';
import { getTransactionData, SpotPriceFn } from '../dataLayer/functions';
import { PoolIF, TokenIF, TransactionIF, TransactionServerIF } from '../types';
import { FetchContractDetailsFn } from './fetchContractDetails';
import { TokenPriceFn } from './fetchTokenPrice';
import { GcgoProvider } from '../../utils/gcgoProvider';

interface argsIF {
    tokenList: TokenIF[];

    user: string;
    chainId: string;
    n: number;
    crocEnv: CrocEnv;
    gcgo: GcgoProvider;
    provider: Provider;
    activePoolList: PoolIF[] | undefined;
    cachedFetchTokenPrice: TokenPriceFn;
    cachedQuerySpotPrice: SpotPriceFn;
    cachedTokenDetails: FetchContractDetailsFn;
    timeBefore?: number;
}

export const fetchUserRecentChanges = (args: argsIF) => {
    const {
        tokenList,
        user,
        chainId,
        n,
        crocEnv,
        gcgo,
        provider,
        activePoolList,
        cachedFetchTokenPrice,
        cachedQuerySpotPrice,
        cachedTokenDetails,
        timeBefore,
    } = args;

    const poolChanges = gcgo
        .userTxs({
            user: user,
            chainId: chainId,
            timeBefore: timeBefore,
            count: n,
        })
        .then((userTransactions: TransactionServerIF[]) => {
            if (!userTransactions) {
                return [] as TransactionIF[];
            }

            return Promise.allSettled(
                userTransactions.map((tx: TransactionServerIF) =>
                    getTransactionData(
                        tx,
                        tokenList,
                        crocEnv,
                        provider,
                        chainId,
                        activePoolList,
                        cachedFetchTokenPrice,
                        cachedQuerySpotPrice,
                        cachedTokenDetails,
                    ),
                ),
            ).then((results) => {
                // Extract successful results
                const successfulTransactions = results
                    .filter(
                        (
                            result,
                        ): result is PromiseFulfilledResult<TransactionIF> =>
                            result.status === 'fulfilled',
                    )
                    .map((result) => result.value);

                // Log errors if needed
                results.forEach((result) => {
                    if (result.status === 'rejected') {
                        console.warn(
                            'Error processing transaction:',
                            result.reason,
                        );
                    }
                });

                return successfulTransactions;
            });
        })
        .catch(console.error);

    return poolChanges;
};
