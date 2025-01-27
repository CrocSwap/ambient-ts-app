import { bigIntToFloat } from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { Provider } from 'ethers';
import { TokenIF } from '../../types';
import { NetworkIF } from '../../types/NetworkIF';
import { GCGO_TESTNET_URL } from '../gcgo';
import testnetTokenList from '../testnet-token-list.json';
import { TopPool } from './TopPool';

const PUBLIC_RPC_URL = 'https://sepolia-rpc.scroll.io';
const SECONDARY_PUBLIC_RPC_URL = 'https://scroll-sepolia-rpc.publicnode.com';

const RESTRICTED_RPC_URL =
    import.meta.env.VITE_BASE_SEPOLIA_RPC_URL !== undefined
        ? import.meta.env.VITE_BASE_SEPOLIA_RPC_URL
        : undefined;

const PRIMARY_RPC_URL = RESTRICTED_RPC_URL
    ? RESTRICTED_RPC_URL
    : PUBLIC_RPC_URL;

const FALLBACK_RPC_URL =
    PRIMARY_RPC_URL === PUBLIC_RPC_URL
        ? SECONDARY_PUBLIC_RPC_URL
        : PUBLIC_RPC_URL;

const chainIdHex = '0x8274f';
const chainSpecFromSDK = lookupChain(chainIdHex);

const chainSpecForWalletConnector = {
    chainId: Number(chainIdHex),
    name: 'Scroll Sepolia Testnet',
    currency: 'ETH',
    rpcUrl: PUBLIC_RPC_URL,
    explorerUrl: 'https://sepolia.scrollscan.dev/',
};

export const scrollSepoliaETH: TokenIF = testnetTokenList.tokens.find(
    (token) =>
        token.address === '0x0000000000000000000000000000000000000000' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const scrollSepoliaUSDC: TokenIF = testnetTokenList.tokens.find(
    (token) =>
        token.address === '0x4D65fB724CEd0CFC6ABFD03231C9CDC2C36A587B' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const scrollSepoliaWBTC: TokenIF = testnetTokenList.tokens.find(
    (token) =>
        token.address === '0xb3B942b6d4a4858838aAb8f94DdaEdd479CD1594' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const scrollSepolia: NetworkIF = {
    chainId: chainIdHex,
    chainSpec: chainSpecFromSDK,
    GCGO_URL: GCGO_TESTNET_URL,
    evmRpcUrl: PRIMARY_RPC_URL,
    fallbackRpcUrl: FALLBACK_RPC_URL,
    chainSpecForWalletConnector: chainSpecForWalletConnector,
    defaultPair: [scrollSepoliaETH, scrollSepoliaUSDC],
    poolIndex: chainSpecFromSDK.poolIndex,
    gridSize: chainSpecFromSDK.gridSize,
    blockExplorer: chainSpecForWalletConnector.explorerUrl,
    displayName: 'Scroll Testnet',
    tokenPriceQueryAssetPlatform: undefined,
    vaultsEnabled: false,
    tempestApiNetworkName: '',
    topPools: [
        new TopPool(
            scrollSepoliaETH,
            scrollSepoliaUSDC,
            chainSpecFromSDK.poolIndex,
        ),
        new TopPool(
            scrollSepoliaETH,
            scrollSepoliaWBTC,
            chainSpecFromSDK.poolIndex,
        ),
        new TopPool(
            scrollSepoliaUSDC,
            scrollSepoliaWBTC,
            chainSpecFromSDK.poolIndex,
        ),
    ],
    getGasPriceInGwei: async (provider?: Provider) => {
        if (!provider) return 0;
        return (
            bigIntToFloat((await provider.getFeeData()).gasPrice || BigInt(0)) *
            1e-9
        );
    },
};
