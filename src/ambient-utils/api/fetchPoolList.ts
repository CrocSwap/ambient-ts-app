import { ANALYTICS_URL } from '../constants';
import { memoizeCacheQueryFn } from '../dataLayer';
import { GCServerPoolIF } from '../types';

export async function fetchPoolList(): Promise<GCServerPoolIF[]> {
    const ENDPOINT: string =
        ANALYTICS_URL + 'service=run&config_path=all_pool_stats';
    return fetch(ENDPOINT)
        .then((response) => response.json())
        .then((json) => {
            if (!json?.data) {
                return [];
            }
            const payload = json?.data as GCServerPoolIF[];
            return payload;
        });
}

export type PoolListFn = () => Promise<GCServerPoolIF[]>;

export const POOL_LIST_WINDOW_GRANULARITY = 5 * 60 * 1000; // 5 minutes

export function memoizeFetchPoolList(): PoolListFn {
    const memoFn = memoizeCacheQueryFn(fetchPoolList);
    return () => memoFn(Math.floor(Date.now() / POOL_LIST_WINDOW_GRANULARITY));
}
