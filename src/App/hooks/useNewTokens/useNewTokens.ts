import { tokenListURIs } from '../../../utils/data/tokenListURIs';
import uriToHttp from '../../../utils/functions/uriToHttp';
import fetchTokenList from '../../../utils/functions/fetchTokenList';
import { TokenListIF } from '../../../utils/interfaces/TokenListIF';

export const useNewTokens = () => {
    console.log('ran custom hook useNewTokens() in App.tsx file!');
    // create an array of promises to fetch all token lists in the URIs file
    const tokenListPromises: Promise<TokenListIF>[] = Object.values(
        tokenListURIs,
    ).map((uri: string) => fetchTokenList(uri, false));

    Promise.allSettled(tokenListPromises).then((promises) =>
        console.log(promises),
    );
};
