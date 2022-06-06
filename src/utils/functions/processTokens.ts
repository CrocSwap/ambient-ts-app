import { TokenIF } from '../interfaces/exports';

export const makeUserTokenList = () => {
    // let importedTokens;
    if (localStorage.user && !localStorage.user.importedTokens) {
        console.log('no importedTokens in local storage user object');
        const { activeTokenLists } = JSON.parse(localStorage.user);
        console.log(activeTokenLists);
        const activeTokens = activeTokenLists.map((token: string) => {
            const tokenList = JSON.parse(localStorage.allTokenLists)[token];
            return tokenList;
        });
        console.log(activeTokens);
    }
};

export const filterTokensByChain = (tkns: Array<TokenIF>, chain: number) => {
    const tokensOnChain = tkns.filter((tkn: TokenIF) => tkn.chainId === chain);
    return tokensOnChain;
};

export const getCurrentTokens = (chainId: string) => {
    const tokensInLocalStorage = localStorage.getItem('testTokens');
    const allTokens = tokensInLocalStorage ? JSON.parse(tokensInLocalStorage) : '';
    const tokensOnChain = filterTokensByChain(allTokens, parseInt(chainId));
    return tokensOnChain;
};

export const findTokenByAddress = (addr: string, tokens: Array<TokenIF>) => {
    const token = tokens.find((tkn: TokenIF) => tkn.address === addr);
    return token;
};
