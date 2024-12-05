/* eslint-disable @typescript-eslint/no-explicit-any  */
import { ChainSpec, CrocEnv } from '@crocswap-libs/sdk';
import { Provider, Signer } from 'ethers';
import { TopPool } from '../constants/networks/TopPool';
import { TokenIF } from './token/TokenIF';

export interface ChainSpecForWeb3Modal {
    chainId: number;
    name: string;
    currency: string;
    rpcUrl: string;
    explorerUrl: string;
}

export interface NetworkIF {
    chainId: string;
    GCGO_URL: string;
    chainSpecForWalletConnector: ChainSpecForWeb3Modal;
    evmRpcUrl: string;
    poolIndex: number;
    gridSize: number;
    defaultPair: TokenIF[];
    defaultPairFuta?: [TokenIF, TokenIF];
    topPools: TopPool[];
    blockExplorer: string;
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
