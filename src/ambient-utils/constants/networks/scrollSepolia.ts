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

const findTokenByAddress = (address: string): TokenIF =>
    testnetTokenList.tokens.find(
        (token) =>
            token.address.toLowerCase() === address.toLowerCase() &&
            token.chainId === Number(chainIdHex),
    ) as TokenIF;

const defaultTokenEntries = [
    ['ETH', '0x0000000000000000000000000000000000000000'],
    ['USDC', '0x4D65fB724CEd0CFC6ABFD03231C9CDC2C36A587B'],
    ['WBTC', '0xb3B942b6d4a4858838aAb8f94DdaEdd479CD1594'],
] as const;

type ScrollSepoliaTokens = {
    [Key in (typeof defaultTokenEntries)[number][0]]: TokenIF;
};

export const SCROLL_SEPOLIA_TOKENS: ScrollSepoliaTokens = Object.fromEntries(
    defaultTokenEntries.map(([key, address]) => [
        key,
        findTokenByAddress(address),
    ]),
) as ScrollSepoliaTokens;

export const scrollSepolia: NetworkIF = {
    chainId: chainIdHex,
    chainSpec: chainSpecFromSDK,
    GCGO_URL: GCGO_TESTNET_URL,
    evmRpcUrl: PRIMARY_RPC_URL,
    fallbackRpcUrl: FALLBACK_RPC_URL,
    chainSpecForWalletConnector: chainSpecForWalletConnector,
    defaultPair: [SCROLL_SEPOLIA_TOKENS.ETH, SCROLL_SEPOLIA_TOKENS.USDC],
    poolIndex: chainSpecFromSDK.poolIndex,
    gridSize: chainSpecFromSDK.gridSize,
    blockExplorer: chainSpecForWalletConnector.explorerUrl,
    displayName: 'Scroll Testnet',
    tokenPriceQueryAssetPlatform: undefined,
    vaultsEnabled: false,
    tempestApiNetworkName: '',
    topPools: [
        new TopPool(
            SCROLL_SEPOLIA_TOKENS.ETH,
            SCROLL_SEPOLIA_TOKENS.USDC,
            chainSpecFromSDK.poolIndex,
        ),
        new TopPool(
            SCROLL_SEPOLIA_TOKENS.ETH,
            SCROLL_SEPOLIA_TOKENS.WBTC,
            chainSpecFromSDK.poolIndex,
        ),
        new TopPool(
            SCROLL_SEPOLIA_TOKENS.USDC,
            SCROLL_SEPOLIA_TOKENS.WBTC,
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
