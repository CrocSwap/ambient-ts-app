import React, { createContext, useContext, useEffect } from 'react';
import { TokenIF } from '../ambient-utils/types';
import { UserDataContext } from './UserDataContext';

export interface NftListByChain {
    chainId: string;
    totalNFTCount: number;
    userHasNFT: boolean;
    data: Array<NftDataIF>;
}

export interface NftDataIF {
    contractAddress: string;
    contractName: string;
    thumbnailUrl: string;
    cachedUrl: string;
}

export interface NftFetchSettingsIF {
    pageKey: string;
    pageSize: number;
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
    NFTData: NftListByChain[] | undefined;
    setNFTData: React.Dispatch<
        React.SetStateAction<NftListByChain[] | undefined>
    >;
    NFTFetchSettings: NftFetchSettingsIF;
    setNFTFetchSettings: React.Dispatch<
        React.SetStateAction<NftFetchSettingsIF>
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

    const [NFTData, setNFTData] = React.useState<NftListByChain[] | undefined>(
        undefined,
    );

    const [NFTFetchSettings, setNFTFetchSettings] =
        React.useState<NftFetchSettingsIF>({ pageKey: '', pageSize: 100 });

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
        NFTData,
        setNFTData,
        NFTFetchSettings,
        setNFTFetchSettings,
    };

    return (
        <TokenBalanceContext.Provider value={tokenBalanceContext}>
            {props.children}
        </TokenBalanceContext.Provider>
    );
};
