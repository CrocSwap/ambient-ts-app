import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { LimitOrderIF } from '../../../utils/interfaces/LimitOrderIF';

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
    const sortByUpdateTime = (unsortedData: LimitOrderIF[]) =>
        [...unsortedData].sort((a, b) => b.latestUpdateTime - a.latestUpdateTime);
    // sort by wallet or ens address
    const sortByWallet = (unsortedData: LimitOrderIF[]) =>
        [...unsortedData].sort((a, b) => {
            const usernameA: string = a.ensResolution ?? a.user;
            const usernameB: string = b.ensResolution ?? b.user;
            return usernameA.localeCompare(usernameB);
        });
    // sort by limit price
    const sortByPrice = (unsortedData: LimitOrderIF[]) =>
        [...unsortedData].sort((a, b) => b.limitPrice - a.limitPrice);
    // sort by value of limit order
    const sortByValue = (unsortedData: LimitOrderIF[]) =>
        [...unsortedData].sort((a, b) => b.totalValueUSD - a.totalValueUSD);

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
            case 'price':
                sortedData = sortByPrice(data);
                break;
            case 'value':
                sortedData = sortByValue(data);
                break;
            case 'lastUpdate':
            default:
                return sortByUpdateTime(data);
        }
        // return reversed data if user wants data reversed
        return reverseSort ? [...sortedData].reverse() : sortedData;
    };

    // array of positions sorted by the relevant column
    const sortedLimitOrders = useMemo(
        () => sortData(limitOrders),
        [sortBy, reverseSort, limitOrders],
    );

    return [sortBy, setSortBy, reverseSort, setReverseSort, sortedLimitOrders];
};
