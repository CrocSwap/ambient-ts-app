import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { swellSepoliaETH, swellSepoliaUSDC } from '../defaultTokens';
import { NetworkIF } from '../../types/NetworkIF';
import { TopPool } from './TopPool';
import { Provider } from 'ethers';
import { GCGO_TESTNET_URL } from '../gcgo';
import { bigIntToFloat } from '@crocswap-libs/sdk';

export const SWELL_SEPOLIA_RPC_URL =
    import.meta.env.VITE_SWELL_SEPOLIA_RPC_URL !== undefined
        ? import.meta.env.VITE_SWELL_SEPOLIA_RPC_URL
        : 'https://swell-testnet.alt.technology';

const chainIdHex = '0x784';
const chainSpecFromSDK = lookupChain(chainIdHex);

const chainSpecForWalletConnector = {
    chainId: Number(chainIdHex),
    name: 'Swell Testnet',
    currency: 'ETH',
    rpcUrl: SWELL_SEPOLIA_RPC_URL,
    explorerUrl: 'https://swell-testnet-explorer.alt.technology/',
};

export const swellSepolia: NetworkIF = {
    chainId: chainIdHex,
    chainSpec: chainSpecFromSDK,
    graphCacheUrl: GCGO_TESTNET_URL,
    evmRpcUrl: SWELL_SEPOLIA_RPC_URL,
    chainSpecForWalletConnector: chainSpecForWalletConnector,
    defaultPair: [swellSepoliaETH, swellSepoliaUSDC],
    defaultPairFuta: [swellSepoliaETH, swellSepoliaUSDC],
    poolIndex: chainSpecFromSDK.poolIndex,
    gridSize: chainSpecFromSDK.gridSize,
    blockExplorer: chainSpecForWalletConnector.explorerUrl,
    displayName: chainSpecForWalletConnector.name,
    topPools: [
        new TopPool(
            swellSepoliaETH,
            swellSepoliaUSDC,
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
