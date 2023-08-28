export interface PoolStatIF {
    poolName?: string;
    baseLogoUri?: string;
    quoteLogoUri?: string;
    poolPrice?: string;
    poolVolume?: string;
    poolTvl?: string;
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
}
