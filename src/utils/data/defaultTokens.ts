export const ropstenETH = {
    address: '0x0000000000000000000000000000000000000000',
    chainId: 3,
    decimals: 18,
    fromList: '/ambient-token-list.json',
    logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
    name: 'Native Ether',
    symbol: 'ETH',
};

export const ropstenWBTC = {
    address: '0x442be68395613bdcd19778e761f03261ec46c06d',
    chainId: 3,
    decimals: 8,
    fromList: '/ambient-token-list.json',
    logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png',
    name: 'Wrapped BTC',
    symbol: 'WBTC',
};

export const ropstenDAI = {
    address: '0xaD6D458402F60fD3Bd25163575031ACDce07538D',
    chainId: 3,
    decimals: 18,
    fromList: '/ambient-token-list.json',
    logoURI: 'https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png',
    name: 'Dai Stablecoin',
    symbol: 'DAI',
};

export const ropstenUSDC = {
    address: '0x07865c6e87b9f70255377e024ace6630c1eaa37f',
    chainId: 3,
    decimals: 6,
    fromList: '/ambient-token-list.json',
    logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
    name: 'USDCoin',
    symbol: 'USDC',
};

export const mainnetDAI = {
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    chainId: 1,
    decimals: 18,
    fromList: '/ambient-token-list.json',
    logoURI: 'https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png',
    name: 'Dai Stablecoin',
    symbol: 'DAI',
};

export const mainnetUSDC = {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    chainId: 1,
    decimals: 6,
    fromList: '/ambient-token-list.json',
    logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
    name: 'USDCoin',
    symbol: 'USDC',
};

export const mainnetWBTC = {
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    chainId: 1,
    decimals: 8,
    fromList: '/ambient-token-list.json',
    logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png',
    name: 'Wrapped BTC',
    symbol: 'WBTC',
};

export const kovanETH = {
    name: 'Native Ether',
    address: '0x0000000000000000000000000000000000000000',
    symbol: 'ETH',
    decimals: 18,
    chainId: 42,
    logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
    fromList: '/ambient-token-list.json',
};

export const kovanUSDC = {
    name: 'USDCoin',
    address: '0xb7a4F3E9097C08dA09517b5aB877F7a917224ede',
    symbol: 'USDC',
    decimals: 6,
    chainId: 42,
    logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
    fromList: '/ambient-token-list.json',
};

export const kovanDAI = {
    name: 'Dai Stablecoin',
    address: '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa',
    symbol: 'DAI',
    decimals: 18,
    chainId: 42,
    logoURI: 'https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png',
    fromList: '/ambient-token-list.json',
};

export const defaultTokens = [
    ropstenETH,
    ropstenWBTC,
    ropstenDAI,
    ropstenUSDC,
    mainnetDAI,
    mainnetUSDC,
    mainnetWBTC,
    kovanDAI,
    kovanUSDC,
    kovanETH,
];
