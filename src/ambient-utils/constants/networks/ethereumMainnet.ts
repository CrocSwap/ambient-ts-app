import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import {
    mainnetETH,
    mainnetUSDC,
    mainnetWBTC,
    mainnetUSDT,
} from '../defaultTokens';
import { NetworkIF } from '../../types/NetworkIF';
import { TopPool } from './TopPool';
import { GCGO_ETHEREUM_URL } from '../gcgo';
import { Provider } from 'ethers';
import { bigIntToFloat } from '@crocswap-libs/sdk';

// const PROVIDER_KEY =
//     import.meta.env.NODE_ENV === 'test'
//         ? import.meta.env.PROVIDER_KEY
//         : import.meta.env.VITE_INFURA_KEY;

const MAINNET_RPC_URL =
    import.meta.env.VITE_MAINNET_RPC_URL !== undefined
        ? import.meta.env.VITE_MAINNET_RPC_URL
        : 'https://ethereum-mainnet.core.chainstack.com/55818ec2ac63dfef6ff4d1a74cf14d72';

const chain = {
    chainId: 1,
    name: 'Ethereum',
    currency: 'ETH',
    rpcUrl: MAINNET_RPC_URL,
    explorerUrl: 'https://etherscan.io',
};

export const ethereumMainnet: NetworkIF = {
    chainId: '0x1',
    graphCacheUrl: GCGO_ETHEREUM_URL,
    evmRpcUrl: MAINNET_RPC_URL,
    // evmRpcUrl: 'https://mainnet.infura.io/v3/' + PROVIDER_KEY,
    chain: chain,
    shouldPollBlock: false,
    marketData: '0x1',
    defaultPair: [mainnetETH, mainnetUSDC],
    topPools: [
        new TopPool(mainnetETH, mainnetUSDC, lookupChain('0x1').poolIndex),
        new TopPool(mainnetETH, mainnetWBTC, lookupChain('0x1').poolIndex),
        new TopPool(mainnetUSDC, mainnetUSDT, lookupChain('0x1').poolIndex),
    ],
    getGasPriceInGwei: async (provider?: Provider) => {
        if (!provider) return 0;
        return (
            bigIntToFloat((await provider.getFeeData()).gasPrice || BigInt(0)) *
            1e-9
        );
    },
};
