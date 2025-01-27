import { bigIntToFloat } from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { Provider } from 'ethers';
import { TokenIF } from '../../types';
import { NetworkIF } from '../../types/NetworkIF';
import { GCGO_TESTNET_URL } from '../gcgo';
import testnetTokenList from '../testnet-token-list.json';
import { TopPool } from './TopPool';

const PUBLIC_RPC_URL = 'https://ethereum-sepolia-rpc.publicnode.com';
const SECONDARY_PUBLIC_RPC_URL = 'https://1rpc.io/sepolia';

const RESTRICTED_RPC_URL =
    import.meta.env.VITE_SEPOLIA_RPC_URL !== undefined
        ? import.meta.env.VITE_SEPOLIA_RPC_URL
        : undefined;

const PRIMARY_RPC_URL = RESTRICTED_RPC_URL
    ? RESTRICTED_RPC_URL
    : PUBLIC_RPC_URL;

const FALLBACK_RPC_URL =
    PRIMARY_RPC_URL === PUBLIC_RPC_URL
        ? SECONDARY_PUBLIC_RPC_URL
        : PUBLIC_RPC_URL;

const chainIdHex = '0xaa36a7';
const chainSpecFromSDK = lookupChain(chainIdHex);

const chainSpecForWalletConnector = {
    chainId: Number(chainIdHex),
    name: 'Sepolia',
    currency: 'ETH',
    rpcUrl: PUBLIC_RPC_URL,
    explorerUrl: 'https://sepolia.etherscan.io/',
};

const findTokenByAddress = (address: string): TokenIF =>
    testnetTokenList.tokens.find(
        (token) =>
            token.address.toLowerCase() === address.toLowerCase() &&
            token.chainId === Number(chainIdHex),
    ) as TokenIF;

const defaultTokenEntries = [
    ['ETH', '0x0000000000000000000000000000000000000000'],
    ['USDC', '0x60bBA138A74C5e7326885De5090700626950d509'],
    ['WBTC', '0xCA97CC9c1a1dfA54A252DaAFE9b5Cd1E16C81328'],
] as const;

// Infer the type of the keys and define the resulting type
type SepoliaTokens = {
    [Key in (typeof defaultTokenEntries)[number][0]]: TokenIF;
};

// Safely construct the object with type inference
export const SEPOLIA_TOKENS: SepoliaTokens = Object.fromEntries(
    defaultTokenEntries.map(([key, address]) => [
        key,
        findTokenByAddress(address),
    ]),
) as SepoliaTokens;

export const ethereumSepolia: NetworkIF = {
    chainId: chainIdHex,
    chainSpec: chainSpecFromSDK,
    GCGO_URL: GCGO_TESTNET_URL,
    evmRpcUrl: PRIMARY_RPC_URL,
    fallbackRpcUrl: FALLBACK_RPC_URL,
    chainSpecForWalletConnector: chainSpecForWalletConnector,
    defaultPair: [SEPOLIA_TOKENS.ETH, SEPOLIA_TOKENS.USDC],
    defaultPairFuta: [SEPOLIA_TOKENS.ETH, SEPOLIA_TOKENS.WBTC],
    poolIndex: chainSpecFromSDK.poolIndex,
    gridSize: chainSpecFromSDK.gridSize,
    blockExplorer: chainSpecForWalletConnector.explorerUrl,
    displayName: 'Sepolia',
    tokenPriceQueryAssetPlatform: undefined,
    vaultsEnabled: false,
    tempestApiNetworkName: '',
    topPools: [
        new TopPool(
            SEPOLIA_TOKENS.ETH,
            SEPOLIA_TOKENS.USDC,
            chainSpecFromSDK.poolIndex,
        ),
        new TopPool(
            SEPOLIA_TOKENS.ETH,
            SEPOLIA_TOKENS.WBTC,
            chainSpecFromSDK.poolIndex,
        ),
        new TopPool(
            SEPOLIA_TOKENS.USDC,
            SEPOLIA_TOKENS.WBTC,
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
