import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { ILimitOrderState } from '../../../utils/state/graphDataSlice';

export const useSortedLimits = (
    defaultSort: string,
    isShowAllEnabled: boolean,
    positions: ILimitOrderState[]
): [
    string,
    Dispatch<SetStateAction<string>>,
    boolean,
    Dispatch<SetStateAction<boolean>>,
    ILimitOrderState[],
] => {
    // function to reverse an array of postion objects
    // we can't use .reverse() bc it sorts an array in place
    function reverseArray(inputArray: ILimitOrderState[]) {
        const outputArray: ILimitOrderState[] = [];
        inputArray.forEach((elem) => outputArray.unshift(elem));
        return outputArray;
    }

    // default sort function
    const sortByUpdateTime = (unsortedData: ILimitOrderState[]) =>
        [...unsortedData].sort((a, b) => b.latestUpdateTime - a.latestUpdateTime);
    // sort by positionHash
    // const sortById = (unsortedData: ILimitOrderState[]) =>
    //     [...unsortedData].sort((a, b) => b.positionStorageSlot.localeCompare(a.positionStorageSlot));
    // sort functions for sortable columns
    const sortByWallet = (unsortedData: ILimitOrderState[]) =>
        [...unsortedData].sort((a, b) => {
            const usernameA: string = a.ensResolution ?? a.user;
            const usernameB: string = b.ensResolution ?? b.user;
            return usernameA.localeCompare(usernameB);
        });
    // const sortByApy = (unsortedData: ILimitOrderState[]) =>
    //     [...unsortedData].sort((a, b) => b.apy - a.apy);
    // TODO: for some reason sortByMin() is leaving the final value out of sequence?
    // const sortByMin = (unsortedData: ILimitOrderState[]) => 
    //     [...unsortedData].sort((a, b) =>
    //         parseFloat(b.lowRangeDisplayInBase) - parseFloat(a.lowRangeDisplayInBase)
    //     );
    // const sortByMax = (unsortedData: ILimitOrderState[]) => 
    //     [...unsortedData].sort((a, b) =>
    //         parseFloat(b.highRangeDisplayInBase) - parseFloat(a.highRangeDisplayInBase)
    //     );
    const sortByValue = (unsortedData: ILimitOrderState[]) =>
        [...unsortedData].sort((a, b) => b.positionLiqTotalUSD - a.positionLiqTotalUSD);

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
            // case 'id':
                // sortedData = sortById(data);
                // break;
            // sort by wallet
            case 'wallet':
                sortedData = sortByWallet(data);
                break;
            // sort by APR
            // case 'apy':
            // case 'apr':
                // sortedData = sortByApy(data);
                // break;
            // case 'min':
                // sortedData = sortByMin(data);
                // break;
            // case 'max':
                // sortedData = sortByMax(data);
                // break;
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
        return reverseSort ? reverseArray(sortedData) : sortedData;
    };

    // TODO: new user positions reset table sort, new pool positions retains sort

    // array of positions sorted by the relevant column
    const sortedPositions = useMemo(
        () => sortData(positions),
        [sortBy, reverseSort, isShowAllEnabled, positions],
    );

    return [sortBy, setSortBy, reverseSort, setReverseSort, sortedPositions];
};
