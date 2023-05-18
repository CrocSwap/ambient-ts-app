import { useCallback, useMemo } from 'react';
import { useTokenMap } from '../../utils/hooks/useTokenMap';
import { TokenIF } from '../../utils/interfaces/exports';

/* Hook to manage, search, and verify against the user's token universe. */
export const useToken = (chainId: string) => {
    const tokenMap = useTokenMap();

    // fn to determine if a token exists in a recognized token list
    // parameter for chain is optional, app uses the current chain by default
    // but we can verify tokens on other chains too as needed
    const verifyToken = useCallback(
        (addr: string, chn = chainId): boolean => {
            return tokenMap.has(addr.toLowerCase() + '_' + chn.toLowerCase());
        },
        [tokenMap, chainId],
    );

    // fn to retrieve all tokens from token map
    // this is the correct syntax to do so
    const tokenUniv = useMemo(() => Array.from(tokenMap.values()), [tokenMap]);

    // fn to get all Ambient tokens agnostic of chain
    const ambientTokens = useMemo(
        () =>
            tokenUniv.filter(
                (tok: TokenIF) => tok.fromList === '/ambient-token-list.json',
            ),
        [tokenUniv],
    );

    // fn to retrieve all tokens from token map on current chain
    const onChainTokens = useMemo(
        (): TokenIF[] =>
            tokenUniv.filter((tok) => tok.chainId === parseInt(chainId)),
        [tokenUniv],
    );

    // fn to return a given token by name and address
    // parameter for chain is optional, app uses the current chain by default
    // but we can verify tokens on other chains too as needed
    const getTokenByAddress = useCallback(
        (addr: string): TokenIF | undefined => {
            return tokenMap.get(
                addr.toLowerCase() + '_' + chainId.toLowerCase(),
            );
        },
        [tokenMap, chainId],
    );

    // fn to return an array of tokens matching either name or symbol
    // can return exact or partial matches
    const getTokensByName = useCallback(
        (searchName: string, chainId: string, exact = false): TokenIF[] => {
            // array of all on-chain tokens in the Map

            // search logic for exact matches only
            const searchExact = (input: string): TokenIF[] => {
                // return filtered array of on-chain tokens
                return onChainTokens.filter(
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
                return onChainTokens.filter(
                    (tok: TokenIF) =>
                        // return token if name includes search string
                        tok.name.toLowerCase().includes(input.toLowerCase()) ||
                        // return token if symbol includes search string
                        tok.symbol.toLowerCase().includes(input.toLowerCase()),
                );
            };

            // array of matches, either exact or partial, depending on arg in fn call
            const matches: TokenIF[] = exact
                ? searchExact(searchName)
                : searchPartial(searchName);

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
        },
        [tokenMap, chainId, onChainTokens],
    );

    return {
        verifyToken,
        ambientTokens,
        onChainTokens,
        getTokenByAddress,
        getTokensByName,
    };
};
