import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { blastSepoliaETH, blastSepoliaUSDB } from '../defaultTokens';
import { NetworkIF } from '../../types/NetworkIF';
import { TopPool } from './TopPool';
import { Provider } from 'ethers';
import { GCGO_TESTNET_URL } from '../gcgo';
import { bigIntToFloat } from '@crocswap-libs/sdk';

const chain = {
    chainId: 168587773,
    name: 'Blast Sepolia',
    currency: 'ETH',
    rpcUrl: 'https://sepolia.blast.io/',
    explorerUrl: 'https://testnet.blastscan.io',
};

const chainSpec = lookupChain('0xa0c71fd');

export const blastSepolia: NetworkIF = {
    chainId: '0xa0c71fd',
    graphCacheUrl: GCGO_TESTNET_URL,
    evmRpcUrl: 'https://sepolia.blast.io/',
    chain: chain,
    marketData: '0x1',
    defaultPair: [blastSepoliaETH, blastSepoliaUSDB],
    poolIndex: chainSpec.poolIndex,
    gridSize: chainSpec.gridSize,
    displayName: chainSpec.displayName,
    topPools: [
        new TopPool(blastSepoliaETH, blastSepoliaUSDB, chainSpec.poolIndex),
    ],
    chainSpec: chainSpec,
    blockExplorer: chainSpec.blockExplorer,
    getGasPriceInGwei: async (provider?: Provider) => {
        if (!provider) return 0;
        return (
            bigIntToFloat((await provider.getFeeData()).gasPrice || BigInt(0)) *
            1e-9
        );
    },
};
