import React, { createContext, useContext, useEffect } from 'react';
import { TokenIF } from '../utils/interfaces/TokenIF';
import { UserDataContext } from './UserDataContext';

interface TokenBalanceContextIF {
    tokenBalances: TokenIF[] | undefined;
    resetTokenBalances: () => void;
    setTokenBalance: (params: {
        tokenAddress: string;
        walletBalance?: string | undefined;
        dexBalance?: string | undefined;
    }) => void;
    setTokenBalances: React.Dispatch<
        React.SetStateAction<TokenIF[] | undefined>
    >;
}

export const TokenBalanceContext = createContext<TokenBalanceContextIF>(
    {} as TokenBalanceContextIF,
);

export const TokenBalanceContextProvider = (props: {
    children: React.ReactNode;
}) => {
    const [tokenBalances, setTokenBalances] = React.useState<
        TokenIF[] | undefined
    >(undefined);

    const { userAddress, isUserConnected } = useContext(UserDataContext);

    const resetTokenBalances = () => {
        setTokenBalances(undefined);
    };
    useEffect(() => {
        resetTokenBalances();
    }, [isUserConnected, userAddress]);

    const setTokenBalance = (params: {
        tokenAddress: string;
        walletBalance?: string | undefined;
        dexBalance?: string | undefined;
    }) => {
        if (!tokenBalances) return;
        const newTokenBalances = [...tokenBalances];

        const tokenIndex = newTokenBalances?.findIndex(
            (token) =>
                token.address.toLowerCase() ===
                params.tokenAddress.toLowerCase(),
        );

        if (newTokenBalances && tokenIndex && tokenIndex !== -1) {
            const newTokenBalance = newTokenBalances[tokenIndex];
            if (params.walletBalance) {
                newTokenBalance.walletBalance = params.walletBalance;
            }
            if (params.dexBalance) {
                newTokenBalance.dexBalance = params.dexBalance;
            }
            if (params.dexBalance || params.walletBalance) {
                newTokenBalances[tokenIndex] = newTokenBalance;
                setTokenBalances(newTokenBalances);
            }
        }
    };

    const tokenBalanceContext = {
        tokenBalances,
        resetTokenBalances,
        setTokenBalance,
        setTokenBalances,
    };

    return (
        <TokenBalanceContext.Provider value={tokenBalanceContext}>
            {props.children}
        </TokenBalanceContext.Provider>
    );
};
