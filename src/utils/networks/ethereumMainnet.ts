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
import { GCGO_ETHEREUM_URL } from '../../constants';

export const ethereumMainnet: NetworkIF = {
    chainId: '0x1',
    graphCacheUrl: GCGO_ETHEREUM_URL,
    wagmiChain,
    shouldPollBlock: false,
    marketData: '0x1',
    defaultPair: [mainnetETH, mainnetUSDC],
    topPools: [
        new TopPool(mainnetETH, mainnetUSDC, lookupChain('0x1').poolIndex),
        new TopPool(mainnetETH, mainnetWBTC, lookupChain('0x1').poolIndex),
        new TopPool(mainnetDAI, mainnetUSDC, lookupChain('0x1').poolIndex),
        new TopPool(mainnetUSDT, mainnetUSDC, lookupChain('0x1').poolIndex),
    ],
    getGasPriceInGwei: async () => {
        const response = await fetch(
            'https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=KNJM7A9ST1Q1EESYXPPQITIP7I8EFSY456',
        );
        const gasPrice = (await response.json()).result.ProposeGasPrice;
        return gasPrice ? parseInt(gasPrice) : undefined;
    },
};
