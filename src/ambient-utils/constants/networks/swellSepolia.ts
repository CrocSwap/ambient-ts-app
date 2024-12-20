import { bigIntToFloat } from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { Provider } from 'ethers';
import { NetworkIF } from '../../types/NetworkIF';
import {
    swellSepoliaETH,
    swellSepoliaUSDC,
    swellSepoliaUSDT,
} from '../defaultTokens';
import { GCGO_TESTNET_URL } from '../gcgo';
import { TopPool } from './TopPool';

export const PUBLIC_RPC_URL = 'https://swell-testnet.alt.technology';

export const RESTRICTED_RPC_URL =
    import.meta.env.VITE_SWELL_SEPOLIA_RPC_URL !== undefined
        ? import.meta.env.VITE_SWELL_SEPOLIA_RPC_URL
        : PUBLIC_RPC_URL;

const chainIdHex = '0x784';
const chainSpecFromSDK = lookupChain(chainIdHex);

const chainSpecForWalletConnector = {
    chainId: Number(chainIdHex),
    name: 'Swellchain Testnet',
    currency: 'ETH',
    rpcUrl: PUBLIC_RPC_URL,
    explorerUrl: 'https://swell-testnet-explorer.alt.technology/',
};

export const swellSepolia: NetworkIF = {
    chainId: chainIdHex,
    chainSpec: chainSpecFromSDK,
    GCGO_URL: GCGO_TESTNET_URL,
    evmRpcUrl: RESTRICTED_RPC_URL,
    chainSpecForWalletConnector: chainSpecForWalletConnector,
    defaultPair: [swellSepoliaETH, swellSepoliaUSDC],
    defaultPairFuta: [swellSepoliaETH, swellSepoliaUSDC],
    poolIndex: chainSpecFromSDK.poolIndex,
    gridSize: chainSpecFromSDK.gridSize,
    blockExplorer: chainSpecForWalletConnector.explorerUrl,
    displayName: 'Swell Testnet',
    tokenPriceQueryAssetPlatform: undefined,
    vaultsEnabled: false,
    topPools: [
        new TopPool(
            swellSepoliaETH,
            swellSepoliaUSDC,
            chainSpecFromSDK.poolIndex,
        ),
        new TopPool(
            swellSepoliaETH,
            swellSepoliaUSDT,
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
