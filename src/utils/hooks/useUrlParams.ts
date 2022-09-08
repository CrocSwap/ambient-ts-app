import { useParams } from 'react-router-dom';

export const useUrlParams = () => {
    console.log('ran useUrlParams');
    const { params } = useParams();
    console.log({ params });
    return params;
};
