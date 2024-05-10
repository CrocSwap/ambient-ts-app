import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import {
    blastETH,
    blastUSDB,
    blastORBIT,
    blastEzETH,
    blastWrsETH,
    blastYES,
} from '../defaultTokens';
import { NetworkIF } from '../../types/NetworkIF';
import { TopPool } from './TopPool';
import { Provider } from '@ethersproject/providers';
import { GCGO_BLAST_URL } from '../gcgo';
import { bigNumToFloat } from '@crocswap-libs/sdk';

export const BLAST_RPC_URL =
    import.meta.env.VITE_BLAST_RPC_URL !== undefined
        ? import.meta.env.VITE_BLAST_RPC_URL
        : 'https://rpc.blast.io/';

const chain = {
    chainId: 81457,
    name: 'Blast',
    network: 'blast',
    nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: [BLAST_RPC_URL],
        },
        public: {
            http: [BLAST_RPC_URL],
        },
    },
    blockExplorers: {
        default: {
            name: 'Blastscan',
            url: 'https://blastscan.io',
        },
    },
    testnet: false,
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
        new TopPool(blastEzETH, blastETH, lookupChain('0x13e31').poolIndex),
        new TopPool(blastORBIT, blastETH, lookupChain('0x13e31').poolIndex),
        new TopPool(blastWrsETH, blastETH, lookupChain('0x13e31').poolIndex),
        new TopPool(blastETH, blastYES, lookupChain('0x13e31').poolIndex),
    ],
    getGasPriceInGwei: async (provider?: Provider) => {
        if (!provider) return 0;
        return bigNumToFloat(await provider.getGasPrice()) * 1e-9;
    },
};
