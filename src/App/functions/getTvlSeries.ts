import { GRAPHCACHE_URL } from '../../constants';
import { TvlSeriesByPoolTimeAndResolution } from '../../utils/state/graphDataSlice';

export const getTvlSeries = async (
    base: string,
    quote: string,
    poolIdx: number,
    chainId: string,
    resolution: number,
): Promise<TvlSeriesByPoolTimeAndResolution | undefined> => {
    const httpGraphCacheServerDomain = GRAPHCACHE_URL;

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
