import { memoizeCacheQueryFn } from './memoizePromiseFn';

const poolListEndpoint = 'https://809821320828123.de:5000/pool_list?';

export const fetchPoolList = async (chainId: string, poolIdx?: number) => {
    console.log('fetching pool list ');
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

// export { fetchPoolList, getPoolVolume, getPoolTVL, get24hChange, getPoolPriceChange };

export type PoolListFn = (
    chain: string,
    poolIdx: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => Promise<any>;

export function memoizeFetchPoolList(): PoolListFn {
    return memoizeCacheQueryFn(fetchPoolList) as PoolListFn;
}
