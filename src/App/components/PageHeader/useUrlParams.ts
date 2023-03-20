import { sortBaseQuoteTokens } from '@crocswap-libs/sdk';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

export const useUrlParams = (): {
    paramsSlug: string;
    baseAddr: string;
    quoteAddr: string;
} => {
    // current URL pathway
    const { pathname } = useLocation();
    // const { params } = useParams();

    // function to isolate the URL params from the full pathway
    const makeParamsSlug = (url: string) => {
        // hold copy of a string in a mutable variable
        let paramsString = url;
        // chop off leading characters until only the params remain
        while (paramsString && !paramsString.startsWith('/chain=')) {
            paramsString = paramsString.slice(1);
        }
        // return string with URL paramas
        return paramsString;
    };

    // params slug to use in URL bar on header navigation
    // useState() + useEffect() is necessary over useMemo() to
    // ... only overwrite the value conditionally
    const [paramsSlug, setParamsSlug] = useState<string>(makeParamsSlug(pathname));
    useEffect(() => {
        // make a new params slug from the URL path
        const newSlug = makeParamsSlug(pathname);
        // prevent overwrite if there are no params
        newSlug && setParamsSlug(newSlug);
    }, [pathname]);

    const urlParams = useMemo<string[][]>(() => {
        // get URL parameters or empty string if undefined
        const fixedParams = paramsSlug ?? '';
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
    }, [paramsSlug]);

    // console.log({ paramsSlug });

    const findParamValue = (key: string) =>
        urlParams.find((param) => param[0] === key)?.slice(-1)[0];

    const tokenAparam = findParamValue('tokenA');
    // console.log({ tokenAparam });
    const tokenBparam = findParamValue('tokenB');
    // console.log({ tokenBparam });

    const sortedTokens =
        tokenAparam && tokenBparam ? sortBaseQuoteTokens(tokenAparam, tokenBparam) : [];

    return {
        paramsSlug,
        baseAddr: sortedTokens[0],
        quoteAddr: sortedTokens[1],
    };
};
