// token lists recognized by the app
// list 'broken' exists for testing purposes only
export const tokenListURIs = {
    ambient: '/ambient-token-list.json',
    testnet: '/testnet-token-list.json',
    uniswap: 'https://tokens.uniswap.org/',
    blastCoingecko: 'https://tokens.coingecko.com/blast/all.json',
    // broken: '/broken-list.json',
    coingecko: 'https://tokens.coingecko.com/uniswap/all.json',
    scrollTech:
        'https://raw.githubusercontent.com/scroll-tech/token-list/main/scroll.tokenlist.json',
    scrollCoingecko: 'https://tokens.coingecko.com/scroll/all.json',
};

export type TokenListURITypes = keyof typeof tokenListURIs;
