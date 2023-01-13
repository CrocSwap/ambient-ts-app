import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { sortBaseQuoteTokens } from '@crocswap-libs/sdk';

export const useUrlParams = () => {
    const { params } = useParams();
    // console.log(params);
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

    const findParamValue = (key: string) => {
        return urlParams.find((param) => param[0] === key)?.slice(-1)[0];
    };

    const [baseAddr, quoteAddr] = sortBaseQuoteTokens(
        findParamValue('tokenA') as string,
        findParamValue('tokenB') as string,
    );

    return {
        chain: findParamValue('chain'),
        tokenA: findParamValue('tokenA') as string,
        tokenB: findParamValue('tokenB') as string,
        baseAddr: baseAddr.toLowerCase(),
        quoteAddr: quoteAddr.toLowerCase(),
    };
};
