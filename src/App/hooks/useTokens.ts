import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { hiddenTokens, tokenListURIs } from '../../ambient-utils/constants';
import ambientTokenList from '../../ambient-utils/constants/ambient-token-list.json';
import testnetTokenList from '../../ambient-utils/constants/testnet-token-list.json';
import {
    chainNumToString,
    serializeBigInt,
    uriToHttp,
} from '../../ambient-utils/dataLayer';
import { TokenIF, TokenListIF } from '../../ambient-utils/types';
import { AppStateContext, TokenBalanceContext } from '../../contexts';

export interface tokenMethodsIF {
    verify: (addr: string) => boolean;
    acknowledge: (tkn: TokenIF) => void;
    tokenUniv: TokenIF[];
    ackTokens: TokenIF[];
    getTokenByAddress: (addr: string) => TokenIF | undefined;
    getTokensFromList: (uri: string) => TokenIF[];
    getTokensByNameOrSymbol: (
        input: string,
        chn: string,
        exact?: boolean,
    ) => TokenIF[];
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
const INIT_LIST: TokenListIF[] = getTokenListsFromLS();
const INIT_ACK: TokenIF[] = getAckTokensFromLS();

export const useTokens = (): tokenMethodsIF => {
    // Token universe
    const [tokenLists, setTokenLists] = useState<TokenListIF[]>(INIT_LIST);

    const {
        activeNetwork: { chainId },
    } = useContext(AppStateContext);
    const { tokenBalances } = useContext(TokenBalanceContext);

    // User acknowledge tokens
    const [ackTokens, setAckTokens] = useState<TokenIF[]>(INIT_ACK);

    // Universe of tokens within the given chain. Combines both tokens from
    // lists and user-acknowledge tokens
    const tokenMap = useMemo<Map<string, TokenIF>>(() => {
        const retMap = new Map<string, TokenIF>();
        tokenLists
            .flatMap((tl) => tl.tokens)
            .concat(ackTokens)
            .filter((t) => {
                // First filter by chainId
                if (chainNumToString(t.chainId) !== chainId) return false;

                // Then check if token is in exclusion list
                return !hiddenTokens.some(
                    (excluded) =>
                        excluded.address.toLowerCase() ===
                            t.address.toLowerCase() &&
                        excluded.chainId === t.chainId,
                );
            })
            .forEach((t) => {
                // list URI of this iteration of the token
                const originatingList: string = t.fromList ?? 'unknown';
                // deep copy of this token data object
                const deepToken: TokenIF = deepCopyToken(t, originatingList);
                // get the current token from the Map if already listed
                const tknFromMap: TokenIF | undefined = retMap.get(
                    t.address.toLowerCase(),
                );
                // if token is listed, update the array of originating URIs
                if (tknFromMap?.listedBy) {
                    deepToken.listedBy = deepToken.listedBy?.concat(
                        tknFromMap.listedBy,
                    );
                    // prevent overwriting ambient token list values
                    if (tknFromMap.listedBy?.includes(tokenListURIs.ambient)) {
                        deepToken.address = tknFromMap.address;
                        deepToken.symbol = tknFromMap.symbol;
                        deepToken.name = tknFromMap.name;
                        deepToken.logoURI = tknFromMap.logoURI;
                        deepToken.decimals = tknFromMap.decimals;
                    }
                }
                // add updated deep copy to the Map
                retMap.set(deepToken.address.toLowerCase(), deepToken);
            });
        return retMap;
    }, [tokenLists, ackTokens, chainId]);

    const tokenUniv: TokenIF[] = useMemo(() => {
        if (tokenMap.size) {
            const newArray = [...tokenMap.values()];
            for (const token of tokenBalances ?? []) {
                if (
                    !newArray.some(
                        (tkn) =>
                            tkn.address.toLowerCase() ===
                            token.address.toLowerCase(),
                    )
                ) {
                    newArray.push(token);
                }
            }
            return newArray;
        } else {
            const newArray = [...ambientTokenList.tokens];
            for (const token of tokenBalances ?? []) {
                if (
                    !newArray.some(
                        (tkn) =>
                            tkn.address.toLowerCase() ===
                            token.address.toLowerCase(),
                    )
                ) {
                    newArray.push(token);
                }
            }
            return newArray
                .filter((tkn: TokenIF) => tkn.chainId === parseInt(chainId))
                .filter((t) => {
                    // Then check if token is in exclusion list
                    return !hiddenTokens.some(
                        (excluded) =>
                            excluded.address.toLowerCase() ===
                                t.address.toLowerCase() &&
                            excluded.chainId === t.chainId,
                    );
                })
                .map((tkn: TokenIF) =>
                    deepCopyToken(tkn, tkn.fromList ?? tokenListURIs.ambient),
                );
        }
    }, [tokenMap, tokenBalances]);

    // fn to make a deep copy of a token data object
    // without this we overrwrite token data in local storage in post-processing
    function deepCopyToken(tkn: TokenIF, source: string): TokenIF {
        return {
            address: tkn.address,
            chainId: tkn.chainId,
            decimals: tkn.decimals,
            fromList: source,
            listedBy: [source],
            logoURI: tkn.logoURI,
            name: tkn.name,
            symbol: tkn.symbol,
        };
    }

    // Load token lists from local storage for fast load, but asynchronously
    // fetch tokens from external URLs and update with latest values
    useEffect(() => {
        const fetchAndFormatList = async (
            uri: string,
        ): Promise<TokenListIF | undefined> => {
            // convert URI to an array of queryable endpoints
            const endpoints: string[] = uriToHttp(uri, 'retry');
            // logic to query endpoints until a query is successful
            let rawData;
            for (let i = 0; i < endpoints.length; i++) {
                // isolate current endpoint from list
                const endpoint = endpoints[i];
                // special handling for the ambient token list (exists locally)
                if (endpoint === tokenListURIs.ambient) {
                    rawData = ambientTokenList;
                }
                // special handling for the testnet token list (exists locally)
                else if (endpoint === tokenListURIs.testnet) {
                    rawData = testnetTokenList;
                }
                // handling for all non-local token lists
                else {
                    const response = await fetch(endpoint);
                    if (response.ok) {
                        rawData = await response.json();
                        break;
                    }
                }
            }
            // cease funcationality if no endpoint returned a valid response
            if (!rawData) return;
            // format the raw data returned with values used in the Ambient app
            const output: TokenListIF = {
                ...rawData,
                uri,
                dateRetrieved: new Date().toISOString(),
                userImported: false,
                tokens: rawData.tokens.map((tkn: TokenIF) => {
                    return { ...tkn, fromList: uri };
                }),
            };
            // return formatted token list
            return output;
        };
        // array of promises for fetched token lists
        const tokenListPromises: Promise<TokenListIF | undefined>[] =
            Object.values(tokenListURIs).map((uri: string) =>
                fetchAndFormatList(uri),
            );
        // resolve all promises for token lists
        Promise.allSettled(tokenListPromises).then((results) => {
            // Filter out promises that were rejected and extract values from fulfilled ones
            const fulfilledLists = results
                .filter(
                    (
                        result,
                    ): result is PromiseFulfilledResult<
                        TokenListIF | undefined
                    > => result.status === 'fulfilled',
                )
                .map((result) => result.value)
                .filter((l) => l !== undefined); // remove `undefined` values (URIs that did not produce a valid response)

            // Record token lists in local storage + persist in local storage
            fulfilledLists.length &&
                localStorage.setItem(
                    localStorageKeys.tokenLists,
                    JSON.stringify(fulfilledLists),
                );
            fulfilledLists.length &&
                setTokenLists(fulfilledLists as TokenListIF[]);
        });
    }, []);

    // fn to verify a token is on a known list or user-acknowledged
    const verifyToken = useCallback(
        (addr: string): boolean => {
            for (const token of ambientTokenList.tokens.concat(
                testnetTokenList.tokens,
            )) {
                if (
                    token.address.toLowerCase() === addr.toLowerCase() &&
                    token.chainId === parseInt(chainId)
                ) {
                    return true;
                }
            }
            for (const token of tokenMap.values()) {
                if (
                    token.address.toLowerCase() === addr.toLowerCase() &&
                    token.chainId === parseInt(chainId)
                ) {
                    return true;
                }
            }
            return false;
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
                serializeBigInt(newAckList),
            );
        },
        [chainId, tokenUniv],
    );

