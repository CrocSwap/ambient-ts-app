const getPoolVolume = async (tokenA: string, tokenB: string, poolIdx: number): Promise<number> => {
    if (tokenA && tokenB && poolIdx) {
        return 1000000000 * Math.random();
    } else {
        return 0;
    }
};

const poolTvlCacheEndpoint = 'https://809821320828123.de:5000/pool_tvl?';

const getPoolTVL = async (tokenA: string, tokenB: string, poolIdx: number): Promise<number> => {
    if (tokenA && tokenB && poolIdx) {
        const tvl = fetch(
            poolTvlCacheEndpoint +
                new URLSearchParams({
                    chainId: '0x5',
                    base: tokenA,
                    quote: tokenB,
                    poolIdx: '36000',
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

const get24hChange = async (
    chainId: string,
    tokenA: string,
    tokenB: string,
    poolIdx: number,
    denomInBase: boolean,
): Promise<number> => {
    if (tokenA && tokenB && poolIdx) {
        const changePercentage = fetch(
            poolPriceChangeCacheEndpoint +
                new URLSearchParams({
                    chainId: chainId,
                    base: tokenA,
                    quote: tokenB,
                    poolIdx: poolIdx.toString(),
                }),
        )
            .then((response) => response.json())
            .then((json) => {
                if (denomInBase) return json?.data?.changeBaseOverQuote;
                return json?.data?.changeQuoteOverBase;
            });
        return changePercentage;
    } else {
        return 0;
    }
};

export { getPoolVolume, getPoolTVL, get24hChange };
