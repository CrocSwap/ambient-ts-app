import { Provider } from '@ethersproject/providers';
import { TopPool } from '../data/defaultTopPools';
import { TokenIF } from './TokenIF';

export interface Tokens {
    USDC?: string;
    WETH?: string;
}

export interface NetworkIF {
    chainId: string;
    wagmiChain: any;
    shouldPollBlock: boolean;
    marketData: string;
    tokens: Tokens;
    defaultPair: TokenIF[];
    topPools: TopPool[];
    stableTokens: string[];
    getGasPriceInGwei: (provider?: Provider) => Promise<number | undefined>;

    customRpc?: string;
}
