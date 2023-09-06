import { TopPool } from '../data/defaultTopPools';

interface Tokens {
    ETH: string;
    USDC: string;
    DAI: string;
    UNI: string;
    WETH: string;
    PEPE: string;
}

export interface NetworkIF {
    chain: string;
    wagmi: any;
    marketData: string;
    networkBE: string;
    tokens: Tokens;
    topPools: TopPool[];
    gasPriceInGwei: number;
    moneynessRank: Map<string, number>;
}
