import { TokenListIF } from '../../../utils/interfaces/exports';
import validateTokenList from '../../../utils/functions/validateTokenList';

export default function getList(listURI:string) {
    // trim whitespace from start and end of input string
    const sanitizedInput = listURI.trim();
    // fetch a token list from the outside URI
    const list = fetch(sanitizedInput)
        // format response object as a JSON
        .then(response => response.json())
        .then(response => {
            validateTokenList(response);
            return response;
        })
        // middleware to add metadata to the list used by the Ambient app
        .then(response => (
            {
                ...response,
                uri: sanitizedInput,
                dateRetrieved: new Date().toISOString(),
                default: false,
                userImported: true,
            }
        ))
        // error logging in console
        .catch(err => console.error(err));

    // resolve the promise object
    Promise.resolve(list)
        .then(resolvedList => {
            // get allTokenLists from local storage
            const allTokenLists = JSON.parse(localStorage.getItem('allTokenLists') as string);
            // determine if a token list from the URI exists in local storage already
            const listExistsInLocalStorage = allTokenLists
                .map((tokenList: TokenListIF) => tokenList.uri)
                .includes(resolvedList.uri);
            // if the list is already in local storage, overwrite it
            // ... if not, add it to the bank of token lists
            if (listExistsInLocalStorage) {
                console.log('already got it, boss!');
                const otherLists = allTokenLists.filter((tokenList: TokenListIF) => tokenList.uri !== resolvedList.uri);
                localStorage.setItem('allTokenLists', JSON.stringify([...otherLists, resolvedList]));
            } else if (!listExistsInLocalStorage) {
                console.log('nope, new to me!');
                localStorage.setItem('allTokenLists', JSON.stringify([...allTokenLists, resolvedList]));
            } else {
                throw new Error('could not determine if token list is already in local storage');
            };
        })
        // error logging in console
        .catch(err => console.error(err));
}