export default function getList(listURI:string) {
    console.log('user wants list from: ' + listURI);
    const list = fetch(listURI)
        .then(response => response.json())
        .then(response => (
            {
                ...response,
                listURI,
                dateRetrieved: new Date().toISOString(),
                default: false,
                userImported: true,
            }
        ));
    Promise.resolve(list)
        .then(resolvedList => console.log(resolvedList));
}