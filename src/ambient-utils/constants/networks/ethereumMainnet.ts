import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import {
    mainnetETH,
    mainnetUSDC,
    mainnetWBTC,
    mainnetUSDT,
} from '../defaultTokens';
import { NetworkIF } from '../../types/NetworkIF';
import { TopPool } from './TopPool';
import { GCGO_ETHEREUM_URL } from '../gcgo';
import { Provider } from 'ethers';
import { bigIntToFloat } from '@crocswap-libs/sdk';

export const MAINNET_RPC_URL =
    import.meta.env.VITE_MAINNET_RPC_URL !== undefined
        ? import.meta.env.VITE_MAINNET_RPC_URL
        : 'https://eth.llamarpc.com';

const chainIdHex = '0x1';
const chainSpecFromSDK = lookupChain(chainIdHex);

const chainSpecForWalletConnector = {
    chainId: Number(chainIdHex),
    name: 'Ethereum',
    currency: 'ETH',
    rpcUrl: MAINNET_RPC_URL,
    explorerUrl: 'https://etherscan.io',
};

export const ethereumMainnet: NetworkIF = {
    chainId: chainIdHex,
    chainSpec: chainSpecFromSDK,
    graphCacheUrl: GCGO_ETHEREUM_URL,
    evmRpcUrl: MAINNET_RPC_URL,
    chainSpecForWalletConnector: chainSpecForWalletConnector,
    defaultPair: [mainnetETH, mainnetUSDC],
    poolIndex: chainSpecFromSDK.poolIndex,
    gridSize: chainSpecFromSDK.gridSize,
    blockExplorer: chainSpecForWalletConnector.explorerUrl,
    displayName: chainSpecForWalletConnector.name,
    topPools: [
        new TopPool(mainnetETH, mainnetUSDC, chainSpecFromSDK.poolIndex),
        new TopPool(mainnetUSDT, mainnetUSDC, chainSpecFromSDK.poolIndex),
        new TopPool(mainnetETH, mainnetWBTC, chainSpecFromSDK.poolIndex),
    ],
    getGasPriceInGwei: async (provider?: Provider) => {
        if (!provider) return 0;
        return (
            bigIntToFloat((await provider.getFeeData()).gasPrice || BigInt(0)) *
            1e-9
        );
    },
};
