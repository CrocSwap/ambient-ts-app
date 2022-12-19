import { useState } from 'react';
import { TokenIF } from '../../utils/interfaces/exports';

export const useRecentTokens = () => {
    console.log('ran hook useRecentTokens()');
    const [recentTokens, setRecentTokens] = useState<TokenIF[]>([]);

    // fn to add a token to the recentTokens array
    const addRecentToken = (tkn: TokenIF): void => setRecentTokens([tkn, ...recentTokens]);

    return {recentTokens, addRecentToken};
}