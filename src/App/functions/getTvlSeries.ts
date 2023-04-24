import { TvlSeriesByPoolTimeAndResolution } from '../../utils/state/graphDataSlice';
/**
 * Retrieve the TVL (Total Value Locked) series for a given pool.
 * @param base - The base asset symbol (e.g. ETH)
 * @param quote - The quote asset symbol (e.g. USDC)
 * @param poolIdx - The pool index
 * @param chainId - The chain ID (e.g. 1 for Ethereum mainnet)
 * @param resolution - The time resolution in seconds (e.g. 86400 for daily)
 * @returns A promise that resolves to the TVL series or undefined if the request fails
 */
export const getTvlSeries = async (
    base: string,
    quote: string,
    poolIdx: number,
    chainId: string,
    resolution: number,
): Promise<TvlSeriesByPoolTimeAndResolution | undefined> => {
    const httpGraphCacheServerDomain = 'https://809821320828123.de:5000';

    const poolTvlSeriesCacheEndpoint =
        httpGraphCacheServerDomain + '/pool_tvl_series?';
    return fetch(
        poolTvlSeriesCacheEndpoint +
            new URLSearchParams({
                base: base,
                quote: quote,
                poolIdx: poolIdx.toString(),
                chainId: chainId,
                resolution: resolution.toString(),
            }),
    )
        .then((response) => response?.json())
        .then((json) => {
            const poolTvl = json?.data;

            return poolTvl;
        })
        .catch(() => {
            // TODO (#1571) we should handle this exception
        });
};
