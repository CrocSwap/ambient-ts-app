import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import {
    plumeSepoliaETH,
    plumeSepoliaUSD,
    plumeSepoliaNEV,
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

const chainIdHex = '0x18230';
const chainSpecFromSDK = lookupChain(chainIdHex);

const chainSpecForWalletConnector = {
    chainId: Number(chainIdHex),
    name: 'Plume Devnet',
    currency: 'ETH',
    rpcUrl: PLUME_SEPOLIA_RPC_URL,
    explorerUrl: 'https://test-explorer.plumenetwork.xyz/',
};

export const plumeSepolia: NetworkIF = {
    chainId: chainIdHex,
    chainSpec: chainSpecFromSDK,
    graphCacheUrl: GCGO_TESTNET_URL,
    evmRpcUrl: PLUME_SEPOLIA_RPC_URL,
    chainSpecForWalletConnector: chainSpecForWalletConnector,
    defaultPair: [plumeSepoliaETH, plumeSepoliaUSD],
    defaultPairFuta: [plumeSepoliaETH, plumeSepoliaUSD],
    poolIndex: chainSpecFromSDK.poolIndex,
    gridSize: chainSpecFromSDK.gridSize,
    blockExplorer: chainSpecForWalletConnector.explorerUrl,
    displayName: chainSpecForWalletConnector.name,
    topPools: [
        new TopPool(
            plumeSepoliaETH,
            plumeSepoliaUSD,
            chainSpecFromSDK.poolIndex,
        ),
        new TopPool(
            plumeSepoliaUSD,
            plumeSepoliaNEV,
            chainSpecFromSDK.poolIndex,
        ),
        new TopPool(
            plumeSepoliaETH,
            plumeSepoliaNEV,
            chainSpecFromSDK.poolIndex,
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
