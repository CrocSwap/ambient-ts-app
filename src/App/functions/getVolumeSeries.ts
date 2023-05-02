import { GRAPHCACHE_URL } from '../../constants';
import { VolumeSeriesByPoolTimeAndResolution } from '../../utils/state/graphDataSlice';

export const getVolumeSeries = async (
    base: string,
    quote: string,
    poolIdx: number,
    chainId: string,
    resolution: number,
): Promise<VolumeSeriesByPoolTimeAndResolution | undefined> => {
    const httpGraphCacheServerDomain = GRAPHCACHE_URL;

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
