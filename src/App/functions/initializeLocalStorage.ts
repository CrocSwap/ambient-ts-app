import { fetchTokenLists } from './fetchTokenLists';

export default function initializeLocalStorage() {
    console.log('ran function initializeLocalStorage()');

    // fetch token lists from URIs if none are in local storage
    if (!localStorage.allTokenLists) fetchTokenLists();

    // create the `user` object and send to local storage
    if (!localStorage.user) localStorage.setItem('user', JSON.stringify({}));
}
