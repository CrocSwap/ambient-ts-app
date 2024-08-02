import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import {
    plumeSepoliaDAI,
    plumeSepoliaETH,
    plumeSepoliaGoonUSD,
    plumeSepoliaGoon,
    plumeSepoliaUSDC,
    plumeSepoliaUSDT,
} from '../defaultTokens';
import { NetworkIF } from '../../types/NetworkIF';
import { TopPool } from './TopPool';
import { Provider } from 'ethers';
import { GCGO_TESTNET_URL } from '../gcgo';
import { bigIntToFloat } from '@crocswap-libs/sdk';

const chain = {
    chainId: 161221135,
    name: 'Plume Testnet',
    currency: 'ETH',
    rpcUrl: 'https://testnet-rpc.plumenetwork.xyz/http/',
    explorerUrl: 'https://testnet-explorer.plumenetwork.xyz',
};

export const plumeSepolia: NetworkIF = {
    chainId: '0x99c0a0f',
    graphCacheUrl: GCGO_TESTNET_URL,
    evmRpcUrl: 'https://testnet-rpc.plumenetwork.xyz/http/',
    chain: chain,
    shouldPollBlock: true,
    marketData: '0x1',
    defaultPair: [plumeSepoliaGoon, plumeSepoliaGoonUSD],
    topPools: [
        new TopPool(
            plumeSepoliaETH,
            plumeSepoliaGoon,
            lookupChain('0x99c0a0f').poolIndex,
        ),
        new TopPool(
            plumeSepoliaETH,
            plumeSepoliaGoonUSD,
            lookupChain('0x99c0a0f').poolIndex,
        ),
        new TopPool(
            plumeSepoliaETH,
            plumeSepoliaUSDC,
            lookupChain('0x99c0a0f').poolIndex,
        ),
        new TopPool(
            plumeSepoliaETH,
            plumeSepoliaUSDT,
            lookupChain('0x99c0a0f').poolIndex,
        ),
        new TopPool(
            plumeSepoliaETH,
            plumeSepoliaDAI,
            lookupChain('0x99c0a0f').poolIndex,
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
