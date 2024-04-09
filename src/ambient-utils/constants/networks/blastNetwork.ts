import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import {
    blastETH,
    blastUSDB,
    blastORBIT,
    blastEzETH,
    blastJUICE,
    blastYES,
} from '../defaultTokens';
import { NetworkIF } from '../../types/NetworkIF';
import { TopPool } from './TopPool';
import { PublicClient } from 'viem';
import { GCGO_BLAST_URL } from '../gcgo';
import { blast as wagmiChain } from 'wagmi/chains';
import { bigIntToFloat } from '@crocswap-libs/sdk';

export const BLAST_RPC_URL =
    process.env.REACT_APP_BLAST_RPC_URL !== undefined
        ? process.env.REACT_APP_BLAST_RPC_URL
        : 'https://rpc.blast.io/';

export const blast: NetworkIF = {
    chainId: '0x13e31',
    graphCacheUrl: GCGO_BLAST_URL,
    evmRpcUrl: BLAST_RPC_URL,
    wagmiChain,
    shouldPollBlock: true,
    marketData: '0x13e31',
    defaultPair: [blastETH, blastUSDB],
    topPools: [
        new TopPool(blastETH, blastUSDB, lookupChain('0x13e31').poolIndex),
        new TopPool(blastEzETH, blastETH, lookupChain('0x13e31').poolIndex),
        new TopPool(blastJUICE, blastETH, lookupChain('0x13e31').poolIndex),
        new TopPool(blastORBIT, blastETH, lookupChain('0x13e31').poolIndex),
        new TopPool(blastYES, blastETH, lookupChain('0x13e31').poolIndex),
    ],
    getGasPriceInGwei: async (publicClient?: PublicClient) => {
        if (!publicClient) return 0;
        return bigIntToFloat(await publicClient.getGasPrice()) * 1e-9;
    },
};
