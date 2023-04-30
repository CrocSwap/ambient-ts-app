import { GRAPHCACHE_URL, IS_LOCAL_ENV } from '../../constants';
import { memoizeCacheQueryFn } from './memoizePromiseFn';

const poolListEndpoint = GRAPHCACHE_URL + 'pool_list?';

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

export type PoolListFn = (
    chain: string,
    poolIdx: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => Promise<any>;

export function memoizeFetchPoolList(): PoolListFn {
    return memoizeCacheQueryFn(fetchPoolList) as PoolListFn;
}
