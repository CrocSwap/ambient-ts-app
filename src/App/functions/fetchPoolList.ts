import { CrocEnv } from '@crocswap-libs/sdk';
import { GRAPHCACHE_SMALL_URL, IS_LOCAL_ENV } from '../../constants';
import { TempPoolServerIF, TokenIF } from '../../utils/interfaces/exports';
import { memoizeCacheQueryFn } from './memoizePromiseFn';

export async function fetchPoolList(
    crocEnv: CrocEnv,
    tokenUniv: TokenIF[],
): Promise<TempPoolServerIF[]> {
    const ENDPOINT: string =
        GRAPHCACHE_SMALL_URL +
        '/pool_list?' +
        new URLSearchParams({
            chainId: (await crocEnv.context).chain.chainId,
            poolIdx: (await crocEnv.context).chain.poolIndex.toString(),
        });
    return fetch(ENDPOINT)
        .then((response) => response.json())
        .then((json) => {
            if (!json?.data) {
                return [];
            }
            let payload = json?.data as TempPoolServerIF[];
            payload = payload.filter((p) => inTokenUniv(p, tokenUniv));
            // TODO:    this is a `Promise.allSettled()` because one bad call for
            // TODO:    ... a contract with no `symbol()` method was failing and
            // TODO:    ... taking everything down, instructions from Doug are to
            // TODO:    ... drop the bad result and investigate more later
            const pools: Promise<TempPoolServerIF[]> = Promise.allSettled(
                payload,
            ).then((results) => {
                function getFulfilledValues<T>(
                    promises: PromiseSettledResult<T>[],
                ): T[] {
                    // output variable for values from fulfilled promises
                    const fulfilledValues: T[] = [];
                    // array to hold rejected promises for troubleshooting
                    const rejectedPromises: PromiseRejectedResult[] = [];
                    // iterate over promises, push to each to the correct array
                    for (const result of promises) {
                        result.status === 'fulfilled'
                            ? fulfilledValues.push(result.value)
                            : rejectedPromises.push(result);
                    }
                    // warn about rejected promises in the console (localhost only)
                    IS_LOCAL_ENV &&
                        rejectedPromises.forEach(
                            (reject: PromiseRejectedResult) => {
                                console.warn(
                                    'failed pool metadata query, see file fetchPoolList.ts to troubleshoot',
                                    reject,
                                );
                            },
                        );
                    // return array of values from fulfilled promises
                    return fulfilledValues;
                }
                return getFulfilledValues(results);
            });
            return pools;
        });
}

function inTokenUniv(payload: TempPoolServerIF, tokenUniv: TokenIF[]): boolean {
    const hasBase = tokenUniv.some(
        (t) => t.address.toLowerCase() === payload.base.toLowerCase(),
    );
    const hasQuote = tokenUniv.some(
        (t) => t.address.toLowerCase() === payload.quote.toLowerCase(),
    );
    return hasBase && hasQuote;
}

export type PoolListFn = (
    chain: string,
    poolIdx: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => Promise<any>;

export function memoizeFetchPoolList(): PoolListFn {
    return memoizeCacheQueryFn(fetchPoolList) as PoolListFn;
}
