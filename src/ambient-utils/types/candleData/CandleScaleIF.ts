export interface CandleScaleIF {
    lastCandleDate: number | undefined;
    nCandles: number;
    isFetchForTimeframe: boolean;
    isShowLatestCandle: boolean;
    isFetchFirst200Candle: boolean;
}
