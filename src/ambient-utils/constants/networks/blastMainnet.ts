import { bigIntToFloat } from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { Provider } from 'ethers';
import { TokenIF } from '../../types';
import { NetworkIF } from '../../types/NetworkIF';
import ambientTokenList from '../ambient-token-list.json';
import { GCGO_BLAST_URL } from '../gcgo';
import { TopPool } from './TopPool';

const PUBLIC_RPC_URL = 'https://blast-rpc.publicnode.com';
const SECONDARY_PUBLIC_RPC_URL = 'https://rpc.blast.io';

const RESTRICTED_RPC_URL =
    import.meta.env.VITE_BLAST_RPC_URL !== undefined
        ? import.meta.env.VITE_BLAST_RPC_URL
        : undefined;

const PRIMARY_RPC_URL = RESTRICTED_RPC_URL
    ? RESTRICTED_RPC_URL
    : PUBLIC_RPC_URL;

const FALLBACK_RPC_URL =
    PRIMARY_RPC_URL === PUBLIC_RPC_URL
        ? SECONDARY_PUBLIC_RPC_URL
        : PUBLIC_RPC_URL;

const chainIdHex = '0x13e31';
const chainSpecFromSDK = lookupChain(chainIdHex);

const chainSpecForWalletConnector = {
    chainId: Number(chainIdHex),
    name: 'Blast',
    currency: 'ETH',
    rpcUrl: PUBLIC_RPC_URL,
    explorerUrl: 'https://blastscan.io/',
};

const findTokenByAddress = (address: string): TokenIF =>
    ambientTokenList.tokens.find(
        (token) =>
            token.address.toLowerCase() === address.toLowerCase() &&
            token.chainId === Number(chainIdHex),
    ) as TokenIF;

const defaultTokenEntries = [
    ['ETH', '0x0000000000000000000000000000000000000000'],
    ['USDB', '0x4300000000000000000000000000000000000003'],
    ['ezETH', '0x2416092f143378750bb29b79eD961ab195CcEea5'],
    ['BLAST', '0xb1a5700fA2358173Fe465e6eA4Ff52E36e88E2ad'],
    ['USDPLUS', '0x4fee793d435c6d2c10c135983bb9d6d4fc7b9bbd'],
    ['wrsETH', '0xe7903B1F75C534Dd8159b313d92cDCfbC62cB3Cd'],
    ['weETH', '0x04C0599Ae5A44757c0af6F9eC3b93da8976c150A'],
] as const;

type BlastTokens = {
    [Key in (typeof defaultTokenEntries)[number][0]]: TokenIF;
};

export const BLAST_TOKENS: BlastTokens = Object.fromEntries(
    defaultTokenEntries.map(([key, address]) => [
        key,
        findTokenByAddress(address),
    ]),
) as BlastTokens;

export const blastMainnet: NetworkIF = {
    chainId: chainIdHex,
    chainSpec: chainSpecFromSDK,
    poolIndex: chainSpecFromSDK.poolIndex,
    gridSize: chainSpecFromSDK.gridSize,
    GCGO_URL: GCGO_BLAST_URL,
    evmRpcUrl: PRIMARY_RPC_URL,
    fallbackRpcUrl: FALLBACK_RPC_URL,
    chainSpecForWalletConnector: chainSpecForWalletConnector,
    defaultPair: [BLAST_TOKENS.ETH, BLAST_TOKENS.USDB],
    blockExplorer: chainSpecForWalletConnector.explorerUrl,
    displayName: chainSpecForWalletConnector.name,
    tokenPriceQueryAssetPlatform: 'blast',
    vaultsEnabled: false,
    tempestApiNetworkName: '',
    topPools: [
        new TopPool(
            BLAST_TOKENS.ETH,
            BLAST_TOKENS.USDB,
            chainSpecFromSDK.poolIndex,
        ),
        new TopPool(
            BLAST_TOKENS.ezETH,
            BLAST_TOKENS.USDB,
            chainSpecFromSDK.poolIndex,
        ),
        new TopPool(
            BLAST_TOKENS.BLAST,
            BLAST_TOKENS.ETH,
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
