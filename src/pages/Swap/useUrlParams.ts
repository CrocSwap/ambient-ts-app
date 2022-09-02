import { useParams } from 'react-router-dom';

export const useUrlParams = () => {
    const { stuff } = useParams();
    console.log({stuff});
}