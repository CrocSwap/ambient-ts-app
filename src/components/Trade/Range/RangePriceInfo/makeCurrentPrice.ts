import truncateDecimals from '../../../../utils/data/truncateDecimals';

export default function makeCurrentPrice(spotPrice: number, didUserFlipDenom: boolean) {
    const rawPrice =
        spotPrice < 1
            ? !didUserFlipDenom
                ? 1 / spotPrice
                : spotPrice
            : !didUserFlipDenom
            ? spotPrice
            : 1 / spotPrice;
    const truncPrice = rawPrice < 2 ? truncateDecimals(rawPrice, 6) : truncateDecimals(rawPrice, 2);
    return truncPrice;
}
