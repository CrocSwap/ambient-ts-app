import { GRAPHCACHE_URL, IS_LOCAL_ENV } from '../../constants';
import { memoizeCacheQueryFn } from './memoizePromiseFn';

export const poolLiquidityCacheEndpoint =
    GRAPHCACHE_URL + '/pool_liquidity_distribution?';

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

export type PoolLiquidityFn = (
    chain: string,
    baseToken: string,
    quoteToken: string,
    poolIdx: number,
    blockNum: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => Promise<any>;

export function memoizePoolLiquidity(): PoolLiquidityFn {
    return memoizeCacheQueryFn(getPoolLiquidity) as PoolLiquidityFn;
}
