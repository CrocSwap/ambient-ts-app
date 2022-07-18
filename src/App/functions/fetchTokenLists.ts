import { tokenListURIs } from '../../utils/data/tokenListURIs';
import { defaultTokenLists } from '../../utils/data/defaultTokenLists';
import { TokenIF } from '../../utils/interfaces/exports';
import uriToHttp from '../../utils/functions/uriToHttp';

export function fetchTokenLists(
    tokenListsReceived: boolean,
    indicateTokenListsReceived: React.Dispatch<React.SetStateAction<boolean>>
) {
    // create an array of promises to fetch all token lists in the URIs file
    // middleware will add the source URI to every return
    const tokenLists = Object.values(tokenListURIs).map((uri) =>
        fetch(uriToHttp(uri))
            .then((response) => response.json())
            .then((response) => (
                {
                    ...response,
                    uri,
                    dateRetrieved: new Date().toISOString(),
                    userImported: false
                }
            ))
    );
    // translate default token lists from a human-readable strings to URI
    // ... strings, this syntax is necessary to map over an array of
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
        // add a key-value pair to each list called `default` which tracks whether a
        // .. list is by default turned on as a boolean
        results.forEach((list) => (list.default = defaultListURIs.includes(list.uri)));
        // add a key-value pair to each token data object in each tole list indicating
        // ... the list it exists on by the URI of the list
        results.forEach((list) => {
            list.tokens.forEach((token: TokenIF) => (token.fromList = list.uri));
        });
        // write the array of token lists as modified by middleware to local storage
        localStorage.setItem('allTokenLists', JSON.stringify(results));
        indicateTokenListsReceived(!tokenListsReceived);
    });
}
