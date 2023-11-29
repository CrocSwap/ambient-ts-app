export interface CandleDataServerIF {
    priceOpen: number;
    priceClose: number;
    minPrice: number;
    maxPrice: number;
    volumeBase: number;
    volumeQuote: number;
    tvlBase: number;
    tvlQuote: number;
    feeRateOpen: number;
    feeRateClose: number;
    period: number;
    time: number;
}
