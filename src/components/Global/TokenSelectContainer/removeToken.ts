import { SetStateAction } from 'react';
import { TokenIF } from '../../../utils/interfaces/exports';

// function to remove a token from local state and local storage
export const removeToken = (
    token: TokenIF,
    tokensBank: Array<TokenIF>,
    currentChain: string,
    setImportedTokens: (value: SetStateAction<TokenIF[]>) => void,
) => {
    // get the list of imported tokens as currently held in local state
    // should be identical to data in local storage if the app updates both in parallel
    const newTokensList = tokensBank.filter(
        (tkn: TokenIF) =>
            // return tokens different from the current address
            tkn.address !== token.address ||
            // if address matches, still return the token if it's not on the current chain
            // native tokens will have the same address on multiple chains
            (tkn.address === token.address && tkn.chainId !== parseInt(currentChain)),
    );
    // send new filtered tokens array to local state
    setImportedTokens(newTokensList);
    // send new filtered tokens array to local storage
    const userData = JSON.parse(localStorage.getItem('user') as string);
    userData.tokens = newTokensList;
    localStorage.setItem('user', JSON.stringify(userData));
};
