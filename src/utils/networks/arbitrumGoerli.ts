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

export const arbitrumGoerli: NetworkIF = {
    chainId: '0x66eed',
    wagmiChain,
    shouldPollBlock: true,
    marketData: '0x1',
    tokens: {
        ETH: '0x0000000000000000000000000000000000000000',
        WETH: '0xc944b73fba33a773a4a07340333a3184a70af1ae',
        USDC: '',
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
    getGasPriceInGwei: async () => {
        // TODO: get Arbitrum gas price https://docs.arbitrum.io/devs-how-tos/how-to-estimate-gas#where-do-we-get-all-this-information-from
        return 0;
    },
};
