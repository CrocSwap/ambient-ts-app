/* eslint-disable camelcase */
import { ANALYTICS_URL } from '../../constants';

type BatchedENSResult = {
    value: {
        data: Array<{
            req_id: string;
            results: {
                ens_address: string | null;
            };
        }>;
    };
};

const parseBatchedEnsReq = (
    response: BatchedENSResult,
): Map<string, string> => {
    const resultMap = new Map<string, string>();

    for (const item of response.value.data) {
        const { req_id, results } = item;
        // 'null' is used to decide when to query again for ens addresses that returned null.
        resultMap.set(req_id.toLowerCase(), results.ens_address || 'null');
    }

    return resultMap;
};

export const fetchEnsAddresses = async (addresses: string[]) => {
    const deDupedAddresses = [...new Set(addresses)];
    const addressQueryBody = JSON.stringify({
        data: {
            req: deDupedAddresses.map((addr) => {
                return {
                    config_path: 'ens_address',
                    req_id: addr,
                    args: {
                        address: addr,
                    },
                };
            }),
        },
    });

    try {
        const response = await fetch(
            ANALYTICS_URL +
                new URLSearchParams({
                    service: 'run',
                    config_path: 'batch_requests',
                    include_data: '0',
                }),
            {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: addressQueryBody,
            },
        );

        const result = await response.json();
        const parsedResult = parseBatchedEnsReq(result as BatchedENSResult);
        return parsedResult;
    } catch (e) {
        console.warn(e);
        return null;
    }
};
