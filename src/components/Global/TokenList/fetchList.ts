import { TokenListIF } from '../../../utils/interfaces/exports';

export default function getList(listURI:string) {
    console.log('user wants list from: ' + listURI);
    const list = fetch(listURI)
        .then(response => response.json())
        .then(response => (
            {
                ...response,
                uri: listURI,
                dateRetrieved: new Date().toISOString(),
                default: false,
                userImported: true,
            }
        ))
        .catch(err => console.error(err));
    Promise.resolve(list)
        .then(resolvedList => {
            console.log(resolvedList);
            const allTokenLists = JSON.parse(localStorage.getItem('allTokenLists') as string);
            const listExistsInLocalStorage = allTokenLists
                .map((tokenList: TokenListIF) => tokenList.uri)
                .includes(resolvedList.uri);
            if (listExistsInLocalStorage) {
                console.log('already got it, boss!');
            } else if (!listExistsInLocalStorage) {
                console.log('nope, new to me!');
                // console.log([...allTokenLists, resolvedList]);
                localStorage.setItem('allTokenLists', JSON.stringify([...allTokenLists, resolvedList]));
            } else {
                throw new Error('could not determine if token list is already in local storage');
            };
        })
        .catch(err => console.error(err));
}