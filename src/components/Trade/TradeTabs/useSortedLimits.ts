import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { LimitOrderIF } from '../../../utils/interfaces/exports';
import { diffHashSig } from '../../../utils/functions/diffHashSig';

export type LimitSortType =
    | 'wallet'
    | 'walletid'
    | 'pool'
    | 'price'
    | 'value'
    | 'time'
    | 'side'
    | 'type'
    | 'default';

export const useSortedLimits = (
    defaultSort: LimitSortType,
    limitOrders: LimitOrderIF[],
): [
    LimitSortType,
    Dispatch<SetStateAction<LimitSortType>>,
    boolean,
    Dispatch<SetStateAction<boolean>>,
    LimitOrderIF[],
] => {
    // default sort function
    const sortByTime = (unsortedData: LimitOrderIF[]): LimitOrderIF[] =>
        [...unsortedData].sort((a, b) => {
            const aTime = a.latestUpdateTime || a.timeFirstMint || Date.now();
            const bTime = b.latestUpdateTime || b.timeFirstMint || Date.now();
            return bTime - aTime;
        });
    // sort by token pair
    const sortByPool = (unsortedData: LimitOrderIF[]): LimitOrderIF[] =>
        [...unsortedData].sort((a, b) => {
            const poolA = a.baseSymbol + a.quoteSymbol;
            const poolB = b.baseSymbol + b.quoteSymbol;
            return poolA.localeCompare(poolB);
        });
    const sortByWallet = (unsortedData: LimitOrderIF[]): LimitOrderIF[] =>
        [...unsortedData].sort((a, b) => {
            const usernameA: string = a.ensResolution ?? a.user;
            const usernameB: string = b.ensResolution ?? b.user;
            return usernameA.localeCompare(usernameB);
        });
    // sort by limit price
    const sortByPrice = (unsortedData: LimitOrderIF[]): LimitOrderIF[] =>
        [...unsortedData].sort((a, b) => a.limitPrice - b.limitPrice);
    // sort by value of limit order
    const sortByValue = (unsortedData: LimitOrderIF[]): LimitOrderIF[] =>
        [...unsortedData].sort((a, b) => {
            const aValue = a.totalValueUSD;
            const bValue = b.totalValueUSD;
            return bValue - aValue;
        });

    // column the user wants the table sorted by
    // this is set when the user clicks a sortable column header
    const [sortBy, setSortBy] = useState<LimitSortType>(defaultSort);
    // whether the sort should be ascending or descending
    const [reverseSort, setReverseSort] = useState<boolean>(false);

    // router to pass data through the appropriate sort function
    const sortData = (data: LimitOrderIF[]): LimitOrderIF[] => {
        // variable to hold output
        let sortedData: LimitOrderIF[];
        // router to apply a specific sort function
        switch (sortBy) {
            case 'wallet':
            case 'walletid':
                sortedData = sortByWallet(data);
                break;
            case 'pool':
                sortedData = sortByPool(data);
                break;
            case 'price':
                sortedData = sortByPrice(data);
                break;
            case 'value':
                sortedData = sortByValue(data);
                break;
            case 'time':
                sortedData = sortByTime(data);
                break;
            default:
                return sortByTime(data);
        }
        // return reversed data if user wants data reversed
        return reverseSort ? [...sortedData].reverse() : sortedData;
    };

    // Generates a fingerprint from the positions objects. Used for comparison
    // in below React hook
    const ordersHashSum = useMemo<string>(
        () => diffHashSig(limitOrders),
        [limitOrders],
    );

    // array of positions sorted by the relevant column
    const sortedLimitOrders = useMemo<LimitOrderIF[]>(
        () => sortData(limitOrders),
        [sortBy, reverseSort, ordersHashSum],
    );

    return [sortBy, setSortBy, reverseSort, setReverseSort, sortedLimitOrders];
};
