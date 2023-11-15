export interface PoolStatIF {
    baseLogoUri?: string;
    quoteLogoUri?: string;
    poolPrice?: string;
    poolVolume?: string;
    poolTvl?: string;
    poolFeesTotal?: string;
    poolApy?: string;

    poolPriceChangePercent?: string;
    isPoolPriceChangePositive?: boolean;

    baseTokenCharacter?: string;
    quoteTokenCharacter?: string;

    poolLink: string;

    shouldInvertDisplay?: boolean;

    baseTvlDecimal?: number;
    quoteTvlDecimal?: number;
    baseTvlUsd?: number;
    quoteTvlUsd?: number;
    feesTotalUsd?: number;
}
