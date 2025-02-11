export interface PoolStatIF {
    baseLogoUri?: string;
    quoteLogoUri?: string;
    poolPrice?: string;
    poolPriceDisplay: number | undefined;
    isPoolInitialized: boolean | undefined;
    poolVolume?: string;
    poolVolume24h?: string;
    poolTvl?: string;
    poolFeesTotal?: string;
    poolFees24h?: string | undefined;
    poolApy?: string;
    apr?: string | undefined;
    poolAmbientAprEstimate: number | undefined;
    poolPriceChangePercent?: string;
    isPoolPriceChangePositive: boolean;

    baseTokenCharacter?: string;
    quoteTokenCharacter?: string;

    poolLink: string;

    shouldInvertDisplay?: boolean;

    baseTvlDecimal?: number;
    quoteTvlDecimal?: number;
    baseTvlUsd?: number;
    quoteTvlUsd?: number;
    feesTotalUsd?: number;
    basePrice?: number;
    quotePrice?: number;
    baseVolumeDecimal?: number;
    quoteVolumeDecimal?: number;
    baseFeeDecimal?: number;
    quoteFeeDecimal?: number;
    baseVolumeUsd?: number;
    quoteVolumeUsd?: number;
    baseFeeUsd?: number;
    quoteFeeUsd?: number;
    tvlTotalUsd?: number;
    volumeTotalUsd?: number;
    baseFdvUsd?: number;
    quoteFdvUsd?: number;
}

export interface SinglePoolDataIF {
    base: string;
    baseFees: number;
    baseTvl: number;
    baseVolume: number;
    chainId: string;
    events: number;
    feeRate: number;
    initTime: number;
    lastPriceIndic: number;
    lastPriceLiq: number;
    lastPriceSwap: number;
    latestTime: number;
    poolIdx: number;
    priceIndic24hAgo: number;
    priceLiq24hAgo: number;
    priceSwap24hAgo: number;
    baseVolume24hAgo: number;
    quoteVolume24hAgo: number;
    baseFees24hAgo: number;
    quoteFees24hAgo: number;
    quote: string;
    quoteFees: number;
    quoteTvl: number;
    quoteVolume: number;
}
