export interface TempPoolIF {
    base: string;
    baseDecimals: number;
    baseSymbol: string;
    chainId: string;
    poolIdx: number;
    quote: string;
    quoteDecimals: number;
    quoteSymbol: string;
}

export interface TempPoolServerIF {
    base: string;
    chainId: string;
    poolIdx: number;
    quote: string;
}
