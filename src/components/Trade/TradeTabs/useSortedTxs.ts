import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { TransactionIF } from '../../../utils/interfaces/exports';
import { diffHashSig } from '../../../utils/functions/diffHashSig';

export type TxSortType =
    | 'time'
    | 'wallet'
    | 'walletid'
    | 'pool'
    | 'price'
    | 'value'
    | 'default';

export const useSortedTxs = (
    defaultSort: TxSortType,
    transactions: TransactionIF[],
): [
    TxSortType,
    Dispatch<SetStateAction<TxSortType>>,
    boolean,
    Dispatch<SetStateAction<boolean>>,
    TransactionIF[],
] => {
    // default sort function
    const sortByUpdateTime = (unsortedData: TransactionIF[]): TransactionIF[] =>
        [...unsortedData].sort((a, b) => b.txTime - a.txTime);
    // sort by token pair
    const sortByPool = (unsortedData: TransactionIF[]): TransactionIF[] =>
        [...unsortedData].sort((a, b) => {
            const poolA = a.baseSymbol + a.quoteSymbol;
            const poolB = b.baseSymbol + b.quoteSymbol;
            return poolA.localeCompare(poolB);
        });
    // sort by wallet or ens address
    const sortByWallet = (unsortedData: TransactionIF[]): TransactionIF[] =>
        [...unsortedData].sort((a, b) => {
            const usernameA: string = a.ensResolution ?? a.user;
            const usernameB: string = b.ensResolution ?? b.user;
            return usernameA.localeCompare(usernameB);
        });
    // sort by limit price
    const sortByPrice = (unsortedData: TransactionIF[]): TransactionIF[] =>
        [...unsortedData].sort((a, b) => b.limitPrice - a.limitPrice);
    // sort by value of limit order
    const sortByValue = (unsortedData: TransactionIF[]): TransactionIF[] =>
        [...unsortedData].sort((a, b) => {
            const valueA = a.totalValueUSD;
            const valueB = b.totalValueUSD;
            if (!valueB) return -1;
            return Math.abs(valueB) - Math.abs(valueA);
        });

    // column the user wants the table sorted by
    // this is set when the user clicks a sortable column header
    const [sortBy, setSortBy] = useState<TxSortType>(defaultSort);
    // whether the sort should be ascending or descending
    const [reverseSort, setReverseSort] = useState<boolean>(false);

    // router to pass data through the appropriate sort function
    const sortData = (data: TransactionIF[]): TransactionIF[] => {
        // variable to hold output
        let sortedData: TransactionIF[];
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
                sortedData = sortByUpdateTime(data);
                break;
            default:
                return sortByUpdateTime(data);
        }
        // return reversed data if user wants data reversed
        return reverseSort ? [...sortedData].reverse() : sortedData;
    };

    // Generates a fingerprint from the positions objects. Used for comparison
    // in below React hook
    const ordersHashSum = useMemo(() => {
        return diffHashSig(transactions);
    }, [transactions]);

    // array of positions sorted by the relevant column
    const sortedTransactions = useMemo(() => {
        return sortData(transactions);
    }, [sortBy, reverseSort, ordersHashSum]);

    return [sortBy, setSortBy, reverseSort, setReverseSort, sortedTransactions];
};
