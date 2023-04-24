import { IS_LOCAL_ENV } from '../../constants';
import { memoizeCacheQueryFn } from './memoizePromiseFn';

const poolLiquidityCacheEndpoint =
    'https://809821320828123.de:5000/pool_liquidity_distribution?';
/**
 * Fetches the liquidity information for a given pool.
 * @param chainId The chain ID where the pool resides.
 * @param base The address of the base token in the pool.
 * @param quote The address of the quote token in the pool.
 * @param poolIdx The index of the pool in the list of all pools.
 * @returns A Promise that resolves to the pool liquidity data.
 */

const getPoolLiquidity = async (
    chainId: string,
    base: string,
    quote: string,
    poolIdx: number,
) => {
    IS_LOCAL_ENV && console.debug('fetching pool liquidity ');
    return fetch(
        poolLiquidityCacheEndpoint +
            new URLSearchParams({
                chainId: chainId,
                base: base,
                quote: quote,
                poolIdx: poolIdx.toString(),
                concise: 'true',
                latestTick: 'true',
            }),
    )
        .then((response) => response.json())
        .then((json) => {
            return json.data;
        });
};
/**
 * Type definition for the pool liquidity function.
 * @param chain The chain ID where the pool resides.
 * @param baseToken The address of the base token in the pool.
 * @param quoteToken The address of the quote token in the pool.
 * @param poolIdx The index of the pool in the list of all pools.
 * @param blockNum The block number at which to fetch the data.
 * @returns A Promise that resolves to the pool liquidity data.
 */
export type PoolLiquidityFn = (
    chain: string,
    baseToken: string,
    quoteToken: string,
    poolIdx: number,
    blockNum: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => Promise<any>;
/**
 * Memoizes the pool liquidity function to cache its results and avoid unnecessary API calls.
 * @returns A memoized version of the pool liquidity function.
 */
export function memoizePoolLiquidity(): PoolLiquidityFn {
    return memoizeCacheQueryFn(getPoolLiquidity) as PoolLiquidityFn;
}
