import { useCallback, useEffect, useMemo, useState } from 'react';
import { defaultTokens } from '../../utils/data/defaultTokens';
import { tokenListURIs } from '../../utils/data/tokenListURIs';
import fetchTokenList from '../../utils/functions/fetchTokenList';
import { TokenIF, TokenListIF } from '../../utils/interfaces/exports';
import chainNumToString from '../functions/chainNumToString';

export interface tokenMethodsIF {
    defaultTokens: TokenIF[];
    verifyToken: (addr: string) => boolean;
    ackToken: (tkn: TokenIF) => void;
    tokenUniv: TokenIF[];
    getTokenByAddress: (addr: string) => TokenIF | undefined;
    getTokenFromList: (uri: string) => TokenIF[];
    getTokensByNameOrSymbol: (input: string, exact?: boolean) => TokenIF[];
}

// keys for data persisted in local storage
const localStorageKeys = {
    tokenLists: 'tokenLists',
    ackTokens: 'ackTokens',
};

// fn to retrieve and parse token lists from local storage
function getTokenEntryFromLS(key: string) {
    const entry: string | null = localStorage.getItem(key);
    // process data retrieved from local storage
    if (entry) {
        try {
            // parse data from local storage and assign to output variable
            return JSON.parse(entry);
        } catch {
            // clear data from local storage and warn user if unable to parse
            // assign `null` value to output variable
            console.warn(
                'localStorage token lists corrupt, clearing data for',
                key,
            );
            localStorage.removeItem(key);
        }
    }

    // Empty or corrupt local storage, set empty list
    return [];
}

function getTokenListsFromLS(): TokenListIF[] {
    return getTokenEntryFromLS(localStorageKeys.tokenLists) as TokenListIF[];
}

// fn to retrieve and parse token lists from local storage
function getAckTokensFromLS(): TokenIF[] {
    return getTokenEntryFromLS(localStorageKeys.ackTokens) as TokenIF[];
}

// Load pre-existing values from local storage, once at beggining of session
// After this point, we will write updates to local storage, for future sessions
// but the source os truth will be React state
const INIT_LIST = getTokenListsFromLS();
const INIT_ACK = getAckTokensFromLS();

