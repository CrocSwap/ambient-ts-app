import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { mainnet as wagmiChain } from 'wagmi/chains';
import {
    mainnetETH,
    mainnetUSDC,
    mainnetWBTC,
    mainnetUSDT,
    mainnetSYN,
} from '../defaultTokens';
import { NetworkIF } from '../../types/NetworkIF';
import { TopPool } from './TopPool';
import { GCGO_ETHEREUM_URL } from '../gcgo';
import { Provider } from '@ethersproject/providers';

const PROVIDER_KEY =
    process.env.NODE_ENV === 'test'
        ? process.env.PROVIDER_KEY
        : process.env.REACT_APP_INFURA_KEY;

export const ethereumMainnet: NetworkIF = {
    chainId: '0x1',
    graphCacheUrl: GCGO_ETHEREUM_URL,
    evmRpcUrl: 'https://mainnet.infura.io/v3/' + PROVIDER_KEY,
    wagmiChain,
    shouldPollBlock: false,
    marketData: '0x1',
    defaultPair: [mainnetETH, mainnetUSDC],
    topPools: [
        new TopPool(mainnetETH, mainnetUSDC, lookupChain('0x1').poolIndex),
        new TopPool(mainnetETH, mainnetWBTC, lookupChain('0x1').poolIndex),
        new TopPool(mainnetSYN, mainnetETH, lookupChain('0x1').poolIndex),
        new TopPool(mainnetUSDT, mainnetUSDC, lookupChain('0x1').poolIndex),
        new TopPool(mainnetETH, mainnetUSDT, lookupChain('0x1').poolIndex),
    ],
    getGasPriceInGwei: async (provider?: Provider) => {
        if (!provider) return 0;
        return (await provider.getGasPrice()).toNumber() * 1e-9;
    },
};
