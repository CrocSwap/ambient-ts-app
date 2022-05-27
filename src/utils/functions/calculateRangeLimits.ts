import {
    fromDisplayPrice,
    pinTickLower,
    pinTickUpper,
    tickToPrice,
    toDisplayPrice,
} from '@crocswap-libs/sdk';

export const calculateRangeLimitsSimple = (
    poolPriceNonDisplay: number,
    rangeWidthPercentage: number,
    baseDecimals: number,
    quoteDecimals: number,
) => {
    const currentPoolPriceTick = Math.log(poolPriceNonDisplay) / Math.log(1.0001);

    const unpinnedRangeLowBoundTick = currentPoolPriceTick - rangeWidthPercentage * 100;
    const unpinnedRangeHighBoundTick = currentPoolPriceTick + rangeWidthPercentage * 100;

    const rangeLowBoundNonDisplayPrice = tickToPrice(unpinnedRangeLowBoundTick);
    const rangeHighBoundNonDisplayPrice = tickToPrice(unpinnedRangeHighBoundTick);

    const pinnedRangeLowBoundNonDisplayPrice = pinTickLower(rangeLowBoundNonDisplayPrice);
    const pinnedRangeHighBoundNonDisplayPrice = pinTickUpper(rangeHighBoundNonDisplayPrice);

    const pinnedRangeLowBoundTick = pinTickLower(pinnedRangeLowBoundNonDisplayPrice);
    const pinnedRangeHighBoundTick = pinTickLower(pinnedRangeHighBoundNonDisplayPrice);

    const pinnedRangeLowBoundDisplayPrice = toDisplayPrice(
        pinnedRangeLowBoundNonDisplayPrice,
        baseDecimals,
        quoteDecimals,
    );

    const pinnedRangeHighBoundDisplayPrice = toDisplayPrice(
        pinnedRangeHighBoundNonDisplayPrice,
        baseDecimals,
        quoteDecimals,
    );

    const rangeLimits = {
        pinnedRangeLowBoundNonDisplayPrice: pinnedRangeLowBoundNonDisplayPrice,
        pinnedRangeLowBoundDisplayPrice: pinnedRangeLowBoundDisplayPrice,
        pinnedRangeLowBoundTick: pinnedRangeLowBoundTick,
        pinnedRangeHighBoundNonDisplayPrice: pinnedRangeHighBoundNonDisplayPrice,
        pinnedRangeHighBoundDisplayPrice: pinnedRangeHighBoundDisplayPrice,
        pinnedRangeHighBoundTick: pinnedRangeHighBoundTick,
    };

    return rangeLimits;
};

export const calculateRangeLimitsAdvanced = (
    rangeLowBoundDisplayPriceString: string,
    rangeHowBoundDisplayPriceString: string,
    areBoundsPinnedToTick: boolean,
    isDenominationInBase: boolean,
    baseDecimals: number,
    quoteDecimals: number,
) => {
    const rangeLowBoundDisplayPrice = parseFloat(rangeLowBoundDisplayPriceString);
    const rangeHighBoundDisplayPrice = parseFloat(rangeHowBoundDisplayPriceString);

    const rangeLowBoundNonDisplayPrice = isDenominationInBase
        ? fromDisplayPrice(rangeLowBoundDisplayPrice, baseDecimals, quoteDecimals, false)
        : fromDisplayPrice(rangeHighBoundDisplayPrice, baseDecimals, quoteDecimals, true);

    const pinnedRangeLowBoundNonDisplayPrice = areBoundsPinnedToTick
        ? rangeLowBoundNonDisplayPrice
        : pinTickLower(rangeLowBoundNonDisplayPrice);

    const rangeHighBoundNonDisplayPrice = isDenominationInBase
        ? fromDisplayPrice(rangeHighBoundDisplayPrice, baseDecimals, quoteDecimals, false)
        : fromDisplayPrice(rangeLowBoundDisplayPrice, baseDecimals, quoteDecimals, true);

    const pinnedRangeHighBoundNonDisplayPrice = areBoundsPinnedToTick
        ? rangeHighBoundNonDisplayPrice
        : pinTickUpper(rangeHighBoundNonDisplayPrice);

    const pinnedRangeLowBoundTick = Math.log(pinnedRangeLowBoundNonDisplayPrice) / Math.log(1.0001);
    const pinnedRangeHighBoundTick =
        Math.log(pinnedRangeHighBoundNonDisplayPrice) / Math.log(1.0001);

    const pinnedRangeLowBoundDisplayPrice = areBoundsPinnedToTick
        ? rangeLowBoundDisplayPrice
        : toDisplayPrice(pinnedRangeLowBoundNonDisplayPrice, baseDecimals, quoteDecimals);

    const pinnedRangeHighBoundDisplayPrice = areBoundsPinnedToTick
        ? rangeHighBoundDisplayPrice
        : toDisplayPrice(pinnedRangeHighBoundNonDisplayPrice, baseDecimals, quoteDecimals);

    const rangeLimits = {
        pinnedRangeLowBoundNonDisplayPrice: pinnedRangeLowBoundNonDisplayPrice,
        pinnedRangeLowBoundDisplayPrice: pinnedRangeLowBoundDisplayPrice,
        pinnedRangeLowBoundTick: pinnedRangeLowBoundTick,
        pinnedRangeHighBoundNonDisplayPrice: pinnedRangeHighBoundNonDisplayPrice,
        pinnedRangeHighBoundDisplayPrice: pinnedRangeHighBoundDisplayPrice,
        pinnedRangeHighBoundTick: pinnedRangeHighBoundTick,
    };

    return rangeLimits;
};
