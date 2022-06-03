export const ambientTokenList = {
    name: 'Ambient Token List',
    timestamp: '2022-03-17T15:02:53.363Z',
    version: {
        major: 1,
        minor: 0,
        patch: 0,
    },
    tags: {},
    logoURI: 'ipfs://QmNa8mQkrNKp1WEEeGjFezDmDeodkWRevGFN8JCV7b4Xir',
    keywords: ['crocswap', 'ambient', 'default'],
    tokens: [
        {
            name: 'Native Ether',
            address: '0x0000000000000000000000000000000000000000',
            symbol: 'ETH',
            decimals: 18,
            chainId: 3,
            logoURI:
                'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
        },
        {
            name: 'Native Ether',
            address: '0x0000000000000000000000000000000000000000',
            symbol: 'ETH',
            decimals: 18,
            chainId: 42,
            logoURI:
                'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
        },
        {
            name: 'Wrapped BTC',
            address: '0x442be68395613bdcd19778e761f03261ec46c06d',
            symbol: 'WBTC',
            decimals: 8,
            chainId: 3,
            logoURI:
                'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png',
        },
        {
            name: 'Dai Stablecoin',
            address: '0xaD6D458402F60fD3Bd25163575031ACDce07538D',
            symbol: 'DAI',
            decimals: 18,
            chainId: 3,
            logoURI: 'https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png',
        },
        {
            name: 'Dai Stablecoin',
            address: '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa',
            symbol: 'DAI',
            decimals: 18,
            chainId: 42,
            logoURI: 'https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png',
        },
        {
            name: 'USDCoin',
            address: '0x07865c6e87b9f70255377e024ace6630c1eaa37f',
            symbol: 'USDC',
            decimals: 6,
            chainId: 3,
            logoURI:
                'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
        },
        {
            name: 'USDCoin',
            address: '0xb7a4F3E9097C08dA09517b5aB877F7a917224ede',
            symbol: 'USDC',
            decimals: 6,
            chainId: 42,
            logoURI:
                'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
        },
        {
            name: 'Dai Stablecoin',
            address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
            symbol: 'DAI',
            decimals: 18,
            chainId: 1,
            logoURI:
                'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
        },
        {
            name: 'USDCoin',
            address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            symbol: 'USDC',
            decimals: 6,
            chainId: 1,
            logoURI:
                'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
        },

        {
            name: 'Wrapped BTC',
            address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
            symbol: 'WBTC',
            decimals: 8,
            chainId: 1,
            logoURI:
                'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png',
        },
    ],
};

export const logAmbientList = () => {
    console.log(ambientTokenList);
};

export const logAmbientTokens = () => {
    console.log(ambientTokenList.tokens);
};

export const getAmbientList = () => {
    return ambientTokenList;
};

export const getAmbientTokens = () => {
    return ambientTokenList.tokens;
};

export const getAmbientTokensOnChain = (chain = 42) => {
    const { tokens } = ambientTokenList;
    const tokensOnChain = tokens.filter((token) => token.chainId === chain);
    return tokensOnChain;
};
