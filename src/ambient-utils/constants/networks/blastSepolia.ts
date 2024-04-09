import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { blastSepoliaETH, blastSepoliaUSDB } from '../defaultTokens';
import { NetworkIF } from '../../types/NetworkIF';
import { TopPool } from './TopPool';
import { PublicClient } from 'viem';
import { GCGO_TESTNET_URL } from '../gcgo';
import { blastSepolia as wagmiChain } from 'viem/chains';
import { bigIntToFloat } from '@crocswap-libs/sdk';

export const blastSepolia: NetworkIF = {
    chainId: '0xa0c71fd',
    graphCacheUrl: GCGO_TESTNET_URL,
    evmRpcUrl: 'https://sepolia.blast.io/',
    wagmiChain,
    shouldPollBlock: true,
    marketData: '0x1',
    defaultPair: [blastSepoliaETH, blastSepoliaUSDB],
    topPools: [
        new TopPool(
            blastSepoliaETH,
            blastSepoliaUSDB,
            lookupChain('0xa0c71fd').poolIndex,
        ),
    ],
    getGasPriceInGwei: async (publicClient?: PublicClient) => {
        if (!publicClient) return 0;
        return bigIntToFloat(await publicClient.getGasPrice()) * 1e-9;
    },
};
