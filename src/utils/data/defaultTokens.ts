import { TokenIF } from '../interfaces/TokenIF';
import { supportedNetworks } from '../networks';

export const mainnetETH = {
    address: '0x0000000000000000000000000000000000000000',
    chainId: 1,
    decimals: 18,
    fromList: '/ambient-token-list.json',
    logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
    name: 'Ether',
    symbol: 'ETH',
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

export const mainnetPEPE = {
    address: '0x6982508145454Ce325dDbE47a25d4ec3d2311933',
    chainId: 1,
    decimals: 18,
    fromList: '/ambient-token-list.json',
    logoURI:
        'https://assets.coingecko.com/coins/images/29850/large/pepe-token.jpeg?1682922725',
    name: 'Pepe',
    symbol: 'PEPE',
};

export const mainnetDAI = {
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    chainId: 1,
    decimals: 18,
    fromList: '/ambient-token-list.json',
    logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
    name: 'Dai Stablecoin',
    symbol: 'DAI',
};

export const mainnetUSDT = {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    chainId: 1,
    decimals: 6,
    fromList: 'https://tokens.coingecko.com/uniswap/all.json',
    logoURI: 'https://assets.coingecko.com/coins/images/325/thumb/Tether.png',
    name: 'Tether',
    symbol: 'USDT',
};

export const goerliETH = {
    name: 'Native Ether',
    address: '0x0000000000000000000000000000000000000000',
    symbol: 'ETH',
    decimals: 18,
    chainId: 5,
    logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
    fromList: '/ambient-token-list.json',
};

export const goerliUSDC = {
    name: 'USDCoin',
    address: '0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C',
    symbol: 'USDC',
    decimals: 6,
    chainId: 5,
    logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
    fromList: '/ambient-token-list.json',
};

export const goerliDAI = {
    name: 'Dai Stablecoin',
    address: '0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60',
    symbol: 'DAI',
    decimals: 18,
    chainId: 5,
    logoURI:
        'https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png',
    fromList: '/ambient-token-list.json',
};

export const goerliUSDT = {
    name: 'Tether',
    address: '0x509ee0d083ddf8ac028f2a56731412edd63223b9',
    symbol: 'USDT',
    decimals: 6,
    chainId: 5,
    logoURI: 'https://assets.coingecko.com/coins/images/325/thumb/Tether.png',
    fromList: '',
};

export const goerliWBTC = {
    name: 'Wrapped BTC',
    address: '0xC04B0d3107736C32e19F1c62b2aF67BE61d63a05',
    symbol: 'WBTC',
    decimals: 8,
    chainId: 5,
    logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png',
    fromList: '/ambient-token-list.json',
};

export const arbGoerliETH = {
    name: 'Native Ether',
    address: '0x0000000000000000000000000000000000000000',
    symbol: 'ETH',
    decimals: 18,
    chainId: 421613,
    logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
};

export const arbGoerliUSDC = {
    name: 'USDCoin',
    address: '0xc944b73fba33a773a4a07340333a3184a70af1ae',
    symbol: 'USDC',
    decimals: 6,
    chainId: 421613,
    logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
};

export const arbGoerliWBTC = {
    name: 'Wrapped BTC',
    address: '0x5263e9d82352b8098cc811164c38915812bfc1e3',
    symbol: 'WBTC',
    decimals: 8,
    chainId: 421613,
    logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png',
};

export const arbGoerliDAI = {
    name: 'Dai Stablecoin',
    address: '0xc52f941486978a25fad837bb701d3025679780e4',
    symbol: 'DAI',
    decimals: 18,
    chainId: 421613,
    logoURI:
        'https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png',
};

export const arbETH = {
    name: 'Native Ether',
    address: '0x0000000000000000000000000000000000000000',
    symbol: 'ETH',
    decimals: 18,
    chainId: 42161,
    logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
};

export const arbUSDC = {
    name: 'USDCoin',
    address: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
    symbol: 'USDC',
    decimals: 6,
    chainId: 42161,
    logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
};

export const defaultTokens: TokenIF[] = [
    mainnetETH,
    mainnetUSDC,
    mainnetWBTC,
    mainnetPEPE,
    mainnetDAI,
    goerliETH,
    goerliUSDC,
    goerliWBTC,
    goerliDAI,
    arbGoerliETH,
    arbGoerliUSDC,
    arbGoerliDAI,
    arbGoerliWBTC,
];

export function getDefaultPairForChain(chainId: string): [TokenIF, TokenIF] {
    return [
        supportedNetworks[chainId].defaultPair[0],
        supportedNetworks[chainId].defaultPair[1],
    ];
}
