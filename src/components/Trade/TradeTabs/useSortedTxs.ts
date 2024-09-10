import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { TransactionIF } from '../../../ambient-utils/types';

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
    (data: TransactionIF[]) => TransactionIF[],
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
    const sortByWallet = (unsortedData: TransactionIF[]): TransactionIF[] => {
        // array to hold transactions with a valid ENS
        const txsENS: TransactionIF[] = [];
        // array to hold transactions with no ENS value
        const txsNoENS: TransactionIF[] = [];
        // push each transaction to one of the above temporary arrays
        unsortedData.forEach((tx: TransactionIF) => {
            tx.ensResolution ? txsENS.push(tx) : txsNoENS.push(tx);
        });
        // sort transactions with an ENS by the ENS value (alphanumeric)
        const sortedENS: TransactionIF[] = txsENS.sort((a, b) => {
            return a.ensResolution.localeCompare(b.ensResolution);
        });
        // sort transactions with no ENS by the wallet address, for some reason
        // ... alphanumeric sort fails so we're running a BigInt comparison
        const sortedNoENS: TransactionIF[] = txsNoENS.sort((a, b) => {
            const walletA = BigInt(a.user);
            const walletB = BigInt(b.user);
            return walletA > walletB ? 1 : -1;
        });
        // combine and return sorted arrays
        return [...sortedENS, ...sortedNoENS];
    };
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

    // array of positions sorted by the relevant column
    const sortedTransactions = useMemo<TransactionIF[]>(() => {
        return sortData(transactions);
    }, [sortBy, reverseSort, transactions[0]?.txHash, transactions.length]);

    return [
        sortBy,
        setSortBy,
        reverseSort,
        setReverseSort,
        sortedTransactions,
        sortData,
    ];
};
