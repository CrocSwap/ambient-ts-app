import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
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
    // module: string
) => {
    // get URL parameters, empty string if undefined
    const { params } = useParams() ?? '';

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

    // useEffect to switch chains if necessary

    // useEffect() to update token pair
    useEffect(() => {
        const getAddress = (tkn: string) => {
            const tokenParam = urlParams.find(param => param[0] === tkn);
            const tokenAddress = tokenParam
                ? tokenParam[1]
                : '0x0000000000000000000000000000000000000000';
            return tokenAddress;
        }
        const addrTokenA = getAddress('tokenA');
        const addrTokenB = getAddress('tokenB');
        console.log({addrTokenA, addrTokenB});
    }, []);
}
