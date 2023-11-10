import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { arbitrumGoerli as wagmiChain } from 'wagmi/chains';
import {
    arbGoerliETH,
    arbGoerliUSDC,
    arbGoerliWBTC,
    arbGoerliDAI,
} from '../data/defaultTokens';
import { TopPool } from '../data/defaultTopPools';
import { NetworkIF } from '../interfaces/NetworkIF';
import { Provider } from '@ethersproject/providers';

export const arbitrumGoerli: NetworkIF = {
    chainId: '0x66eed',
    graphCacheUrl: 'https://ambindexer.net/gcgo',
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
