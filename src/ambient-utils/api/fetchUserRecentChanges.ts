import { CrocEnv } from '@crocswap-libs/sdk';
import { Provider } from 'ethers';
import { getTransactionData, SpotPriceFn } from '../dataLayer/functions';
import { TokenIF, TransactionIF } from '../types';
import { FetchAddrFn } from './fetchAddress';
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
    cachedFetchTokenPrice: TokenPriceFn;
    cachedQuerySpotPrice: SpotPriceFn;
    cachedTokenDetails: FetchContractDetailsFn;
    cachedEnsResolve: FetchAddrFn;
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
        cachedFetchTokenPrice,
        cachedQuerySpotPrice,
        cachedTokenDetails,
        cachedEnsResolve,
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

            const skipENSFetch = true;
            const updatedTransactions = Promise.all(
                userTransactions.map((tx: TransactionIF) => {
                    return getTransactionData(
                        tx,
                        tokenList,
                        crocEnv,
                        provider,
                        chainId,
                        cachedFetchTokenPrice,
                        cachedQuerySpotPrice,
                        cachedTokenDetails,
                        cachedEnsResolve,
                        skipENSFetch,
                    );
                }),
            ).then((updatedTransactions) => {
                return updatedTransactions;
            });
            return updatedTransactions;
        })
        .catch(console.error);

    return poolChanges;
};
