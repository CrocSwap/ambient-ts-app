import { createContext, useContext } from 'react';
import {
    getRecentTokensParamsIF,
    useRecentTokens,
} from '../App/hooks/useRecentTokens';
import { tokenMethodsIF, useTokens } from '../App/hooks/useTokens';
import { useTokenSearch } from '../App/hooks/useTokenSearch';
import { TokenIF } from '../utils/interfaces/TokenIF';
import { CrocEnvContext } from './CrocEnvContext';
import { UserDataContext } from './UserDataContext';

interface TokenContextIF {
    tokens: tokenMethodsIF;
    outputTokens: TokenIF[];
    rawInput: string;
    validatedInput: string;
    setInput: (val: string) => void;
    searchType: string;
    addRecentToken: (tkn: TokenIF) => void;
    getRecentTokens: (options?: getRecentTokensParamsIF) => TokenIF[];
    addTokenInfo: (token: TokenIF) => TokenIF;
}

export const TokenContext = createContext<TokenContextIF>({} as TokenContextIF);

export const TokenContextProvider = (props: { children: React.ReactNode }) => {
    const { chainData } = useContext(CrocEnvContext);
    const { tokenBalances } = useContext(UserDataContext);

    const tokens: tokenMethodsIF = useTokens(chainData.chainId);
    const { addRecentToken, getRecentTokens } = useRecentTokens(
        chainData.chainId,
    );

    const [outputTokens, validatedInput, setInput, searchType, rawInput] =
        useTokenSearch(
            chainData.chainId,
            tokens,
            tokenBalances ?? [],
            getRecentTokens,
        );

    const addTokenInfo = (token: TokenIF): TokenIF => {
        const oldToken: TokenIF | undefined = tokens.getTokenByAddress(
            token.address,
        );
        const newToken = { ...token };
        newToken.name = oldToken ? oldToken.name : '';
        newToken.logoURI = oldToken ? oldToken.logoURI : '';
        return newToken;
    };

    const tokenContext = {
        tokens,
        outputTokens,
        rawInput,
        validatedInput,
        setInput,
        searchType,
        addRecentToken,
        getRecentTokens,
        addTokenInfo,
    };

    return (
        <TokenContext.Provider value={tokenContext}>
            {props.children}
        </TokenContext.Provider>
    );
};
