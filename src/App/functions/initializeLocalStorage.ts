import { fetchTokenLists } from './fetchTokenLists';

export default function initializeLocalStorage() {
    console.log('ran function initializeLocalStorage()');

    // fetch token lists from URIs if none are in local storage
    if (!window.localStorage.allTokenLists) fetchTokenLists();
}
