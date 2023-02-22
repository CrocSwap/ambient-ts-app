import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch } from './reduxToolkit';
import {
    setTokenA,
    setTokenB,
    setAdvancedLowTick,
    setAdvancedHighTick,
    setLimitTick
} from '../state/tradeDataSlice';
import { TokenIF } from '../interfaces/exports';

export const useUrlParamsNew = (
    chainId: string,
    getTokenByAddress: (addr: string, chn: string) => TokenIF | undefined
): void => {
    const { params } = useParams();

    const dispatch = useAppDispatch();

    const urlParams = useMemo<string[][]>(() => {
        // get URL parameters or empty string if undefined
        const fixedParams = params ?? '';
        // split params string at every ampersand
        return (
            fixedParams.split('&')
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

    const chainToUse = useMemo<string>(() => {
        const chainParam = urlParams.find(
            (param: string[]) => param[0] === 'chain'
        );
        let output: string;
        if (chainParam) {
            output = chainParam[1] ?? chainId;
        } else {
            output = chainId;
        }
        return output;
    }, [chainId, urlParams]);
    
    const updateRTK = (key: string, val: string): void => {
        const handleToken = (tkn: string, addr: string): void => {
            const tokenData = getTokenByAddress(addr, chainToUse);
            if (tokenData) {
                tkn === 'tokenA' && dispatch(setTokenA(tokenData));
                tkn === 'tokenB' && dispatch(setTokenB(tokenData));
            }
        }
        switch (key) {
            case 'tokenA':
            case 'tokenB':
                handleToken(key, val);
                break;
            case 'lowTick':
                dispatch(setAdvancedLowTick(parseInt(val)));
                break;
            case 'highTick':
                dispatch(setAdvancedHighTick(parseInt(val)));
                break;
            case 'limitTick':
                dispatch(setLimitTick(parseInt(val)));
        }
    };

    urlParams.forEach((param: string[]) => updateRTK(param[0], param[1]));
};
