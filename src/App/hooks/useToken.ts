import { useEffect } from 'react';

export const useToken = () => {
    console.log('triggered useToken() hook!');

    // get allTokenLists from local storage after initial render
    useEffect(() => {
        // fn to check local storage for token lists with a recursion limiter
        const checkForTokenLists = (limiter=0) => {
            // execute if local storage has token lists
            if (localStorage.getItem('allTokenLists')) {
                console.log('we have token lists');
            // call fn recursively if local storage does not have token lists
            // limit recursive calls to 100
            } else if (limiter < 100) {
                console.log('I do not see any lists yet');
                setTimeout(() => checkForTokenLists(limiter + 1), 250);
            } else {
                // console warning if max recursion depth is reached
                console.warn('maximum recursion depth reached');
            }
        }
        checkForTokenLists();
    }, []);
}