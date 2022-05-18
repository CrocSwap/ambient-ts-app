import { tokenListURIs } from '../../utils/data/tokenURIs';

export function fetchTokenLists() {
    if (!window.localStorage.allTokenLists) {
        console.log('fetching lists...');
        const tokenLists = Object.values(tokenListURIs).map((uri) =>
            fetch(uri)
                .then((response) => {
                    console.log(response);
                    return response.json();
                })
                .then((response) => ({ ...response, uri })),
        );

        Promise.allSettled(tokenLists).then((results) => {
            localStorage.setItem('allTokenLists', JSON.stringify(results));
        });
    }
}
