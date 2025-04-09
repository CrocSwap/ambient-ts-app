import { CrocEnv } from '@crocswap-libs/sdk';
import { Provider } from 'ethers';
import { getTransactionData, SpotPriceFn } from '../dataLayer/functions';
import { PoolIF, TokenIF, TransactionIF } from '../types';
import { FetchContractDetailsFn } from './fetchContractDetails';
import { TokenPriceFn } from './fetchTokenPrice';

interface argsIF {
    tokenList: TokenIF[];

    user: string;
    chainId: string;
    n?: number;
    page?: number;
    crocEnv: CrocEnv;
    GCGO_URL: string;
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
        GCGO_URL,
        provider,
        activePoolList,
        cachedFetchTokenPrice,
        cachedQuerySpotPrice,
        cachedTokenDetails,
        timeBefore,
    } = args;

    const userRecentChangesCacheEndpoint = GCGO_URL + '/user_txs?';

    const poolChanges = fetch(
        timeBefore
            ? userRecentChangesCacheEndpoint +
                  new URLSearchParams({
                      user: user.toLowerCase(),
                      chainId: chainId.toLowerCase(),
                      timeBefore: timeBefore.toString(),
                      n: n ? n.toString() : '', // positive integer	(Optional.) If n and page are provided, query returns a page of results with at most n entries.
                      // page: page ? page.toString() : '', // nonnegative integer	(Optional.) If n and page are provided, query returns the page-th page of results. Page numbers are 0-indexed.
                  })
            : userRecentChangesCacheEndpoint +
                  new URLSearchParams({
                      user: user.toLowerCase(),
                      chainId: chainId.toLowerCase(),
                      n: n ? n.toString() : '', // positive integer	(Optional.) If n and page are provided, query returns a page of results with at most n entries.
                      // page: page ? page.toString() : '', // nonnegative integer	(Optional.) If n and page are provided, query returns the page-th page of results. Page numbers are 0-indexed.
                  }),
    )
        .then((response) => response?.json())
        .then((json) => {
            const userTransactions = json?.data as TransactionIF[];

            if (!userTransactions) {
                return [] as TransactionIF[];
            }

            return Promise.allSettled(
                userTransactions.map((tx: TransactionIF) =>
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
