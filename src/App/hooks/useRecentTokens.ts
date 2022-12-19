import { useState } from 'react';
import { TokenIF } from '../../utils/interfaces/exports';

interface getRecentTokensParamsIF {
    onCurrentChain: boolean,
    count: number | null
}

export const useRecentTokens = (
    chainId: string
): {
    addRecentToken: (tkn: TokenIF) => void,
    getRecentTokens: (options: getRecentTokensParamsIF) => TokenIF[],
    resetRecentTokens: () => void
} => {
    // console.log('ran hook useRecentTokens()');
    const [recentTokens, setRecentTokens] = useState<TokenIF[]>([]);

    // fn to add a token to the recentTokens array
    const addRecentToken = (tkn: TokenIF): void => setRecentTokens([tkn, ...recentTokens]);

    // fn to return recent tokens from local state
    const getRecentTokens = (
        {
            onCurrentChain=false,
            count=null
        }: getRecentTokensParamsIF
    ): TokenIF[] => {
        const relevantTokens = onCurrentChain 
            ? recentTokens.filter((tkn: TokenIF) => tkn.chainId === parseInt(chainId))
            : recentTokens;
        return relevantTokens.slice(0, count ?? relevantTokens.length+1);
    }

    // fn to clear list of recent tokens
    const resetRecentTokens = (): void => setRecentTokens([]);

    return {
        addRecentToken,
        getRecentTokens,
        resetRecentTokens
    };
}