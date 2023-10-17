import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { mainnet as wagmiChain } from 'wagmi/chains';
import {
    mainnetETH,
    mainnetUSDC,
    mainnetWBTC,
    mainnetDAI,
    mainnetUSDT,
} from '../data/defaultTokens';
import { TopPool } from '../data/defaultTopPools';
import { NetworkIF } from '../interfaces/exports';

export const ethereumMainnet: NetworkIF = {
    chainId: '0x1',
    mainnetChainId: '0x1',
    wagmiChain,
    shouldPollBlock: false,
    tokens: {
        ETH: '0x0000000000000000000000000000000000000000',
        WETH: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        USDC: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        USDT: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        UNI: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
        DAI: '0x6b175474e89094c44da98b954eedeac495271d0f',
        WBTC: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
        FRAX: '0x853d955acef822db058eb8505911ed77f175b99e',
        PEPE: '0x6982508145454ce325ddbe47a25d4ec3d2311933',
    },
    defaultPair: [mainnetETH, mainnetUSDC],
    topPools: [
        new TopPool(mainnetETH, mainnetUSDC, lookupChain('0x1').poolIndex),
        new TopPool(mainnetETH, mainnetWBTC, lookupChain('0x1').poolIndex),
        new TopPool(mainnetDAI, mainnetUSDC, lookupChain('0x1').poolIndex),
        new TopPool(mainnetUSDT, mainnetUSDC, lookupChain('0x1').poolIndex),
    ],
    stableTokens: [
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
        '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
    ],
    wrappedNativeTokens: [
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
    ],
    getGasPriceInGwei: async () => {
        const response = await fetch(
            'https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=KNJM7A9ST1Q1EESYXPPQITIP7I8EFSY456',
        );
        const gasPrice = (await response.json()).result.ProposeGasPrice;
        return gasPrice ? parseInt(gasPrice) : undefined;
    },
};
