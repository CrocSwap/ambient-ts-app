import { toDisplayQty } from '@crocswap-libs/sdk';
import { useMemo, useState } from 'react';
import { AuctionDataIF } from '../../../ambient-utils/dataLayer';

export type auctionSorts =
    | 'createdAt'
    | 'recent'
    | 'ticker'
    | 'marketCap'
    | 'timeLeft';

export interface sortDetailsIF {
    sortBy: auctionSorts;
    isReversed: boolean;
}

// interface for return value of the hook
export interface sortedAuctionsIF {
    data: AuctionDataIF[];
    active: auctionSorts;
    isReversed: boolean;
    update: (newSort: auctionSorts) => void;
    reverse: () => void;
    custom(s: auctionSorts, r: boolean): void;
}

export function useSortedAuctions(unsorted: AuctionDataIF[]): sortedAuctionsIF {
    // default sort sequence for data
    const DEFAULT_SORT: auctionSorts = 'timeLeft';

    // metadata on how data should be sorted
    const [sortDetails, setSortDetails] = useState<sortDetailsIF>({
        sortBy: DEFAULT_SORT,
        isReversed: false,
    });

    // fn to sort data by ticker (alphabetical)
    function sortByTicker(d: AuctionDataIF[]): AuctionDataIF[] {
        return [...d].sort((a: AuctionDataIF, b: AuctionDataIF) =>
            b.ticker.localeCompare(a.ticker),
        );
    }

    // fn to sort data by creation time (numerical)
    function sortByTimeRemaining(d: AuctionDataIF[]): AuctionDataIF[] {
        return [...d].sort((a: AuctionDataIF, b: AuctionDataIF) => {
            const aEndTime = a.createdAt + a.auctionLength;
            const bEndTime = b.createdAt + b.auctionLength;

            return aEndTime - bEndTime;
        });
    }

    // fn to sort by market cap (numerical)
    function sortByMarketCap(d: AuctionDataIF[]): AuctionDataIF[] {
        return [...d].sort(
            (a: AuctionDataIF, b: AuctionDataIF) =>
                parseFloat(
                    toDisplayQty(b.filledClearingPriceInNativeTokenWei, 18),
                ) -
                parseFloat(
                    toDisplayQty(a.filledClearingPriceInNativeTokenWei, 18),
                ),
        );
    }

    // fn to update which sort should be applied
    function updateSort(newSort: auctionSorts): void {
        newSort !== sortDetails.sortBy &&
            setSortDetails({
                sortBy: newSort,
                isReversed: sortDetails.isReversed,
            });
    }

    // fn to reverse or un-reverse sorted data
    function reverseSort(): void {
        setSortDetails({
            sortBy: sortDetails.sortBy,
            isReversed: !sortDetails.isReversed,
        });
    }

    // fn to allow custom sort option input
    function sortCustom(s: auctionSorts, r: boolean): void {
        setSortDetails({
            sortBy: s,
            isReversed: r,
        });
    }

    // logic router to sort data according to the indicated method
    const sortedData = useMemo<AuctionDataIF[]>(() => {
        let output: AuctionDataIF[];
        switch (sortDetails.sortBy) {
            case 'ticker':
                output = sortByTicker(unsorted);
                break;
            case 'marketCap':
                output = sortByMarketCap(unsorted);
                break;
            case 'timeLeft':
            default:
                output = sortByTimeRemaining(unsorted);
                break;
        }
        return sortDetails.isReversed ? [...output].reverse() : output;
    }, [unsorted, sortDetails]);

    // return val of hook
    return {
        data: sortedData,
        active: sortDetails.sortBy,
        isReversed: sortDetails.isReversed,
        update: updateSort,
        reverse: reverseSort,
        custom: sortCustom,
    };
}
