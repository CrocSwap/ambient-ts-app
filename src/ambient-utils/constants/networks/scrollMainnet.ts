import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import {
    scrollETH,
    scrollScroll,
    scrollUSDC,
    scrollUSDT,
    scrollWBTC,
    scrollWrsETH,
} from '../defaultTokens';
import { NetworkIF } from '../../types/NetworkIF';
import { TopPool } from './TopPool';
import { Provider } from 'ethers';
import { GCGO_SCROLL_URL } from '../gcgo';
import { bigIntToFloat } from '@crocswap-libs/sdk';

export const SCROLL_RPC_URL =
    import.meta.env.VITE_SCROLL_RPC_URL !== undefined
        ? import.meta.env.VITE_SCROLL_RPC_URL
        : 'https://rpc.scroll.io';

const chain = {
    chainId: 534352,
    name: 'Scroll',
    currency: 'ETH',
    rpcUrl: 'https://rpc.scroll.io/',
    explorerUrl: 'https://scrollscan.com',
};

const chainSpec = lookupChain('0x82750');

export const scrollMainnet: NetworkIF = {
    chainId: '0x82750',
    graphCacheUrl: GCGO_SCROLL_URL,
    evmRpcUrl: SCROLL_RPC_URL,
    chain: chain,
    marketData: '0x82750',
    defaultPair: [scrollETH, scrollUSDC],
    poolIndex: chainSpec.poolIndex,
    gridSize: chainSpec.gridSize,
    blockExplorer: chainSpec.blockExplorer,
    displayName: chainSpec.displayName,
    topPools: [
        new TopPool(scrollETH, scrollUSDC, chainSpec.poolIndex),
        new TopPool(scrollScroll, scrollETH, chainSpec.poolIndex),
        new TopPool(scrollETH, scrollWBTC, chainSpec.poolIndex),
        new TopPool(scrollETH, scrollUSDT, chainSpec.poolIndex),
        new TopPool(scrollWrsETH, scrollETH, chainSpec.poolIndex),
    ],
    chainSpec: chainSpec,
    getGasPriceInGwei: async (provider?: Provider) => {
        if (!provider) return 0;
        return (
            bigIntToFloat((await provider.getFeeData()).gasPrice || BigInt(0)) *
            1e-9
        );
    },
};
