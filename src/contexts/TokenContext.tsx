import { createContext, useContext, useEffect, useState } from 'react';
import { fetchTokenLists } from '../App/functions/fetchTokenLists';
import { tokenMethodsIF, useTokens } from '../App/hooks/useTokens';
import { useTokenSearch } from '../App/hooks/useTokenSearch';
import { IS_LOCAL_ENV } from '../constants';
import { useAppSelector } from '../utils/hooks/reduxToolkit';
import { TokenIF } from '../utils/interfaces/TokenIF';
import { CrocEnvContext } from './CrocEnvContext';
import { UserDataContext } from './UserDataContext';

interface TokenContextIF {
    tokens: tokenMethodsIF;
    outputTokens: TokenIF[];
    validatedInput: string;
    setInput: (val: string) => void;
    searchType: string;
}

export const TokenContext = createContext<TokenContextIF>({} as TokenContextIF);

export const TokenContextProvider = (props: { children: React.ReactNode }) => {
    const { chainData } = useContext(CrocEnvContext);
    const { getRecentTokens } = useContext(UserDataContext);
    const connectedUserErc20Tokens = useAppSelector(
        (state) => state.userData.tokens.erc20Tokens,
    );

    const tokens: tokenMethodsIF = useTokens(chainData.chainId);

    const [outputTokens, validatedInput, setInput, searchType] = useTokenSearch(
        chainData.chainId,
        tokens,
        connectedUserErc20Tokens ?? [],
        getRecentTokens,
    );

    const tokenState = {
        tokens,
        outputTokens,
        validatedInput,
        setInput,
        searchType,
    };

    useEffect(() => {
        fetchTokenLists();
    }, []);

    return (
        <TokenContext.Provider value={tokenState}>
            {props.children}
        </TokenContext.Provider>
    );
};
