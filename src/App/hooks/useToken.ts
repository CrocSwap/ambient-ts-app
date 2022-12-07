import { useEffect } from 'react';

export const useToken = () => {
    console.log('triggered useToken() hook!');

    // get allTokenLists from local storage
    // if it doesn't exist yet, check recurisvely until it does
    useEffect(() => {
        const checkForTokenLists = (limiter=0) => {
            console.log('trigger function checForTokenLists()');
            if (localStorage.getItem('allTokenLists')) {
                console.log('we have token lists');
            } else {
                console.log('I do not see any lists yet');
                setTimeout(() => checkForTokenLists(limiter + 1), 250);
            }
        }
        checkForTokenLists();
    }, []);
}