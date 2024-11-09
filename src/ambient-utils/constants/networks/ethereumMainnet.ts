import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import {
    mainnetETH,
    mainnetUSDC,
    mainnetWBTC,
    mainnetUSDT,
    mainnetDAI,
} from '../defaultTokens';
import { NetworkIF } from '../../types/NetworkIF';
import { TopPool } from './TopPool';
import { GCGO_ETHEREUM_URL } from '../gcgo';
import { Provider } from 'ethers';
import { bigIntToFloat } from '@crocswap-libs/sdk';

const MAINNET_RPC_URL =
    import.meta.env.VITE_MAINNET_RPC_URL !== undefined
        ? import.meta.env.VITE_MAINNET_RPC_URL
        : 'https://eth.llamarpc.com';

const chain = {
    chainId: 1,
    name: 'Ethereum',
    currency: 'ETH',
    rpcUrl: MAINNET_RPC_URL,
    explorerUrl: 'https://etherscan.io',
};

const chainSpec = lookupChain('0x1');

export const ethereumMainnet: NetworkIF = {
    chainId: '0x1',
    graphCacheUrl: GCGO_ETHEREUM_URL,
    evmRpcUrl: MAINNET_RPC_URL,
    chain: chain,
    marketData: '0x1',
    defaultPair: [mainnetETH, mainnetUSDC],
    poolIndex: chainSpec.poolIndex,
    gridSize: chainSpec.gridSize,
    blockExplorer: chainSpec.blockExplorer,
    displayName: chainSpec.displayName,
    topPools: [
        new TopPool(mainnetETH, mainnetUSDC, chainSpec.poolIndex),
        new TopPool(mainnetETH, mainnetWBTC, chainSpec.poolIndex),
        new TopPool(mainnetETH, mainnetUSDT, chainSpec.poolIndex),
        new TopPool(mainnetUSDT, mainnetUSDC, chainSpec.poolIndex),
        new TopPool(mainnetETH, mainnetDAI, chainSpec.poolIndex),
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
