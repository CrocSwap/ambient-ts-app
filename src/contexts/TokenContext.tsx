import { createContext, useContext } from 'react';
import { TokenIF } from '../ambient-utils/types';
import { TokenContextIF } from '../ambient-utils/types/contextTypes';
import { useRecentTokens } from '../App/hooks/useRecentTokens';
import { tokenMethodsIF, useTokens } from '../App/hooks/useTokens';
import { useTokenSearch } from '../App/hooks/useTokenSearch';
import { AppStateContext } from './AppStateContext';
import { TokenBalanceContext } from './TokenBalanceContext';

export const TokenContext = createContext({} as TokenContextIF);

export const TokenContextProvider = (props: { children: React.ReactNode }) => {
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