    const getTokenByAddress = useCallback(
        (addr: string): TokenIF | undefined => tokenMap.get(addr.toLowerCase()),
        [tokenMap],
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
        (input: string, chn: string, exact = false): TokenIF[] => {
            // search input fixed for casing and with whitespace trimmed
            const cleanedInput: string = input.trim().toLowerCase();

            // fn to search for exact matches
            const searchExact = (): TokenIF[] => {
                // return tokens where name OR symbol exactly matches search string
                return tokenUniv
                    .filter((tkn: TokenIF) => tkn.chainId === parseInt(chn))
                    .filter(
                        (tkn: TokenIF) =>
                            tkn.name.toLowerCase() === cleanedInput ||
                            tkn.symbol.toLowerCase() === cleanedInput,
                    )
                    .filter((t) => {
                        // Then check if token is in exclusion list
                        return !hiddenTokens.some(
                            (excluded) =>
                                excluded.address.toLowerCase() ===
                                    t.address.toLowerCase() &&
                                excluded.chainId === t.chainId,
                        );
                    });
            };
            // fn to search for partial matches (includes exact matches too)
            const searchPartial = (): TokenIF[] => {
                // arrays to hold exact and partial matches separately
                const exactMatches: TokenIF[] = [];
                const partialMatches: TokenIF[] = [];
                // iterate over tokens to look for matches
                tokenUniv
                    .filter((tkn: TokenIF) => tkn.chainId === parseInt(chn))
                    .forEach((tkn: TokenIF) => {
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
                return exactMatches.concat(partialMatches).filter((t) => {
                    // Then check if token is in exclusion list
                    return !hiddenTokens.some(
                        (excluded) =>
                            excluded.address.toLowerCase() ===
                                t.address.toLowerCase() &&
                            excluded.chainId === t.chainId,
                    );
                });
            };
            // return requested results
            return exact ? searchExact() : searchPartial();
        },
        [chainId, tokenUniv],
    );

    return useMemo(
        () => ({
            verify: verifyToken,
            acknowledge: ackToken,
            tokenUniv: tokenUniv,
            ackTokens: ackTokens,
            getTokenByAddress,
            getTokensFromList,
            getTokensByNameOrSymbol,
        }),
        [tokenUniv, chainId],
    );
};
