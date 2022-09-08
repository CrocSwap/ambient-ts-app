import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch } from '../../utils/hooks/reduxToolkit';
import { useMoralisWeb3Api } from 'react-moralis';
import { defaultTokens } from '../../utils/data/defaultTokens';
import { ethers } from 'ethers';
import { setTokenA, setTokenB } from '../../utils/state/tradeDataSlice';
import { TokenIF } from '../../utils/interfaces/TokenIF';
// import swapParams from '../../utils/classes/swapParams';

/**     Instructions to Use This Hook
 * 
 *      1. Create a new parameters class and import to this file.
 *      2. Call the hook in the page rendered with URL parameters.
 *      3. Name the URL pathway (sans parameters) as an argument.
 *      4. Add a 'case' to func makeParams() for the URL pathway.
 *      5. For the URL pathway, return an instance of the imported class.
 */

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
        const paramsArray = fixedParams.split('&')
            // remove any values missing an = symbol
            .filter(par => par.includes('='))
            // split substrings at = symbols to make [key, value] tuples
            .map(par => par.split('='))
            // remove empty strings created by extra = symbols
            .map(par => par.filter(e => e !== ''))
            // remove tuples with trisomy issues
            .filter(par => par.length === 2);
        // router to feed parameters into the correct object constructor
        // const makeParams = (input: string[][]) => {
        //     switch (module) {
        //         // swap module
        //         case 'swap':
        //             return new swapParams(input);
        //         // default pathway (considered an error pathway)
        //         default:
        //             console.warn(`Unrecognized URL pathway in useUrlParams() hook. Received value <<${module}>>. Refer to useUrlParams.ts for troubleshooting. Ensure that the hook was called with a value for parameter module recognized in func makeParams(). Triggering empty return.`);
        //             return;
        //     }
        // }
        // return the correct parameters object for URL pathway
        return paramsArray;
    }, []);

    // console.log(urlParams);

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
    // console.log(nativeToken);

    // this can probably go inside the useEffect() hook for token data
    const fetchAndFormatTokenData = (addr: string) => {
        if (addr === ethers.constants.AddressZero) return nativeToken;
        const promise = Web3Api.token.getTokenMetadata({
            chain: chainToUse as '0x1', addresses: [addr]
        });
        const rawData = Promise.resolve(promise)
            .then(res => res[0])
            .then(res => ({
                name: res.name,
                address: res.address,
                symbol: res.symbol,
                decimals: res.decimals,
                logoURI: res.logo,
                fromList: 'urlParam'
            }));
        return rawData;
    }

    // useEffect to switch chains if necessary

    // useEffect() to update token pair
    useEffect(() => {
        const getAddress = (tkn: string) => {
            const tokenParam = urlParams.find(param => param[0] === tkn);
            const tokenAddress = tokenParam
                ? tokenParam[1]
                : ethers.constants.AddressZero;
            return tokenAddress;
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
