import { useEffect, useState } from 'react';
import { TokenIF, TokenListIF } from '../../../utils/interfaces/exports';
import { tokenListURIs } from '../../../utils/data/tokenListURIs';

export const useTokenMap = () => {
    const [tokenMap, setTokenMap] = useState(new Map<string, TokenIF>());

    const getAmbientTokens = () => {
        let ambientTokens = [];
        try {
            let tokenLists = [];
            if (localStorage.allTokenLists) {
                console.log('getting allTokenLists from localStorage...');
                tokenLists = JSON.parse(localStorage.getItem('allTokenLists') as string);
                const ambientListPresent = tokenLists.some(
                    (tokenList: TokenListIF) => tokenList.uri === tokenListURIs.ambient,
                );
                if (ambientListPresent) {
                    ambientTokens = tokenLists.find(
                        (tokenList: TokenListIF) => tokenList.uri === tokenListURIs.ambient,
                    ).tokens;
                } else {
                    throw new Error('Did not find Ambient token list in local storage.');
                }
            } else {
                throw new Error('Did not find value <<<allTokenLists>>> in local storage.');
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
                console.log('getting allTokenLists from localStorage...');
                tokenLists = JSON.parse(localStorage.getItem('allTokenLists') as string);
                const coinGeckoListPresent = tokenLists.some(
                    (tokenList: TokenListIF) => tokenList.uri === tokenListURIs.coingecko,
                );
                if (coinGeckoListPresent) {
                    coinGeckoTokens = tokenLists.find(
                        (tokenList: TokenListIF) => tokenList.uri === tokenListURIs.coingecko,
                    ).tokens;
                } else {
                    throw new Error('Did not find CoinGecko token list in local storage.');
                }
            } else {
                throw new Error('Did not find value <<<allTokenLists>>> in local storage.');
            }
        } catch (err) {
            console.warn(err);
        }
        return coinGeckoTokens;
    };

    useEffect(() => {
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
    }, []);

    return tokenMap;
};
