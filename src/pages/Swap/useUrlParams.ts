import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import swapParams from '../../utils/classes/swapParams';

export const useUrlParams = (module: string) => {
    const { params } = useParams() ?? '';

    const recognizedParams = ['chain', 'tokenA', 'tokenB'];

    const parsedParams = useMemo(() => {
        const fixedParams = params ?? '';
        const paramsArray = fixedParams.split('&')
            .filter(par => par.includes('='))
            .map(par => par.split('='))
            .filter(par => recognizedParams.includes(par[0]))
            .map(par => par.filter(e => e !== ''))
            .filter(par => par.length === 2);
        return paramsArray;
    }, []);

    const makeParams = (input: string[][]) => {
        switch (module) {
            case 'swap':
                return new swapParams(input);
            default: return;
        }
    }

    const urlParams = makeParams(parsedParams);
    return urlParams;
}