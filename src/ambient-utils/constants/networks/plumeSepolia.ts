import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import {
    plumeSepoliaDAI,
    plumeSepoliaETH,
    plumeSepoliaP,
    plumeSepoliaUSD,
    plumeSepoliaUSDC,
    plumeSepoliaUSDT,
} from '../defaultTokens';
import { NetworkIF } from '../../types/NetworkIF';
import { TopPool } from './TopPool';
import { Provider } from '@ethersproject/providers';
import { GCGO_TESTNET_URL } from '../gcgo';
import { bigNumToFloat } from '@crocswap-libs/sdk';

const chain = {
    chainId: 161221135,
    name: 'Plume Sepolia',
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
    defaultPair: [plumeSepoliaETH, plumeSepoliaP],
    topPools: [
        new TopPool(
            plumeSepoliaETH,
            plumeSepoliaP,
            lookupChain('0x99c0a0f').poolIndex,
        ),
        new TopPool(
            plumeSepoliaETH,
            plumeSepoliaUSD,
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
        return bigNumToFloat(await provider.getGasPrice()) * 1e-9;
    },
};
