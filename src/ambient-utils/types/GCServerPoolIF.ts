export interface GCServerPoolIF {
    base: string;
    chainId: string;
    poolIdx: number;
    quote: string;
}
export interface AnalyticsServerPoolIF {
    base: string;
    chainId: string;
    poolIdx: number;
    quote: string;
    baseUsdPrice: number;
    quoteUsdPrice: number;
    lastPriceSwap: number;
    priceSwap24hAgo: number;
    baseTvl: number;
    quoteTvl: number;
    baseVolume: number;
    baseVolume24hAgo: number;
    quoteVolume: number;
    quoteVolume24hAgo: number;
    baseFees: number;
    baseFees24hAgo: number;
    quoteFees: number;
    quoteFees24hAgo: number;
    feeRate: number;
    initTime: number;
    latestTime: number;
    events: number;
}
