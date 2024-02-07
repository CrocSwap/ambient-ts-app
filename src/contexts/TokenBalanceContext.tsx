import React, { createContext, useContext, useEffect } from 'react';
import { TokenIF } from '../ambient-utils/types';
import { UserDataContext } from './UserDataContext';

export interface NftTokenContractBalanceItemIF {
    balance: any;
    balance24h: any;
    contractAddress: string;
    contractName: string;
    contractTickerSymbol: string;
    isSpam: boolean;
    lastTransferedAt: any;
    nftData: Array<any>;
    supportsErc: Array<string>;
    type: string;
}
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
    NFTData: NftTokenContractBalanceItemIF[] | undefined;
    setNFTData: React.Dispatch<
        React.SetStateAction<NftTokenContractBalanceItemIF[] | undefined>
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

    const [NFTData, setNFTData] = React.useState<
        NftTokenContractBalanceItemIF[] | undefined
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
        setNFTData,
        NFTData,
    };

    return (
        <TokenBalanceContext.Provider value={tokenBalanceContext}>
            {props.children}
        </TokenBalanceContext.Provider>
    );
};
