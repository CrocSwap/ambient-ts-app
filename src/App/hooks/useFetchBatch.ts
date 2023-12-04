/* eslint-disable camelcase */
import { useEffect, useState } from 'react';
import { fetchBatch } from '../../ambient-utils/api';
import {
    AnalyticsServerError,
    FetchBatchOptions,
    RequestResponseMap,
} from '../../ambient-utils/types';

export function useFetchBatch<K extends keyof RequestResponseMap>(
    requestBody: RequestResponseMap[K]['request'],
    options?: FetchBatchOptions,
) {
    const [data, setData] = useState<RequestResponseMap[K]['success'] | null>(
        null,
    );
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<AnalyticsServerError | null>(null);

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            if (data) setData(null);
            try {
                const response = await fetchBatch<K>(requestBody, options);
                if ('error' in response) throw new Error(response.error);

                setData(response as RequestResponseMap[K]['success']);
            } catch (err) {
                setError(err as AnalyticsServerError);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [JSON.stringify({ ...requestBody, ...options })]);

    return { data, isLoading, error };
}
