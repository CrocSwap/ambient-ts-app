import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { ILimitOrderState } from '../../../utils/state/graphDataSlice';

export const useSortedLimits = (
    defaultSort: string,
    positions: ILimitOrderState[]
): [
    string,
    Dispatch<SetStateAction<string>>,
    boolean,
    Dispatch<SetStateAction<boolean>>,
    ILimitOrderState[],
] => {
    // default sort function
    const sortByUpdateTime = (unsortedData: ILimitOrderState[]) =>
        [...unsortedData].sort((a, b) => b.latestUpdateTime - a.latestUpdateTime);
    // sort by wallet or ens address
    const sortByWallet = (unsortedData: ILimitOrderState[]) =>
        [...unsortedData].sort((a, b) => {
            const usernameA: string = a.ensResolution ?? a.user;
            const usernameB: string = b.ensResolution ?? b.user;
            return usernameA.localeCompare(usernameB);
        });
    // sort by limit price
    const sortByPrice = (unsortedData: ILimitOrderState[]) =>
        [...unsortedData].sort((a, b) => b.limitPrice - a.limitPrice);
    // sort by value of limit order
    const sortByValue = (unsortedData: ILimitOrderState[]) =>
        [...unsortedData].sort((a, b) => b.totalValueUSD - a.totalValueUSD);

    // column the user wants the table sorted by
    const [sortBy, setSortBy] = useState(defaultSort);
    // whether the sort should be ascending or descening
    const [reverseSort, setReverseSort] = useState(false);

    // router to pass data through the appropriate sort function
    const sortData = (data: ILimitOrderState[]) => {
        // variable to hold output
        let sortedData: ILimitOrderState[];
        // router to apply a specific sort function
        switch (sortBy) {
            // sort by wallet
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
                sortedData = sortByUpdateTime(data);
                break;
            // return data unsorted if user did not choose a sortable column
            default:
                return sortByUpdateTime(data);
        }
        // return reversed data if user wants data reversed
        return reverseSort
            ? [...sortedData].reverse()
            : sortedData;
    };

    // array of positions sorted by the relevant column
    const sortedPositions = useMemo(
        () => sortData(positions),
        [sortBy, reverseSort, positions],
    );

    return [sortBy, setSortBy, reverseSort, setReverseSort, sortedPositions];
};
