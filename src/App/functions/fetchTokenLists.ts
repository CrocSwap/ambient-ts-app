import { tokenListURIs } from '../../utils/data/tokenURIs';
import { defaultTokenLists } from '../../utils/data/defaultTokenLists';

export function fetchTokenLists() {
    // create an array of promises to fetch all token lists in the URIs file
    // middleware will add the source URI to every return
    const tokenLists = Object.values(tokenListURIs).map((uri) =>
        fetch(uri)
            .then((response) => response.json())
            .then((response) => ({ ...response, uri })),
    );
    // translate default token lists from a human-readable strings to URI
    // ... strings, this syntax is necessary to map over aan array of
    // ... strings and look up each as a key in an object
    const defaultListURIs = defaultTokenLists.map((listName: string) => {
        type tokenListURIsKey = keyof typeof tokenListURIs;
        const list = listName as tokenListURIsKey;
        return tokenListURIs[list];
    });
    // when all promises have been resolved, send to local storage
    // IMPORTANT!  because of how `Promise.all` works, if a single
    // ... promise is rejected, the function will not execute, if
    // ... this is acting strangely, try changing Promise.all() to
    // ... Promise.allSettled()
    Promise.all(tokenLists).then((results) => {
        console.log(`we need this one: ${tokenListURIs.ambient}`);
        results.forEach((list) => {
            console.warn(list);
        });
        localStorage.setItem('allTokenLists', JSON.stringify(results));
    });
}
