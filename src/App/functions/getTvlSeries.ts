import { TvlSeriesByPoolTimeAndResolution } from '../../utils/state/graphDataSlice';

export const getTvlSeries = async (
    base: string,
    quote: string,
    poolIdx: number,
    chainId: string,
    resolution: number,
): Promise<TvlSeriesByPoolTimeAndResolution | undefined> => {
    const httpGraphCacheServerDomain = 'https://809821320828123.de:5000';

    const poolTvlSeriesCacheEndpoint = httpGraphCacheServerDomain + '/pool_tvl_series?';
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
            // return undefined;
        });
};
