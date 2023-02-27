import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch } from '../../utils/hooks/reduxToolkit';
import Moralis from 'moralis';
import { defaultTokens } from '../../utils/data/defaultTokens';
import { ethers } from 'ethers';
import {
    setTokenA,
    setTokenB,
    setAdvancedMode,
    setAdvancedLowTick,
    setAdvancedHighTick
} from '../../utils/state/tradeDataSlice';
import { TokenIF, TokenListIF } from '../../utils/interfaces/exports';

export const useUrlParams = (
    // module: string,
    chainId: string,
    isInitialized: boolean,
): [string[], Array<number | null>, number | null] => {
    // get URL parameters, empty string if undefined
    const { params } = useParams() ?? '';
    // console.log({params});

    const dispatch = useAppDispatch();

    // parse parameter string into [key, value] tuples
    // useMemo() with empty dependency array runs once on initial render
    const urlParams = useMemo<string[][]>(() => {
        // get URL parameters or empty string if undefined
        const fixedParams = params ?? '';
        // split params string at every ampersand
        return (
            fixedParams
                .split('&')
                // remove any values missing an = symbol
                .filter((par) => par.includes('='))
                // split substrings at = symbols to make [key, value] tuples
                .map((par) => par.split('='))
                // remove empty strings created by extra = symbols
                .map((par) => par.filter((e) => e !== ''))
                // remove tuples with trisomy issues
                .filter((par) => par.length === 2)
        );
    }, [params]);

    const getAddress = (tkn: string) => {
        const tokenParam = urlParams.find((param) => param[0] === tkn);
        const tokenAddress = tokenParam ? tokenParam[1] : ethers.constants.AddressZero;
        return tokenAddress.toLowerCase();
    };

    const tokenPair = useMemo(() => {
        return [getAddress('tokenA'), getAddress('tokenB')];
    }, [urlParams]);

    const tickPair = useMemo<Array<number | null>>(() => {
        const getTick = (tick: string): number | null => {
            let neededTick: string;
            if (tick === 'low') {
                neededTick = 'lowTick';
            } else if (tick === 'high') {
                neededTick = 'highTick';
            }
            const tickParam = urlParams.find((param) => param[0] === neededTick);
            return tickParam ? parseInt(tickParam[1]) : null;
        };
        const advLowTick = getTick('low') ?? 0;
        const advHighTick = getTick('high') ?? 0;
        advLowTick && dispatch(setAdvancedLowTick(advLowTick));
        advHighTick && dispatch(setAdvancedHighTick(advHighTick));
        console.log({advHighTick});
        console.log({advLowTick});
        if (![advLowTick, advHighTick].includes(0)) {
            console.log('doing it!!');
            dispatch(setAdvancedMode(true));
        }
        return [advLowTick, advHighTick];
    }, [urlParams]);

    const limitTick = useMemo<number | null>(() => {
        const limitTickParam = urlParams.find((param) => param[0] === 'limitTick');
        return limitTickParam ? parseInt(limitTickParam[1]) : null;
    }, [urlParams]);

    // make a list of params found in the URL queried
    const paramsUsed = useMemo(() => urlParams.map((param) => param[0]), [urlParams]);

    // determine which chain to use
    const chainToUse = useMemo(() => {
        // find `chain` in params
        const chainParam = urlParams.find((param) => param[0] === 'chain');
        // if a chain was included in the URL params use that
        // otherwise use whatever chain ID the hook was passed
        return chainParam ? chainParam[1] : chainId;
        // update this value every time the app switches chains
    }, [chainId]);

    // TODO: need to get this data from somewhere other than default tokens
    // find the native token of the current chain
    const nativeToken = useMemo(
        () =>
            // iterate through ambient token list
            defaultTokens.find(
                (tkn) =>
                    // token address must be the zero address
                    tkn.address === ethers.constants.AddressZero &&
                    // token must be on the correct chain
                    tkn.chainId === parseInt(chainToUse),
            ),
        // update this value when the hook switches to a new chain
        [chainToUse],
    );

    const [tokenList, setTokenList] = useState<string | undefined>();

    useEffect(() => {
        // get allTokenLists from local storage
        function check() {
            const tokenListsFromStorage = localStorage.getItem('allTokenLists');
            if (tokenListsFromStorage !== null) {
                // console.log('found');
                setTokenList(tokenListsFromStorage);
            } else {
                // console.log('not found');
                setTimeout(check, 100);
            }
        }
        setTimeout(check, 100);
    }, []);

    // useEffect() to update token pair
    useEffect(() => {
        const fetchAndFormatTokenData = (addr: string) => {
            // short-circuit function if native token is needed
            if (addr === ethers.constants.AddressZero) {
                return nativeToken;
            }

            let listCounter = 0;

            // function to find token if not the native token
            const findToken = (listNames: string[]): TokenIF | undefined => {
                console.log('looking for token!!');
                const allTokenLists = tokenList ? JSON.parse(tokenList as string) : undefined;
                // extract CoinGecko list from allTokenLists
                if (
                    // make sure allTokenLists is not undefined
                    allTokenLists &&
                    // make sure desired list is in allTokenLists
                    allTokenLists.some(
                        (list: TokenListIF) => list.name === listNames[listCounter] && list.default,
                    )
                ) {
                    // extract desired token list
                    const { tokens } = allTokenLists.find(
                        (list: TokenListIF) => list.name === listNames[listCounter] && list.default,
                    );
                    // see if the desired token is in the list
                    const tokenOnList = tokens.some(
                        (token: TokenIF) =>
                            token.address.toLowerCase() === addr &&
                            token.chainId === parseInt(chainToUse),
                    );

                    if (tokenOnList) {
                        const token = tokens.find(
                            (token: TokenIF) => token.address.toLowerCase() === addr,
                        );
                        return token;
                    } else if (listCounter < listNames.length - 1) {
                        listCounter++;
                        return findToken(listNames);
                    } else {
                        return getTokenFromChain(addr);
                    }
                }
            };
            return findToken(['Ambient Token List', 'CoinGecko', 'Testnet Token List']);
        };

        // TODO: find a way to correctly type this return
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function getTokenFromChain(addr: string): any {
            const promise = Moralis.EvmApi.token.getTokenMetadata({
                addresses: [addr],
                chain: chainToUse,
            });
            return Promise.resolve(promise)
                .then((res) => res?.result[0].token)
                .then((token) => {
                    // console.log({ token });
                    return {
                        name: token.name,
                        chainId: token.chain.decimal,
                        address: token.contractAddress.lowercase,
                        symbol: token.symbol,
                        decimals: token.decimals,
                        logoURI: token.logo ?? '',
                        fromList: 'urlParam',
                    };
                });
        }

        const addrTokenA = tokenPair[0];
        const addrTokenB = tokenPair[1];
        const tokensAreDifferent =
            paramsUsed.includes('tokenA') &&
            paramsUsed.includes('tokenB') &&
            addrTokenA !== addrTokenB;
        const paramsIncludesToken = paramsUsed.includes('tokenA') || paramsUsed.includes('tokenB');
        // TODO: this needs to be gatekept so it runs only once
        if (isInitialized && tokensAreDifferent && paramsIncludesToken) {
            Promise.all([
                fetchAndFormatTokenData(addrTokenA),
                fetchAndFormatTokenData(addrTokenB),
            ]).then((res) => {
                res[0] && dispatch(setTokenA(res[0] as TokenIF));
                res[1] && dispatch(setTokenB(res[1] as TokenIF));
            });
        }
    }, [tokenList, urlParams]);

    return [tokenPair, tickPair, limitTick];
};
