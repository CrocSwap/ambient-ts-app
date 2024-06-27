import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { blastETH, blastUSDB, blastEzETH, blastBLAST } from '../defaultTokens';
import { NetworkIF } from '../../types/NetworkIF';
import { TopPool } from './TopPool';
import { Provider } from 'ethers';
import { GCGO_BLAST_URL } from '../gcgo';
import { bigIntToFloat } from '@crocswap-libs/sdk';

export const BLAST_RPC_URL =
    import.meta.env.VITE_BLAST_RPC_URL !== undefined
        ? import.meta.env.VITE_BLAST_RPC_URL
        : 'https://rpc.blast.io/';

const chain = {
    chainId: 81457,
    name: 'Blast',
    currency: 'ETH',
    rpcUrl: 'https://rpc.blast.io/',
    explorerUrl: 'https://blastscan.io',
};

export const blast: NetworkIF = {
    chainId: '0x13e31',
    graphCacheUrl: GCGO_BLAST_URL,
    evmRpcUrl: BLAST_RPC_URL,
    chain: chain,
    shouldPollBlock: true,
    marketData: '0x13e31',
    defaultPair: [blastETH, blastUSDB],
    topPools: [
        new TopPool(blastETH, blastUSDB, lookupChain('0x13e31').poolIndex),
        new TopPool(blastETH, blastBLAST, lookupChain('0x13e31').poolIndex),
        new TopPool(blastEzETH, blastETH, lookupChain('0x13e31').poolIndex),
    ],
    getGasPriceInGwei: async (provider?: Provider) => {
        if (!provider) return 0;
        return (
            bigIntToFloat((await provider.getFeeData()).gasPrice || BigInt(0)) *
            1e-9
        );
    },
};
