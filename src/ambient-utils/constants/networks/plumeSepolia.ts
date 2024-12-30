import { bigIntToFloat } from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { Provider } from 'ethers';
import { NetworkIF } from '../../types/NetworkIF';
import {
    plumeSepoliaETH,
    plumeSepoliaNEV,
    plumeSepoliaUSD,
} from '../defaultTokens';
import { GCGO_TESTNET_URL } from '../gcgo';
import { TopPool } from './TopPool';

const PUBLIC_RPC_URL = 'https://test-rpc.plumenetwork.xyz';
const SECONDARY_PUBLIC_RPC_URL = 'https://base-sepolia-rpc.publicnode.com';

const RESTRICTED_RPC_URL =
    import.meta.env.VITE_PLUME_SEPOLIA_RPC_URL !== undefined
        ? import.meta.env.VITE_PLUME_SEPOLIA_RPC_URL
        : undefined;

const PRIMARY_RPC_URL = RESTRICTED_RPC_URL
    ? RESTRICTED_RPC_URL
    : PUBLIC_RPC_URL;

const FALLBACK_RPC_URL =
    PRIMARY_RPC_URL === PUBLIC_RPC_URL
        ? SECONDARY_PUBLIC_RPC_URL
        : PUBLIC_RPC_URL;

const chainIdHex = '0x18230';
const chainSpecFromSDK = lookupChain(chainIdHex);

const chainSpecForWalletConnector = {
    chainId: Number(chainIdHex),
    name: 'Plume Devnet',
    currency: 'ETH',
    rpcUrl: PUBLIC_RPC_URL,
    explorerUrl: 'https://test-explorer.plumenetwork.xyz/',
};

export const plumeSepolia: NetworkIF = {
    chainId: chainIdHex,
    chainSpec: chainSpecFromSDK,
    GCGO_URL: GCGO_TESTNET_URL,
    evmRpcUrl: PRIMARY_RPC_URL,
    fallbackRpcUrl: FALLBACK_RPC_URL,
    chainSpecForWalletConnector: chainSpecForWalletConnector,
    defaultPair: [plumeSepoliaETH, plumeSepoliaUSD],
    defaultPairFuta: [plumeSepoliaETH, plumeSepoliaUSD],
    poolIndex: chainSpecFromSDK.poolIndex,
    gridSize: chainSpecFromSDK.gridSize,
    blockExplorer: chainSpecForWalletConnector.explorerUrl,
    displayName: 'Plume Devnet',
    tokenPriceQueryAssetPlatform: undefined,
    vaultsEnabled: false,
    tempestApiNetworkName: '',
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
