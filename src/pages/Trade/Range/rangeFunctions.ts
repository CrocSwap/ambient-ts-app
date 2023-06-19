import {
    fromDisplayPrice,
    toDisplayPrice,
    tickToPrice,
    MIN_TICK,
    MAX_TICK,
} from '@crocswap-libs/sdk';

import truncateDecimals from '../../../utils/data/truncateDecimals';
import { formatAmountOld } from '../../../utils/numbers';

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

    const lowPriceDisplayTruncated =
        lowPriceDisplay < 0.0001
            ? lowPriceDisplay.toExponential(2)
            : lowPriceDisplay < 2
            ? lowPriceDisplay > 0.1
                ? truncateDecimals(lowPriceDisplay, 4)
                : truncateDecimals(lowPriceDisplay, 6)
            : truncateDecimals(lowPriceDisplay, 2);

    const highPriceDisplayTruncated =
        highPriceDisplay < 0.0001
            ? highPriceDisplay.toExponential(2)
            : highPriceDisplay < 2
            ? highPriceDisplay > 0.1
                ? truncateDecimals(highPriceDisplay, 4)
                : truncateDecimals(highPriceDisplay, 6)
            : truncateDecimals(highPriceDisplay, 2);

    const lowPriceDisplayTruncatedWithCommas: string = !lowPriceDisplay
        ? ''
        : lowPriceDisplay < 0.0001
        ? lowPriceDisplay.toExponential(2)
        : lowPriceDisplay < 2
        ? lowPriceDisplay.toPrecision(3)
        : lowPriceDisplay >= 100000
        ? formatAmountOld(lowPriceDisplay, 1)
        : lowPriceDisplay.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });

    const highPriceDisplayTruncatedWithCommas: string = !highPriceDisplay
        ? ''
        : highPriceDisplay < 0.0001
        ? highPriceDisplay.toExponential(2)
        : highPriceDisplay < 2
        ? highPriceDisplay.toPrecision(3)
        : highPriceDisplay >= 100000
        ? formatAmountOld(highPriceDisplay, 1)
        : highPriceDisplay.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
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
        pinnedMinPriceDisplay < 2
            ? pinnedMinPriceDisplay > 0.1
                ? truncateDecimals(pinnedMinPriceDisplay, 4).toString()
                : truncateDecimals(pinnedMinPriceDisplay, 6).toString()
            : truncateDecimals(pinnedMinPriceDisplay, 2).toString();
    const pinnedMaxPriceDisplayTruncated =
        pinnedMaxPriceDisplay < 2
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
