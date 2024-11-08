import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import {
    plumeSepoliaETH,
    plumeSepoliaUSD,
    plumeSepoliaNEV,
    plumeSepoliaUSDT,
} from '../defaultTokens';
import { NetworkIF } from '../../types/NetworkIF';
import { TopPool } from './TopPool';
import { Provider } from 'ethers';
import { GCGO_TESTNET_URL } from '../gcgo';
import { bigIntToFloat } from '@crocswap-libs/sdk';

const chain = {
    chainId: 98864,
    name: 'Plume Devnet',
    currency: 'ETH',
    rpcUrl: 'https://test-rpc.plumenetwork.xyz',
    explorerUrl: 'https://test-explorer.plumenetwork.xyz/',
};

export const plumeSepolia: NetworkIF = {
    chainId: '0x18230',
    graphCacheUrl: GCGO_TESTNET_URL,
    evmRpcUrl: 'https://testnet-rpc.plumenetwork.xyz/http/',
    chain: chain,
    shouldPollBlock: true,
    marketData: '0x1',
    defaultPair: [plumeSepoliaETH, plumeSepoliaUSD],
    topPools: [
        new TopPool(
            plumeSepoliaETH,
            plumeSepoliaUSD,
            lookupChain('0x18230').poolIndex,
        ),
        new TopPool(
            plumeSepoliaUSD,
            plumeSepoliaNEV,
            lookupChain('0x18230').poolIndex,
        ),
        new TopPool(
            plumeSepoliaETH,
            plumeSepoliaUSDT,
            lookupChain('0x18230').poolIndex,
        ),
        new TopPool(
            plumeSepoliaUSD,
            plumeSepoliaUSDT,
            lookupChain('0x18230').poolIndex,
        ),
        new TopPool(
            plumeSepoliaETH,
            plumeSepoliaNEV,
            lookupChain('0x18230').poolIndex,
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
