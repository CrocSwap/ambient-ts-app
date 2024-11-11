/* eslint-disable @typescript-eslint/no-explicit-any  */
import { Provider, Signer } from 'ethers';
import { TopPool } from '../constants/networks/TopPool';
import { TokenIF } from './token/TokenIF';
import { ChainSpec, CrocEnv } from '@crocswap-libs/sdk';

export interface NetworkIF {
    chainId: string;
    graphCacheUrl: string;
    chain: any;
    evmRpcUrl: string;
    marketData: string;
    poolIndex: number;
    gridSize: number;
    defaultPair: TokenIF[];
    defaultPairFuta?: [TokenIF, TokenIF];
    topPools: TopPool[];
    blockExplorer: string | undefined;
    displayName: string;
    chainSpec: ChainSpec;
    getGasPriceInGwei: (provider?: Provider) => Promise<number | undefined>;
}

export interface NetworkSessionIF {
    tokenUniv: TokenIF[];
    infuraUrl: string;
    provider: Provider;
    chainId: string;
    signer?: Signer;
    gcUrl: string;
    crocEnv: CrocEnv;
}

export interface NetworkUserSessionIF {
    networkSession: NetworkSessionIF;
    userAddress: string;
}
