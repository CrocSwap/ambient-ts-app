import { bigIntToFloat } from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { Chain } from '@reown/appkit/networks';
import { Provider } from 'ethers';
import { findTokenByAddress } from '../../dataLayer/functions/findTokenByAddress';
import { TokenIF } from '../../types';
import { NetworkIF } from '../../types/NetworkIF';
import { GCGO_TESTNET_URLS } from '../gcgo';
import { TopPool } from './TopPool';
import { GcgoFetcher } from '../../../utils/gcgoFetcher';

const PUBLIC_RPC_URL = 'https://sepolia.blast.io';
const SECONDARY_PUBLIC_RPC_URL = 'https://sepolia.blast.io';

const RESTRICTED_RPC_URL =
    import.meta.env.VITE_BLAST_SEPOLIA_RPC_URL !== undefined
        ? import.meta.env.VITE_BLAST_SEPOLIA_RPC_URL
        : undefined;

const PRIMARY_RPC_URL = RESTRICTED_RPC_URL
    ? RESTRICTED_RPC_URL
    : PUBLIC_RPC_URL;

const FALLBACK_RPC_URL =
    PRIMARY_RPC_URL === PUBLIC_RPC_URL
        ? SECONDARY_PUBLIC_RPC_URL
        : PUBLIC_RPC_URL;

const chainIdHex = '0xa0c71fd';
const chainSpecFromSDK = lookupChain(chainIdHex);

const chainSpecForAppKit: Chain = {
    id: Number(chainIdHex),
    rpcUrls: {
        default: {
            http: [PUBLIC_RPC_URL],
        },
    },
    name: 'Blast Sepolia',
    nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
    },
    blockExplorers: {
        default: {
            name: 'Blastscan',
            url: 'https://sepolia.blastscan.io/',
            apiUrl: 'https://api-sepolia.blastscan.io/api/',
        },
    },
    contracts: {
        multicall3: {
            address: '0xca11bde05977b3631167028862be2a173976ca11',
        },
    },
    testnet: true,
};

const defaultTokenEntries = [
    ['ETH', '0x0000000000000000000000000000000000000000'],
    ['USDB', '0x4200000000000000000000000000000000000022'],
] as const;

// Infer the type of the keys and define the resulting type
type BlastSepoliaTokens = {
    [Key in (typeof defaultTokenEntries)[number][0]]: TokenIF;
};

// Safely construct the object with type inference
export const BLAST_SEPOLIA_TOKENS: BlastSepoliaTokens = Object.fromEntries(
    defaultTokenEntries.map(([key, address]) => [
        key,
        findTokenByAddress(address, chainIdHex),
    ]),
) as BlastSepoliaTokens;

export const blastSepolia: NetworkIF = {
    chainId: chainIdHex,
    chainSpec: chainSpecFromSDK,
    gcgo: new GcgoFetcher(GCGO_TESTNET_URLS, Number(chainIdHex)),
    GCGO_URLS: GCGO_TESTNET_URLS,
    evmRpcUrls: [PRIMARY_RPC_URL, FALLBACK_RPC_URL],
    chainSpecForAppKit,
    defaultPair: [BLAST_SEPOLIA_TOKENS.ETH, BLAST_SEPOLIA_TOKENS.USDB],
    poolIndex: chainSpecFromSDK.poolIndex,
    gridSize: chainSpecFromSDK.gridSize,
    isTestnet: chainSpecFromSDK.isTestNet,
    displayName: 'Blast Testnet',
    tokenPriceQueryAssetPlatform: undefined,
    vaultsEnabled: false,
    tempestApiNetworkName: '',
    fastLaneProtectionEnabled: false,
    topPools: [
        new TopPool(
            BLAST_SEPOLIA_TOKENS.ETH,
            BLAST_SEPOLIA_TOKENS.USDB,
            chainSpecFromSDK.poolIndex,
        ),
    ],
    blockExplorer: (
        chainSpecForAppKit.blockExplorers?.default.url || ''
    ).replace(/\/?$/, '/'),
    getGasPriceInGwei: async (provider?: Provider) => {
        if (!provider) return 0;
        return (
            bigIntToFloat((await provider.getFeeData()).gasPrice || BigInt(0)) *
            1e-9
        );
    },
};
