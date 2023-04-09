import { useEffect, useState } from 'react';
import { TokenIF, TokenListIF } from '../interfaces/exports';

export const useTokenMap = () => {
    const tokenListsNeeded = JSON.parse(localStorage.getItem('user') as string)
        ?.activeTokenLists ?? ['/ambient-token-list.json'];

    // hook to preserve the token map value across renders
    const [tokenMap, setTokenMap] = useState(new Map<string, TokenIF>());

    // hook to create a new token map and write it to local storage
    useEffect(() => {
        // JSON value of 'allTokenLists' from local storage
        const allTokenLists = JSON.parse(
            localStorage.getItem('allTokenLists') as string,
        );
        if (!allTokenLists) return;

        const getTokensByURI = (uri: string) => {
            try {
                const findListByURI = (list: TokenListIF) => list.uri === uri;
                const doesListExist = allTokenLists.some(findListByURI);

                if (doesListExist) {
                    return allTokenLists.find(findListByURI).tokens;
                } else {
                    throw new Error(
                        `Did not find a token list with URI <<${uri}>> in local storage.`,
                    );
                }
            } catch (err) {
                console.warn(err);
            }
            return [];
        };

        // declare a variable to hold the token map
        const newTokensMap = new Map<string, TokenIF>();

        // make array of all tokens in the relevant lists
        tokenListsNeeded
            .flatMap(getTokensByURI)
            // create a value in the Map object
            .forEach((tkn: TokenIF) =>
                newTokensMap.set(
                    tkn.address.toLowerCase() +
                        '_0x' +
                        tkn.chainId.toString(16).toLowerCase(),
                    tkn,
                ),
            );

        setTokenMap(newTokensMap);
    }, [localStorage.allTokenLists]);

    // return token map held in local state created by useEffect() hook
    return tokenMap;
};
