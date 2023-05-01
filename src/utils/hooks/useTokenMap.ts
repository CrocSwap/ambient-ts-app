import { useEffect, useState } from 'react';
import { defaultTokenLists } from '../data/defaultTokenLists';
import { tokenListURIs } from '../data/tokenListURIs';
import { TokenIF, TokenListIF } from '../interfaces/exports';

export const useTokenMap = () => {
    // hook to preserve the token map value across renders
    const [tokenMap, setTokenMap] = useState(INIT_TOKEN_LIST);

    // hook to create a new token map and write it to local storage
    useEffect(() => {
        const newTokensMap = scrapeTokenMap();
        setTokenMap(newTokensMap);
    }, [localStorage.allTokenLists, localStorage.acknowledgedTokens]);

    // return token map held in local state created by useEffect() hook
    return tokenMap;
};

function scrapeTokenMap() {
    const tokenListsNeeded = defaultTokenLists.map(
        (listName) => tokenListURIs[listName],
    );

    function parseAllTokens(): TokenListIF[] {
        const entry = localStorage.getItem('allTokenLists');
        if (entry) {
            try {
                const entryObj = JSON.parse(entry);
                return entryObj as TokenListIF[];
            } catch {
                console.warn(
                    'localStorage allTokenList corrupt. Clearning entry',
                );
                localStorage.removeItem('allTokenLists');
            }
        }
        return [];
    }

    function parseAckTokens(): TokenIF[] {
        const entry = localStorage.getItem('acknowledgedTokens');
        if (entry) {
            try {
                return JSON.parse(entry) as TokenIF[];
            } catch {
                console.warn(
                    'localStorage acknowledgedTokens corrupt. Clearing entry',
                );
                localStorage.removeItem('ackowledgedTokens');
            }
        }
        return [];
    }

    const allTokenLists = parseAllTokens();
    const ackTokens = parseAckTokens();

    const getTokensByURI = (uri: string) => {
        const findListByURI = (list: TokenListIF) => list.uri === uri;
        return allTokenLists.find(findListByURI)?.tokens || [];
    };

    // Ack tokens have lower priority (go first in list, so are overwrriten if
    // duplicated) than list token entries.
    const tokenUniv = tokenListsNeeded
        .flatMap(getTokensByURI)
        .concat(ackTokens)
        .reverse();

    // declare a variable to hold the token map
    const newTokensMap = new Map<string, TokenIF>();

    tokenUniv.forEach((tkn: TokenIF) =>
        newTokensMap.set(
            tkn.address.toLowerCase() +
                '_0x' +
                tkn.chainId.toString(16).toLowerCase(),
            tkn,
        ),
    );

    return newTokensMap;
}

const INIT_TOKEN_LIST = scrapeTokenMap();
