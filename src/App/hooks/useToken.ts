import { useTokenMap } from '../../utils/hooks/useTokenMap';
import { TokenIF } from '../../utils/interfaces/exports';

/* Hook to manage, search, and verify against the user's token universe. */
export const useToken = (
    chainId: string,
): [
    // Function for verifyng whether a given token exists in the universe
    verifyToken: (addr: string, chn: string) => boolean,

    // Returns all the tokens specifically defined in the Ambient token list
    getAmbientTokens: () => TokenIF[],

    // Returns all tokens in universe on a specific chain
    getTokensOnChain: (chn: string) => TokenIF[],

    // Looks up a specific token in the universe and returns metadata for it
    getToken: (addr: string, chn: string) => TokenIF | undefined,

    // Allows for a search by name or symbol, either with an exact or partial
    // match
    getTokensByName: (
        searchName: string,
        chn: string,
        exact: boolean,
    ) => TokenIF[],
] => {
    const tokenMap = useTokenMap();

    // fn to determine if a token exists in a recognized token list
    // parameter for chain is optional, app uses the current chain by default
    // but we can verify tokens on other chains too as needed
    const verifyToken = (addr: string, chn = chainId): boolean => {
        return tokenMap.has(addr.toLowerCase() + '_' + chn.toLowerCase());
    };

    // fn to retrieve all tokens from token map
    // this is the correct syntax to do so
    const getAllTokens = (): TokenIF[] => Array.from(tokenMap.values());

    // fn to get all Ambient tokens agnostic of chain
    const getAmbientTokens = (): TokenIF[] => {
        return getAllTokens().filter(
            (tok: TokenIF) => tok.fromList === '/ambient-token-list.json',
        );
    };

    // fn to retrieve all tokens from token map on current chain
    const getTokensOnChain = (chn = chainId): TokenIF[] => {
        // return all values from the token map on current chain
        return getAllTokens().filter((tok) => tok.chainId === parseInt(chn));
    };

    // fn to return a given token by name and address
    // parameter for chain is optional, app uses the current chain by default
    // but we can verify tokens on other chains too as needed
    const getTokenByAddress = (
        addr: string,
        chn = chainId,
    ): TokenIF | undefined => {
        return tokenMap.get(addr.toLowerCase() + '_' + chn.toLowerCase());
    };

    // fn to return an array of tokens matching either name or symbol
    // can return exact or partial matches
    const getTokensByName = (
        searchName: string,
        chn = chainId,
        exact = false,
    ): TokenIF[] => {
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
    };

    return [
        verifyToken,
        getAmbientTokens,
        getTokensOnChain,
        getTokenByAddress,
        getTokensByName,
    ];
};
