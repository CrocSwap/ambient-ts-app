import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { mainnet as wagmiChain } from 'wagmi/chains';
import {
    mainnetETH,
    mainnetUSDC,
    mainnetWBTC,
    mainnetDAI,
    mainnetUSDT,
} from '../defaultTokens';
import { NetworkIF } from '../../types/NetworkIF';
import { TopPool } from './TopPool';
import { GCGO_ETHEREUM_URL } from '../gcgo';
import { AMBIENT_UTILS_OVERRIDES } from '../../initAmbientUtils';

const PROVIDER_KEY =
    process.env.NODE_ENV === 'test'
        ? process.env.PROVIDER_KEY
        : process.env.NODE_ENV === 'package'
        ? AMBIENT_UTILS_OVERRIDES['INFURA_API_KEY']
        : process.env.REACT_APP_INFURA_KEY;

const ETHERSCAN_API_KEY =
    process.env.NODE_ENV === 'package'
        ? AMBIENT_UTILS_OVERRIDES['ETHERSCAN_API_KEY']
        : 'KNJM7A9ST1Q1EESYXPPQITIP7I8EFSY456';

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
        new TopPool(mainnetDAI, mainnetUSDC, lookupChain('0x1').poolIndex),
        new TopPool(mainnetUSDT, mainnetUSDC, lookupChain('0x1').poolIndex),
    ],
    getGasPriceInGwei: async () => {
        const response = await fetch(
            `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${ETHERSCAN_API_KEY}`,
        );
        const gasPrice = (await response.json()).result.ProposeGasPrice;
        return gasPrice ? parseInt(gasPrice) : undefined;
    },
};
