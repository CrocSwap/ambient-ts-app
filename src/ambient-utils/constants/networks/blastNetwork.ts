import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { blastETH, blastUSDB } from '../defaultTokens';
import { NetworkIF } from '../../types/NetworkIF';
import { TopPool } from './TopPool';
import { Provider } from '@ethersproject/providers';
import { GCGO_BLAST_URL } from '../gcgo';
import { Chain } from 'wagmi';

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
            http: ['https://rpc.ankr.com/blast/'],
        },
        public: {
            http: ['https://rpc.ankr.com/blast/'],
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
    evmRpcUrl: 'https://rpc.ankr.com/blast/',
    wagmiChain,
    shouldPollBlock: true,
    marketData: '0x13e31',
    defaultPair: [blastETH, blastUSDB],
    topPools: [
        new TopPool(blastETH, blastUSDB, lookupChain('0x13e31').poolIndex),
    ],
    getGasPriceInGwei: async (provider?: Provider) => {
        if (!provider) return 0;
        return (await provider.getGasPrice()).toNumber() * 1e-9;
    },
};
