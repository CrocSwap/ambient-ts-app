import { useEffect } from 'react';

export const useToken = () => {
    console.log('triggered useToken() hook!');

    // get allTokenLists from local storage
    // if it doesn't exist yet, check recurisvely until it does
    useEffect(() => {
        console.log('woohoo');
        localStorage.getItem('allTokenLists')
            ? console.log('we have token lists')
            : console.log('I do not see any lists yet');
        const checkForTokenLists = () => {
            console.log('trigger function checForTokenLists()');
        }
        checkForTokenLists();
    }, []);
}