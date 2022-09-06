import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

export const useUrlParams = () => {
    const { params } = useParams() ?? '';
    
    const paramsMap = useMemo(() => {
        const fixedParams = params ?? '';
        const map = new Map();
        fixedParams.split('&')
            .filter((par => par.includes('=')))
            .map(par => par.split('='))
            .forEach(par => paramsMap.set(par[0], par[1]));
        return map;
    }, []);

    console.log(paramsMap);
}