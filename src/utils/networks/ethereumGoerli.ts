import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { goerli as wagmiChain } from 'wagmi/chains';
import {
    goerliETH,
    goerliUSDC,
    goerliWBTC,
    goerliDAI,
    goerliUSDT,
} from '../data/defaultTokens';
import { TopPool } from '../data/defaultTopPools';
import { NetworkIF } from '../interfaces/exports';

export const ethereumGoerli: NetworkIF = {
    chainId: '0x5',
    graphCacheUrl: 'https://ambindexer.net/gcgo',
    wagmiChain,
    shouldPollBlock: false,
    marketData: '0x1',
    defaultPair: [goerliETH, goerliUSDC],
    topPools: [
        new TopPool(goerliETH, goerliUSDC, lookupChain('0x5').poolIndex),
        new TopPool(goerliETH, goerliWBTC, lookupChain('0x5').poolIndex),
        new TopPool(goerliUSDC, goerliDAI, lookupChain('0x5').poolIndex),
        new TopPool(goerliUSDT, goerliUSDC, lookupChain('0x5').poolIndex),
    ],
    getGasPriceInGwei: async () => {
        const response = await fetch(
            'https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=KNJM7A9ST1Q1EESYXPPQITIP7I8EFSY456',
        );
        const gasPrice = (await response.json()).result.ProposeGasPrice;
        return gasPrice ? parseInt(gasPrice) : undefined;
    },
};
