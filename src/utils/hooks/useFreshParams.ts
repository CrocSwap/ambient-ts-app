import { useState } from 'react';
import { useParams } from 'react-router-dom';

export type paramsType =
    | 'chain'
    | 'tokenA'
    | 'tokenB'
    | 'limitTick'
    | 'lowTick'
    | 'highTick';

export interface useFreshParamsIF {
    current: string;
    update: (key: paramsType, value: string) => void;
}

export const useFreshParams = () => {
    const { params } = useParams();
    const [currentParamsStr, setCurrentParamsStr] = useState<string>(
        params ?? '',
    );

    function updateParam(key: paramsType, value: string): void {
        const paramMap: Map<paramsType, string> = new Map();
        currentParamsStr
            // split the params string at the separator character
            .split('&')
            // remove any values missing an = symbol
            .filter((par) => par.includes('='))
            // split substrings at = symbols to make [key, value] tuples
            .map((par) => par.split('='))
            // remove empty strings created by extra = symbols
            .map((par) => par.filter((e) => e !== ''))
            // remove tuples with trisomy issues
            .filter((par) => par.length === 2)
            .forEach((par) => paramMap.set(par[0] as paramsType, par[1]));
        paramMap.set(key, value);
        const newParamString = [...paramMap.entries()]
            .map((par) => par.join('='))
            .join('&');
        setCurrentParamsStr(newParamString);
        history.replaceState(null, '', newParamString);
    }

    return {
        current: currentParamsStr,
        update: updateParam,
    };
};
