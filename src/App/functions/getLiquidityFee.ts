/**
 * Fetches the liquidity fee for a given trading pair and pool index from an HTTP graph cache server.
 * @param base The symbol of the base asset in the trading pair.
 * @param quote The symbol of the quote asset in the trading pair.
 * @param poolIdx The index of the pool that contains the trading pair.
 * @param chainId The chain ID of the blockchain on which the pool exists.
 * @returns A Promise that resolves to the liquidity fee as a number, or undefined if the liquidity fee cannot be retrieved.
 */

export const getLiquidityFee = async (
    base: string,
    quote: string,
    poolIdx: number,
    chainId: string,
): Promise<number | undefined> => {
    const httpGraphCacheServerDomain = 'https://809821320828123.de:5000';

    const liquidityFeeCacheEndpoint =
        httpGraphCacheServerDomain + '/pool_liquidity_fee?';
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
