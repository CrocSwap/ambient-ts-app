import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch } from './reduxToolkit';
import {
    setTokenA,
    setTokenB,
    setAdvancedLowTick,
    setAdvancedHighTick,
    setLimitTick,
    setChainId,
} from '../state/tradeDataSlice';
import { TokenIF } from '../interfaces/exports';

export interface UrlParams {
    chainId?: string;
    tokenA?: TokenIF;
    tokenB?: TokenIF;
}

export const useUrlParams = (
    dfltChainId: string,
    getTokenByAddress: (addr: string, chn: string) => TokenIF | undefined,
): UrlParams => {
    const { params } = useParams();

    const dispatch = useAppDispatch();

    const urlParamMap = useMemo<Map<string, string>>(() => {
        // get URL parameters or empty string if undefined
        const fixedParams = params ?? '';
        // split params string at every ampersand
        const paramMap = new Map<string, string>();

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
            .forEach((par) => {
                if (par.length == 1) {
                    paramMap.set(par[0], par[1]);
                }
            });

        return paramMap;
    }, [params]);

    const paramStruct: UrlParams = {};

    function processOptParam(
        paramName: string,
        processFn: (val: string) => void,
    ) {
        if (urlParamMap.has('chainId')) {
            const paramVal = urlParamMap.get('chainId') as string;
            processFn(paramVal);
        }
    }

    processOptParam('chainId', (chainId: string) => {
        dispatch(setChainId(chainId));
        paramStruct.chainId = chainId;
    });

    const chainToUse = paramStruct.chainId ? paramStruct.chainId : dfltChainId;

    processOptParam('tokenA', (addr: string) => {
        const tokenData = getTokenByAddress(addr, chainToUse);
        if (tokenData) {
            dispatch(setTokenA(tokenData));
            paramStruct.tokenA = tokenData;
        }
    });

    processOptParam('tokenB', (addr: string) => {
        const tokenData = getTokenByAddress(addr, chainToUse);
        if (tokenData) {
            dispatch(setTokenB(tokenData));
            paramStruct.tokenB = tokenData;
        }
    });

    processOptParam('lowTick', (tick: string) => {
        dispatch(setAdvancedLowTick(parseInt(tick)));
    });
    processOptParam('highTick', (tick: string) => {
        dispatch(setAdvancedHighTick(parseInt(tick)));
    });
    processOptParam('limitTick', (tick: string) => {
        dispatch(setLimitTick(parseInt(tick)));
    });

    return paramStruct;
};
