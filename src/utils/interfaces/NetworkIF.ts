import { Provider } from '@ethersproject/providers';
import { TopPool } from '../data/defaultTopPools';
import { TokenIF } from './TokenIF';

export interface NetworkIF {
    chainId: string;
    graphCacheUrl: string;
    wagmiChain: any;
    shouldPollBlock: boolean;
    marketData: string;
    defaultPair: [TokenIF, TokenIF];
    topPools: TopPool[];
    getGasPriceInGwei: (provider?: Provider) => Promise<number | undefined>;
}
