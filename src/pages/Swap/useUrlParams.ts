import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch } from '../../utils/hooks/reduxToolkit';
import { useMoralisWeb3Api } from 'react-moralis';
import { defaultTokens } from '../../utils/data/defaultTokens';
import { ethers } from 'ethers';
import { setTokenA, setTokenB } from '../../utils/state/tradeDataSlice';
import { TokenIF, TokenListIF } from '../../utils/interfaces/exports';

export const useUrlParams = (
    // module: string,
    chainId: string,
    isInitialized: boolean,
) => {
    // get URL parameters, empty string if undefined
    const { params } = useParams() ?? '';

    const dispatch = useAppDispatch();

    // needed to pull token metadata from on-chain
    const Web3Api = useMoralisWeb3Api();

    // parse parameter string into [key, value] tuples
    // useMemo() with empty dependency array runs once on initial render
    const urlParams = useMemo(() => {
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
            return findToken(['Ambient Token List', 'CoinGecko']);
        };

        // TODO: find a way to correctly type this return
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function getTokenFromChain(addr: string): any {
            const promise = Web3Api.token.getTokenMetadata({
                chain: chainToUse as '0x5',
                addresses: [addr],
            });
            return Promise.resolve(promise)
                .then((res) => res[0])
                .then((res) => ({
                    name: res.name,
                    address: res.address,
                    symbol: res.symbol,
                    decimals: res.decimals,
                    logoURI: res.logo ?? '',
                    fromList: 'urlParam',
                }));
        }

        const getAddress = (tkn: string) => {
            const tokenParam = urlParams.find((param) => param[0] === tkn);
            const tokenAddress = tokenParam ? tokenParam[1] : ethers.constants.AddressZero;
            return tokenAddress.toLowerCase();
        };
        const addrTokenA = getAddress('tokenA');
        const addrTokenB = getAddress('tokenB');
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
                // res.forEach((tkn) =>
                //     console.assert(
                //         tkn,
                //         'Missing token data in useUrlParams.ts, refer to file for troubleshooting',
                //     ),
                // );
                res[0] && dispatch(setTokenA(res[0] as TokenIF));
                res[1] && dispatch(setTokenB(res[1] as TokenIF));
            });
        }
    }, [tokenList, urlParams]);
};
