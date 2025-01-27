/* eslint-disable @typescript-eslint/no-explicit-any  */

import ambientTokenList from '../constants/ambient-token-list.json';
import testnetTokenList from '../constants/testnet-token-list.json';
import { uriToHttp } from '../dataLayer/functions/uriToHttp';
import { TokenListIF } from '../types/token/TokenListIF';

// !important:  abstraction is at this point largely unnecessary, but at
// !important:  ... some point in the future we'll likely support users
// !important:  ... important custom lists of tokens to the platform

// fn to fetch a token list asynchronously... this function creates and
// ... returns a promise but allows the parent file to determine how to
// ... best resolve it (multiple fetches may be dispatched in parallel)
export default async function fetchTokenList(
    uri: string,
    isUserImported = false,
): Promise<TokenListIF> {
    // function isRunningOnLocalhost(): boolean {
    //     const hostname = window.location.hostname;
    //     return (
    //         hostname === 'localhost' ||
    //         hostname === '127.0.0.1' ||
    //         hostname.startsWith('192.168') ||
    //         hostname === '[::1]'
    //     );
    // }

    // Handle manual lists
    const tokenListMap = new Map<string, any>([
        ['ambient-token-list.json', ambientTokenList],
        ['testnet-token-list.json', testnetTokenList],
    ]);

    if (uri.startsWith('/')) {
        // if (uri.startsWith('/') && isRunningOnLocalhost()) {
        for (const [key, value] of tokenListMap) {
            if (uri.includes(key)) {
                return Promise.resolve({
                    ...value,
                    uri,
                    dateRetrieved: new Date().toISOString(),
                    isUserImported,
                });
            }
        }
        throw Error(`Can not access ${uri} token list if deployed locally`);
    }

    return fetch(uriToHttp(uri))
        .then((response) => response.json())
        .then((response) => ({
            ...response,
            uri,
            dateRetrieved: new Date().toISOString(),
            isUserImported,
        }));
}
