import { bigIntToFloat } from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { Chain } from '@reown/appkit/networks';
import { Provider } from 'ethers';
import { findTokenByAddress } from '../../dataLayer/functions/findTokenByAddress';
import { TokenIF } from '../../types';
import { NetworkIF } from '../../types/NetworkIF';
import { GCGO_BLAST_URL } from '../gcgo';
import { TopPool } from './TopPool';

const RPC_URLS = {
    PUBLIC: 'https://rpc.blast.io',
    SECONDARY_PUBLIC: 'https://blastl2-mainnet.public.blastapi.io',
    RESTRICTED: import.meta.env.VITE_BLAST_RPC_URL,
};

const PRIMARY_RPC_URL = RPC_URLS.RESTRICTED || RPC_URLS.PUBLIC;
const FALLBACK_RPC_URL =
    PRIMARY_RPC_URL === RPC_URLS.PUBLIC
        ? RPC_URLS.SECONDARY_PUBLIC
        : RPC_URLS.PUBLIC;

const chainIdHex = '0x13e31';

const chainSpecFromSDK = lookupChain(chainIdHex);

const chainSpecForAppKit: Chain = {
    id: Number(chainIdHex),
    rpcUrls: {
        default: { http: [RPC_URLS.PUBLIC] },
    },
    name: 'Blast',
    nativeCurrency: {
        decimals: 18,
        name: 'Ether',
        symbol: 'ETH',
    },
    blockExplorers: {
        default: {
            name: 'Blastscan',
            url: 'https://blastscan.io',
            apiUrl: 'https://api.blastscan.io/api',
        },
    },
};

const defaultTokenEntries = [
    ['ETH', '0x0000000000000000000000000000000000000000'],
    ['USDB', '0x4300000000000000000000000000000000000003'],
    ['ezETH', '0x2416092f143378750bb29b79eD961ab195CcEea5'],
    ['BLAST', '0xb1a5700fA2358173Fe465e6eA4Ff52E36e88E2ad'],
    ['USDPLUS', '0x4fee793d435c6d2c10c135983bb9d6d4fc7b9bbd'],
    ['wrsETH', '0xe7903B1F75C534Dd8159b313d92cDCfbC62cB3Cd'],
    ['weETH', '0x04C0599Ae5A44757c0af6F9eC3b93da8976c150A'],
] as const;

type BlastTokens = Record<(typeof defaultTokenEntries)[number][0], TokenIF>;

export const BLAST_TOKENS: BlastTokens = Object.fromEntries(
    defaultTokenEntries.map(([key, address]) => [
        key,
        findTokenByAddress(address, chainIdHex),
    ]),
) as BlastTokens;

const curentTopPoolsList: [keyof BlastTokens, keyof BlastTokens][] = [
    ['ETH', 'USDB'],
    ['ezETH', 'USDB'],
    ['BLAST', 'ETH'],
];

const topPools = curentTopPoolsList.map(
    ([tokenA, tokenB]) =>
        new TopPool(
            BLAST_TOKENS[tokenA],
            BLAST_TOKENS[tokenB],
            chainSpecFromSDK.poolIndex,
        ),
);

const getGasPriceInGwei = async (provider?: Provider) => {
    if (!provider) return 0;
    return (
        bigIntToFloat((await provider.getFeeData()).gasPrice || BigInt(0)) *
        1e-9
    );
};

export const blastMainnet: NetworkIF = {
    chainId: chainIdHex,
    chainSpec: chainSpecFromSDK,
    poolIndex: chainSpecFromSDK.poolIndex,
    gridSize: chainSpecFromSDK.gridSize,
    isTestnet: chainSpecFromSDK.isTestNet,
    GCGO_URL: GCGO_BLAST_URL,
    evmRpcUrl: PRIMARY_RPC_URL,
    fallbackRpcUrl: FALLBACK_RPC_URL,
    chainSpecForAppKit: chainSpecForAppKit,
    defaultPair: [BLAST_TOKENS.ETH, BLAST_TOKENS.USDB],
    blockExplorer: chainSpecForAppKit.blockExplorers?.default.url || '',
    displayName: chainSpecForAppKit.name,
    tokenPriceQueryAssetPlatform: 'blast',
    vaultsEnabled: false,
    tempestApiNetworkName: '',
    topPools,
    getGasPriceInGwei,
};
