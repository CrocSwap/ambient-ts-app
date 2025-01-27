import { bigIntToFloat } from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { Provider } from 'ethers';
import { NetworkIF } from '../../types/NetworkIF';
import { blastBLAST, blastETH, blastEzETH, blastUSDB } from '../defaultTokens';
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
