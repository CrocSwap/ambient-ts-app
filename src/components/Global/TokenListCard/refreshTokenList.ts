import uriToHttp from '../../../utils/functions/uriToHttp';
import { TokenIF, TokenListIF } from '../../../utils/interfaces/exports';

export default function refreshTokenList(uri: string) {
    console.log('user clicked button to refresh: ', uriToHttp(uri));

    // get allTokenLists array from local storage
    const allTokenLists = JSON.parse(localStorage.getItem('allTokenLists') as string);

    // find the index in allTokenLists of the list we're updating
    const tokenListIndex = allTokenLists.findIndex(
        (tokenList: TokenListIF) => tokenList.uri === uri,
    );

    // fetch the list from the URI on record and apply middleware to it
    const newList = fetch(uriToHttp(uri))
        .then((response) => response.json())
        .then((response) => ({
            ...response,
            uri,
            dateRetrieved: new Date().toISOString(),
            userImported: allTokenLists[tokenListIndex].userImported,
        }));

    // resolve the promise object and apply actions to it
    Promise.resolve(newList).then((list) => formatAndUpdateList(list));

    // function to handle actions on returned list
    function formatAndUpdateList(list: TokenListIF) {
        // add fromList value to each token data object in list
        list.tokens.forEach((tkn: TokenIF) => (tkn.fromList = uri));
        // remove old value version of token list from array and add new one in same index
        allTokenLists.splice(tokenListIndex, 1, list);
        // send updated array of token lists to local storage
        localStorage.setItem('allTokenLists', JSON.stringify(allTokenLists));
    }
}
