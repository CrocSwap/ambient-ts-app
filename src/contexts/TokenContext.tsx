import { createContext, useContext, useEffect } from 'react';
import { fetchTokenLists } from '../App/functions/fetchTokenLists';
import {
    getRecentTokensParamsIF,
    useRecentTokens,
} from '../App/hooks/useRecentTokens';
import { tokenMethodsIF, useTokens } from '../App/hooks/useTokens';
import { useTokenSearch } from '../App/hooks/useTokenSearch';
import { useAppSelector } from '../utils/hooks/reduxToolkit';
import { TokenIF } from '../utils/interfaces/TokenIF';
import { CrocEnvContext } from './CrocEnvContext';

interface TokenContextIF {
    tokens: tokenMethodsIF;
    outputTokens: TokenIF[];
    validatedInput: string;
    setInput: (val: string) => void;
    searchType: string;
    addRecentToken: (tkn: TokenIF) => void;
    getRecentTokens: (options?: getRecentTokensParamsIF) => TokenIF[];
}

export const TokenContext = createContext<TokenContextIF>({} as TokenContextIF);

export const TokenContextProvider = (props: { children: React.ReactNode }) => {
    const { chainData } = useContext(CrocEnvContext);
    const connectedUserErc20Tokens = useAppSelector(
        (state) => state.userData.tokens.erc20Tokens,
    );

    const tokens: tokenMethodsIF = useTokens(chainData.chainId);
    const { addRecentToken, getRecentTokens } = useRecentTokens(
        chainData.chainId,
    );

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
        addRecentToken,
        getRecentTokens,
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
