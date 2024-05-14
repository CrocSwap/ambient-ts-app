import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { blastSepoliaETH, blastSepoliaUSDB } from '../defaultTokens';
import { NetworkIF } from '../../types/NetworkIF';
import { TopPool } from './TopPool';
import { Provider } from '@ethersproject/providers';
import { GCGO_TESTNET_URL } from '../gcgo';
import { bigNumToFloat } from '@crocswap-libs/sdk';

const chain = {
    chainId: 168587773,
    name: 'Blast Sepolia',
    network: 'blast-sepolia',
    nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ['https://sepolia.blast.io/'],
        },
        public: {
            http: ['https://sepolia.blast.io/'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Blastscan',
            url: 'https://testnet.blastscan.io',
        },
    },
    testnet: true,
};

export const blastSepolia: NetworkIF = {
    chainId: '0xa0c71fd',
    graphCacheUrl: GCGO_TESTNET_URL,
    evmRpcUrl: 'https://sepolia.blast.io/',
    chain: chain,
    shouldPollBlock: true,
    marketData: '0x1',
    defaultPair: [blastSepoliaETH, blastSepoliaUSDB],
    topPools: [
        new TopPool(
            blastSepoliaETH,
            blastSepoliaUSDB,
            lookupChain('0xa0c71fd').poolIndex,
        ),
    ],
    getGasPriceInGwei: async (provider?: Provider) => {
        if (!provider) return 0;
        return bigNumToFloat(await provider.getGasPrice()) * 1e-9;
    },
};
