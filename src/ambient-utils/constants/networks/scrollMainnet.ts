import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import {
    scrollETH,
    scrollSTONE,
    scrollUSDC,
    scrollUSDT,
    scrollWBTC,
    scrollWeETH,
} from '../defaultTokens';
import { NetworkIF } from '../../types/NetworkIF';
import { TopPool } from './TopPool';
import { Provider } from 'ethers';
import { GCGO_SCROLL_URL } from '../gcgo';
import { bigIntToFloat } from '@crocswap-libs/sdk';

export const SCROLL_RPC_URL =
    import.meta.env.VITE_SCROLL_RPC_URL !== undefined
        ? import.meta.env.VITE_SCROLL_RPC_URL
        : 'https://rpc.scroll.io/';

const chain = {
    chainId: 534352,
    name: 'Scroll',
    currency: 'ETH',
    rpcUrl: 'https://rpc.scroll.io/',
    explorerUrl: 'https://scrollscan.com',
};

export const scrollMainnet: NetworkIF = {
    chainId: '0x82750',
    graphCacheUrl: GCGO_SCROLL_URL,
    evmRpcUrl: SCROLL_RPC_URL,
    chain: chain,
    shouldPollBlock: true,
    marketData: '0x82750',
    defaultPair: [scrollETH, scrollUSDC],
    topPools: [
        new TopPool(scrollETH, scrollUSDC, lookupChain('0x82750').poolIndex),
        new TopPool(scrollETH, scrollUSDT, lookupChain('0x82750').poolIndex),
        new TopPool(scrollETH, scrollWeETH, lookupChain('0x82750').poolIndex),
        new TopPool(scrollETH, scrollWBTC, lookupChain('0x82750').poolIndex),
        new TopPool(scrollETH, scrollSTONE, lookupChain('0x82750').poolIndex),
    ],
    getGasPriceInGwei: async (provider?: Provider) => {
        if (!provider) return 0;
        return (
            bigIntToFloat((await provider.getFeeData()).gasPrice || BigInt(0)) *
            1e-9
        );
    },
};
