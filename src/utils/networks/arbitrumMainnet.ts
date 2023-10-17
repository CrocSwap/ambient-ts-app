import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { arbitrum as wagmiChain } from 'wagmi/chains';
import { arbETH, arbUSDC } from '../data/defaultTokens';
import { TopPool } from '../data/defaultTopPools';
import { NetworkIF } from '../interfaces/NetworkIF';
import { Provider } from '@ethersproject/providers';

export const arbitrumMainnet: NetworkIF = {
    chainId: '0xa4b1',
    mainnetChainId: '0xa4b1',
    wagmiChain,
    shouldPollBlock: true,
    tokens: {
        ETH: '0x0000000000000000000000000000000000000000',
        WETH: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
        USDC: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
        USDT: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
        DAI: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
        UNI: '0xfa7f8980b0f1e64a2062791cc3b0871572f1f7f0',
        WBTC: '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f',
        PEPE: '',
        FRAX: '0x17fc002b466eec40dae837fc4be5c67993ddbd6f',
    },
    defaultPair: [arbETH, arbUSDC],
    topPools: [new TopPool(arbETH, arbUSDC, lookupChain('0xa4b1').poolIndex)],
    stableTokens: [
        '0xaf88d065e77c8cc2239327c5edb3a432268e5831', // USDC
    ],
    wrappedNativeTokens: [
        '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', // WETH
    ],
    getGasPriceInGwei: async (provider?: Provider) => {
        if (!provider) return 0;
        return (await provider.getGasPrice()).toNumber() * 1e-9;
    },
};
