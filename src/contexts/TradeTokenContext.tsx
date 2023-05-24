import { createContext } from 'react';

interface TradeTokenIF {
    baseToken: {
        address: string;
        mainnetAddress: string;
        balance: string;
        dexBalance: string;
        decimals: number;
    };
    quoteToken: {
        address: string;
        mainnetAddress: string;
        balance: string;
        dexBalance: string;
        decimals: number;
    };
    tokenAAllowance: string;
    tokenBAllowance: string;
    setRecheckTokenAApproval: (val: boolean) => void;
    setRecheckTokenBApproval: (val: boolean) => void;
    isTokenABase: boolean;
}

export const TradeTokenContext = createContext<TradeTokenIF>(
    {} as TradeTokenIF,
);
