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
    mainnetChainId: '0xa4b1',
    wagmiChain,
    shouldPollBlock: true,
    marketData: '0x1',
    tokens: {
        ETH: '0x0000000000000000000000000000000000000000',
        WETH: '0xe39ab88f8a4777030a534146a9ca3b52bd5d43a3',
        USDC: '0x8fb1e3fc51f3b789ded7557e680551d93ea9d892',
        USDT: '',
        DAI: '',
        UNI: '',
        WBTC: '',
        PEPE: '',
        FRAX: '',
    },
    defaultPair: [arbGoerliETH, arbGoerliUSDC],
    topPools: [
        new TopPool(arbGoerliETH, arbGoerliUSDC, lookupChain('0x5').poolIndex),
        new TopPool(arbGoerliETH, arbGoerliWBTC, lookupChain('0x5').poolIndex),
        new TopPool(arbGoerliETH, arbGoerliDAI, lookupChain('0x5').poolIndex),
    ],
    stableTokens: [
        '0xc944b73fba33a773a4a07340333a3184a70af1ae', // USDC
    ],
    wrappedNativeTokens: [
        '0xe39ab88f8a4777030a534146a9ca3b52bd5d43a3', // WETH
    ],
    getGasPriceInGwei: async (provider?: Provider) => {
        if (!provider) return 0;
        return (await provider.getGasPrice()).toNumber() * 1e-9;
    },
};
