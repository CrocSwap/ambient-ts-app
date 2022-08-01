import uriToHttp from '../../../utils/functions/uriToHttp'; 
import { TokenListIF } from '../../../utils/interfaces/exports';

export default function refreshTokenList(uri:string) {
    console.log('user clicked button to refresh: ', uriToHttp(uri));

    const allTokenLists = JSON.parse(localStorage.getItem('allTokenLists') as string);

    const newList = fetch(uriToHttp(uri))
        .then((response) => response.json())
        .then((response) => (
            {
                ...response,
                uri,
                dateRetrieved: new Date().toISOString(),
                userImported: false
            }
        ));

    Promise.resolve(newList)
        .then((list) => replaceList(list))

    function replaceList(list: TokenListIF) {
        const tokenListIndex = allTokenLists.findIndex((tokenList: TokenListIF) => tokenList.uri === uri);
        allTokenLists.splice(tokenListIndex, 1, list);
        localStorage.setItem('allTokenLists', JSON.stringify(allTokenLists));
    }
}