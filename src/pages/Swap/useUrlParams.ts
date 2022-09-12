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

    const [cgl, setCgl] = useState<TokenListIF | null>(null);
    const [cglTryCounter, setCglTryCounter] = useState(0);
    useEffect(() => console.log(cglTryCounter), [cglTryCounter])

    useEffect(() => {
        const getCoinGeckoList = () => {
            const allTokenLists = JSON.parse(localStorage.getItem('allTokenLists') as string);
                if (
                    allTokenLists &&
                    allTokenLists.some(
                        (list: TokenListIF) => list.name === 'CoinGecko' && list.default
                    )
                ) {
                    setCgl(
                        allTokenLists.find((list: TokenListIF) => (
                            list.name === 'CoinGecko' && list.default
                        ))
                    );
                } else {
                    setCglTryCounter(cglTryCounter + 1);
                    cglTryCounter < 10 && setTimeout(() => getCoinGeckoList(), 250);
                }
            }
        cgl ?? getCoinGeckoList();
    }, []);
    useEffect(() => console.log({cgl}), [cgl]);

    const dispatch = useAppDispatch();

    // needed to pull token metadata from on-chain
    const Web3Api = useMoralisWeb3Api();

    // parse parameter string into [key, value] tuples
    // useMemo() with empty dependency array runs once on initial render
    const urlParams = useMemo(() => {
        // get URL parameters or empty string if undefined
        const fixedParams = params ?? '';
        // split params string at every ampersand
        return fixedParams.split('&')
            // remove any values missing an = symbol
            .filter(par => par.includes('='))
            // split substrings at = symbols to make [key, value] tuples
            .map(par => par.split('='))
            // remove empty strings created by extra = symbols
            .map(par => par.filter(e => e !== ''))
            // remove tuples with trisomy issues
            .filter(par => par.length === 2);
    }, []);

    const paramsUsed = useMemo(() => (
        urlParams.map(param => param[0])
    ), []);

    const chainToUse = useMemo(() => {
        const chainParam = urlParams.find(param => param[0] === 'chain');
        return chainParam ? chainParam[1] : chainId;
    }, [chainId]);

    const nativeToken = useMemo(() => (
        defaultTokens.find(tkn =>
            tkn.address === ethers.constants.AddressZero &&
            tkn.chainId === parseInt(chainToUse)
        )
    ), [chainToUse]);

    // this can probably go inside the useEffect() hook for token data


    // useEffect to switch chains if necessary

    // useEffect() to update token pair
    useEffect(() => {
        const fetchAndFormatTokenData = (addr: string) => {
            if (addr === ethers.constants.AddressZero) return nativeToken;
    
            const getTokenFromChain = () => {
                const promise = Web3Api.token.getTokenMetadata({
                    chain: chainToUse as '0x1', addresses: [addr]
                });
                return (Promise.resolve(promise)
                    .then(res => res[0])
                    .then(res => ({
                        name: res.name,
                        address: res.address,
                        symbol: res.symbol,
                        decimals: res.decimals,
                        logoURI: res.logo,
                        fromList: 'urlParam'
                    }))
                );
            }
    
            if (cgl) {
                const token = cgl.tokens.find((token: TokenIF) => (
                    token.address === addr
                    // TODO: the next line makes sure the token is from
                    // TODO: ... the current chain, it is disabled now
                    // TODO: ... for dev testing, will turn on and test
                    // TODO: ... error handling later
                    // && token.chainId === parseInt(chainId)
                ));
                console.log('token from CG: ', token);
                return token || getTokenFromChain();
            } else if (cglTryCounter <= 10) {
                console.log(cgl);
                console.log('no CG token list yet... re-calling function');
                // console.log(cglTryCounter);
                setTimeout(() => fetchAndFormatTokenData(addr), 250);
            } else {
                console.log('hit max attempts to get token from CG, fetching from chain');
                getTokenFromChain();
            }
        }
        const getAddress = (tkn: string) => {
            const tokenParam = urlParams.find(param => param[0] === tkn);
            const tokenAddress = tokenParam
                ? tokenParam[1]
                : ethers.constants.AddressZero;
            return tokenAddress.toLowerCase();
        }
        const addrTokenA = getAddress('tokenA');
        const addrTokenB = getAddress('tokenB');
        const tokensAreDifferent = (
            paramsUsed.includes('tokenA') &&
            paramsUsed.includes('tokenB') &&
            (addrTokenA !== addrTokenB)
        );
        const paramsIncludesToken = (
            paramsUsed.includes('tokenA') ||
            paramsUsed.includes('tokenB')
        );
        // TODO: this needs to be gatekept so it runs only once
        if (isInitialized && tokensAreDifferent && paramsIncludesToken) {
            Promise.all([
                fetchAndFormatTokenData(addrTokenA),
                fetchAndFormatTokenData(addrTokenB)
            ]).then(res => {
                dispatch(setTokenA(res[0] as TokenIF));
                dispatch(setTokenB(res[1] as TokenIF));
            });
        }
    }, [isInitialized]);
}
