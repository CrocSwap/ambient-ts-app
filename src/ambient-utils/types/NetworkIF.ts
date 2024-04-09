/* eslint-disable @typescript-eslint/no-explicit-any  */
import { PublicClient, WalletClient, Chain } from 'viem';
import { TopPool } from '../constants/networks/TopPool';
import { TokenIF } from './token/TokenIF';
import { CrocEnv } from '@crocswap-libs/sdk';

export interface NetworkIF {
    chainId: string;
    graphCacheUrl: string;
    wagmiChain: Chain;
    evmRpcUrl: string;
    shouldPollBlock: boolean;
    marketData: string;
    defaultPair: TokenIF[];
    topPools: TopPool[];
    getGasPriceInGwei: (provider?: PublicClient) => Promise<number | undefined>;
}

export interface NetworkSessionIF {
    tokenUniv: TokenIF[];
    infuraUrl: string;
    publicClient: PublicClient;
    chainId: string;
    walletClient?: WalletClient;
    gcUrl: string;
    crocEnv: CrocEnv;
}

export interface NetworkUserSessionIF {
    networkSession: NetworkSessionIF;
    userAddress: string;
}
