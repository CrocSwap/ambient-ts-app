/* eslint-disable camelcase */
import { useEffect, useState } from 'react';
import {
    FetchBatchOptions,
    RequestResponseMap,
    fetchBatch,
} from '../../utils/functions/fetchBatch';

export function useFetchBatch<K extends keyof RequestResponseMap>(
    requestBody: RequestResponseMap[K]['request'],
    options?: FetchBatchOptions,
) {
    const [data, setData] = useState<RequestResponseMap[K]['response'] | null>(
        null,
    );
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            if (data) setData(null);
            try {
                const response = await fetchBatch<K>(requestBody, options);
                setData(response);
            } catch (err) {
                setError(err);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [JSON.stringify({ ...requestBody, ...options })]);

    return { data, isLoading, error };
}
