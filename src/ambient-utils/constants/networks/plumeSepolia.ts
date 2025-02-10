import { bigIntToFloat } from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { Provider } from 'ethers';
import { findTokenByAddress } from '../../dataLayer/functions/findTokenByAddress';
import { TokenIF } from '../../types';
import { NetworkIF } from '../../types/NetworkIF';
import { GCGO_TESTNET_URL } from '../gcgo';
import { TopPool } from './TopPool';

const PUBLIC_RPC_URL = 'https://test-rpc.plumenetwork.xyz';
const SECONDARY_PUBLIC_RPC_URL = 'https://test-rpc.plumenetwork.xyz';

const RESTRICTED_RPC_URL =
    import.meta.env.VITE_PLUME_SEPOLIA_RPC_URL !== undefined
        ? import.meta.env.VITE_PLUME_SEPOLIA_RPC_URL
        : undefined;

const PRIMARY_RPC_URL = RESTRICTED_RPC_URL
    ? RESTRICTED_RPC_URL
    : PUBLIC_RPC_URL;

const FALLBACK_RPC_URL =
    PRIMARY_RPC_URL === PUBLIC_RPC_URL
        ? SECONDARY_PUBLIC_RPC_URL
        : PUBLIC_RPC_URL;

const chainIdHex = '0x18230';
const chainSpecFromSDK = lookupChain(chainIdHex);

const chainSpecForWalletConnector = {
    chainId: Number(chainIdHex),
    name: 'Plume Devnet',
    currency: 'ETH',
    rpcUrl: PUBLIC_RPC_URL,
    explorerUrl: 'https://test-explorer.plumenetwork.xyz/',
};

const defaultTokenEntries = [
    ['ETH', '0x0000000000000000000000000000000000000000'],
    ['pUSD', '0xe644F07B1316f28a7F134998e021eA9f7135F351'],
    ['NEV', '0x659619AEdf381c3739B0375082C2d61eC1fD8835'],
] as const;

// Infer the type of the keys and define the resulting type
type PlumeSepoliaTokens = {
    [Key in (typeof defaultTokenEntries)[number][0]]: TokenIF;
};

// Safely construct the object with type inference
export const PLUME_SEPOLIA_TOKENS: PlumeSepoliaTokens = Object.fromEntries(
    defaultTokenEntries.map(([key, address]) => [
        key,
        findTokenByAddress(address, chainIdHex),
    ]),
) as PlumeSepoliaTokens;

export const plumeSepolia: NetworkIF = {
    chainId: chainIdHex,
    chainSpec: chainSpecFromSDK,
    GCGO_URL: GCGO_TESTNET_URL,
    evmRpcUrl: PRIMARY_RPC_URL,
    fallbackRpcUrl: FALLBACK_RPC_URL,
    chainSpecForWalletConnector: chainSpecForWalletConnector,
    defaultPair: [PLUME_SEPOLIA_TOKENS.ETH, PLUME_SEPOLIA_TOKENS.pUSD],
    defaultPairFuta: [PLUME_SEPOLIA_TOKENS.ETH, PLUME_SEPOLIA_TOKENS.pUSD],
    poolIndex: chainSpecFromSDK.poolIndex,
    gridSize: chainSpecFromSDK.gridSize,
    blockExplorer: chainSpecForWalletConnector.explorerUrl,
    displayName: 'Plume Devnet',
    tokenPriceQueryAssetPlatform: undefined,
    vaultsEnabled: false,
    tempestApiNetworkName: '',
    topPools: [
        new TopPool(
            PLUME_SEPOLIA_TOKENS.ETH,
            PLUME_SEPOLIA_TOKENS.pUSD,
            chainSpecFromSDK.poolIndex,
        ),
        new TopPool(
            PLUME_SEPOLIA_TOKENS.pUSD,
            PLUME_SEPOLIA_TOKENS.NEV,
            chainSpecFromSDK.poolIndex,
        ),
        new TopPool(
            PLUME_SEPOLIA_TOKENS.ETH,
            PLUME_SEPOLIA_TOKENS.NEV,
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
