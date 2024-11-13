import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import {
    scrollETH,
    scrollUSDC,
    scrollUSDT,
    scrollWBTC,
    scrollWrsETH,
} from '../defaultTokens';
import { NetworkIF } from '../../types/NetworkIF';
import { TopPool } from './TopPool';
import { Provider } from 'ethers';
import { GCGO_SCROLL_URL } from '../gcgo';
import { bigIntToFloat } from '@crocswap-libs/sdk';

export const SCROLL_RPC_URL =
    import.meta.env.VITE_SCROLL_RPC_URL !== undefined
        ? import.meta.env.VITE_SCROLL_RPC_URL
        : 'https://rpc.scroll.io';

const chainIdHex = '0x82750';
const chainSpecFromSDK = lookupChain(chainIdHex);

const chainSpecForWalletConnector = {
    chainId: Number(chainIdHex),
    name: 'Scroll',
    currency: 'ETH',
    rpcUrl: SCROLL_RPC_URL,
    explorerUrl: 'https://scrollscan.com',
};

export const scrollMainnet: NetworkIF = {
    chainId: chainIdHex,
    chainSpec: chainSpecFromSDK,
    graphCacheUrl: GCGO_SCROLL_URL,
    evmRpcUrl: SCROLL_RPC_URL,
    chainSpecForWalletConnector: chainSpecForWalletConnector,
    defaultPair: [scrollETH, scrollUSDC],
    poolIndex: chainSpecFromSDK.poolIndex,
    gridSize: chainSpecFromSDK.gridSize,
    blockExplorer: chainSpecForWalletConnector.explorerUrl,
    displayName: chainSpecForWalletConnector.name,
    topPools: [
        new TopPool(scrollETH, scrollUSDC, chainSpecFromSDK.poolIndex),
        new TopPool(scrollETH, scrollUSDT, chainSpecFromSDK.poolIndex),
        new TopPool(scrollUSDT, scrollUSDC, chainSpecFromSDK.poolIndex),
        new TopPool(scrollWrsETH, scrollETH, chainSpecFromSDK.poolIndex),
        new TopPool(scrollETH, scrollWBTC, chainSpecFromSDK.poolIndex),
    ],
    getGasPriceInGwei: async (provider?: Provider) => {
        if (!provider) return 0;
        return (
            bigIntToFloat((await provider.getFeeData()).gasPrice || BigInt(0)) *
            1e-9
        );
    },
};
