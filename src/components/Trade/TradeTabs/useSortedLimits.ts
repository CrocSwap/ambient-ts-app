import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { LimitOrderIF } from '../../../utils/interfaces/exports';
import { diffHashSig } from '../../../utils/functions/diffHashSig';

export const useSortedLimits = (
    defaultSort: string,
    limitOrders: LimitOrderIF[],
): [
    string,
    Dispatch<SetStateAction<string>>,
    boolean,
    Dispatch<SetStateAction<boolean>>,
    LimitOrderIF[],
] => {
    // default sort function

    const sortByTime = (unsortedData: LimitOrderIF[]) =>
        [...unsortedData].sort((a, b) => {
            const aTime = a.latestUpdateTime || a.timeFirstMint || Date.now();
            const bTime = b.latestUpdateTime || b.timeFirstMint || Date.now();
            return bTime - aTime;
        });
    // sort by token pair
    const sortByPool = (unsortedData: LimitOrderIF[]) =>
        [...unsortedData].sort((a, b) => {
            const poolA = a.baseSymbol + a.quoteSymbol;
            const poolB = b.baseSymbol + b.quoteSymbol;
            return poolA.localeCompare(poolB);
        });
    const sortByWallet = (unsortedData: LimitOrderIF[]) =>
        [...unsortedData].sort((a, b) => {
            const usernameA: string = a.ensResolution ?? a.user;
            const usernameB: string = b.ensResolution ?? b.user;
            return usernameA.localeCompare(usernameB);
        });
    // sort by limit price
    const sortByPrice = (unsortedData: LimitOrderIF[]) =>
        [...unsortedData].sort((a, b) => a.limitPrice - b.limitPrice);
    // sort by value of limit order
    const sortByValue = (unsortedData: LimitOrderIF[]) =>
        [...unsortedData].sort((a, b) => {
            const aValue =
                a.claimableLiqTotalUSD !== 0
                    ? a.claimableLiqTotalUSD
                    : a.totalValueUSD;
            const bValue =
                b.claimableLiqTotalUSD !== 0
                    ? b.claimableLiqTotalUSD
                    : b.totalValueUSD;
            return bValue - aValue;
        });

    // column the user wants the table sorted by
    // this is set when the user clicks a sortable column header
    const [sortBy, setSortBy] = useState(defaultSort);
    // whether the sort should be ascending or descending
    const [reverseSort, setReverseSort] = useState(false);

    // router to pass data through the appropriate sort function
    const sortData = (data: LimitOrderIF[]) => {
        // variable to hold output
        let sortedData: LimitOrderIF[];
        // router to apply a specific sort function
        switch (sortBy) {
            case 'wallet':
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
    const ordersHashSum = useMemo(
        () => diffHashSig(limitOrders),
        [limitOrders],
    );

    // array of positions sorted by the relevant column
    const sortedLimitOrders = useMemo(
        () => sortData(limitOrders),
        [sortBy, reverseSort, ordersHashSum],
    );

    return [sortBy, setSortBy, reverseSort, setReverseSort, sortedLimitOrders];
};
