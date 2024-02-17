import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { goerli as wagmiChain } from 'wagmi/chains';
import {
    goerliETH,
    goerliUSDC,
    goerliWBTC,
    goerliDAI,
    goerliUSDT,
} from '../defaultTokens';
import { NetworkIF } from '../../types/NetworkIF';
import { TopPool } from './TopPool';
import { GCGO_TESTNET_URL } from '../gcgo';

const PROVIDER_KEY =
    process.env.NODE_ENV === 'test'
        ? process.env.PROVIDER_KEY
        : process.env.REACT_APP_INFURA_KEY;

export const ethereumGoerli: NetworkIF = {
    chainId: '0x5',
    graphCacheUrl: GCGO_TESTNET_URL,
    evmRpcUrl: 'https://goerli.infura.io/v3/' + PROVIDER_KEY,
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
        return 15;
    },
};
