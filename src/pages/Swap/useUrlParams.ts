import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

export const useUrlParams = () => {
    const { params } = useParams() ?? '';
    const parsedParams = useMemo(() => {
        const fixedParams = params ?? '';
        const paramsArray = fixedParams.split('&')
            .filter((par => par.includes('=')));
        return paramsArray;
    }, []);
    console.log(parsedParams);
}