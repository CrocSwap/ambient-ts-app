import { defaultTokenLists } from '../../utils/data/defaultTokenLists';
import { tokenListURIs } from '../../utils/data/tokenListURIs';
// import { ambientTokenList } from '../../utils/data/ambientTokenList';
import { TokenListIF } from '../../utils/interfaces/exports';

export default function initializeUserLocalStorage() {
    // boolean to control whether local storage for user data needs updating
    let userUpdated = false;

    // TODO:  @Emily eventually I would like to move the logic for token list
    // TODO:  ... middleware and writing to local storage out of the function
    // TODO:  ... call and into this file, but that's complicated because the
    // TODO:  ... function uses a promise, for now it's easier to leave it
    // TODO:  ... as it currently is written

    // this code block is commented out as I've removed the dependence of later
    // ... functionalities on it, for now I'm leaving it here in case I put the
    // ... logic to make a user-set of imported tokens in this file

    // fetch token lists from URIs if none are in local storage
    // const allTokenLists = localStorage.allTokenLists
    //     ? JSON.parse(localStorage.getItem('allTokenLists') as string)
    //     : [ambientTokenList];

    // retrieve the user object from local storage
    // putting it there then pulling it back is necessary to prevent overwrites
    const user = localStorage.user ? JSON.parse(localStorage.getItem('user') as string) : {};

    // get the list of token lists that the app will load by default and only
    // ... build the value in local storage if there is not one already, this
    // ... is necessary to prevent overwrites once the user has updated which
    // ... lists are active in the app
    if (!user.activeTokenLists || !user.activeTokenLists.length) {
        user.activeTokenLists = defaultTokenLists.map((listName: string) => {
            type tokenListURIsKey = keyof typeof tokenListURIs;
            const list = listName as tokenListURIsKey;
            return tokenListURIs[list];
        });
        userUpdated = true;
    }

    // if there is an array of active token lists in local storage but no array
    // of tokens on the user object, then create an array of tokens from any
    // lists which are marked as default in defaultTokenLists.ts
    if (
        (!user.tokens || !user.tokens.length) &&
        user.activeTokenLists &&
        localStorage.allTokenLists
    ) {
        user.tokens = JSON.parse(localStorage.getItem('allTokenLists') as string).find(
            (tokenList: TokenListIF) => tokenList.uri === tokenListURIs.ambient,
        ).tokens;
        userUpdated = true;
    }

    // create a value to track whether the sidebar is open or closed
    if (!user.sidebar) {
        user.sidebar = 'open';
        userUpdated = true;
    }

    if (!user.ackTokens) {
        user.ackTokens = [];
        userUpdated = true;
    }

    if (!user.bypassConfirm) {
        user.bypassConfirm = false;
        userUpdated = true;
    }

    if (!user.bypassConfirm) {
        const initialMap = new Map();
        const initialPairs = [
            ['global', false],
            ['swap', false],
            ['limit', false],
            ['range', false],
            ['repo', false],
        ];
        initialPairs.forEach((pair) => initialMap.set(pair[0], pair[1]));
        user.bypassConfirm = JSON.stringify(Array.from(initialMap.entries()));
        userUpdated = true;
    }

    if (userUpdated) {
        localStorage.setItem('user', JSON.stringify(user));
    }
}
