import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { sepolia as wagmiChain } from 'wagmi/chains';
import { sepoliaETH, sepoliaUSDC, sepoliaWBTC } from '../defaultTokens';
import { NetworkIF } from '../../types/NetworkIF';
import { TopPool } from './TopPool';
import { GCGO_TESTNET_URL } from '../gcgo';
import { Provider } from '@ethersproject/providers';

const PROVIDER_KEY =
    process.env.NODE_ENV === 'test'
        ? process.env.PROVIDER_KEY
        : process.env.REACT_APP_INFURA_KEY;

export const ethereumSepolia: NetworkIF = {
    chainId: '0xaa36a7',
    graphCacheUrl: GCGO_TESTNET_URL,
    evmRpcUrl: 'https://sepolia.infura.io/v3/' + PROVIDER_KEY,
    wagmiChain,
    shouldPollBlock: false,
    marketData: '0x1',
    defaultPair: [sepoliaETH, sepoliaUSDC],
    topPools: [
        new TopPool(sepoliaETH, sepoliaUSDC, lookupChain('0xaa36a7').poolIndex),
        new TopPool(sepoliaETH, sepoliaWBTC, lookupChain('0xaa36a7').poolIndex),
        new TopPool(
            sepoliaUSDC,
            sepoliaWBTC,
            lookupChain('0xaa36a7').poolIndex,
        ),
    ],
    getGasPriceInGwei: async (provider?: Provider) => {
        if (!provider) return 0;
        return (await provider.getGasPrice()).toNumber() * 1e-9;
    },
};
