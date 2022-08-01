import uriToHttp from '../../../utils/functions/uriToHttp'; 

export default function refreshTokenList(uri:string) {
    console.log('user clicked button to refresh: ', uriToHttp(uri));

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
    
    console.log(newList);
}