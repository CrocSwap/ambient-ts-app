import { createContext, useContext } from 'react';
import {
    getRecentTokensParamsIF,
    useRecentTokens,
} from '../App/hooks/useRecentTokens';
import { tokenMethodsIF, useTokens } from '../App/hooks/useTokens';
import { useTokenSearch } from '../App/hooks/useTokenSearch';
import { TokenIF } from '../ambient-utils/types';
import { CrocEnvContext } from './CrocEnvContext';
import { TokenBalanceContext } from './TokenBalanceContext';

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
    // TODO: possible option to merge TokenBalanceContext with TokenContext
    const { tokenBalances } = useContext(TokenBalanceContext);
    const tokens: tokenMethodsIF = useTokens(chainData.chainId, tokenBalances);
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
