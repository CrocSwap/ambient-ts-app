import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { PositionIF } from '../../../../utils/interfaces/PositionIF';

export const useSortedPositions = (
    isShowAllEnabled: boolean,
    userPositions: PositionIF[],
    poolPositions: PositionIF[],
): [
    string,
    Dispatch<SetStateAction<string>>,
    boolean,
    Dispatch<SetStateAction<boolean>>,
    PositionIF[],
] => {
    // function to reverse an array of postion objects
    // we can't use .reverse() bc it sorts an array in place
    function reverseArray(inputArray: PositionIF[]) {
        const outputArray: PositionIF[] = [];
        inputArray.forEach((elem) => outputArray.unshift(elem));
        return outputArray;
    }

    // default sort function
    const sortByUpdateTime = (unsortedData: PositionIF[]) =>
        [...unsortedData].sort((a, b) => b.latestUpdateTime - a.latestUpdateTime);
    // sort functions for sortable columns
    const sortByWallet = (unsortedData: PositionIF[]) =>
        [...unsortedData].sort((a, b) => a.user.localeCompare(b.user));
    const sortByApy = (unsortedData: PositionIF[]) =>
        [...unsortedData].sort((a, b) => b.apy - a.apy);
    const sortByValue = (unsortedData: PositionIF[]) =>
        [...unsortedData].sort((a, b) => b.positionLiqTotalUSD - a.positionLiqTotalUSD);

    // column the user wants the table sorted by
    const [sortBy, setSortBy] = useState('default');
    // whether the sort should be ascending or descening
    const [reverseSort, setReverseSort] = useState(false);

    // router to pass data through the appropriate sort function
    const sortData = (data: PositionIF[]) => {
        // variable to hold output
        let sortedData: PositionIF[];
        // router to apply a specific sort function
        switch (sortBy) {
            // sort by wallet
            case 'wallet':
                sortedData = sortByWallet(data);
                break;
            // sort by APR
            case 'apy':
                sortedData = sortByApy(data);
                break;
            case 'apr':
                sortedData = sortByApy(data);
                break;
            case 'value':
                sortedData = sortByValue(data);
                break;
            // return data unsorted if user did not choose a sortable column
            default:
                return sortByUpdateTime(data);
        }
        // return reversed data if user wants data reversed
        return reverseSort ? reverseArray(sortedData) : sortedData;
    };

    // TODO: new user positions reset table sort, new pool positions retains sort

    // array of positions sorted by the relevant column
    const sortedPositions = useMemo(
        () => sortData(isShowAllEnabled ? poolPositions : userPositions),
        [sortBy, reverseSort, isShowAllEnabled, poolPositions, userPositions],
    );

    return [sortBy, setSortBy, reverseSort, setReverseSort, sortedPositions];
};
