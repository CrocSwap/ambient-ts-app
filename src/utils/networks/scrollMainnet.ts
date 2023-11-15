import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import {
    scrollETH,
    scrollUSDC,
    // scrollUSDT,
    // scrollWBTC,
} from '../data/defaultTokens';
import { TopPool } from '../data/defaultTopPools';
import { NetworkIF } from '../interfaces/NetworkIF';
import { Provider } from '@ethersproject/providers';
import { GCGO_SCROLL_URL } from '../../constants';

const wagmiChain = {
    id: 534352,
    name: 'Scroll',
    network: 'scroll',
    nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ['https://rpc.scroll.io/'],
        },
        public: {
            http: ['https://rpc.scroll.io/'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Scrollscan',
            url: 'https://scrollscan.com',
        },
    },
    testnet: false,
};

export const scrollMainnet: NetworkIF = {
    chainId: '0x82750',
    graphCacheUrl: GCGO_SCROLL_URL,
    wagmiChain,
    shouldPollBlock: true,
    marketData: '0x82750',
    defaultPair: [scrollETH, scrollUSDC],
    topPools: [
        new TopPool(scrollETH, scrollUSDC, lookupChain('0x82750').poolIndex),
        // new TopPool(scrollETH, scrollUSDT, lookupChain('0x82750').poolIndex),
        // new TopPool(scrollETH, scrollWBTC, lookupChain('0x82750').poolIndex),
        // new TopPool(scrollUSDT, scrollUSDC, lookupChain('0x82750').poolIndex),
    ],
    getGasPriceInGwei: async (provider?: Provider) => {
        if (!provider) return 0;
        return (await provider.getGasPrice()).toNumber() * 1e-9;
    },
};
