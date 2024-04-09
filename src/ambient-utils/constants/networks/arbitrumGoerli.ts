import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { arbitrumGoerli as wagmiChain } from 'wagmi/chains';
import {
    arbGoerliETH,
    arbGoerliUSDC,
    arbGoerliWBTC,
    arbGoerliDAI,
} from '../defaultTokens';
import { NetworkIF } from '../../types/NetworkIF';
import { TopPool } from './TopPool';
import { PublicClient } from 'viem';
import { GCGO_ETHEREUM_URL } from '../gcgo';
import { bigIntToFloat } from '@crocswap-libs/sdk';

const PROVIDER_KEY =
    process.env.NODE_ENV === 'test'
        ? process.env.PROVIDER_KEY
        : process.env.REACT_APP_INFURA_KEY;

export const arbitrumGoerli: NetworkIF = {
    chainId: '0x66eed',
    graphCacheUrl: GCGO_ETHEREUM_URL,
    evmRpcUrl: 'https://arbitrum-goerli.infura.io/v3/' + PROVIDER_KEY,
    wagmiChain,
    shouldPollBlock: true,
    marketData: '0x1',
    defaultPair: [arbGoerliETH, arbGoerliUSDC],
    topPools: [
        new TopPool(arbGoerliETH, arbGoerliUSDC, lookupChain('0x5').poolIndex),
        new TopPool(arbGoerliETH, arbGoerliWBTC, lookupChain('0x5').poolIndex),
        new TopPool(arbGoerliETH, arbGoerliDAI, lookupChain('0x5').poolIndex),
    ],
    getGasPriceInGwei: async (publicClient?: PublicClient) => {
        if (!publicClient) return 0;
        return bigIntToFloat(await publicClient.getGasPrice()) * 1e-9;
    },
};
