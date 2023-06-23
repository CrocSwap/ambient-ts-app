import {
    fromDisplayPrice,
    toDisplayPrice,
    tickToPrice,
    MIN_TICK,
    MAX_TICK,
} from '@crocswap-libs/sdk';

import truncateDecimals from '../../../utils/data/truncateDecimals';
import { getFormattedNumber } from '../../../App/functions/getFormattedNumber';

export function roundDownTick(lowTick: number, nTicksGrid: number): number {
    const tickGrid = Math.floor(lowTick / nTicksGrid) * nTicksGrid;
    const horizon = Math.floor(MIN_TICK / nTicksGrid) * nTicksGrid;
    return Math.max(tickGrid, horizon);
}

export function roundUpTick(highTick: number, nTicksGrid: number): number {
    const tickGrid = Math.ceil(highTick / nTicksGrid) * nTicksGrid;
    const horizon = Math.ceil(MAX_TICK / nTicksGrid) * nTicksGrid;
    return Math.min(tickGrid, horizon);
}

export function getPinnedPriceValuesFromTicks(
    isDenomInBase: boolean,
    baseTokenDecimals: number,
    quoteTokenDecimals: number,
    minTick: number,
    maxTick: number,
    gridSize: number,
): {
    pinnedMinPriceDisplay: string;
    pinnedMaxPriceDisplay: string;
    pinnedMinPriceDisplayTruncated: string;
    pinnedMaxPriceDisplayTruncated: string;
    pinnedMinPriceDisplayTruncatedWithCommas: string;
    pinnedMaxPriceDisplayTruncatedWithCommas: string;
    pinnedLowTick: number;
    pinnedHighTick: number;
    pinnedMinPriceNonDisplay: number;
    pinnedMaxPriceNonDisplay: number;
} {
    const pinnedLowTick = roundDownTick(minTick, gridSize);

    const pinnedHighTick = roundUpTick(maxTick, gridSize);

    const pinnedMinPriceNonDisplay = tickToPrice(pinnedLowTick);
    const pinnedMaxPriceNonDisplay = tickToPrice(pinnedHighTick);

    const lowPriceDisplayInQuote = toDisplayPrice(
        pinnedMinPriceNonDisplay,
        baseTokenDecimals,
        quoteTokenDecimals,
    );

    const highPriceDisplayInQuote = toDisplayPrice(
        pinnedMaxPriceNonDisplay,
        baseTokenDecimals,
        quoteTokenDecimals,
    );
    const lowPriceDisplayInBase = 1 / highPriceDisplayInQuote;
    const highPriceDisplayInBase = 1 / lowPriceDisplayInQuote;

    const lowPriceDisplay = isDenomInBase
        ? lowPriceDisplayInBase
        : lowPriceDisplayInQuote;
    const highPriceDisplay = isDenomInBase
        ? highPriceDisplayInBase
        : highPriceDisplayInQuote;

    const lowPriceDisplayTruncated = getFormattedNumber({
        value: lowPriceDisplay,
    });
    const highPriceDisplayTruncated = getFormattedNumber({
        value: highPriceDisplay,
    });

    const lowPriceDisplayTruncatedWithCommas = getFormattedNumber({
        value: lowPriceDisplay,
        nullDisplay: '',
    });
    const highPriceDisplayTruncatedWithCommas = getFormattedNumber({
        value: highPriceDisplay,
        nullDisplay: '',
    });

    return {
        pinnedMinPriceDisplay: lowPriceDisplay.toString(),
        pinnedMaxPriceDisplay: highPriceDisplay.toString(),
        pinnedMinPriceDisplayTruncated: lowPriceDisplayTruncated,
        pinnedMaxPriceDisplayTruncated: highPriceDisplayTruncated,
        pinnedMinPriceDisplayTruncatedWithCommas:
            lowPriceDisplayTruncatedWithCommas,
        pinnedMaxPriceDisplayTruncatedWithCommas:
            highPriceDisplayTruncatedWithCommas,
        pinnedLowTick: pinnedLowTick,
        pinnedHighTick: pinnedHighTick,
        pinnedMinPriceNonDisplay: pinnedMinPriceNonDisplay,
        pinnedMaxPriceNonDisplay: pinnedMaxPriceNonDisplay,
    };
}

export function getPinnedTickFromDisplayPrice(
    isDenomInBase: boolean,
    baseTokenDecimals: number,
    quoteTokenDecimals: number,
    isMinPrice: boolean,
    priceDisplayString: string,
    gridSize: number,
): number {
    const priceDisplayNum = parseFloat(priceDisplayString);
    let priceNonDisplayNum, pinnedTick;
    if (isDenomInBase) {
        priceNonDisplayNum = fromDisplayPrice(
            1 / priceDisplayNum,
            baseTokenDecimals,
            quoteTokenDecimals,
        );
        const tickExact = Math.log(priceNonDisplayNum) / Math.log(1.0001);
        if (isMinPrice) {
            pinnedTick = roundDownTick(tickExact, gridSize);
        } else {
            pinnedTick = roundUpTick(tickExact, gridSize);
        }
    } else {
        priceNonDisplayNum = fromDisplayPrice(
            priceDisplayNum,
            baseTokenDecimals,
            quoteTokenDecimals,
        );
        const tickExact = Math.log(priceNonDisplayNum) / Math.log(1.0001);
        if (isMinPrice) {
            pinnedTick = roundDownTick(tickExact, gridSize);
        } else {
            pinnedTick = roundUpTick(tickExact, gridSize);
        }
    }
    return pinnedTick;
}

