import { TokenListIF } from '../../../utils/interfaces/exports';

export default function getList(listURI:string) {
    const sanitizedInput = listURI.trim();
    const list = fetch(sanitizedInput)
        .then(response => response.json())
        .then(response => (
            {
                ...response,
                uri: sanitizedInput,
                dateRetrieved: new Date().toISOString(),
                default: false,
                userImported: true,
            }
        ))
        .catch(err => console.error(err));
    Promise.resolve(list)
        .then(resolvedList => {
            const allTokenLists = JSON.parse(localStorage.getItem('allTokenLists') as string);
            const listExistsInLocalStorage = allTokenLists
                .map((tokenList: TokenListIF) => tokenList.uri)
                .includes(resolvedList.uri);
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
        .catch(err => console.error(err));
}