import { GRAPHCACHE_URL } from '../../constants';

export const getDexTvlSeries = async (day: string): Promise<ITvlSeriesData> => {
    return fetch(
        GRAPHCACHE_URL +
            '/dex_tvl_series?' +
            new URLSearchParams({
                resolution: '86400',
                n: day,
            }),
    )
        .then((response) => response?.json())
        .then((json) => {
            const tvlSeries = json?.data;
            return tvlSeries;
        })
        .catch(console.error);
};

export const getDexFeeSeries = async () => {
    return fetch(
        GRAPHCACHE_URL +
            '/dex_fee_series?' +
            new URLSearchParams({
                resolution: '86400',
                n: '60',
            }),
    )
        .then((response) => response?.json())
        .then((json) => {
            const feeSeries = json?.data;
            return feeSeries;
        })
        .catch(console.error);
};

export const getDexVolumeSeries = async (
    day: string,
): Promise<IVolumeSeriesData> => {
    return fetch(
        GRAPHCACHE_URL +
            '/dex_volume_series?' +
            new URLSearchParams({
                resolution: '86400',
                n: day,
            }),
    )
        .then((response) => response?.json())
        .then((json) => {
            const volumeSeries = json?.data;
            return volumeSeries;
        })
        .catch(console.error);
};

export type pool = {
    base: string;
    baseDecimals: number;
    baseSymbol: string;
    blockFirstMint: number;
    curveStorageSlot: string;
    id: string;
    network: string;
    poolHash: string;
    poolIdx: number;
    quote: string;
    quoteDecimals: number;
    quoteSymbol: string;
    timeFirstMint: number;
};

export type seriesDatum = {
    max: number;
    mean: number;
    median: number;
    min: number;
    numPools: number;
    time: number;
    total: number;
};

export type IVolumeSeriesData = {
    n: number;
    poolIdx: number;
    pools: pool[];
    resolution: number;
    series: seriesDatum[];
    timeEnd: number;
    timeStart: number;
};

export type ITvlSeriesData = {
    n: number;
    poolIdx: number;
    pools: pool[];
    resolution: number;
    series: seriesDatum[];
    timeEnd: number;
    timeStart: number;
};
