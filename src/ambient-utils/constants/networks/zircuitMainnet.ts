import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { scrollETH, scrollUSDC } from '../defaultTokens';
import { NetworkIF } from '../../types/NetworkIF';
import { TopPool } from './TopPool';
import { Provider } from 'ethers';
import { GCGO_SCROLL_URL } from '../gcgo';
import { bigIntToFloat } from '@crocswap-libs/sdk';

export const ZIRCUIT_RPC_URL =
    import.meta.env.VITE_ZIRCUIT_RPC_URL !== undefined
        ? import.meta.env.VITE_ZIRCUIT_RPC_URL
        : 'https://zircuit1-mainnet.p2pify.com/';

const chain = {
    chainId: 48900,
    name: 'Zircuit',
    currency: 'ETH',
    rpcUrl: 'https://zircuit1-mainnet.p2pify.com/',
    explorerUrl: 'https://explorermainnet.zircuit.com',
};

export const zircuitMainnet: NetworkIF = {
    chainId: '0xbf04',
    graphCacheUrl: GCGO_SCROLL_URL,
    evmRpcUrl: ZIRCUIT_RPC_URL,
    chain: chain,
    shouldPollBlock: true,
    marketData: '0xbf04',
    defaultPair: [scrollETH, scrollUSDC],
    topPools: [
        new TopPool(scrollETH, scrollUSDC, lookupChain('0x82750').poolIndex),
    ],
    getGasPriceInGwei: async (provider?: Provider) => {
        if (!provider) return 0;
        return (
            bigIntToFloat((await provider.getFeeData()).gasPrice || BigInt(0)) *
            1e-9
        );
    },
};
