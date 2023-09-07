import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
    useLinkGen,
    linkGenMethodsIF,
} from '../../../../utils/hooks/useLinkGen';

export const useRepoExitPath = (): string => {
    const { params } = useParams();

    // hook to generate navigation actions with pre-loaded path
    const linkGenPool: linkGenMethodsIF = useLinkGen('pool');

    // generate a nav path for clicking the exit button
    // regenerate value every time the URL params change (virtually never)
    const exitPath = useMemo<string>(() => {
        // get URL parameters or empty string if undefined
        const fixedParams = params ?? '';
        // break URL param string into parameter tuples
        const paramSets = fixedParams
            // split the params string at the separator character
            .split('&')
            // remove any values missing an = symbol
            .filter((par) => par.includes('='))
            // split substrings at = symbols to make [key, value] tuples
            .map((par) => par.split('='))
            // remove empty strings created by extra = symbols
            .map((par) => par.filter((e) => e !== ''))
            // remove tuples with trisomy issues
            .filter((par) => par.length === 2);
        // fn to look up the value of any param
        // return empty string if param is not found
        const findParam = (name: 'chain' | 'tokenA' | 'tokenB'): string => {
            // find param tuple with name provided as an arg
            const paramTuple = paramSets.find((param) => param[0] === name);
            // return value from tuple or empty string in tuple is not found
            return paramTuple ? paramTuple[1] : '';
        };
        // generate and return nav path
        // @Ben: need guidance on what to use for `lowTick` and `highTick` here
        return linkGenPool.getFullURL({
            chain: findParam('chain'),
            tokenA: findParam('tokenA'),
            tokenB: findParam('tokenB'),
        });
    }, [params]);

    // return memoized URL pathway
    return exitPath;
};
