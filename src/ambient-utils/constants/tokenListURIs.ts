// token lists recognized by the app

// list 'broken' exists for testing purposes only
export const tokenListURIs = {
    ethereumCoingecko: 'https://tokens.coingecko.com/ethereum/all.json',
    blastCoingecko: 'https://tokens.coingecko.com/blast/all.json',
    // broken: '/broken-list.json',
    scrollCoingecko: 'https://tokens.coingecko.com/scroll/all.json',
    scrollTech:
        'https://raw.githubusercontent.com/scroll-tech/token-list/main/scroll.tokenlist.json',
    testnet: '/testnet-token-list.json',
    uniswap: 'https://tokens.uniswap.org',
    ambient: '/ambient-token-list.json',
    futa: '/futa-token-list.json',
    baseCoingecko: 'https://tokens.coingecko.com/base/all.json',
};

export type TokenListURITypes = keyof typeof tokenListURIs;
