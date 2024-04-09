import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import {
    scrollETH,
    scrollUSDC,
    // scrollDAI,
    scrollUSDT,
    scrollWBTC,
    scrollWrsETH,
} from '../defaultTokens';
import { NetworkIF } from '../../types/NetworkIF';
import { TopPool } from './TopPool';
import { PublicClient } from 'viem';
import { GCGO_SCROLL_URL } from '../gcgo';
import { scroll as wagmiChain } from 'viem/chains';
import { bigIntToFloat } from '@crocswap-libs/sdk';

export const SCROLL_RPC_URL =
    process.env.REACT_APP_SCROLL_RPC_URL !== undefined
        ? process.env.REACT_APP_SCROLL_RPC_URL
        : 'https://rpc.scroll.io/';

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
        new TopPool(scrollETH, scrollUSDT, lookupChain('0x82750').poolIndex),
        new TopPool(scrollUSDT, scrollUSDC, lookupChain('0x82750').poolIndex),
        new TopPool(scrollETH, scrollWBTC, lookupChain('0x82750').poolIndex),
        new TopPool(scrollWrsETH, scrollETH, lookupChain('0x82750').poolIndex),
    ],
    getGasPriceInGwei: async (publicCLient?: PublicClient) => {
        if (!publicCLient) return 0;
        return bigIntToFloat(await publicCLient.getGasPrice()) * 1e-9;
    },
};
