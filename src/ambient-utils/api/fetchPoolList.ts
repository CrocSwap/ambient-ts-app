import { ANALYTICS_URL } from '../constants';
import { memoizeCacheQueryFn } from '../dataLayer';
import { AnalyticsServerPoolIF } from '../types';

export async function fetchPoolList(
    chainId: string,
): Promise<AnalyticsServerPoolIF[]> {
    const ENDPOINT: string =
        ANALYTICS_URL + 'service=run&config_path=all_pool_stats&';

    return fetch(
        ENDPOINT +
            new URLSearchParams({
                chainId: chainId,
            }),
    )
        .then((response) => response.json())
        .then((json) => {
            if (!json?.data) {
                return [];
            }
            const payload = json?.data as AnalyticsServerPoolIF[];
            return payload;
        });
}

export type PoolListFn = (chainId: string) => Promise<AnalyticsServerPoolIF[]>;

export const POOL_LIST_WINDOW_GRANULARITY = 15 * 1000; // 15 seconds

export function memoizeFetchPoolList(): PoolListFn {
    const memoFn = memoizeCacheQueryFn(fetchPoolList);
    return (chainId) =>
        memoFn(chainId, Math.floor(Date.now() / POOL_LIST_WINDOW_GRANULARITY));
}
