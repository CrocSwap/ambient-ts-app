import { useState, useEffect, useRef } from 'react';
import { LimitOrderIF } from '../../utils/interfaces/LimitOrderIF';
import { TransactionIF } from '../../utils/interfaces/TransactionIF';
import { getAddress } from 'ethers/lib/utils.js';
import { fetchEnsAddresses } from '../functions/fetchENSAddresses';
import { PositionIF } from '../../utils/interfaces/PositionIF';

type TradeTableDataRow = TransactionIF | LimitOrderIF | PositionIF;

export default function useEnsAddresses(data: TradeTableDataRow[]) {
    const [ensAdressMapping, setEnsAddressMapping] = useState<
        Map<string, string>
    >(new Map());
    const cacheRef = useRef<Map<string, string>>(new Map());

    useEffect(() => {
        const uncachedAddresses = data
            .map((row) => (row.user ? getAddress(row.user) : ''))
            .filter((addr) => addr && !cacheRef.current.has(addr));

        // If we have uncached addresses, we fetch them
        if (uncachedAddresses.length > 0) {
            (async () => {
                const batchedEnsMap = await fetchEnsAddresses(
                    uncachedAddresses,
                );
                if (batchedEnsMap) {
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
