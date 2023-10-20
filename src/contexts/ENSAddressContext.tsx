import { createContext, useContext, useState, useRef, ReactNode } from 'react';
import { getAddress } from 'ethers/lib/utils.js';
import { TransactionIF } from '../utils/interfaces/TransactionIF';
import { LimitOrderIF } from '../utils/interfaces/LimitOrderIF';
import { PositionIF } from '../utils/interfaces/PositionIF';
import { fetchEnsAddresses } from '../App/functions/fetchENSAddresses';

type TradeTableDataRow = TransactionIF | LimitOrderIF | PositionIF;

type ENSAddressContextValue = {
    ensAddressMapping: Map<string, string>;
    addData: (data: TradeTableDataRow[]) => void;
};

const ENSAddressContext = createContext<ENSAddressContextValue | undefined>(
    undefined,
);

export const ENSAddressContextProvider = (props: { children: ReactNode }) => {
    const [ensAddressMapping, setEnsAddressMapping] = useState<
        Map<string, string>
    >(new Map());
    const cacheRef = useRef<Map<string, string>>(new Map());
    const nullCacheRef = useRef<Map<string, number>>(new Map());
    const DEADLINE = 1 * 60 * 60 * 1000; // 1 hour

    const addData = (data: TradeTableDataRow[]) => {
        const now = Date.now();

        const uncachedAddresses = [
            ...new Set(
                data.map((row) =>
                    (row.user ? getAddress(row.user) : '').toLowerCase(),
                ),
            ),
        ].filter((addr) => {
            const nullTimestamp = nullCacheRef.current.get(addr);
            // Address is valid if it's not in the cache OR in the nullCache but was added more than DEADLINE ago
            return (
                addr &&
                !cacheRef.current.has(addr) &&
                (!nullTimestamp || now - nullTimestamp >= DEADLINE)
            );
        });

        // If we have uncached addresses, we fetch them
        if (uncachedAddresses.length > 0) {
            (async () => {
                const batchedEnsMap = await fetchEnsAddresses(
                    uncachedAddresses,
                );

                if (batchedEnsMap && batchedEnsMap.size > 0) {
                    // Separate the addresses that returned null
                    const nullAddresses: string[] = [];

                    batchedEnsMap.forEach(
                        (value, key) =>
                            value === 'null' &&
                            nullAddresses.push(key.toLowerCase()) &&
                            batchedEnsMap.delete(key),
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
    };

    return (
        <ENSAddressContext.Provider value={{ ensAddressMapping, addData }}>
            {props.children}
        </ENSAddressContext.Provider>
    );
};

export function useENSAddresses() {
    const context = useContext(ENSAddressContext);
    if (!context) {
        throw new Error(
            'useENSAddresses must be used within an ENSAddressProvider',
        );
    }
    return context;
}
