export const tokenListURIs = {
    ambient: '/ambient-token-list.json',
    testnet: '/testnet-token-list.json',
    // broken: '/broken-list.json',
    // uniswap: 'https://tokens.uniswap.org',
    // coinmarketcap: 'https://api.coinmarketcap.com/data-api/v3/uniswap/all.json',
    // aave: 'https://wispy-bird-88a7.uniswap.workers.dev/?url=http://tokenlist.aave.eth.link',
    coingecko: 'https://tokens.coingecko.com/uniswap/all.json',
    // arbitrum: 'https://bridge.arbitrum.io/token-list-42161.json',
    // gemini: 'https://www.gemini.com/uniswap/manifest.json',
    // compound: 'https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json',
    // optimism: 'https://static.optimism.io/optimism.tokenlist.json',
    // kleros: 'https://wispy-bird-88a7.uniswap.workers.dev/?url=http://t2crtokens.eth.link',
    // rollsocialmoney: 'https://app.tryroll.com/tokens.json',
    // baerc20: 'https://raw.githubusercontent.com/The-Blockchain-Association/sec-notice-list/master/ba-sec-list.json',
};

export type TokenListURITypes = keyof typeof tokenListURIs;
