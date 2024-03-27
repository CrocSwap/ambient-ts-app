import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import {
    scrollETH,
    scrollUSDC,
    // scrollDAI,
    scrollUSDT,
    scrollWBTC,
    scrollWstETH,
} from '../defaultTokens';
import { NetworkIF } from '../../types/NetworkIF';
import { TopPool } from './TopPool';
import { Provider } from '@ethersproject/providers';
import { GCGO_SCROLL_URL } from '../gcgo';
import { bigNumToFloat } from '@crocswap-libs/sdk';

export const SCROLL_RPC_URL =
    process.env.REACT_APP_SCROLL_RPC_URL !== undefined
        ? process.env.REACT_APP_SCROLL_RPC_URL
        : 'https://rpc.scroll.io/';

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
            http: [SCROLL_RPC_URL],
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
    evmRpcUrl: SCROLL_RPC_URL,
    wagmiChain,
    shouldPollBlock: true,
    marketData: '0x82750',
    defaultPair: [scrollETH, scrollUSDC],
    topPools: [
        new TopPool(scrollETH, scrollUSDC, lookupChain('0x82750').poolIndex),
        new TopPool(scrollUSDT, scrollUSDC, lookupChain('0x82750').poolIndex),
        new TopPool(scrollETH, scrollUSDT, lookupChain('0x82750').poolIndex),
        new TopPool(scrollETH, scrollWBTC, lookupChain('0x82750').poolIndex),
        new TopPool(scrollWstETH, scrollETH, lookupChain('0x82750').poolIndex),
    ],
    getGasPriceInGwei: async (provider?: Provider) => {
        if (!provider) return 0;
        return bigNumToFloat(await provider.getGasPrice()) * 1e-9;
    },
};
