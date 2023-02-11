import { memoizeCacheQueryFn } from './memoizePromiseFn';

const poolStatsFreshEndpoint = 'https://809821320828123.de:5000/pool_stats_fresh?';

const getPoolStatsFresh = async (chainId: string, base: string, quote: string, poolIdx: number) => {
    console.log('fetching fresh pool stats ');
    return fetch(
        poolStatsFreshEndpoint +
            new URLSearchParams({
                chainId: chainId,
                base: base,
                quote: quote,
                poolIdx: poolIdx.toString(),
                addTotalVolume: 'true',
                concise: 'true',
            }),
    )
        .then((response) => response.json())
        .then((json) => {
            return json.data;
        });
};

const poolVolumeCacheEndpoint = 'https://809821320828123.de:5000/pool_volume?';

const getPoolVolume = async (
    tokenA: string,
    tokenB: string,
    poolIdx: number,
    chainId: string,
): Promise<number> => {
    if (tokenA && tokenB && poolIdx) {
        const totalVolumeUSD = fetch(
            poolVolumeCacheEndpoint +
                new URLSearchParams({
                    chainId: chainId,
                    base: tokenA,
                    quote: tokenB,
                    poolIdx: poolIdx.toString(),
                    concise: 'true',
                }),
        )
            .then((response) => response.json())
            .then((json) => {
                return json?.data?.totalVolumeUSD;
            });
        return totalVolumeUSD;
    } else {
        return 0;
    }
};

const poolTvlCacheEndpoint = 'https://809821320828123.de:5000/pool_tvl?';

const getPoolTVL = async (
    tokenA: string,
    tokenB: string,
    poolIdx: number,
    chainId: string,
): Promise<number> => {
    if (tokenA && tokenB && poolIdx) {
        const tvl = fetch(
            poolTvlCacheEndpoint +
                new URLSearchParams({
                    chainId: chainId,
                    base: tokenA,
                    quote: tokenB,
                    poolIdx: poolIdx.toString(),
                    concise: 'true',
                }),
        )
            .then((response) => response.json())
            .then((json) => {
                return json?.data?.tvl;
            });
        return tvl;
    } else {
        return 0;
    }
};

const poolPriceChangeCacheEndpoint = 'https://809821320828123.de:5000/pool_price_change?';

const getPoolPriceChange = async (
    chainId: string,
    baseToken: string,
    quoteToken: string,
    poolIdx: number,
) => {
    return fetch(
        poolPriceChangeCacheEndpoint +
            new URLSearchParams({
                chainId: chainId,
                base: baseToken,
                quote: quoteToken,
                poolIdx: poolIdx.toString(),
                concise: 'true',
            }),
    )
        .then((response) => response.json())
        .then((json) => {
            return json.data;
        });
};

const get24hChange = async (
    chainId: string,
    baseToken: string,
    quoteToken: string,
    poolIdx: number,
    denomInBase: boolean,
): Promise<number> => {
    if (baseToken && quoteToken && poolIdx) {
        const changePercentage = fetch(
            poolPriceChangeCacheEndpoint +
                new URLSearchParams({
                    chainId: chainId,
                    base: baseToken,
                    quote: quoteToken,
                    poolIdx: poolIdx.toString(),
                    concise: 'true',
                }),
        )
            .then((response) => response.json())
            .then((json) => {
                if (denomInBase) return json?.data?.changeQuoteOverBase;
                return json?.data?.changeBaseOverQuote;
            });
        return changePercentage;
    } else {
        return 0;
    }
};

export { getPoolStatsFresh, getPoolVolume, getPoolTVL, get24hChange, getPoolPriceChange };

export type PoolStatsFn = (
    chain: string,
    baseToken: string,
    quoteToken: string,
    poolIdx: number,
    blockNum: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => Promise<any>;

export function memoizePoolStats(): PoolStatsFn {
    return memoizeCacheQueryFn(getPoolStatsFresh) as PoolStatsFn;
}
