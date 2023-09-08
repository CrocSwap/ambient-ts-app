import { TopPool } from '../data/defaultTopPools';
import { TokenIF } from './TokenIF';

export interface Tokens {
    ETH: string;
    USDC: string;
    USDT: string;
    DAI: string;
    UNI: string;
    WETH: string;
    WBTC: string;
    PEPE: string;
    FRAX: string;
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
    getGasPriceInGwei: () => Promise<number | undefined>;
}
