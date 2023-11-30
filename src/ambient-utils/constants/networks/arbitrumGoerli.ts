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
import { Provider } from '@ethersproject/providers';
import { GCGO_ETHEREUM_URL } from '../gcgo';

export const arbitrumGoerli: NetworkIF = {
    chainId: '0x66eed',
    graphCacheUrl: GCGO_ETHEREUM_URL,
    wagmiChain,
    shouldPollBlock: true,
    marketData: '0x1',
    defaultPair: [arbGoerliETH, arbGoerliUSDC],
    topPools: [
        new TopPool(arbGoerliETH, arbGoerliUSDC, lookupChain('0x5').poolIndex),
        new TopPool(arbGoerliETH, arbGoerliWBTC, lookupChain('0x5').poolIndex),
        new TopPool(arbGoerliETH, arbGoerliDAI, lookupChain('0x5').poolIndex),
    ],
    getGasPriceInGwei: async (provider?: Provider) => {
        if (!provider) return 0;
        return (await provider.getGasPrice()).toNumber() * 1e-9;
    },
};
