export interface LiquidityRangeIF {
    lowerBound: number;
    lowerBoundPrice: number;
    lowerBoundInvPrice: number;
    lowerBoundPriceDecimalCorrected: number;
    lowerBoundInvPriceDecimalCorrected: number;
    upperBound: number;
    upperBoundPrice: number;
    upperBoundInvPrice: number;
    upperBoundPriceDecimalCorrected: number;
    upperBoundInvPriceDecimalCorrected: number;
    activeLiq: number;
    cumAskLiq: number;
    cumBidLiq: number;
    deltaBase: number;
    deltaQuote: number;
    deltaAverageUSD: number;
    cumDeltaBase: number;
    cumDeltaQuote: number;
    cumAverageUSD: number;
}
