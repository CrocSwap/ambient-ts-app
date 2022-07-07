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
        ));
    Promise.resolve(list)
        .then(resolvedList => {
            console.log(resolvedList);
            const allTokenLists = JSON.parse(localStorage.getItem('allTokenLists') as string)
            if (allTokenLists.map((tokenList: TokenListIF) => tokenList.uri).includes(resolvedList.uri)) {
                console.log('already got it, boss!')
            } else {
                console.log('nope, new to me!')
            }
            console.log(allTokenLists);
        });
}