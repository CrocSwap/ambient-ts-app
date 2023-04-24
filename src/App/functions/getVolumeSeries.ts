import { VolumeSeriesByPoolTimeAndResolution } from '../../utils/state/graphDataSlice';
/**
 * Fetches volume series data for a specific pool, given the base token, quote token,
 * pool index, chain ID, and resolution.
 *
 * @param base - The base token symbol.
 * @param quote - The quote token symbol.
 * @param poolIdx - The index of the pool.
 * @param chainId - The ID of the chain.
 * @param resolution - The resolution of the volume series data.
 *
 * @returns A Promise that resolves to the volume series data for the pool, or undefined if the request fails.
 */
export const getVolumeSeries = async (
    base: string,
    quote: string,
    poolIdx: number,
    chainId: string,
    resolution: number,
): Promise<VolumeSeriesByPoolTimeAndResolution | undefined> => {
    const httpGraphCacheServerDomain = 'https://809821320828123.de:5000';

    const poolVolumeSeriesCacheEndpoint =
        httpGraphCacheServerDomain + '/pool_volume_series?';
    return fetch(
        poolVolumeSeriesCacheEndpoint +
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
            const poolLiquidity = json?.data;

            return poolLiquidity;
        })
        .catch(() => {
            // TODO (#1571) we should handle this exception
        });
};