export const useTokens = (chainId: string): tokenMethodsIF => {
    // Token universe
    const [tokenLists, setTokenLists] = useState<TokenListIF[]>(INIT_LIST);

    // User acknowledge tokens
    const [ackTokens, setAckTokens] = useState<TokenIF[]>(INIT_ACK);

    // Universe of tokens within the given chain. Combines both tokens from
    // lists and user-acknowledge tokens
    const tokenMap = useMemo(() => {
        const retMap = new Map<string, TokenIF>();
        tokenLists
            .reverse() // Reverse add, so higher priority lists overwrite lower priority
            .flatMap((tl) => tl.tokens)
            .concat(ackTokens)
            .filter((t) => chainNumToString(t.chainId) === chainId)
            .forEach((t) => {
                // list URI of this iteration of the token
                const originatingList: string = t.fromList ?? 'unknown';
                // deep copy of this token data object
                const deepToken = {
                    address: t.address,
                    chainId: t.chainId,
                    decimals: t.decimals,
                    fromList: originatingList,
                    listedBy: [originatingList],
                    logoURI: t.logoURI,
                    name: t.name,
                    symbol: t.symbol,
                };
                // get the current token from the Map if already listed
                const tknFromMap: TokenIF | undefined = retMap.get(
                    t.address.toLowerCase(),
                );
                // if token is listed, update the array of originating URIs
                if (tknFromMap?.listedBy) {
                    deepToken.listedBy = deepToken.listedBy.concat(
                        tknFromMap.listedBy,
                    );
                }
                // add updated deep copy to the Map
                retMap.set(deepToken.address.toLowerCase(), deepToken);
            });
        return retMap;
    }, [tokenLists, ackTokens, chainId]);

    const tokenUniv = useMemo(() => [...tokenMap.values()], [tokenMap]);

    const defaultTokensInUniv = useMemo(
        () =>
            defaultTokens.filter(
                (tkn) => chainNumToString(tkn.chainId) === chainId,
            ),
        [chainId],
    );

    // Load token lists from local storage for fast load, but asynchronously
    // fetch tokens from external URLs and update with latest values
    useEffect(() => {
        const fetches = Object.values(tokenListURIs).map((uri: string) =>
            fetchTokenList(uri),
        );

        Promise.allSettled(fetches)
            // format returned data into a useful form for the app
            // 1st val ➡ indicates if second val is a value
            // 2nd val ➡ value returned by promise
            .then((promises) =>
                promises
                    .flatMap((promise) => Object.entries(promise))
                    .filter((promise) => promise[0] === 'value')
                    .map((promise) => promise[1]),
            )
            .then((lists: TokenListIF[]) => {
                lists.forEach((list) => {
                    list.tokens.forEach(
                        (token: TokenIF) => (token.fromList = list.uri),
                    );
                });

                // Write to local storage to cache for future sessions
                localStorage.setItem(
                    localStorageKeys.tokenLists,
                    JSON.stringify(lists),
                );
                setTokenLists(lists);
            });
    }, []);

    // fn to verify a token is on a known list or user-acknowledged
    const verifyToken = useCallback(
        (addr: string): boolean => {
            return tokenMap.has(addr.toLowerCase());
        },
        [chainId, tokenMap],
    );

    const ackToken = useCallback(
        (tkn: TokenIF): void => {
            // Don't duplicate if previously acknowledged
            if (
                ackTokens.some(
                    (ack) =>
                        ack.address === tkn.address &&
                        ack.chainId === tkn.chainId,
                )
            ) {
                return;
            }

            // Create new list object (don't just append) so memoization updates
            const newAckList = [...ackTokens, tkn];
            setAckTokens(newAckList);

            // Update local storage, so that newly added ack token is persisted
            // to next session
            localStorage.setItem(
                localStorageKeys.ackTokens,
                JSON.stringify(newAckList),
            );
        },
        [chainId, tokenUniv],
    );

    const getTokenByAddress = useCallback(
        (addr: string): TokenIF | undefined => tokenMap.get(addr.toLowerCase()),
        [chainId, tokenUniv],
    );

    const getTokensFromList = useCallback(
        (uri: string) => {
            return tokenUniv.filter((tkn: TokenIF) =>
                tkn.listedBy?.includes(uri),
            );
        },
        [chainId, tokenUniv],
    );

    // fn to return all tokens where name or symbol matches search input
    // can return just exact matches or exact + partial matches
    const getTokensByNameOrSymbol = useCallback(
        (input: string, exact = false): TokenIF[] => {
            // search input fixed for casing and with whitespace trimmed
            const cleanedInput: string = input.trim().toLowerCase();

            // fn to search for exact matches
            const searchExact = (): TokenIF[] => {
                // return tokens where name OR symbol exactly matches search string
                return tokenUniv.filter(
                    (tkn) =>
                        tkn.name.toLowerCase() === cleanedInput ||
                        tkn.symbol.toLowerCase() === cleanedInput,
                );
            };
            // fn to search for partial matches (includes exact matches too)
            const searchPartial = (): TokenIF[] => {
                // arrays to hold exact and partial matches separately
                const exactMatches: TokenIF[] = [];
                const partialMatches: TokenIF[] = [];
                // iterate over tokens to look for matches
                tokenUniv.forEach((tkn: TokenIF) => {
                    if (
                        tkn.name.toLowerCase() === cleanedInput ||
                        tkn.symbol.toLowerCase() === cleanedInput
                    ) {
                        // push exact matches to the appropriate array
                        exactMatches.push(tkn);
                    } else if (
                        tkn.name.toLowerCase().includes(cleanedInput) ||
                        tkn.symbol.toLowerCase().includes(cleanedInput)
                    ) {
                        // push partial matches to the appropriate array
                        partialMatches.push(tkn);
                    }
                });
                return exactMatches.concat(partialMatches);
            };
            // return requested results
            return exact ? searchExact() : searchPartial();
        },
        [chainId, tokenUniv],
    );

    return useMemo(
        () => ({
            defaultTokens: defaultTokensInUniv,
            verifyToken: verifyToken,
            ackToken: ackToken,
            tokenUniv: tokenUniv,
            getTokenByAddress: getTokenByAddress,
            getTokenFromList: getTokensFromList,
            getTokensByNameOrSymbol: getTokensByNameOrSymbol,
        }),
        [tokenUniv, chainId],
    );
};