export function getPinnedPriceValuesFromDisplayPrices(
    isDenomInBase: boolean,
    baseTokenDecimals: number,
    quoteTokenDecimals: number,
    minPriceDisplayString: string,
    maxPriceDisplayString: string,
    gridSize: number,
): {
    pinnedMinPriceDisplay: string;
    pinnedMaxPriceDisplay: string;
    pinnedMinPriceDisplayTruncated: string;
    pinnedMaxPriceDisplayTruncated: string;
    pinnedLowTick: number;
    pinnedHighTick: number;
    pinnedMinPriceNonDisplay: number;
    pinnedMaxPriceNonDisplay: number;
} {
    const minPriceDisplayNum = parseFloat(minPriceDisplayString);
    const maxPriceDisplayNum = parseFloat(maxPriceDisplayString);

    const minPriceNonDisplayNum = isDenomInBase
        ? fromDisplayPrice(
              1 / maxPriceDisplayNum,
              baseTokenDecimals,
              quoteTokenDecimals,
          )
        : fromDisplayPrice(
              minPriceDisplayNum,
              baseTokenDecimals,
              quoteTokenDecimals,
          );

    const maxPriceNonDisplayNum = isDenomInBase
        ? fromDisplayPrice(
              1 / minPriceDisplayNum,
              baseTokenDecimals,
              quoteTokenDecimals,
          )
        : fromDisplayPrice(
              maxPriceDisplayNum,
              baseTokenDecimals,
              quoteTokenDecimals,
          );

    const lowTickExact = Math.log(minPriceNonDisplayNum) / Math.log(1.0001);
    const highTickExact = Math.log(maxPriceNonDisplayNum) / Math.log(1.0001);

    const pinnedLowTick = roundDownTick(lowTickExact, gridSize);

    const pinnedHighTick = roundUpTick(highTickExact, gridSize);

    const pinnedMinPriceNonDisplay = tickToPrice(pinnedLowTick);
    const pinnedMaxPriceNonDisplay = tickToPrice(pinnedHighTick);

    const pinnedMinPriceDisplay = isDenomInBase
        ? 1 /
          toDisplayPrice(
              pinnedMaxPriceNonDisplay,
              baseTokenDecimals,
              quoteTokenDecimals,
              false,
          )
        : toDisplayPrice(
              pinnedMinPriceNonDisplay,
              baseTokenDecimals,
              quoteTokenDecimals,
              false,
          );

    const pinnedMaxPriceDisplay = isDenomInBase
        ? 1 /
          toDisplayPrice(
              pinnedMinPriceNonDisplay,
              baseTokenDecimals,
              quoteTokenDecimals,
              false,
          )
        : toDisplayPrice(
              pinnedMaxPriceNonDisplay,
              baseTokenDecimals,
              quoteTokenDecimals,
              false,
          );

    const pinnedMinPriceDisplayTruncated =
        pinnedMinPriceDisplay < 0.0001
            ? pinnedMinPriceDisplay.toExponential(2)
            : pinnedMinPriceDisplay < 2
            ? pinnedMinPriceDisplay > 0.1
                ? truncateDecimals(pinnedMinPriceDisplay, 4).toString()
                : truncateDecimals(pinnedMinPriceDisplay, 6).toString()
            : truncateDecimals(pinnedMinPriceDisplay, 2).toString();
    const pinnedMaxPriceDisplayTruncated =
        pinnedMaxPriceDisplay < 0.0001
            ? pinnedMaxPriceDisplay.toExponential(2)
            : pinnedMaxPriceDisplay < 2
            ? pinnedMinPriceDisplay > 0.1
                ? truncateDecimals(pinnedMaxPriceDisplay, 4).toString()
                : truncateDecimals(pinnedMaxPriceDisplay, 6).toString()
            : truncateDecimals(pinnedMaxPriceDisplay, 2).toString();

    return {
        pinnedMinPriceDisplay: pinnedMinPriceDisplay.toString(),
        pinnedMaxPriceDisplay: pinnedMaxPriceDisplay.toString(),
        pinnedMinPriceDisplayTruncated: pinnedMinPriceDisplayTruncated,
        pinnedMaxPriceDisplayTruncated: pinnedMaxPriceDisplayTruncated,
        pinnedLowTick: pinnedLowTick,
        pinnedHighTick: pinnedHighTick,
        pinnedMinPriceNonDisplay: pinnedMinPriceNonDisplay,
        pinnedMaxPriceNonDisplay: pinnedMaxPriceNonDisplay,
    };
}
