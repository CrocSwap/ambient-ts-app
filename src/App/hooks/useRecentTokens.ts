import { useState } from 'react';
import { TokenIF } from '../../utils/interfaces/exports';

export const useRecentTokens = (
    chainId: string
): {
    addRecentToken: (tkn: TokenIF) => void,
    getRecentTokens: (onCurrentChain?: boolean) => TokenIF[]
} => {
    // console.log('ran hook useRecentTokens()');
    const [recentTokens, setRecentTokens] = useState<TokenIF[]>([]);

    // fn to add a token to the recentTokens array
    const addRecentToken = (tkn: TokenIF): void => setRecentTokens([tkn, ...recentTokens]);

    // fn to return recent tokens from local state
    const getRecentTokens = (onCurrentChain=false): TokenIF[] => {
        return onCurrentChain
            ? recentTokens.filter((tkn: TokenIF) => tkn.chainId === parseInt(chainId))
            : recentTokens;
    }

    return {
        addRecentToken,
        getRecentTokens
    };
}