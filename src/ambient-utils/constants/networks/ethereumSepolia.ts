import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { sepoliaETH, sepoliaUSDC, sepoliaWBTC } from '../defaultTokens';
import { NetworkIF } from '../../types/NetworkIF';
import { TopPool } from './TopPool';
import { GCGO_TESTNET_URL } from '../gcgo';
import { Provider } from 'ethers';
import { bigIntToFloat } from '@crocswap-libs/sdk';

export const SEPOLIA_RPC_URL =
    import.meta.env.VITE_SEPOLIA_RPC_URL !== undefined
        ? import.meta.env.VITE_SEPOLIA_RPC_URL
        : 'https://ethereum-sepolia-rpc.publicnode.com';

const chain = {
    chainId: 11155111,
    name: 'Sepolia',
    currency: 'ETH',
    rpcUrl: SEPOLIA_RPC_URL,
    explorerUrl: 'https://sepolia.etherscan.io',
};

const chainSpec = lookupChain('0xaa36a7');

export const ethereumSepolia: NetworkIF = {
    chainId: '0xaa36a7',
    graphCacheUrl: GCGO_TESTNET_URL,
    evmRpcUrl: SEPOLIA_RPC_URL,
    chain: chain,
    marketData: '0x1',
    defaultPair: [sepoliaETH, sepoliaUSDC],
    defaultPairFuta: [sepoliaETH, sepoliaWBTC],
    poolIndex: chainSpec.poolIndex,
    gridSize: chainSpec.gridSize,
    blockExplorer: chainSpec.blockExplorer,
    displayName: chainSpec.displayName,
    topPools: [
        new TopPool(sepoliaETH, sepoliaUSDC, chainSpec.poolIndex),
        new TopPool(sepoliaETH, sepoliaWBTC, chainSpec.poolIndex),
        new TopPool(sepoliaUSDC, sepoliaWBTC, chainSpec.poolIndex),
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
