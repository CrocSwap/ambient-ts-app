import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import {
    scrollSepoliaETH,
    scrollSepoliaUSDC,
    scrollSepoliaWBTC,
} from '../defaultTokens';
import { NetworkIF } from '../../types/NetworkIF';
import { TopPool } from './TopPool';
import { PublicClient } from 'viem';
import { scrollSepolia as wagmiChain } from 'viem/chains';
import { GCGO_TESTNET_URL } from '../gcgo';
import { bigIntToFloat } from '@crocswap-libs/sdk';

export const scrollSepolia: NetworkIF = {
    chainId: '0x8274f',
    graphCacheUrl: GCGO_TESTNET_URL,
    evmRpcUrl: 'https://sepolia-rpc.scroll.io/',
    wagmiChain,
    shouldPollBlock: true,
    marketData: '0x1',
    defaultPair: [scrollSepoliaETH, scrollSepoliaUSDC],
    topPools: [
        new TopPool(
            scrollSepoliaETH,
            scrollSepoliaUSDC,
            lookupChain('0x8274f').poolIndex,
        ),
        new TopPool(
            scrollSepoliaETH,
            scrollSepoliaWBTC,
            lookupChain('0xaa36a7').poolIndex,
        ),
        new TopPool(
            scrollSepoliaUSDC,
            scrollSepoliaWBTC,
            lookupChain('0xaa36a7').poolIndex,
        ),
    ],
    getGasPriceInGwei: async (publicClient?: PublicClient) => {
        if (!publicClient) return 0;
        return bigIntToFloat(await publicClient.getGasPrice()) * 1e-9;
    },
};
