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
    poolApy?: string;

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
}
