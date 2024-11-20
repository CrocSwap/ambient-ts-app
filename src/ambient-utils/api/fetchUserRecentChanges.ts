import { CrocEnv } from '@crocswap-libs/sdk';
import { GCGO_OVERRIDE_URL } from '../constants';
import { TokenIF, TransactionIF } from '../types';
import { FetchAddrFn } from './fetchAddress';
import { FetchContractDetailsFn } from './fetchContractDetails';
import { TokenPriceFn } from './fetchTokenPrice';
import { getTransactionData, SpotPriceFn } from '../dataLayer/functions';
import { Provider } from 'ethers';

interface argsIF {
    tokenList: TokenIF[];

    user: string;
    chainId: string;
    n?: number;
    page?: number;
    crocEnv: CrocEnv;
    graphCacheUrl: string;
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
        graphCacheUrl,
        provider,
        cachedFetchTokenPrice,
        cachedQuerySpotPrice,
        cachedTokenDetails,
        cachedEnsResolve,
        timeBefore,
    } = args;

    const userRecentChangesCacheEndpoint = GCGO_OVERRIDE_URL
        ? GCGO_OVERRIDE_URL + '/user_txs?'
        : graphCacheUrl + '/user_txs?';

    const poolChanges = fetch(
        timeBefore
            ? userRecentChangesCacheEndpoint +
                  new URLSearchParams({
                      user: user,
                      chainId: chainId,
                      timeBefore: timeBefore.toString(),
                      n: n ? n.toString() : '', // positive integer	(Optional.) If n and page are provided, query returns a page of results with at most n entries.
                      // page: page ? page.toString() : '', // nonnegative integer	(Optional.) If n and page are provided, query returns the page-th page of results. Page numbers are 0-indexed.
                  })
            : userRecentChangesCacheEndpoint +
                  new URLSearchParams({
                      user: user,
                      chainId: chainId,
                      n: n ? n.toString() : '', // positive integer	(Optional.) If n and page are provided, query returns a page of results with at most n entries.
                      // page: page ? page.toString() : '', // nonnegative integer	(Optional.) If n and page are provided, query returns the page-th page of results. Page numbers are 0-indexed.
                  }),
    )
        .then((response) => response?.json())
        .then((json) => {
            const userTransactions = json?.data;

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
