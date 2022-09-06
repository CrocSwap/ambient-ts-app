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
            .filter(par => recognizedParams.includes(par[0]))
            .map(par => par.filter(e => e !== ''))
            .filter(par => par.length === 2);
        return paramsArray;
    }, []);

    console.log(parsedParams);

    class urlParams {
        chain: string;
        tokenA: string;
        tokenB: string;

        constructor(inputArray: string[][]) {
            const findValue = (key: string) => {
                const queriedPair = inputArray.find((pair: string[]) => pair[0] === key);
                return queriedPair ? queriedPair[1] : '';
            }
            this.chain = findValue('chain');
            this.tokenA = findValue('tokenA');
            this.tokenB = findValue('tokenB');
        };
    }

    const output = new urlParams(parsedParams);
    console.log(output);
}