import { TokenIF } from '../token/TokenIF';

export interface PoolIF {
    name?: string;
    base: string;
    quote: string;
    baseToken: TokenIF;
    quoteToken: TokenIF;
    chainId: string;
    poolIdx: number;
    isBaseTokenMoneynessGreaterOrEqual?: boolean;
    baseFees?: number;
    baseFees24hAgo?: number;
    baseTvl?: number;
    baseUsdPrice?: number;
    baseVolume?: number;
    baseVolume24hAgo?: number;
    feeRate?: number;
    initTime?: number;
    lastPriceSwap?: number;
    priceSwap24hAgo?: number;
    quoteFees?: number;
    quoteFees24hAgo?: number;
    quoteTvl?: number;
    quoteUsdPrice?: number;
    quoteVolume?: number;
    quoteVolume24hAgo?: number;
    latestTime?: number;

    baseTvlDecimal?: number;
    quoteTvlDecimal?: number;
    baseTvlUsd?: number;
    quoteTvlUsd?: number;
    feesTotalUsd?: number;
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

    volumeChange24h?: number;
    feesChange24h?: number;

    apr?: number | undefined;

    displayPrice?: number | undefined;
    displayPriceString?: string | undefined;

    priceChange24h?: number | undefined;
    priceChangePercentString?: string | undefined;
    isPoolPriceChangePositive?: boolean | undefined;

    usdPriceMoneynessBased?: number | undefined;
}
