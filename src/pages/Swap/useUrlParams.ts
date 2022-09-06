import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import swapParams from '../../utils/classes/swapParams';

export const useUrlParams = (module: string) => {
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
        const makeParams = (input: string[][]) => {
            switch (module) {
                // swap module
                case 'swap':
                    return new swapParams(input);
                // default pathway (considered an error pathway)
                default: return;
            }
        }
        // return the correct parameters object for URL pathway
        return makeParams(paramsArray);
    }, []);

    return urlParams;
}