// token lists recognized by the app
// list 'broken' exists for testing purposes only
export const tokenListURIs = {
    ambient: '/ambient-token-list.json',
    testnet: '/testnet-token-list.json',
    uniswap: 'https://cloudflare-ipfs.com/ipns/tokens.uniswap.org',
    // broken: '/broken-list.json',
    coingecko: 'https://tokens.coingecko.com/uniswap/all.json',
    scroll: 'https://raw.githubusercontent.com/scroll-tech/token-list/main/scroll.tokenlist.json',
};

export type TokenListURITypes = keyof typeof tokenListURIs;
