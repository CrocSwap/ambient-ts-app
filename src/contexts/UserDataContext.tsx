import { createContext } from 'react';
import { getRecentTokensParamsIF } from '../App/hooks/useRecentTokens';
import { TokenIF } from '../utils/interfaces/TokenIF';

interface UserDataIF {
    addRecentToken: (tkn: TokenIF) => void;
    getRecentTokens: (options?: getRecentTokensParamsIF) => TokenIF[];
}

export const UserDataContext = createContext<UserDataIF>({} as UserDataIF);
