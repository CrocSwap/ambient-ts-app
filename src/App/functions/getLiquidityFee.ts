export const getLiquidityFee = async (
    base: string,
    quote: string,
    poolIdx: number,
    chainId: string,
): Promise<number | undefined> => {
    const httpGraphCacheServerDomain = 'https://809821320828123.de:5000';

    const liquidityFeeCacheEndpoint = httpGraphCacheServerDomain + '/pool_liquidity_fee?';
    return fetch(
        liquidityFeeCacheEndpoint +
            new URLSearchParams({
                base: base,
                quote: quote,
                poolIdx: poolIdx.toString(),
                chainId: chainId,
            }),
    )
        .then((response) => response?.json())
        .then((json) => {
            const liquidityFee = json?.data?.liquidityFee;

            return liquidityFee;
        })
        .catch(() => {
            return undefined;
        });
};
