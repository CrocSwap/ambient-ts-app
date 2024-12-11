import { createContext, useContext } from 'react';
import { TokenIF } from '../ambient-utils/types';
import {
    getRecentTokensParamsIF,
    useRecentTokens,
} from '../App/hooks/useRecentTokens';
import { tokenMethodsIF, useTokens } from '../App/hooks/useTokens';
import { useTokenSearch } from '../App/hooks/useTokenSearch';
import { AppStateContext } from './AppStateContext';
import { TokenBalanceContext } from './TokenBalanceContext';

export interface TokenContextIF {
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

export const TokenContext = createContext({} as TokenContextIF);

export const TokenContextProvider = (props: { children: React.ReactNode }) => {
    if (import.meta.hot) {
        import.meta.hot.accept(() => {
            window.location.reload(); // Forces a full browser reload when context code changes
        });
    }
    const {
        activeNetwork: { chainId },
    } = useContext(AppStateContext);
    const { tokenBalances } = useContext(TokenBalanceContext);
    const tokens: tokenMethodsIF = useTokens(chainId, tokenBalances);
    const { addRecentToken, getRecentTokens } = useRecentTokens(chainId);

    const [outputTokens, validatedInput, setInput, searchType, rawInput] =
        useTokenSearch(chainId, tokens, tokenBalances ?? [], getRecentTokens);

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
