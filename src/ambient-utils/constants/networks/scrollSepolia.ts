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
    chainId: 534351,
    name: 'Scroll Sepolia',
    currency: 'ETH',
    rpcUrl: 'https://sepolia-rpc.scroll.io/',
    explorerUrl: 'https://sepolia.scrollscan.dev',
};

export const scrollSepolia: NetworkIF = {
    chainId: '0x8274f',
    graphCacheUrl: GCGO_TESTNET_URL,
    evmRpcUrl: 'https://sepolia-rpc.scroll.io/',
    chain: chain,
    shouldPollBlock: true,
    marketData: '0x1',
    defaultPair: [scrollSepoliaETH, scrollSepoliaUSDC],
    defaultPairFuta: [scrollSepoliaETH, scrollSepoliaUSDC],
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
    getGasPriceInGwei: async (provider?: Provider) => {
        if (!provider) return 0;
        return (
            bigIntToFloat((await provider.getFeeData()).gasPrice || BigInt(0)) *
            1e-9
        );
    },
};
