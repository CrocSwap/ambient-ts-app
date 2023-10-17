import { createContext } from 'react';
import { useBatchENSFetch } from '../App/hooks/useBatchENSFetch';

interface ENSContextIF {
    queueAddressForResolution: (address: string) => Promise<string>;
}

export const ENSContext = createContext<ENSContextIF>({} as ENSContextIF);

interface ENSProviderProps {
    children: React.ReactNode;
}

export const ENSContextProvider = ({ children }: ENSProviderProps) => {
    const queueAddressForResolution = useBatchENSFetch();

    const ensContext = {
        queueAddressForResolution,
    };

    return (
        <ENSContext.Provider value={ensContext}>{children}</ENSContext.Provider>
    );
};
