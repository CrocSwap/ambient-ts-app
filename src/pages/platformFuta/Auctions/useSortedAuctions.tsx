import { useMemo, useState } from 'react';
import { AuctionDataIF } from '../../../contexts/AuctionsContext';

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

export interface sortedAuctionsIF {
    data: AuctionDataIF[];
    active: auctionSorts;
    isReversed: boolean;
    update: (newSort: auctionSorts) => void;
    reverse: () => void;
}

export function useSortedAuctions(unsorted: AuctionDataIF[]) {
    const DEFAULT_SORT: auctionSorts = 'recent';

    const [sortDetails, setSortDetails] = useState<sortDetailsIF>({
        sortBy: DEFAULT_SORT,
        isReversed: false,
    });

    function sortByTicker(d: AuctionDataIF[]): AuctionDataIF[] {
        return [...d].sort((a: AuctionDataIF, b: AuctionDataIF) =>
            b.ticker.localeCompare(a.ticker),
        );
    }

    function sortByCreationTime(d: AuctionDataIF[]): AuctionDataIF[] {
        return d;
    }

    function sortByMarketCap(d: AuctionDataIF[]): AuctionDataIF[] {
        return [...d].sort(
            (a: AuctionDataIF, b: AuctionDataIF) => b.marketCap - a.marketCap,
        );
    }

    function updateSort(newSort: auctionSorts): void {
        newSort !== sortDetails.sortBy &&
            setSortDetails({
                sortBy: newSort,
                isReversed: sortDetails.isReversed,
            });
    }

    function reverseSort(): void {
        setSortDetails({
            sortBy: sortDetails.sortBy,
            isReversed: !sortDetails.isReversed,
        });
    }

    const sortedData = useMemo<AuctionDataIF[]>(() => {
        let output: AuctionDataIF[];
        switch (sortDetails.sortBy) {
            case 'ticker':
                output = sortByTicker(unsorted);
                break;
            case 'marketCap':
                output = sortByMarketCap(unsorted);
                break;
            case 'createdAt':
            default:
                output = sortByCreationTime(unsorted);
                break;
        }
        return sortDetails.isReversed ? [...output].reverse() : output;
    }, [unsorted, sortDetails]);

    return {
        data: sortedData,
        active: sortDetails.sortBy,
        isReversed: sortDetails.isReversed,
        update: updateSort,
        reverse: reverseSort,
    };
}
