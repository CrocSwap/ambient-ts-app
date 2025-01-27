import { bigIntToFloat } from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { Provider } from 'ethers';
import { TokenIF } from '../../types';
import { NetworkIF } from '../../types/NetworkIF';
import ambientTokenList from '../ambient-token-list.json';
import { GCGO_ETHEREUM_URL } from '../gcgo';
import { TopPool } from './TopPool';

const PUBLIC_RPC_URL = 'https://ethereum-rpc.publicnode.com';
const SECONDARY_PUBLIC_RPC_URL = 'https://eth.llamarpc.com';

const RESTRICTED_RPC_URL =
    import.meta.env.VITE_MAINNET_RPC_URL !== undefined
        ? import.meta.env.VITE_MAINNET_RPC_URL
        : undefined;

const PRIMARY_RPC_URL = RESTRICTED_RPC_URL
    ? RESTRICTED_RPC_URL
    : PUBLIC_RPC_URL;

const FALLBACK_RPC_URL =
    PRIMARY_RPC_URL === PUBLIC_RPC_URL
        ? SECONDARY_PUBLIC_RPC_URL
        : PUBLIC_RPC_URL;

const chainIdHex = '0x1';
const chainSpecFromSDK = lookupChain(chainIdHex);

const chainSpecForWalletConnector = {
    chainId: Number(chainIdHex),
    name: 'Ethereum',
    currency: 'ETH',
    rpcUrl: PUBLIC_RPC_URL,
    explorerUrl: 'https://etherscan.io/',
};

export const mainnetETH: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0x0000000000000000000000000000000000000000' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const mainnetUSDC: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const mainnetUSDT: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0xdAC17F958D2ee523a2206206994597C13D831ec7' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const mainnetWBTC: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const mainnetDAI: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0x6B175474E89094C44Da98b954EedeAC495271d0F' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const mainnetSWETH: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0xf951e335afb289353dc249e82926178eac7ded78' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const mainnetRSETH: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0xa1290d69c65a6fe4df752f95823fae25cb99e5a7' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const mainnetRSWETH: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0xFAe103DC9cf190eD75350761e95403b7b8aFa6c0' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const mainnetSTONE: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0x7122985656e38bdc0302db86685bb972b145bd3c' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const mainnetSWELL: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0x0a6E7Ba5042B38349e437ec6Db6214AEC7B35676' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const mainnetTBTC: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0x18084fbA666a33d37592fA2633fD49a74DD93a88' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const ethereumMainnet: NetworkIF = {
    chainId: chainIdHex,
    chainSpec: chainSpecFromSDK,
    GCGO_URL: GCGO_ETHEREUM_URL,
    evmRpcUrl: PRIMARY_RPC_URL,
    fallbackRpcUrl: FALLBACK_RPC_URL,
    chainSpecForWalletConnector: chainSpecForWalletConnector,
    defaultPair: [mainnetETH, mainnetUSDC],
    poolIndex: chainSpecFromSDK.poolIndex,
    gridSize: chainSpecFromSDK.gridSize,
    blockExplorer: chainSpecForWalletConnector.explorerUrl,
    displayName: 'Ethereum',
    tokenPriceQueryAssetPlatform: 'ethereum',
    vaultsEnabled: true,
    tempestApiNetworkName: 'ethereum',
    topPools: [
        new TopPool(mainnetETH, mainnetUSDC, chainSpecFromSDK.poolIndex),
        new TopPool(mainnetETH, mainnetUSDT, chainSpecFromSDK.poolIndex),
        new TopPool(mainnetETH, mainnetWBTC, chainSpecFromSDK.poolIndex),
        new TopPool(mainnetUSDT, mainnetUSDC, chainSpecFromSDK.poolIndex),
    ],
    getGasPriceInGwei: async (provider?: Provider) => {
        if (!provider) return 0;
        return (
            bigIntToFloat((await provider.getFeeData()).gasPrice || BigInt(0)) *
            1e-9
        );
    },
};
