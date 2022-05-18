import { tokenListURIs } from '../utils/data/tokenURIs';

export function fetchTokenLists() {
    // check if the token lists are already in local storage, currently
    // ... this is limited because there could feasibly be an empty
    // ... value, this will be accounted for later when additional
    // ... functionality periodically refreshes the list
    if (!window.localStorage.allTokenLists) {
        // create an array of promises to fetch all token lists in the URIs file
        // middleware will add the source URI to every return
        const tokenLists = Object.values(tokenListURIs).map((uri) =>
            fetch(uri)
                .then((response) => response.json())
                .then((response) => ({ ...response, uri })),
        );
        // when all promises have been resolved, send to local storage
        // IMPORTANT!  because of how `Promise.all` works, if a single
        // ... promise is rejected, the function will not execute, if
        // ... this is acting strangely, try changing Promise.all() to
        // ... Promise.allSettled()
        Promise.all(tokenLists).then((results) => {
            localStorage.setItem('allTokenLists', JSON.stringify(results));
        });
    }
}
