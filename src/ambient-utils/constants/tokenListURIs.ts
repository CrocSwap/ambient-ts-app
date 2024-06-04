// token lists recognized by the app
// list 'broken' exists for testing purposes only
export const tokenListURIs = {
    testnet: '/testnet-token-list.json',
    blastCoingecko: 'https://tokens.coingecko.com/blast/all.json',
    // broken: '/broken-list.json',
    scrollCoingecko: 'https://tokens.coingecko.com/scroll/all.json',
    scrollTech:
        'https://raw.githubusercontent.com/scroll-tech/token-list/main/scroll.tokenlist.json',
    ethereumCoingecko: 'https://tokens.coingecko.com/ethereum/all.json',
    uniswap: 'https://tokens.uniswap.org',
    ambient: '/ambient-token-list.json',
};

export type TokenListURITypes = keyof typeof tokenListURIs;
