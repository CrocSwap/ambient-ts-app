import { createContext } from 'react';
import { tokenMethodsIF } from '../App/hooks/useTokens';
import { TokenIF } from '../utils/interfaces/TokenIF';

interface TokenContextIF {
    tokens: tokenMethodsIF;
    outputTokens: TokenIF[];
    validatedInput: string;
    setInput: (val: string) => void;
    searchType: string;
}

export const TokenContext = createContext<TokenContextIF>({} as TokenContextIF);
