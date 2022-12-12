import { useCallback, useEffect, useState } from 'react';
import { TokenIF, TokenListIF } from '../../utils/interfaces/exports';

// TODO: refactor to accept tokens from another hook in params
// TODO: ... this will eliminate the need for recursive calls
// TODO: ... it will also update data automatically

export const useToken = (
    chainId: string
) : [
    tokenMap: Map<string, TokenIF>,
    verifyToken: (addr: string, chn: string) => boolean,
    getAllTokens: () => TokenIF[],
    getTokensOnChain: (chn: string) => TokenIF[],
    getToken: (addr: string, chn: string) => TokenIF | undefined,
    getTokensByName: (searchName: string, chn: string, exact: boolean) => TokenIF[]
] => {
    const [tokenMap, setTokenMap] = useState(new Map<string, TokenIF>());

    // get allTokenLists from local storage after initial render
    useEffect(() => {
        // fn to check local storage for token lists with a recursion limiter
        const checkForTokenLists = (limiter=0) => {
            // execute if local storage has token lists
            if (localStorage.getItem('allTokenLists')) {
                // create an empty map to put key-val pairs into
                const newTokenMap = new Map<string, TokenIF>();
                // abstracted logic to add a new token to the map
                const addTokenToMap = (tkn: TokenIF) => {
                    const tokenKey = tkn.address.toLowerCase() +
                        '_0x' +
                        tkn.chainId.toString().toLowerCase();
                    const tokenFromArray = newTokenMap.get(tokenKey);
                    if (tokenFromArray) {
                        tokenFromArray?.fromListArr?.push(tkn.fromList ?? '');
                        newTokenMap.set(tokenKey, tokenFromArray);
                    } else {
                        tkn.fromListArr = [tkn.fromList ?? ''];
                        newTokenMap.set(tokenKey, tkn);
                    }
                };
                // get 'allTokenLists' from local storage
                JSON.parse(localStorage.getItem('allTokenLists') as string)
                    // create an array of all token data objects
                    .flatMap((tokenList: TokenListIF) => tokenList.tokens)
                    // add each token to the map
                    // this will by nature remove duplicate entries across lists
                    .forEach((tkn: TokenIF) => addTokenToMap(tkn));
                // send token map to be memoized in local state
                setTokenMap(newTokenMap);
            } else if (limiter < 100) {
                // call fn recursively if local storage does not have token lists
                // limit recursive calls to 100
                setTimeout(() => checkForTokenLists(limiter + 1), 250);
            } else {
                // console warning if max recursion depth is reached
                console.warn('maximum recursion depth reached');
            }
        }
        checkForTokenLists();
    }, []);

    // fn to determine if a token exists in a recognized token list
    // parameter for chain is optional, app uses the current chain by default
    // but we can verify tokens on other chains too as needed
    const verifyToken = (addr: string, chn=chainId) => {
        return !!tokenMap.get(addr.toLowerCase() + '_' + chn.toLowerCase());
    }

    const getAllTokens = () => Array.from(tokenMap.values());

    const getTokensOnChain = useCallback((chn: string) => (
        Array.from(tokenMap.values()).filter(tok => tok.chainId === parseInt(chn))
    ), [chainId]);

    // fn to return a given token by name and address
    // parameter for chain is optional, app uses the current chain by default
    // but we can verify tokens on other chains too as needed
    const getTokenByAddress = (addr: string, chn=chainId) => {
        return tokenMap.get(addr.toLowerCase() + '_' + chn.toLowerCase());
    }

    const getTokensByName = (searchName: string, chn=chainId, exact=false) => {
        const tokens = getTokensOnChain(chn);
        const searchExact = (input: string) => {
            console.log('searching for exact match');
            const exactMatches = tokens.filter((tok: TokenIF) => (
                tok.name.toLowerCase() === input.toLowerCase() ||
                tok.symbol.toLowerCase() === input.toLowerCase()
            ));
            return exactMatches;
        }
        const searchPartial = (input: string) => {
            const partialMatches = tokens.filter((tok: TokenIF) =>
                tok.name.toLowerCase().includes(input.toLowerCase()) ||
                tok.symbol.toLowerCase().includes(input.toLowerCase())
            );
            return partialMatches;
        }
        const matches = exact ? searchExact(searchName) : searchPartial(searchName);
        console.log({matches});
        return matches;
    }

    // return function to verify a token and retrieve token metadata
    return [
        tokenMap,
        verifyToken,
        getAllTokens,
        getTokensOnChain,
        getTokenByAddress,
        getTokensByName
    ];
}