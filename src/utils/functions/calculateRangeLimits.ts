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

    const rangeLowBoundTick = currentPoolPriceTick - rangeWidthPercentage * 100;
    const rangeHighBoundTick = currentPoolPriceTick + rangeWidthPercentage * 100;

    const rangeLowBoundNonDisplayPrice = tickToPrice(rangeLowBoundTick);
    const rangeHighBoundNonDisplayPrice = tickToPrice(rangeHighBoundTick);

    const pinnedRangeLowBoundNonDisplayPrice = pinTickLower(rangeLowBoundNonDisplayPrice);
    const pinnedRangeHighBoundNonDisplayPrice = pinTickUpper(rangeHighBoundNonDisplayPrice);

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
        rangeLowBoundTick: rangeLowBoundTick,
        pinnedRangeHighBoundNonDisplayPrice: pinnedRangeHighBoundNonDisplayPrice,
        pinnedRangeHighBoundDisplayPrice: pinnedRangeHighBoundDisplayPrice,
        rangeHighBoundTick: rangeHighBoundTick,
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
        ? fromDisplayPrice(rangeLowBoundDisplayPrice, baseDecimals, quoteDecimals)
        : fromDisplayPrice(rangeHighBoundDisplayPrice, baseDecimals, quoteDecimals);

    const pinnedRangeLowBoundNonDisplayPrice = areBoundsPinnedToTick
        ? rangeLowBoundNonDisplayPrice
        : pinTickLower(rangeLowBoundNonDisplayPrice);

    const rangeHighBoundNonDisplayPrice = isDenominationInBase
        ? fromDisplayPrice(rangeHighBoundDisplayPrice, baseDecimals, quoteDecimals)
        : fromDisplayPrice(rangeLowBoundDisplayPrice, baseDecimals, quoteDecimals);

    const pinnedRangeHighBoundNonDisplayPrice = areBoundsPinnedToTick
        ? rangeHighBoundNonDisplayPrice
        : pinTickUpper(rangeHighBoundNonDisplayPrice);

    const rangeLowBoundTick = Math.log(pinnedRangeLowBoundNonDisplayPrice) / Math.log(1.0001);
    const rangeHighBoundTick = Math.log(pinnedRangeHighBoundNonDisplayPrice) / Math.log(1.0001);

    const pinnedRangeLowBoundDisplayPrice = areBoundsPinnedToTick
        ? rangeLowBoundDisplayPrice
        : toDisplayPrice(pinnedRangeLowBoundNonDisplayPrice, baseDecimals, quoteDecimals);

    const pinnedRangeHighBoundDisplayPrice = areBoundsPinnedToTick
        ? rangeHighBoundDisplayPrice
        : toDisplayPrice(pinnedRangeHighBoundNonDisplayPrice, baseDecimals, quoteDecimals);

    const rangeLimits = {
        pinnedRangeLowBoundNonDisplayPrice: pinnedRangeLowBoundNonDisplayPrice,
        pinnedRangeLowBoundDisplayPrice: pinnedRangeLowBoundDisplayPrice,
        rangeLowBoundTick: rangeLowBoundTick,
        pinnedRangeHighBoundNonDisplayPrice: pinnedRangeHighBoundNonDisplayPrice,
        pinnedRangeHighBoundDisplayPrice: pinnedRangeHighBoundDisplayPrice,
        rangeHighBoundTick: rangeHighBoundTick,
    };

    return rangeLimits;
};
