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

export const PLUME_SEPOLIA_RPC_URL =
    import.meta.env.VITE_PLUME_SEPOLIA_RPC_URL !== undefined
        ? import.meta.env.VITE_PLUME_SEPOLIA_RPC_URL
        : 'https://test-rpc.plumenetwork.xyz';

const chain = {
    chainId: 98864,
    name: 'Plume Devnet',
    currency: 'ETH',
    rpcUrl: PLUME_SEPOLIA_RPC_URL,
    explorerUrl: 'https://test-explorer.plumenetwork.xyz/',
};

const chainSpec = lookupChain('0x18230');

export const plumeSepolia: NetworkIF = {
    chainId: '0x18230',
    graphCacheUrl: GCGO_TESTNET_URL,
    evmRpcUrl: PLUME_SEPOLIA_RPC_URL,
    chain: chain,
    marketData: '0x1',
    defaultPair: [plumeSepoliaETH, plumeSepoliaUSD],
    defaultPairFuta: [plumeSepoliaETH, plumeSepoliaUSD],
    poolIndex: chainSpec.poolIndex,
    gridSize: chainSpec.gridSize,
    blockExplorer: chainSpec.blockExplorer,
    displayName: chainSpec.displayName,
    topPools: [
        new TopPool(plumeSepoliaETH, plumeSepoliaUSD, chainSpec.poolIndex),
        new TopPool(plumeSepoliaUSD, plumeSepoliaNEV, chainSpec.poolIndex),
        new TopPool(plumeSepoliaETH, plumeSepoliaUSDT, chainSpec.poolIndex),
        new TopPool(plumeSepoliaUSD, plumeSepoliaUSDT, chainSpec.poolIndex),
        new TopPool(plumeSepoliaETH, plumeSepoliaNEV, chainSpec.poolIndex),
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
