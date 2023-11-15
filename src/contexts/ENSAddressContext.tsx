import { createContext, useContext, useState, useRef, ReactNode } from 'react';
import {
    TransactionIF,
    LimitOrderIF,
    PositionIF,
} from '../ambient-utils/types';
import { batchFetchAndCacheENSAddressData } from '../ambient-utils/dataLayer';

type TradeTableDataRow = TransactionIF | LimitOrderIF | PositionIF;

type ENSAddressContextValue = {
    ensAddressMapping: Map<string, string>;
    addData: (data: TradeTableDataRow[]) => Promise<void>;
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

    const addData = async (data: TradeTableDataRow[]) => {
        const copiedCache = new Map([...cacheRef.current]);
        const copiedNullCache = new Map([...nullCacheRef.current]);
        const { updatedAddressesCache, updatedNullAddressesCache } =
            await batchFetchAndCacheENSAddressData(
                data,
                copiedCache,
                copiedNullCache,
            );

        cacheRef.current = new Map([...copiedCache, ...updatedAddressesCache]);
        setEnsAddressMapping(
            (prev) => new Map([...prev, ...updatedAddressesCache]),
        );
        nullCacheRef.current = updatedNullAddressesCache;
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
