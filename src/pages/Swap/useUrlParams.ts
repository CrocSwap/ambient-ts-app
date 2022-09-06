import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

export const useUrlParams = () => {
    const { params } = useParams() ?? '';
    const paramsArray = useMemo(() => {
        const fixedParams = params ?? '';
        return fixedParams.split('&');
    }, []);
    console.log(paramsArray);
}