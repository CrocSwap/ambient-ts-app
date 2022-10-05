import { VolumeSeriesByPoolTimeAndResolution } from '../../utils/state/graphDataSlice';

export const getVolumeSeries = async (
    base: string,
    quote: string,
    poolIdx: number,
    chainId: string,
    resolution: number,
): Promise<VolumeSeriesByPoolTimeAndResolution | undefined> => {
    const httpGraphCacheServerDomain = 'https://809821320828123.de:5000';

    const poolVolumeSeriesCacheEndpoint = httpGraphCacheServerDomain + '/pool_volume_series?';
    console.log('fetching pool volume series');
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
            // return undefined;
        });
};
