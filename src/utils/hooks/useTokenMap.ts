import { useEffect, useState } from 'react';
import { TokenIF, TokenListIF } from '../interfaces/exports';
import { tokenListURIs } from '../data/tokenListURIs';

export const useTokenMap = (
    tokenListsNeeded: string[]
) => {
    // console.log(tokenListURIs);
    const [tokenMap, setTokenMap] = useState(new Map<string, TokenIF>());

    // const tokensArray = JSON.parse(localStorage.getItem('allTokenLists') as string)
    //     .filter((list: TokenListIF) => tokenListsNeeded.includes(list.uri ?? ''))
    //     .flatMap((list: TokenListIF) => list.tokens);

    // console.log(tokensArray);

    const getAmbientTokens = () => {
        let ambientTokens = [];
        try {
            let tokenLists = [];
            if (localStorage.allTokenLists) {
                tokenLists = JSON.parse(localStorage.getItem('allTokenLists') as string);
                const ambientListPresent = tokenLists.some(
                    (tokenList: TokenListIF) => tokenList.uri === tokenListURIs.ambient,
                );
                if (ambientListPresent) {
                    ambientTokens = tokenLists.find(
                        (tokenList: TokenListIF) => tokenList.uri === tokenListURIs.ambient,
                    ).tokens;
                } else {
                    // throw new Error('Did not find Ambient token list in local storage.');
                }
            } else {
                // tokenLists.push(ambientTokenList.tokens);
                // throw new Error('Did not find value <<<allTokenLists>>> in local storage.');
            }
        } catch (err) {
            console.warn(err);
        }
        return ambientTokens;
    };

    const getCoinGeckoTokens = () => {
        let coinGeckoTokens = [];
        try {
            let tokenLists = [];
            if (localStorage.allTokenLists) {
                // console.log('getting coinGeckoTokens from localStorage...');

                tokenLists = JSON.parse(localStorage.getItem('allTokenLists') as string);
                const coinGeckoListPresent = tokenLists.some(
                    (tokenList: TokenListIF) => tokenList.uri === tokenListURIs.coingecko,
                );
                if (coinGeckoListPresent) {
                    coinGeckoTokens = tokenLists.find(
                        (tokenList: TokenListIF) => tokenList.uri === tokenListURIs.coingecko,
                    ).tokens;
                } else {
                    // throw new Error('Did not find CoinGecko token list in local storage.');
                }
            } else {
                // throw new Error('Did not find value <<<allTokenLists>>> in local storage.');
            }
        } catch (err) {
            console.warn(err);
        }
        return coinGeckoTokens;
    };

    useEffect(() => {
        const allTokenLists = JSON.parse(localStorage.getItem('allTokenLists') as string);

        const getTokensByURI = (uri: string) => allTokenLists.find((list: TokenListIF) => list.uri === uri).tokens;

        const tkns = tokenListsNeeded.flatMap((listURI: string) => getTokensByURI(listURI));
        console.log(tkns);

        const newTokensMap = new Map<string, TokenIF>();



        getCoinGeckoTokens().forEach((tkn: TokenIF) =>
            newTokensMap.set(
                tkn.address.toLowerCase() + '_0x' + tkn.chainId.toString(16).toLowerCase(),
                tkn,
            ),
        );
        getAmbientTokens().forEach((tkn: TokenIF) =>
            newTokensMap.set(
                tkn.address.toLowerCase() + '_0x' + tkn.chainId.toString(16).toLowerCase(),
                tkn,
            ),
        );
        setTokenMap(newTokensMap);
    }, [localStorage.allTokenLists]);

    return tokenMap;
};
