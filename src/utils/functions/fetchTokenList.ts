import uriToHttp from './uriToHttp';
import { TokenListIF } from '../interfaces/TokenListIF';

// !important:  abstraction is at this point largely unnecessary, but at
// !important:  ... some point in the future we'll likely support users
// !important:  ... important custom lists of tokens to the platform

// fn to fetch a token list asynchronously... this function creates and
// ... returns a promise but allows the parent file to determine how to
// ... best resolve it (mutliple fetches may be dispatched in parallel)
export default function fetchTokenList(
    // uri for the fetch request
    uri: string,
    // whether this list is requested by the Ambient app or by the user
    isUserImported = false,
): Promise<TokenListIF> {
    return (
        fetch(uriToHttp(uri))
            // process response as a JSOM
            .then((response) => response.json())
            // middleware to add internal-use data to each list
            .then((response) => ({
                ...response,
                uri,
                dateRetrieved: new Date().toISOString(),
                isUserImported: isUserImported,
            }))
    );
}
