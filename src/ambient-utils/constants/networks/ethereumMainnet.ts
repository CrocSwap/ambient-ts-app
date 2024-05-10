import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import {
    mainnetETH,
    mainnetUSDC,
    mainnetWBTC,
    mainnetSYN,
    mainnetMKR,
    mainnetRPL,
} from '../defaultTokens';
import { NetworkIF } from '../../types/NetworkIF';
import { TopPool } from './TopPool';
import { GCGO_ETHEREUM_URL } from '../gcgo';
import { Provider } from '@ethersproject/providers';
import { bigNumToFloat } from '@crocswap-libs/sdk';

const PROVIDER_KEY =
    import.meta.env.NODE_ENV === 'test'
        ? import.meta.env.PROVIDER_KEY
        : import.meta.env.VITE_INFURA_KEY;

const chain = {
    chainId: 1,
    name: 'Ethereum',
    network: 'homestead',
    nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ['https://mainnet.infura.io/v3/' + PROVIDER_KEY],
        },
        public: {
            http: ['https://mainnet.infura.io/v3/' + PROVIDER_KEY],
        },
    },
    blockExplorers: {
        default: {
            name: 'Etherscan',
            url: 'https://etherscan.io',
        },
    },
    testnet: false,
};

export const ethereumMainnet: NetworkIF = {
    chainId: '0x1',
    graphCacheUrl: GCGO_ETHEREUM_URL,
    evmRpcUrl: 'https://mainnet.infura.io/v3/' + PROVIDER_KEY,
    chain: chain,
    shouldPollBlock: false,
    marketData: '0x1',
    defaultPair: [mainnetETH, mainnetUSDC],
    topPools: [
        new TopPool(mainnetETH, mainnetWBTC, lookupChain('0x1').poolIndex),
        new TopPool(mainnetETH, mainnetUSDC, lookupChain('0x1').poolIndex),
        new TopPool(mainnetSYN, mainnetETH, lookupChain('0x1').poolIndex),
        new TopPool(mainnetETH, mainnetRPL, lookupChain('0x1').poolIndex),
        new TopPool(mainnetMKR, mainnetETH, lookupChain('0x1').poolIndex),
    ],
    getGasPriceInGwei: async (provider?: Provider) => {
        if (!provider) return 0;
        return bigNumToFloat(await provider.getGasPrice()) * 1e-9;
    },
};
