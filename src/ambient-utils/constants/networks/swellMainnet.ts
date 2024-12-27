import { bigIntToFloat } from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { Provider } from 'ethers';
import { NetworkIF } from '../../types/NetworkIF';
import { swellETH, swellRSWETH, swellSWETH, swellUSDE } from '../defaultTokens';
import { GCGO_SWELL_URL } from '../gcgo';
import { TopPool } from './TopPool';

export const PUBLIC_RPC_URL = 'https://swell-mainnet.alt.technology';

export const RESTRICTED_RPC_URL =
    import.meta.env.VITE_SWELL_RPC_URL !== undefined
        ? import.meta.env.VITE_SWELL_RPC_URL
        : PUBLIC_RPC_URL;

const chainIdHex = '0x783';
const chainSpecFromSDK = lookupChain(chainIdHex);

const chainSpecForWalletConnector = {
    chainId: Number(chainIdHex),
    name: 'Swellchain',
    currency: 'ETH',
    rpcUrl: PUBLIC_RPC_URL,
    explorerUrl: 'https://explorer.swellnetwork.io/',
};

export const swellMainnet: NetworkIF = {
    chainId: chainIdHex,
    chainSpec: chainSpecFromSDK,
    GCGO_URL: GCGO_SWELL_URL,
    evmRpcUrl: RESTRICTED_RPC_URL,
    chainSpecForWalletConnector: chainSpecForWalletConnector,
    defaultPair: [swellETH, swellUSDE],
    defaultPairFuta: [swellETH, swellUSDE],
    poolIndex: chainSpecFromSDK.poolIndex,
    gridSize: chainSpecFromSDK.gridSize,
    blockExplorer: chainSpecForWalletConnector.explorerUrl,
    displayName: 'Swell',
    tokenPriceQueryAssetPlatform: 'swell',
    vaultsEnabled: true,
    tempestApiNetworkName: 'swell',
    topPools: [
        new TopPool(swellETH, swellUSDE, chainSpecFromSDK.poolIndex),
        new TopPool(swellRSWETH, swellETH, chainSpecFromSDK.poolIndex),
        new TopPool(swellSWETH, swellETH, chainSpecFromSDK.poolIndex),
    ],
    getGasPriceInGwei: async (provider?: Provider) => {
        if (!provider) return 0;
        return (
            bigIntToFloat((await provider.getFeeData()).gasPrice || BigInt(0)) *
            1e-9
        );
    },
};
