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
    const truncPrice = truncateDecimals(rawPrice, 4);
    return truncPrice;
}
