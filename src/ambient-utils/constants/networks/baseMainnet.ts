import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { scrollETH, scrollUSDC } from '../defaultTokens';
import { NetworkIF } from '../../types/NetworkIF';
import { TopPool } from './TopPool';
import { Provider } from 'ethers';
import { GCGO_SCROLL_URL } from '../gcgo';
import { bigIntToFloat } from '@crocswap-libs/sdk';

export const BASE_RPC_URL =
    import.meta.env.VITE_BASE_RPC_URL !== undefined
        ? import.meta.env.VITE_BASE_RPC_URL
        : 'https://mainnet.base.org';

const chain = {
    chainId: 8453,
    name: 'Base',
    currency: 'ETH',
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
};

export const baseMainnet: NetworkIF = {
    chainId: '0x2105',
    graphCacheUrl: GCGO_SCROLL_URL,
    evmRpcUrl: BASE_RPC_URL,
    chain: chain,
    shouldPollBlock: true,
    marketData: '0x2105',
    defaultPair: [scrollETH, scrollUSDC],
    topPools: [
        new TopPool(scrollETH, scrollUSDC, lookupChain('0x2105').poolIndex),
    ],
    getGasPriceInGwei: async (provider?: Provider) => {
        if (!provider) return 0;
        return (
            bigIntToFloat((await provider.getFeeData()).gasPrice || BigInt(0)) *
            1e-9
        );
    },
};
