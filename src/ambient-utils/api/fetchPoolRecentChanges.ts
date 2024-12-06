import { CrocEnv } from '@crocswap-libs/sdk';
import { Provider } from 'ethers';
import { getTransactionData, SpotPriceFn } from '../dataLayer/functions';
import { TokenIF, TransactionServerIF } from '../types';
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

export const fetchPoolRecentChanges = (args: argsIF) => {
    const {
        tokenList,
        base,
        quote,
        poolIdx,
        chainId,
        n,
        period,
        time,
        timeBefore,
        crocEnv,
        GCGO_URL,
        provider,
        cachedFetchTokenPrice,
        cachedQuerySpotPrice,
        cachedTokenDetails,
        cachedEnsResolve,
    } = args;

    const poolRecentChangesCacheEndpoint = GCGO_URL + '/pool_txs?';

    const poolChanges = fetch(
        period && time
            ? poolRecentChangesCacheEndpoint +
                  new URLSearchParams({
                      base: base.toLowerCase(),
                      quote: quote.toLowerCase(),
                      poolIdx: poolIdx.toString(),
                      chainId: chainId,
                      n: n ? n.toString() : '',
                      period: period.toString(),
                      time: time.toString(),
                  })
            : timeBefore
              ? poolRecentChangesCacheEndpoint +
                new URLSearchParams({
                    base: base.toLowerCase(),
                    quote: quote.toLowerCase(),
                    poolIdx: poolIdx.toString(),
                    chainId: chainId,
                    n: n ? n.toString() : '',
                    timeBefore: timeBefore.toString(),
                })
              : poolRecentChangesCacheEndpoint +
                new URLSearchParams({
                    base: base.toLowerCase(),
                    quote: quote.toLowerCase(),
                    poolIdx: poolIdx.toString(),
                    chainId: chainId,
                    n: n ? n.toString() : '',
                    // positive integer	(Optional.) If n and page are provided, query returns a page of results with at most n entries.
                    // page: page ? page.toString() : '', // nonnegative integer	(Optional.) If n and page are provided, query returns the page-th page of results. Page numbers are 0-indexed.
                }),
    )
        .then((response) => response?.json())
        .then((json) => {
            const poolTransactions = json?.data;

            if (!poolTransactions) {
                return [];
            }

            const skipENSFetch = true;
            return Promise.all(
                poolTransactions.map((tx: TransactionServerIF) => {
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
        })
        .catch(console.error);

    return poolChanges;
};
