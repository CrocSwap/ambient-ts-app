import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { sepoliaETH, sepoliaUSDC, sepoliaWBTC } from '../defaultTokens';
import { NetworkIF } from '../../types/NetworkIF';
import { TopPool } from './TopPool';
import { GCGO_TESTNET_URL } from '../gcgo';
import { Provider } from 'ethers';
import { bigIntToFloat } from '@crocswap-libs/sdk';

// const PROVIDER_KEY =
//     import.meta.env.NODE_ENV === 'test'
//         ? import.meta.env.PROVIDER_KEY
//         : import.meta.env.VITE_INFURA_KEY;

const chain = {
    chainId: 11155111,
    name: 'Sepolia',
    currency: 'ETH',
    rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
    explorerUrl: 'https://sepolia.etherscan.io',
};

export const ethereumSepolia: NetworkIF = {
    chainId: '0xaa36a7',
    graphCacheUrl: GCGO_TESTNET_URL,
    evmRpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
    // evmRpcUrl: 'https://sepolia.infura.io/v3/' + PROVIDER_KEY,
    chain: chain,
    shouldPollBlock: false,
    marketData: '0x1',
    defaultPair: [sepoliaETH, sepoliaUSDC],
    defaultPairFuta: [sepoliaETH, sepoliaWBTC],
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
        return (
            bigIntToFloat((await provider.getFeeData()).gasPrice || BigInt(0)) *
            1e-9
        );
    },
};
