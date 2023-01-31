import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../utils/hooks/reduxToolkit';
import { TokenIF, TokenListIF } from '../../utils/interfaces/exports';
import { setShouldRecheckLocalStorage } from '../../utils/state/userDataSlice';

export const useToken = (
    chainId: string,
): [
    tokenMap: Map<string, TokenIF>,
    verifyToken: (addr: string, chn: string) => boolean,
    getAllTokens: () => TokenIF[],
    getAmbientTokens: () => TokenIF[],
    getTokensOnChain: (chn: string) => TokenIF[],
    getToken: (addr: string, chn: string) => TokenIF | undefined,
    getTokensByName: (searchName: string, chn: string, exact: boolean) => TokenIF[],
    acknowledgeToken: (tkn: TokenIF) => void,
] => {
    const [tokenMap, setTokenMap] = useState(new Map<string, TokenIF>());

    // abstracted logic to add a new token to the map
    // necessary because tokenMap cannot be mutated directly
    function addTokenToMap(tkn: TokenIF, map: Map<string, TokenIF>): void {
        // mutable output variable
        const newMap = map;
        // generate a key for the key value pair
        const tokenKey = tkn.address.toLowerCase() + '_0x' + tkn.chainId.toString().toLowerCase();
        // boolean showing if token is already in the Map
        const tokenFromArray = newMap.get(tokenKey);
        // if token is already in the Map, update the array of origin URIs
        if (tokenFromArray) {
            // if current token has a `fromList` value, add it to the URI array
            tkn.fromList && tokenFromArray.fromListArr?.push(tkn.fromList);
            // update value on the Map with the new URI listed in URI array
            newMap.set(tokenKey, tokenFromArray);
            // if token is NOT in the Map, add it
        } else {
            // initialize an array to hold multiple list URI references
            tkn.fromList && (tkn.fromListArr = [tkn.fromList]);
            // add updated token data object to the array
            newMap.set(tokenKey, tkn);
        }
    }

    const shouldRecheckLocalStorage = useAppSelector(
        (state) => state.userData,
    )?.shoulRecheckLocalStorage;

    const dispatch = useAppDispatch();

    // get allTokenLists from local storage after initial render
    useEffect(() => {
        // fn to check local storage for token lists with a recursion limiter
        const checkForTokenLists = (limiter = 0): void => {
            // execute if local storage has token lists
            if (localStorage.getItem('allTokenLists')) {
                // create an empty map to put key-val pairs into
                const newTokenMap = new Map<string, TokenIF>();
                // get 'allTokenLists' from local storage
                JSON.parse(localStorage.getItem('allTokenLists') as string)
                    // create an array of all token data objects
                    ?.flatMap((tokenList: TokenListIF) => tokenList.tokens)
                    // add each token to the map
                    // this will by nature remove duplicate entries across lists
                    ?.forEach((tkn: TokenIF) => addTokenToMap(tkn, newTokenMap));
                // get 'ackTokens' from user data object in local storage
                JSON.parse(localStorage.getItem('user') as string)
                    ?.ackTokens // add each token to the map
                    // this will also remove duplicates intelligently
                    ?.forEach((tkn: TokenIF) => addTokenToMap(tkn, newTokenMap));
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
        };
        checkForTokenLists();

        dispatch(setShouldRecheckLocalStorage(false));
    }, [shouldRecheckLocalStorage]);

    // fn to determine if a token exists in a recognized token list
    // parameter for chain is optional, app uses the current chain by default
    // but we can verify tokens on other chains too as needed
    const verifyToken = (addr: string, chn = chainId): boolean => {
        return !!tokenMap.get(addr.toLowerCase() + '_' + chn.toLowerCase());
    };

    // fn to retrieve all tokens from token map
    // this is the correct syntax to do so
    const getAllTokens = (): TokenIF[] => Array.from(tokenMap.values());

    // fn to get all Ambient tokens agnostic of chain
    const getAmbientTokens = (): TokenIF[] => {
        return getAllTokens().filter((tok: TokenIF) => tok.fromList === '/ambient-token-list.json');
    };

    // fn to retrieve all tokens from token map on current chain
    const getTokensOnChain = (chn = chainId): TokenIF[] => {
        // return all values from the token map on current chain
        return getAllTokens().filter((tok) => tok.chainId === parseInt(chn));
    };

    // fn to return a given token by name and address
    // parameter for chain is optional, app uses the current chain by default
    // but we can verify tokens on other chains too as needed
    const getTokenByAddress = (addr: string, chn = chainId): TokenIF | undefined => {
        return tokenMap.get(addr.toLowerCase() + '_' + chn.toLowerCase());
    };

    // fn to return an array of tokens matching either name or symbol
    // can return exact or partial matches
    const getTokensByName = (searchName: string, chn = chainId, exact = false): TokenIF[] => {
        // array of all on-chain tokens in the Map
        const tokensOnChain = getTokensOnChain(chn);
        // search logic for exact matches only
        const searchExact = (input: string): TokenIF[] => {
            // return filtered array of on-chain tokens
            return tokensOnChain.filter(
                (tok: TokenIF) =>
                    // return token if name is exact match for search input
                    tok.name.toLowerCase() === input.toLowerCase() ||
                    // return token if symbol is exact match for search input
                    tok.symbol.toLowerCase() === input.toLowerCase(),
            );
        };
        // search logic for exact and partial matches
        const searchPartial = (input: string): TokenIF[] => {
            // return filtered array of on-chain tokens
            return tokensOnChain.filter(
                (tok: TokenIF) =>
                    // return token if name includes search string
                    tok.name.toLowerCase().includes(input.toLowerCase()) ||
                    // return token if symbol includes search string
                    tok.symbol.toLowerCase().includes(input.toLowerCase()),
            );
        };
        // array of matches, either exact or partial, depending on arg in fn call
        const matches: TokenIF[] = exact ? searchExact(searchName) : searchPartial(searchName);
        // array to hold exact-string token matches
        const exactMatches: TokenIF[] = [];
        // array to hold partial-string token matches
        const partialMatches: TokenIF[] = [];
        // iterate over the list of matches once
        // push all values to output array for exact or partial matches
        matches.forEach((match: TokenIF) => {
            if (
                match.name.toLowerCase() === searchName.toLowerCase() ||
                match.symbol.toLowerCase() === searchName.toLowerCase()
            ) {
                exactMatches.push(match);
            } else {
                partialMatches.push(match);
            }
        });
        // return the two match arrays as a single unified array
        // this ranks exact matches higher than partial matches
        // will work even when only exact matches are wanted
        return [...exactMatches, ...partialMatches];
    };

    // fn to add a token to the acknowledged list in local storage
    const acknowledgeToken = (tkn: TokenIF): void => {
        // retrieve and parse user data object from local storage
        const userData = JSON.parse(localStorage.getItem('user') as string);
        // determine whether token is already in the acknowledged tokens array
        const isTokenNew = !userData.ackTokens.some(
            (ackToken: TokenIF) =>
                tkn.address.toLowerCase() === ackToken.address.toLowerCase() &&
                tkn.chainId === ackToken.chainId,
        );
        // if token is not yet in the array, add it and update local storage
        if (isTokenNew) {
            userData.ackTokens = [...userData.ackTokens, tkn];
            localStorage.setItem('user', JSON.stringify(userData));
        }
        // mutable copy of the current token map
        const newTokenMap = tokenMap;
        // update the map with the new token
        addTokenToMap(tkn, newTokenMap);
        // send the updated map to local state in this hook
        setTokenMap(newTokenMap);
    };

    // return functions to verify a token and retrieve token metadata
    return [
        tokenMap,
        verifyToken,
        getAllTokens,
        getAmbientTokens,
        getTokensOnChain,
        getTokenByAddress,
        getTokensByName,
        acknowledgeToken,
    ];
};
