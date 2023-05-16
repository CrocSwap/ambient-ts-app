import { createContext, SetStateAction, Dispatch } from 'react';

interface ChainDataIF {
    gasPriceInGwei: number | undefined;
    setGasPriceinGwei: Dispatch<SetStateAction<number | undefined>>;
    lastBlockNumber: number;
    setLastBlockNumber: Dispatch<SetStateAction<number>>;
}

export const ChainDataContext = createContext<ChainDataIF>({} as ChainDataIF);
