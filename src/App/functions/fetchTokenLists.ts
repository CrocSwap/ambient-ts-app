// START: Import React and Dongles
import { Dispatch, SetStateAction } from 'react';

// START: Import Local Files
import { tokenListURIs } from '../../utils/data/tokenListURIs';
import { defaultTokenLists } from '../../utils/data/defaultTokenLists';
import { TokenIF } from '../../utils/interfaces/exports';
import uriToHttp from '../../utils/functions/uriToHttp';

/**

Fetches token lists from URIs and stores them in local storage with additional data.
@param tokenListsReceived - A boolean indicating if token lists have been fetched.
@param indicateTokenListsReceived - A state hook used to indicate if token lists have been fetched.
*/

export function fetchTokenLists(
    tokenListsReceived: boolean,
    indicateTokenListsReceived: Dispatch<SetStateAction<boolean>>,
) {
    // create an array of promises to fetch all token lists in the URIs file
    // middleware will add the source URI to every return
    const tokenLists = Object.values(tokenListURIs).map((uri) =>
        fetch(uriToHttp(uri))
            .then((response) => response.json())
            .then((response) => ({
                ...response,
                uri,
                dateRetrieved: new Date().toISOString(),
                userImported: false,
            })),
    );
    // translate default token lists from a human-readable strings to URI
    // ... strings, this syntax is necessary to map over an array of
    // ... strings and look up each as a key in an object
    const defaultListURIs = defaultTokenLists.map((listName: string) => {
        type tokenListURIsKey = keyof typeof tokenListURIs;
        const list = listName as tokenListURIsKey;
        return tokenListURIs[list];
    });

    Promise.allSettled(tokenLists)
        // this code extracts data from fulfilled promises
        .then(
            (promises) =>
                promises
                    .flatMap((promise) => Object.entries(promise))
                    .filter((promise) => promise[0] === 'value')
                    .map((promise) => promise[1]),
            // middleware to add data to fetched results for in-house use
        )
        .then((lists) => {
            // indicate the list was fetched from the array of lists hardcoded in the front
            lists.forEach(
                (list) => (list.default = defaultListURIs.includes(list.uri)),
            );
            // indicate which list each token data object was imported with
            lists.forEach((list) =>
                list.tokens.forEach(
                    (token: TokenIF) => (token.fromList = list.uri),
                ),
            );
            // send list with custom-added values to local storage
            localStorage.setItem('allTokenLists', JSON.stringify(lists));
            // notify App.tsx that new token lists have been written to local storage
            indicateTokenListsReceived(!tokenListsReceived);
        });
}
