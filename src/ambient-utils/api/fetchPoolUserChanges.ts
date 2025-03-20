import { CrocEnv } from '@crocswap-libs/sdk';
import { Provider } from 'ethers';
import { getTransactionData, SpotPriceFn } from '../dataLayer/functions';
import { PoolIF, TokenIF, TransactionServerIF } from '../types';
import { FetchContractDetailsFn } from './fetchContractDetails';
import { TokenPriceFn } from './fetchTokenPrice';

interface argsIF {
    tokenList: TokenIF[];
    base: string;
    quote: string;
    poolIdx: number;
    chainId: string;
    user: `0x${string}`;
    n?: number;
    page?: number;
    period?: number;
    time?: number;
    timeBefore?: number;
    crocEnv: CrocEnv;
    GCGO_URL: string;
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
        GCGO_URL,
        provider,
        activePoolList,
        cachedFetchTokenPrice,
        cachedQuerySpotPrice,
        cachedTokenDetails,
    } = args;

    const poolRecentChangesCacheEndpoint = GCGO_URL + '/user_pool_txs?';

    const poolChanges = fetch(
        period && time
            ? poolRecentChangesCacheEndpoint +
                  new URLSearchParams({
                      base: base.toLowerCase(),
                      quote: quote.toLowerCase(),
                      poolIdx: poolIdx.toString(),
                      chainId: chainId.toLowerCase(),
                      user: user.toLowerCase(),
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
                    chainId: chainId.toLowerCase(),
                    user: user.toLowerCase(),
                    n: n ? n.toString() : '',
                    timeBefore: timeBefore.toString(),
                })
              : poolRecentChangesCacheEndpoint +
                new URLSearchParams({
                    base: base.toLowerCase(),
                    quote: quote.toLowerCase(),
                    poolIdx: poolIdx.toString(),
                    chainId: chainId.toLowerCase(),
                    user: user.toLowerCase(),
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
