// token lists recognized by the app
// list 'broken' exists for testing purposes only
export const tokenListURIs = {
    ambient: '/ambient-token-list.json',
    testnet: '/testnet-token-list.json',
    // broken: '/broken-list.json',
    coingecko: 'https://tokens.coingecko.com/uniswap/all.json',
};

export type TokenListURITypes = keyof typeof tokenListURIs;
