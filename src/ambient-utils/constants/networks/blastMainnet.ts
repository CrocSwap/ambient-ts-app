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

export const blastETH: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0x0000000000000000000000000000000000000000' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const blastUSDB: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0x4300000000000000000000000000000000000003' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const blastEzETH: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0x2416092f143378750bb29b79eD961ab195CcEea5' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const blastBLAST: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0xb1a5700fA2358173Fe465e6eA4Ff52E36e88E2ad' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const blastUSDPLUS: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0x4fee793d435c6d2c10c135983bb9d6d4fc7b9bbd' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const blastWrsETH: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0xe7903B1F75C534Dd8159b313d92cDCfbC62cB3Cd' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const blastWEETH: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0x04C0599Ae5A44757c0af6F9eC3b93da8976c150A' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const blastMainnet: NetworkIF = {
    chainId: chainIdHex,
    chainSpec: chainSpecFromSDK,
    poolIndex: chainSpecFromSDK.poolIndex,
    gridSize: chainSpecFromSDK.gridSize,
    GCGO_URL: GCGO_BLAST_URL,
    evmRpcUrl: PRIMARY_RPC_URL,
    fallbackRpcUrl: FALLBACK_RPC_URL,
    chainSpecForWalletConnector: chainSpecForWalletConnector,
    defaultPair: [blastETH, blastUSDB],
    blockExplorer: chainSpecForWalletConnector.explorerUrl,
    displayName: chainSpecForWalletConnector.name,
    tokenPriceQueryAssetPlatform: 'blast',
    vaultsEnabled: false,
    tempestApiNetworkName: '',
    topPools: [
        new TopPool(blastETH, blastUSDB, chainSpecFromSDK.poolIndex),
        new TopPool(blastEzETH, blastUSDB, chainSpecFromSDK.poolIndex),
        new TopPool(blastBLAST, blastETH, chainSpecFromSDK.poolIndex),
    ],
    getGasPriceInGwei: async (provider?: Provider) => {
        if (!provider) return 0;
        return (
            bigIntToFloat((await provider.getFeeData()).gasPrice || BigInt(0)) *
            1e-9
        );
    },
};
