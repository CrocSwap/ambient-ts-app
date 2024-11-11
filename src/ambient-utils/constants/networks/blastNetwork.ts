import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { blastETH, blastUSDB, blastBLAST, blastEzETH } from '../defaultTokens';
import { NetworkIF } from '../../types/NetworkIF';
import { TopPool } from './TopPool';
import { Provider } from 'ethers';
import { GCGO_BLAST_URL } from '../gcgo';
import { bigIntToFloat } from '@crocswap-libs/sdk';

export const BLAST_RPC_URL =
    import.meta.env.VITE_BLAST_RPC_URL !== undefined
        ? import.meta.env.VITE_BLAST_RPC_URL
        : 'https://rpc.blast.io';

const chain = {
    chainId: 81457,
    name: 'Blast',
    currency: 'ETH',
    rpcUrl: BLAST_RPC_URL,
    explorerUrl: 'https://blastscan.io',
};

const chainSpec = lookupChain('0x13e31');

export const blast: NetworkIF = {
    chainId: '0x13e31',
    graphCacheUrl: GCGO_BLAST_URL,
    evmRpcUrl: BLAST_RPC_URL,
    chain: chain,
    marketData: '0x13e31',
    defaultPair: [blastETH, blastUSDB],
    poolIndex: chainSpec.poolIndex,
    gridSize: chainSpec.gridSize,
    blockExplorer: chainSpec.blockExplorer,
    displayName: chainSpec.displayName,
    topPools: [
        new TopPool(blastETH, blastUSDB, chainSpec.poolIndex),
        new TopPool(blastBLAST, blastETH, chainSpec.poolIndex),
        new TopPool(blastEzETH, blastUSDB, chainSpec.poolIndex),
    ],
    chainSpec: chainSpec,
    getGasPriceInGwei: async (provider?: Provider) => {
        if (!provider) return 0;
        return (
            bigIntToFloat((await provider.getFeeData()).gasPrice || BigInt(0)) *
            1e-9
        );
    },
};
