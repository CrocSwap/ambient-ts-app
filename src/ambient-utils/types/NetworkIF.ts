import { Provider, Signer } from '@ethersproject/providers';
import { TopPool } from '../constants/networks/TopPool';
import { TokenIF } from './token/TokenIF';
import { ethers } from 'ethers';
import { fetchBlockNumber } from '../../api/fetchBlockNumber';
import { CrocEnv } from '@crocswap-libs/sdk';

export interface NetworkIF {
    chainId: string;
    graphCacheUrl: string;
    wagmiChain: any;
    shouldPollBlock: boolean;
    marketData: string;
    defaultPair: TokenIF[];
    topPools: TopPool[];
    getGasPriceInGwei: (provider?: Provider) => Promise<number | undefined>;
}

export interface NetworkSessionIF {
    tokenUniv: TokenIF[];
    infuraUrl: string;
    provider: Provider;
    chainId: string;
    lastBlockNumber: number;
    signer?: Signer;
    gcUrl: string;
    crocEnv: CrocEnv;
}
