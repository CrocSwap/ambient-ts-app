import {
    fromDisplayPrice,
    toDisplayPrice,
    tickToPrice,
    GRID_SIZE_DFLT,
    MIN_TICK,
    MAX_TICK,
    // concDepositSkew,
    // liquidityForBaseQty, // sendAmbientMint,
    // liquidityForQuoteQty,
    // fromDisplayQty,
    // sendConcMint,
    // parseMintEthersReceipt,
    // EthersNativeReceipt,
    // ambientPosSlot,
    // concPosSlot,
    // approveToken,
    // contractAddresses,
} from '@crocswap-libs/sdk';

import truncateDecimals from '../../../utils/data/truncateDecimals';

export function roundDownTick(lowTick: number, nTicksGrid: number = GRID_SIZE_DFLT): number {
    const tickGrid = Math.floor(lowTick / nTicksGrid) * nTicksGrid;
    const horizon = Math.floor(MIN_TICK / nTicksGrid) * nTicksGrid;
    return Math.max(tickGrid, horizon);
}

export function roundUpTick(highTick: number, nTicksGrid: number = GRID_SIZE_DFLT): number {
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
    const pinnedLowTick = roundDownTick(minTick);

    const pinnedHighTick = roundUpTick(maxTick);

    const pinnedMinPriceNonDisplay = tickToPrice(pinnedLowTick);
    const pinnedMaxPriceNonDisplay = tickToPrice(pinnedHighTick);

    const pinnedMinPriceDisplay = isDenomInBase
        ? 1 / toDisplayPrice(pinnedMaxPriceNonDisplay, baseTokenDecimals, quoteTokenDecimals, false)
        : toDisplayPrice(pinnedMinPriceNonDisplay, baseTokenDecimals, quoteTokenDecimals, false);

    const pinnedMaxPriceDisplay = isDenomInBase
        ? 1 / toDisplayPrice(pinnedMinPriceNonDisplay, baseTokenDecimals, quoteTokenDecimals, false)
        : toDisplayPrice(pinnedMaxPriceNonDisplay, baseTokenDecimals, quoteTokenDecimals, false);

    const pinnedMinPriceDisplayTruncated =
        pinnedMinPriceDisplay < 2
            ? truncateDecimals(pinnedMinPriceDisplay, 4).toString()
            : truncateDecimals(pinnedMinPriceDisplay, 0).toString();

    const pinnedMaxPriceDisplayTruncated =
        pinnedMaxPriceDisplay < 2
            ? truncateDecimals(pinnedMaxPriceDisplay, 4).toString()
            : truncateDecimals(pinnedMaxPriceDisplay, 0).toString();

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

export function getPinnedPriceValuesFromDisplayPrices(
    isDenomInBase: boolean,
    baseTokenDecimals: number,
    quoteTokenDecimals: number,
    minPriceDisplayString: string,
    maxPriceDisplayString: string,
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
        ? fromDisplayPrice(1 / maxPriceDisplayNum, baseTokenDecimals, quoteTokenDecimals)
        : fromDisplayPrice(minPriceDisplayNum, baseTokenDecimals, quoteTokenDecimals);

    const maxPriceNonDisplayNum = isDenomInBase
        ? fromDisplayPrice(1 / minPriceDisplayNum, baseTokenDecimals, quoteTokenDecimals)
        : fromDisplayPrice(maxPriceDisplayNum, baseTokenDecimals, quoteTokenDecimals);

    const lowTickExact = Math.log(minPriceNonDisplayNum) / Math.log(1.0001);
    const highTickExact = Math.log(maxPriceNonDisplayNum) / Math.log(1.0001);

    const pinnedLowTick = roundDownTick(lowTickExact);

    const pinnedHighTick = roundUpTick(highTickExact);

    const pinnedMinPriceNonDisplay = tickToPrice(pinnedLowTick);
    const pinnedMaxPriceNonDisplay = tickToPrice(pinnedHighTick);

    const pinnedMinPriceDisplay = isDenomInBase
        ? 1 / toDisplayPrice(pinnedMaxPriceNonDisplay, baseTokenDecimals, quoteTokenDecimals, false)
        : toDisplayPrice(pinnedMinPriceNonDisplay, baseTokenDecimals, quoteTokenDecimals, false);

    const pinnedMaxPriceDisplay = isDenomInBase
        ? 1 / toDisplayPrice(pinnedMinPriceNonDisplay, baseTokenDecimals, quoteTokenDecimals, false)
        : toDisplayPrice(pinnedMaxPriceNonDisplay, baseTokenDecimals, quoteTokenDecimals, false);

    const pinnedMinPriceDisplayTruncated =
        pinnedMinPriceDisplay < 2
            ? truncateDecimals(pinnedMinPriceDisplay, 4).toString()
            : truncateDecimals(pinnedMinPriceDisplay, 0).toString();
    const pinnedMaxPriceDisplayTruncated =
        pinnedMaxPriceDisplay < 2
            ? truncateDecimals(pinnedMaxPriceDisplay, 4).toString()
            : truncateDecimals(pinnedMaxPriceDisplay, 0).toString();

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
