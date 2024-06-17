import { useRef, useState } from 'react';
import { auctionDataIF } from '../mockAuctionData';

export type auctionSorts = 'recent' | 'ticker' | 'marketCap' | 'timeLeft';
export interface sortDetailsIF {
    sortBy: auctionSorts;
    isReversed: boolean;
}
export interface sortByIF {
    method: auctionSorts;
    reverse: boolean;
}
export interface sortedAuctionsIF {
    data: auctionDataIF[];
    update: (sortType: auctionSorts) => void;
}

export function useSortedAuctions(unsorted: auctionDataIF[]) {
    const [sorted, setSorted] = useState<auctionDataIF[]>(unsorted);

    const DEFAULT_SORT: auctionSorts = 'recent';
    const sortDetails = useRef<sortDetailsIF>({
        sortBy: DEFAULT_SORT,
        isReversed: false,
    });

    function sortByTicker(d: auctionDataIF[]): auctionDataIF[] {
        return d.sort((a: auctionDataIF, b: auctionDataIF) =>
            b.ticker.localeCompare(a.ticker),
        );
    }

    function sortByMarketCap(d: auctionDataIF[]): auctionDataIF[] {
        console.log('sorting by market cap');
        return d.sort(
            (a: auctionDataIF, b: auctionDataIF) => b.marketCap - a.marketCap,
        );
    }

    function updateSort(sortType: auctionSorts): void {
        const isNewSortType: boolean = sortType !== sortDetails.current.sortBy;
        let newlySortedData: auctionDataIF[];
        if (isNewSortType) {
            sortDetails.current.sortBy = sortType;
            switch (sortType) {
                case 'ticker':
                    newlySortedData = sortByTicker(unsorted);
                    break;
                case 'marketCap':
                    newlySortedData = sortByMarketCap(unsorted);
                    break;
                default:
                    newlySortedData = unsorted;
                    break;
            }
        } else {
            sortDetails.current.isReversed = !sortDetails.current.isReversed;
            newlySortedData = [...sorted].reverse();
        }
        setSorted(newlySortedData);
    }

    return {
        data: sorted,
        update: updateSort,
    };
}
