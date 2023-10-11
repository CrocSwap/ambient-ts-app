import { CrocEnv } from '@crocswap-libs/sdk';
import { GRAPHCACHE_SMALL_URL, IS_LOCAL_ENV } from '../../constants';
import { TokenIF, TransactionIF } from '../../utils/interfaces/exports';
import { FetchAddrFn } from './fetchAddress';
import { FetchContractDetailsFn } from './fetchContractDetails';
import { TokenPriceFn } from './fetchTokenPrice';
import { getTransactionData } from './getTransactionData';
import { SpotPriceFn } from './querySpotPrice';
import { Provider } from '@ethersproject/providers';

interface argsIF {
    tokenList: TokenIF[];

    user: string;
    chainId: string;
    annotate: boolean;
    addValue: boolean;
    simpleCalc: boolean;
    annotateMEV: boolean;
    ensResolution: boolean;
    n?: number;
    page?: number;
    crocEnv: CrocEnv;
    provider: Provider;
    mainnetProvider: Provider;
    lastBlockNumber: number;
    cachedFetchTokenPrice: TokenPriceFn;
    cachedQuerySpotPrice: SpotPriceFn;
    cachedTokenDetails: FetchContractDetailsFn;
    cachedEnsResolve: FetchAddrFn;
}

export const fetchUserRecentChanges = (args: argsIF) => {
    const {
        tokenList,
        user,
        chainId,
        annotate,
        addValue,
        simpleCalc,
        annotateMEV,
        ensResolution,
        n,
        crocEnv,
        provider,
        mainnetProvider,
        lastBlockNumber,
        cachedFetchTokenPrice,
        cachedQuerySpotPrice,
        cachedTokenDetails,
        cachedEnsResolve,
    } = args;

    const userRecentChangesCacheEndpoint = GRAPHCACHE_SMALL_URL + '/user_txs?';

    IS_LOCAL_ENV && console.debug('fetching user recent changes');

    const poolChanges = fetch(
        userRecentChangesCacheEndpoint +
            new URLSearchParams({
                user: user,
                chainId: chainId,
                annotate: annotate.toString(),
                addValue: addValue.toString(),
                simpleCalc: simpleCalc.toString(),
                annotateMEV: annotateMEV.toString(),
                ensResolution: ensResolution.toString(),
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

            const updatedTransactions = Promise.all(
                userTransactions.map((tx: TransactionIF) => {
                    return getTransactionData(
                        tx,
                        tokenList,
                        crocEnv,
                        provider,
                        mainnetProvider,
                        chainId,
                        lastBlockNumber,
                        cachedFetchTokenPrice,
                        cachedQuerySpotPrice,
                        cachedTokenDetails,
                        cachedEnsResolve,
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
