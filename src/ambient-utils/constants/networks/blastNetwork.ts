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
import { Provider } from '@ethersproject/providers';
import { GCGO_BLAST_URL } from '../gcgo';
import { Chain } from 'wagmi';
import { bigNumToFloat } from '@crocswap-libs/sdk';

export const BLAST_RPC_URL =
    process.env.REACT_APP_BLAST_RPC_URL !== undefined
        ? process.env.REACT_APP_BLAST_RPC_URL
        : 'https://rpc.blast.io/';

const wagmiChain = {
    id: 81457,
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
} as const satisfies Chain;

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
        new TopPool(blastORBIT, blastETH, lookupChain('0x13e31').poolIndex),
        new TopPool(blastJUICE, blastETH, lookupChain('0x13e31').poolIndex),
        new TopPool(blastYES, blastETH, lookupChain('0x13e31').poolIndex),
    ],
    getGasPriceInGwei: async (provider?: Provider) => {
        if (!provider) return 0;
        return bigNumToFloat(await provider.getGasPrice()) * 1e-9;
    },
};
