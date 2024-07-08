import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import {
    scrollSepoliaETH,
    scrollSepoliaUSDC,
    scrollSepoliaWBTC,
} from '../defaultTokens';
import { NetworkIF } from '../../types/NetworkIF';
import { TopPool } from './TopPool';
import { Provider } from 'ethers';
import { GCGO_TESTNET_URL } from '../gcgo';
import { bigIntToFloat } from '@crocswap-libs/sdk';

const chain = {
    chainId: 84532,
    name: 'Base Sepolia',
    currency: 'ETH',
    rpcUrl: 'https://sepolia.base.org/',
    explorerUrl: 'https://sepolia.basescan.org',
};

export const baseSepolia: NetworkIF = {
    chainId: '0x14a34',
    graphCacheUrl: GCGO_TESTNET_URL,
    evmRpcUrl: 'https://sepolia.base.org/',
    chain: chain,
    shouldPollBlock: true,
    marketData: '0x1',
    defaultPair: [scrollSepoliaETH, scrollSepoliaUSDC],
    topPools: [
        new TopPool(
            scrollSepoliaETH,
            scrollSepoliaUSDC,
            lookupChain('0x14a34').poolIndex,
        ),
        new TopPool(
            scrollSepoliaETH,
            scrollSepoliaWBTC,
            lookupChain('0x14a34').poolIndex,
        ),
        new TopPool(
            scrollSepoliaUSDC,
            scrollSepoliaWBTC,
            lookupChain('0x14a34').poolIndex,
        ),
    ],
    getGasPriceInGwei: async (provider?: Provider) => {
        if (!provider) return 0;
        return (
            bigIntToFloat((await provider.getFeeData()).gasPrice || BigInt(0)) *
            1e-9
        );
    },
};
