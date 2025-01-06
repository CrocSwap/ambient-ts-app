// token lists recognized by the app

// list 'broken' exists for testing purposes only
export const tokenListURIs = {
    ambient: '/ambient-token-list.json',
    testnet: '/testnet-token-list.json',
    ethereumCoingecko: 'https://tokens.coingecko.com/ethereum/all.json',
    blastCoingecko: 'https://tokens.coingecko.com/blast/all.json',
    // broken: '/broken-list.json',
    scrollCoingecko: 'https://tokens.coingecko.com/scroll/all.json',
    scrollTech:
        'https://raw.githubusercontent.com/scroll-tech/token-list/main/scroll.tokenlist.json',
    // uniswap: 'https://tokens.uniswap.org',
    futa: 'http://localhost:3002/futa-token-list',
    baseCoingecko: 'https://tokens.coingecko.com/base/all.json',
};

// string union of all keys in the `tokenListURIs` obj
export type TokenListURITypes = keyof typeof tokenListURIs;

// string union of all values in the `tokenListURIs` obj
export type tokenListEndpointStrings =
    (typeof tokenListURIs)[TokenListURITypes];

// type definition for the refresh intervals object
//      keys: subset of keys in the `tokenListURIs` obj
//      values: refresh time in seconds (arbitrary number)
export type refreshTime = [TokenListURITypes, number];

// times to refresh individual token lists
// export const refreshTimes: refreshTime[] = [
//     ['scrollTech', 6],
//     ['futa', 15],
// ];
