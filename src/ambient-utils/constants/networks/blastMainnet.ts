import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import {
    blastETH,
    blastUSDB,
    blastBLAST,
    blastEzETH,
    blastUSDPLUS,
} from '../defaultTokens';
import { NetworkIF } from '../../types/NetworkIF';
import { TopPool } from './TopPool';
import { Provider } from 'ethers';
import { GCGO_BLAST_URL } from '../gcgo';
import { bigIntToFloat } from '@crocswap-libs/sdk';

export const BLAST_RPC_URL =
    import.meta.env.VITE_BLAST_RPC_URL !== undefined
        ? import.meta.env.VITE_BLAST_RPC_URL
        : 'https://rpc.blast.io';

const chainIdHex = '0x13e31';
const chainSpecFromSDK = lookupChain(chainIdHex);

const chainSpecForWalletConnector = {
    chainId: Number(chainIdHex),
    name: 'Blast',
    currency: 'ETH',
    rpcUrl: BLAST_RPC_URL,
    explorerUrl: 'https://blastscan.io',
};

export const blast: NetworkIF = {
    chainId: chainIdHex,
    chainSpec: chainSpecFromSDK,
    poolIndex: chainSpecFromSDK.poolIndex,
    gridSize: chainSpecFromSDK.gridSize,
    graphCacheUrl: GCGO_BLAST_URL,
    evmRpcUrl: BLAST_RPC_URL,
    chainSpecForWalletConnector: chainSpecForWalletConnector,
    defaultPair: [blastETH, blastUSDB],
    blockExplorer: chainSpecForWalletConnector.explorerUrl,
    displayName: chainSpecForWalletConnector.name,
    topPools: [
        new TopPool(blastETH, blastUSDB, chainSpecFromSDK.poolIndex),
        new TopPool(blastEzETH, blastETH, chainSpecFromSDK.poolIndex),
        new TopPool(blastBLAST, blastETH, chainSpecFromSDK.poolIndex),
        new TopPool(blastUSDPLUS, blastUSDB, chainSpecFromSDK.poolIndex),
    ],
    getGasPriceInGwei: async (provider?: Provider) => {
        if (!provider) return 0;
        return (
            bigIntToFloat((await provider.getFeeData()).gasPrice || BigInt(0)) *
            1e-9
        );
    },
};
