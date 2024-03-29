export interface LimitOrderIF {
    id: string;
    limitOrderId: string;
    pivotTime: number;
    crossTime: number;
    user: string;
    base: string;
    quote: string;
    poolIdx: number;
    curentPoolPriceDisplayNum: number;
    bidTick: number;
    askTickInvPriceDecimalCorrected: number;
    askTickPriceDecimalCorrected: number;
    bidTickInvPriceDecimalCorrected: number;
    bidTickPriceDecimalCorrected: number;
    askTick: number;
    isBid: boolean;
    positionLiq: number;
    positionLiqBase: number;
    positionLiqQuote: number;
    originalPositionLiqBase: number;
    originalPositionLiqQuote: number;
    expectedPositionLiqBase: number;
    expectedPositionLiqQuote: number;
    positionLiqBaseDecimalCorrected: number;
    positionLiqQuoteDecimalCorrected: number;
    originalPositionLiqBaseDecimalCorrected: number;
    originalPositionLiqQuoteDecimalCorrected: number;
    expectedPositionLiqBaseDecimalCorrected: number;
    expectedPositionLiqQuoteDecimalCorrected: number;
    claimableLiq: number;
    claimableLiqPivotTimes: number;
    claimableLiqBase: number;
    claimableLiqQuote: number;
    claimableLiqBaseDecimalCorrected: number;
    claimableLiqQuoteDecimalCorrected: number;
    baseSymbol: string;
    baseName: string;
    baseDecimals: number;
    baseTokenLogoURI: string;
    quoteSymbol: string;
    quoteName: string;
    quoteDecimals: number;
    quoteTokenLogoURI: string;
    limitPrice: number;
    invLimitPrice: number;
    limitPriceDecimalCorrected: number;
    invLimitPriceDecimalCorrected: number;
    ensResolution: string;
    totalValueUSD: number;
    latestUpdateTime: number;
    timeFirstMint: number;
    chainId: string;
    concLiq: number;
    rewardLiq: number;
}
