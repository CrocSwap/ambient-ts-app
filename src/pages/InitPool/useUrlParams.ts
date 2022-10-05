import { useParams } from 'react-router-dom';

export const useUrlParams = () => {
    const { params } = useParams();
    console.log(params);
}