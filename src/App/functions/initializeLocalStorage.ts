import { fetchTokenLists } from './fetchTokenLists';
import { TokenListIF } from '../../utils/interfaces/exports';

export default function initializeLocalStorage() {
    // boolean to control whether local storage for user data needs updating
    let userUpdated = false;

    // TODO:  @Emily eventually I would like to move the logic for token list
    // TODO:  ... middleware and writing to local storage out of the function
    // TODO:  ... call and into this file, but that's complicated because the
    // TODO:  ... function uses a promise, for now it's easier to leave it
    // TODO:  ... as it currently is written

    // fetch token lists from URIs if none are in local storage
    if (!localStorage.allTokenLists) fetchTokenLists();

    // retrieve the user object from local storage
    // putting it there then pulling it back is necessary to prevent overwrites
    const user = localStorage.user ? JSON.parse(localStorage.getItem('user') as string) : {};

    // if user object does not have active token lists, initialize with ambient
    if (!user.activeTokenLists || !user.activeTokenLists.length) {
        user.activeTokenLists = JSON.parse(localStorage.allTokenLists).filter(
            (list: TokenListIF) => list.default === true,
        );
        userUpdated = true;
    }

    // if user object does not have imported tokens, initialize with tokens
    // ... from default lists (see defaultTokenLists.ts file)
    if (!user.importedTokens) {
        user.importedTokens = user.activeTokenLists.map((list: TokenListIF) => list.tokens).flat();
        userUpdated = true;
    }

    if (userUpdated) {
        localStorage.setItem('user', JSON.stringify(user));
    }
}
