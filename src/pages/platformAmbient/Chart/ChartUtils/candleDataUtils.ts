import { CandleDataIF } from '../../../../ambient-utils/types';

export function updateZeroPriceCandles(
    candles: CandleDataIF[],
    poolPriceDisplay: number,
): CandleDataIF[] {
    return candles.map((p) => {
        let openPrice = p.priceOpenDecimalCorrected;
        let closePrice = p.priceCloseDecimalCorrected;
        let maxPrice = p.maxPriceExclMEVDecimalCorrected;
        let minPrice = p.minPriceExclMEVDecimalCorrected;
        let isZeroData = false;
        if (openPrice === 0) {
            const prices = [closePrice, maxPrice, minPrice];

            const nonZeroPrices = prices.find((price) => price !== 0);
            openPrice = nonZeroPrices ? nonZeroPrices : poolPriceDisplay;
            closePrice = nonZeroPrices ? nonZeroPrices : poolPriceDisplay;
            maxPrice = nonZeroPrices ? nonZeroPrices : poolPriceDisplay;
            minPrice = nonZeroPrices ? nonZeroPrices : poolPriceDisplay;
            isZeroData = true;
        }

        return {
            ...p,
            minPriceDecimalCorrected: minPrice,
            maxPriceDecimalCorrected: maxPrice,
            priceOpenDecimalCorrected: openPrice,
            priceCloseDecimalCorrected: closePrice,
            invMinPriceDecimalCorrected: 1 / minPrice,
            invMaxPriceDecimalCorrected: 1 / maxPrice,
            invPriceOpenDecimalCorrected: 1 / openPrice,
            invPriceCloseDecimalCorrected: 1 / closePrice,
            minPriceExclMEVDecimalCorrected: minPrice,
            maxPriceExclMEVDecimalCorrected: maxPrice,
            priceOpenExclMEVDecimalCorrected: openPrice,
            priceCloseExclMEVDecimalCorrected: closePrice,
            invMinPriceExclMEVDecimalCorrected: 1 / minPrice,
            invMaxPriceExclMEVDecimalCorrected: 1 / maxPrice,
            invPriceOpenExclMEVDecimalCorrected: 1 / openPrice,
            invPriceCloseExclMEVDecimalCorrected: 1 / closePrice,
            isZeroData: isZeroData,
        };
    });
}
