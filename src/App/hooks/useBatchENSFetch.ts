import { useState, useEffect } from 'react';
import { fetchEnsAddresses } from '../functions/fetchENSAddresses';

const MIN_BATCH_SIZE = 20;
const BATCH_INTERVAL = 1 * 60 * 1000; // 1 hour

type PromiseResolvers = {
    [address: string]: (ensName: string) => void;
};

export type QueueAddressForResolutionFn = (address: string) => Promise<string>;

export const useBatchENSFetch = () => {
    const [addressQueue, setAddressQueue] = useState<string[]>([]);
    const [promiseResolvers, setPromiseResolvers] = useState<PromiseResolvers>(
        {},
    );

    useEffect(() => {
        let timer: NodeJS.Timeout;

        const fetchENSNames = async () => {
            if (addressQueue.length === 0) return;

            const addressesToQuery = [...addressQueue];
            setAddressQueue([]);

            const data = await fetchEnsAddresses(addressesToQuery);

            addressesToQuery.forEach((address) => {
                const resolver = promiseResolvers[address];
                if (resolver) {
                    resolver(data?.get(address) || ''); // resolve the promise with the ENS name or empty string
                }
            });
            setPromiseResolvers({});
        };

        if (addressQueue.length >= MIN_BATCH_SIZE) {
            fetchENSNames();
        } else {
            timer = setTimeout(fetchENSNames, BATCH_INTERVAL);
        }

        return () => clearTimeout(timer);
    }, [addressQueue]);

    const queueAddressForResolution = (address: string): Promise<string> => {
        if (!addressQueue.includes(address)) {
            setAddressQueue((prev) => [...prev, address]);
        }
        return new Promise((resolve) => {
            setPromiseResolvers((prev) => ({ ...prev, [address]: resolve }));
        });
    };

    return queueAddressForResolution;
};
