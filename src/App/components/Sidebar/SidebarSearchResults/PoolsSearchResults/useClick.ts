import { useLocation } from 'react-router-dom';

export const useClick = () => {
    const {pathname} = useLocation();
    console.log('fired custom hook useClick()');
    console.log('current pathname is: ' + pathname);
}