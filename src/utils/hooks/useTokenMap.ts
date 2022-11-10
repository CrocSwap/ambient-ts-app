import { useEffect, useState } from 'react';
import { TokenIF, TokenListIF } from '../interfaces/exports';

export const useTokenMap = (
    tokenListsNeeded: string[]
) => {
    const [tokenMap, setTokenMap] = useState(new Map<string, TokenIF>());

    useEffect(() => {
        const allTokenLists = JSON.parse(localStorage.getItem('allTokenLists') as string);

        const getTokensByURI = (uri: string) => {
            let tokens: TokenIF[] = [];
            try {
                const findListByURI = (list: TokenListIF) => list.uri === uri;
                const doesListExist = allTokenLists.some(findListByURI);
                const errMsg = `Did not find a token list with URI <<${uri}>> in local storage.`;
                if (doesListExist) {
                    tokens = allTokenLists.find(findListByURI).tokens;
                } else {
                    throw new Error(errMsg);
                }
            } catch (err) {
                console.warn(err);
            }
            return tokens;
        };
        const newTokensMap = new Map<string, TokenIF>();

        tokenListsNeeded
            .flatMap((listURI: string) => getTokensByURI(listURI))
            .forEach((tkn: TokenIF) =>
                newTokensMap.set(
                    tkn.address.toLowerCase() + '_0x' + tkn.chainId.toString(16).toLowerCase(),
                    tkn,
            ),
        );

        setTokenMap(newTokensMap);
    }, [localStorage.allTokenLists]);

    return tokenMap;
};
