import { useState, useEffect, useRef } from 'react';
import { LimitOrderIF } from '../../utils/interfaces/LimitOrderIF';
import { TransactionIF } from '../../utils/interfaces/TransactionIF';
import { getAddress } from 'ethers/lib/utils.js';
import { fetchEnsAddresses } from '../functions/fetchENSAddresses';
import { PositionIF } from '../../utils/interfaces/PositionIF';

type TradeTableDataRow = TransactionIF | LimitOrderIF | PositionIF;

// TODO: move this into a higher context (not susceptible to crocenv updates)
export default function useEnsAddresses(data: TradeTableDataRow[]) {
    const [ensAdressMapping, setEnsAddressMapping] = useState<
        Map<string, string>
    >(new Map());
    const cacheRef = useRef<Map<string, string>>(new Map());
    const nullCacheRef = useRef<Map<string, number>>(new Map()); // Storing null addresses with timestamp

    const DEADLINE = 1 * 60 * 60 * 1000; // 1 hour

    useEffect(() => {
        const now = Date.now();

        const uncachedAddresses = data
            .map((row) => (row.user ? getAddress(row.user) : ''))
            .filter((addr) => {
                const nullTimestamp = nullCacheRef.current.get(addr);
                // Address is valid if it's not in the cache OR in the nullCache but was added more than 5 minutes ago
                return (
                    addr &&
                    !cacheRef.current.has(addr) &&
                    (!nullTimestamp || now - nullTimestamp > DEADLINE)
                );
            });

        // If we have uncached addresses, we fetch them
        if (uncachedAddresses.length > 0) {
            (async () => {
                const batchedEnsMap = await fetchEnsAddresses(
                    uncachedAddresses,
                );
                if (batchedEnsMap) {
                    // Separate the addresses that returned null
                    const nullAddresses: string[] = [];
                    batchedEnsMap.forEach(
                        (value, key) =>
                            value === 'null' &&
                            nullAddresses.push(key.toLowerCase()),
                    );

                    // Update nullCache with the addresses that returned null and current timestamp
                    nullAddresses.forEach((addr) =>
                        nullCacheRef.current.set(addr, now),
                    );

                    // Update the state with the newly fetched addresses
                    setEnsAddressMapping(
                        (prev) => new Map([...prev, ...batchedEnsMap]),
                    );

                    // Update the cache with the newly fetched addresses
                    cacheRef.current = new Map([
                        ...cacheRef.current,
                        ...batchedEnsMap,
                    ]);
                }
            })();
        }
    }, [data]);

    return ensAdressMapping;
}
