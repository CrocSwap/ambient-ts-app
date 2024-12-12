import { bigIntToFloat } from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { Provider } from 'ethers';
import { NetworkIF } from '../../types/NetworkIF';
import { plumeETH, plumeNEV, plumeUSD } from '../defaultTokens';
import { GCGO_PLUME_URL } from '../gcgo';
import { TopPool } from './TopPool';

export const PUBLIC_RPC_URL = 'https://phoenix-rpc.plumenetwork.xyz';

export const RESTRICTED_RPC_URL =
    import.meta.env.VITE_PLUME_RPC_URL !== undefined
        ? import.meta.env.VITE_PLUME_RPC_URL
        : PUBLIC_RPC_URL;

const chainIdHex = '0x18231';
const chainSpecFromSDK = lookupChain(chainIdHex);

const chainSpecForWalletConnector = {
    chainId: Number(chainIdHex),
    name: 'Plume',
    currency: 'ETH',
    rpcUrl: PUBLIC_RPC_URL,
    explorerUrl: 'https://phoenix-explorer.plumenetwork.xyz/',
};

export const plumeMainnet: NetworkIF = {
    chainId: chainIdHex,
    chainSpec: chainSpecFromSDK,
    GCGO_URL: GCGO_PLUME_URL,
    evmRpcUrl: RESTRICTED_RPC_URL,
    chainSpecForWalletConnector: chainSpecForWalletConnector,
    defaultPair: [plumeETH, plumeUSD],
    defaultPairFuta: [plumeETH, plumeUSD],
    poolIndex: chainSpecFromSDK.poolIndex,
    gridSize: chainSpecFromSDK.gridSize,
    blockExplorer: chainSpecForWalletConnector.explorerUrl,
    displayName: chainSpecForWalletConnector.name,
    topPools: [
        new TopPool(plumeETH, plumeUSD, chainSpecFromSDK.poolIndex),
        new TopPool(plumeNEV, plumeUSD, chainSpecFromSDK.poolIndex),
        new TopPool(plumeETH, plumeNEV, chainSpecFromSDK.poolIndex),
    ],
    getGasPriceInGwei: async (provider?: Provider) => {
        if (!provider) return 0;
        return (
            bigIntToFloat((await provider.getFeeData()).gasPrice || BigInt(0)) *
            1e-9
        );
    },
};
