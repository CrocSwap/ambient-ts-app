import { IS_LOCAL_ENV } from '../../constants';
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
/**

Fetches recent changes to a liquidity pool from a cache endpoint.
@param args - An object containing various parameters for fetching pool changes.
@returns A Promise that resolves to an array of updated transaction data, or an error if the request fails.
@interface argsIF - An interface containing properties for the args parameter.
@property {TokenIF[]} tokenList - A list of tokens involved in the pool.
@property {string} base - The base token symbol in the pool.
@property {string} quote - The quote token symbol in the pool.
@property {number} poolIdx - The index of the pool to fetch changes for.
@property {string} chainId - The ID of the chain to fetch changes for.
@property {boolean} annotate - Flag to annotate transaction data with additional information.
@property {boolean} addValue - Flag to add a value property to the transaction data.
@property {boolean} simpleCalc - Flag to use simple calculations for token prices.
@property {boolean} annotateMEV - Flag to annotate transaction data with MEV information.
@property {boolean} ensResolution - Flag to resolve addresses using ENS.
@property {number} [n] - Optional parameter for specifying a limit on the number of results.
@property {number} [page] - Optional parameter for specifying a page number of results.
@property {number} [period] - Optional parameter for specifying a time period for the query.
@property {number} [time] - Optional parameter for specifying a time range for the query.
*/
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
        'https://809821320828123.de:5000' + '/pool_recent_changes?';

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
