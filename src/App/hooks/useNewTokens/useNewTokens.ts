import { tokenListURIs } from '../../../utils/data/tokenListURIs';
import uriToHttp from '../../../utils/functions/uriToHttp';
import { TokenListIF } from '../../../utils/interfaces/TokenListIF';

export const useNewTokens = () => {
    console.log('ran custom hook useNewTokens() in App.tsx file!');
    // create an array of promises to fetch all token lists in the URIs file
    const tokenListPromises: Promise<TokenListIF>[] = Object.values(
        tokenListURIs,
    ).map((uri) =>
        fetch(uriToHttp(uri))
            // process response as a JSOM
            .then((response) => response.json())
            // middleware to add internal-use data to each list
            .then((response) => ({
                ...response,
                uri,
                dateRetrieved: new Date().toISOString(),
                userImported: false,
            })),
    );

    Promise.allSettled(tokenListPromises).then((promises) =>
        console.log(promises),
    );
};
