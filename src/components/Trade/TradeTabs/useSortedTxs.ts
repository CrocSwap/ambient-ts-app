import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { ITransaction } from '../../../utils/state/graphDataSlice';

export const useSortedTransactions = (
    defaultSort: string,
    transactions: ITransaction[],
): [
    string,
    Dispatch<SetStateAction<string>>,
    boolean,
    Dispatch<SetStateAction<boolean>>,
    ITransaction[],
] => {
    // default sort function
    const sortByUpdateTime = (unsortedData: ITransaction[]) =>
        [...unsortedData].sort((a, b) => b.time - a.time);
    // sort by wallet or ens address
    const sortByPool = (unsortedData: ITransaction[]) =>
        [...unsortedData].sort((a, b) => {
            const poolA = a.base + a.quote;
            const poolB = b.base + b.quote;
            return poolA.localeCompare(poolB);
        });
    const sortByWallet = (unsortedData: ITransaction[]) =>
        [...unsortedData].sort((a, b) => {
            const usernameA: string = a.ensResolution ?? a.user;
            const usernameB: string = b.ensResolution ?? b.user;
            return usernameA.localeCompare(usernameB);
        });
    // sort by limit price
    const sortByPrice = (unsortedData: ITransaction[]) =>
        [...unsortedData].sort((a, b) => b.limitPrice - a.limitPrice);
    // sort by value of limit order
    const sortByValue = (unsortedData: ITransaction[]) =>
        [...unsortedData].sort((a, b) => {
            const valueA = a.totalFlowUSD
                ? a.totalFlowUSD
                : a.totalValueUSD
                ? a.totalValueUSD
                : a.valueUSD;
            const valueB: number = b.totalFlowUSD
                ? b.totalFlowUSD
                : b.totalValueUSD
                ? b.totalValueUSD
                : b.valueUSD;

            if (!valueB) return -1;

            return Math.abs(valueB) - Math.abs(valueA);
        });

    // column the user wants the table sorted by
    // this is set when the user clicks a sortable column header
    const [sortBy, setSortBy] = useState(defaultSort);
    // whether the sort should be ascending or descending
    const [reverseSort, setReverseSort] = useState(false);

    // router to pass data through the appropriate sort function
    const sortData = (data: ITransaction[]) => {
        // variable to hold output
        let sortedData: ITransaction[];
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
                sortedData = sortByUpdateTime(data);
                break;
            default:
                return sortByUpdateTime(data);
        }
        // return reversed data if user wants data reversed
        return reverseSort ? [...sortedData].reverse() : sortedData;
    };

    // array of positions sorted by the relevant column
    const sortedTransactions = useMemo(
        () => sortData(transactions),
        [sortBy, reverseSort, transactions],
    );

    return [sortBy, setSortBy, reverseSort, setReverseSort, sortedTransactions];
};
