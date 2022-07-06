import { SetStateAction } from 'react';
import { TokenIF } from '../../../utils/interfaces/exports';

export interface importTokenIF {
    tkn: TokenIF,
    tokensBank: Array<TokenIF>,
    setImportedTokens: (value: SetStateAction<TokenIF[]>) => void,
    chooseToken: (tok: TokenIF) => void
}

export const importToken = (
    tkn: TokenIF,
    tokensBank: Array<TokenIF>,
    setImportedTokens: (value: SetStateAction<TokenIF[]>) => void,
    chooseToken: (tok: TokenIF) => void
) => {
    // look inside tokensBank to see if clicked token is already imported
    const newImportedTokensArray = [tkn, ...tokensBank];
    setImportedTokens(newImportedTokensArray);
    // sync local storage and local state inside App.tsx with new array
    const userData = JSON.parse(localStorage.getItem('user') as string);
    userData.tokens = newImportedTokensArray;
    localStorage.setItem('user', JSON.stringify(userData));
    chooseToken(tkn);
};