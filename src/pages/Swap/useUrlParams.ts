import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

export const useUrlParams = () => {
    const { params } = useParams() ?? '';

    const recognizedParams = ['chain', 'tokenA', 'tokenB'];

    const parsedParams = useMemo(() => {
        const fixedParams = params ?? '';
        const paramsArray = fixedParams.split('&')
            .filter(par => par.includes('='))
            .map(par => par.split('='))
            .filter(par => recognizedParams.includes(par[0]));
        return paramsArray;
    }, []);

    console.log(parsedParams);
}