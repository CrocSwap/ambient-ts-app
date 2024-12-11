import { createContext, useContext, useEffect, useState } from 'react';
import { TokenIF } from '../ambient-utils/types';
import {
    NftFetchSettingsIF,
    NftListByChain,
    TokenBalanceContextIF,
} from '../ambient-utils/types/contextTypes';
import { UserDataContext } from './UserDataContext';

export const TokenBalanceContext = createContext({} as TokenBalanceContextIF);

export const TokenBalanceContextProvider = (props: {
    children: React.ReactNode;
}) => {
    const [tokenBalances, setTokenBalances] = useState<TokenIF[] | undefined>(
        undefined,
    );

    const [NFTData, setNFTData] = useState<NftListByChain[] | undefined>(
        undefined,
    );

    const [NFTFetchSettings, setNFTFetchSettings] =
        useState<NftFetchSettingsIF>({ pageKey: '', pageSize: 100 });

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
        setTokenBalances((prev) => {
            const newTokenBalances = prev ? [...prev] : [];
            const tokenIndex = newTokenBalances?.findIndex(
                (token) =>
                    token.address.toLowerCase() ===
                    params.tokenAddress.toLowerCase(),
            );
            if (newTokenBalances && tokenIndex !== -1) {
                const newTokenBalance = newTokenBalances[tokenIndex];
                if (params.walletBalance) {
                    newTokenBalance.walletBalance = params.walletBalance;
                }
                if (params.dexBalance) {
                    newTokenBalance.dexBalance = params.dexBalance;
                }
                if (params.dexBalance || params.walletBalance) {
                    newTokenBalances[tokenIndex] = newTokenBalance;
                    return newTokenBalances;
                }
            }
            return prev;
        });
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
