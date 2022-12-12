import { useEffect, useState } from 'react';
import { TokenIF, TokenListIF } from '../../utils/interfaces/exports';

// TODO: refactor to accept tokens from another hook in params
// TODO: ... this will eliminate the need for recursive calls
// TODO: ... it will also update data automatically

export const useToken = (
    chainId: string
) : [
    verifyToken: (addr: string, chn: string) => boolean,
    getToken: (addr: string, chn: string) => TokenIF | undefined
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
                    // if token is already in map, add URI to array of URIs
                    // if token is NOT in map, add it
                    // const alreadyInMap = newTokenMap.get();
                    if (newTokenMap.get(tokenKey)) {
                        console.log('found a dupe!');
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
                console.log(newTokenMap);
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

    // fn to return a given token by name and address
    // parameter for chain is optional, app uses the current chain by default
    // but we can verify tokens on other chains too as needed
    const getToken = (addr: string, chn=chainId) => {
        return tokenMap.get(addr.toLowerCase() + '_' + chn.toLowerCase());
    }

    // return function to verify a token and retrieve token metadata
    return [verifyToken, getToken];
}