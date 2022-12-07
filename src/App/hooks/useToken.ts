import { useEffect } from 'react';
import { TokenListIF } from '../../utils/interfaces/exports';

// TODO: refactor to accept tokens from another hook in params
// TODO: ... this will eliminate the need for recursive calls
// TODO: ... it will also update data automatically

export const useToken = () => {
    console.log('triggered useToken() hook!');

    // get allTokenLists from local storage after initial render
    useEffect(() => {
        // fn to check local storage for token lists with a recursion limiter
        const checkForTokenLists = (limiter=0) => {
            // execute if local storage has token lists
            if (localStorage.getItem('allTokenLists')) {
                const listedTokens = JSON.parse(
                    localStorage.getItem('allTokenLists') as string
                ).flatMap((tokenList: TokenListIF) => tokenList.tokens);
            // call fn recursively if local storage does not have token lists
            // limit recursive calls to 100
            } else if (limiter < 100) {
                setTimeout(() => checkForTokenLists(limiter + 1), 250);
            } else {
                // console warning if max recursion depth is reached
                console.warn('maximum recursion depth reached');
            }
        }
        checkForTokenLists();
    }, []);
}