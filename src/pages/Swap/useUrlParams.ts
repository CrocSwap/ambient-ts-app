import { useParams } from 'react-router-dom';

export const useUrlParams = () => {
    const { params } = useParams() ?? '';
    const fixedParams = params ?? '';
    const paramsArray = fixedParams.split('&');
    console.log({paramsArray});
}