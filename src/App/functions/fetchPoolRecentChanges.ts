import { GRAPHCACHE_URL, IS_LOCAL_ENV } from '../../constants';
import { TokenIF, TransactionIF } from '../../utils/interfaces/exports';
import { getTransactionData } from './getTransactionData';

interface argsIF {
    tokenList: TokenIF[];
    base: string;
    quote: string;
    poolIdx: number;
    chainId: string;
    annotate: boolean;
    addValue: boolean;
    simpleCalc: boolean;
    annotateMEV: boolean;
    ensResolution: boolean;
    n?: number;
    page?: number;
    period?: number;
    time?: number;
}

export const fetchPoolRecentChanges = (args: argsIF) => {
    const {
        tokenList,
        base,
        quote,
        poolIdx,
        chainId,
        annotate,
        addValue,
        simpleCalc,
        annotateMEV,
        ensResolution,
        n,
        period,
        time,
    } = args;

    const poolRecentChangesCacheEndpoint =
        GRAPHCACHE_URL + '/pool_recent_changes?';

    IS_LOCAL_ENV && console.debug('fetching pool recent changes');

    const poolChanges = fetch(
        period && time
            ? poolRecentChangesCacheEndpoint +
                  new URLSearchParams({
                      base: base.toLowerCase(),
                      quote: quote.toLowerCase(),
                      poolIdx: poolIdx.toString(),
                      chainId: chainId,
                      annotate: annotate.toString(),
                      addValue: addValue.toString(),
                      simpleCalc: simpleCalc.toString(),
                      annotateMEV: annotateMEV.toString(),
                      ensResolution: ensResolution.toString(),
                      n: n ? n.toString() : '',
                      period: period.toString(),
                      time: time.toString(),
                  })
            : poolRecentChangesCacheEndpoint +
                  new URLSearchParams({
                      base: base.toLowerCase(),
                      quote: quote.toLowerCase(),
                      poolIdx: poolIdx.toString(),
                      chainId: chainId,
                      annotate: annotate.toString(),
                      addValue: addValue.toString(),
                      simpleCalc: simpleCalc.toString(),
                      annotateMEV: annotateMEV.toString(),
                      ensResolution: ensResolution.toString(),
                      n: n ? n.toString() : '',
                      // positive integer	(Optional.) If n and page are provided, query returns a page of results with at most n entries.
                      // page: page ? page.toString() : '', // nonnegative integer	(Optional.) If n and page are provided, query returns the page-th page of results. Page numbers are 0-indexed.
                  }),
    )
        .then((response) => response?.json())
        .then((json) => {
            const userTransactions = json?.data;

            const updatedTransactions = Promise.all(
                userTransactions.map((tx: TransactionIF) => {
                    return getTransactionData(tx, tokenList);
                }),
            ).then((updatedTransactions) => {
                return updatedTransactions;
            });
            return updatedTransactions;
        })
        .catch(console.error);

    return poolChanges;
};
