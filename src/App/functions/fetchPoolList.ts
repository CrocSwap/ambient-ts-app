import { IS_LOCAL_ENV } from '../../constants';
import { memoizeCacheQueryFn } from './memoizePromiseFn';

const poolListEndpoint = 'https://809821320828123.de:5000/pool_list?';
/**
 * Fetches pool list of the given chain from a cache endpoint.
 * @param chainId - The chain ID to fetch pool list for.
 * @param poolIdx - The pool index to fetch pool list for, if specified.
 * @returns A Promise that resolves to an array of pool list, or undefined if the request fails.
 */
export const fetchPoolList = async (chainId: string, poolIdx?: number) => {
    IS_LOCAL_ENV && console.debug('fetching pool list ');
    if (poolIdx !== undefined) {
        return fetch(
            poolListEndpoint +
                new URLSearchParams({
                    chainId: chainId,
                    poolIdx: poolIdx.toString(),
                }),
        )
            .then((response) => response.json())
            .then((json) => {
                return json.data;
            });
    } else {
        return fetch(
            poolListEndpoint +
                new URLSearchParams({
                    chainId: chainId,
                }),
        )
            .then((response) => response.json())
            .then((json) => {
                return json.data;
            });
    }
};
/**
 * Returns a memoized version of fetchPoolList.
 * @returns A memoized version of fetchPoolList function.
 */
export type PoolListFn = (
    chain: string,
    poolIdx: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => Promise<any>;

export function memoizeFetchPoolList(): PoolListFn {
    return memoizeCacheQueryFn(fetchPoolList) as PoolListFn;
}
