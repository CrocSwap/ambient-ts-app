import { useMemo, useState } from 'react';
import { TransactionIF } from '../../../../ambient-utils/types';
import { columnSlugsType } from './Transactions2';
import { BigNumber } from 'ethers';
import { diffHashSig } from '../../../../ambient-utils/dataLayer';

// export type sortSlugs = columnSlugsType | 'default';

export interface useSortIF {
    update: (slug: columnSlugsType) => void;
    data: TransactionIF[];
};

export default function useSort(
    defaultSort: columnSlugsType,
    transactions: TransactionIF[],
): useSortIF {
    // default sort function
    const sortByUpdateTime = (unsortedData: TransactionIF[]): TransactionIF[] =>
        [...unsortedData].sort((a, b) => b.txTime - a.txTime);
    // sort by token pair
    // const sortByPool = (unsortedData: TransactionIF[]): TransactionIF[] =>
    //     [...unsortedData].sort((a, b) => {
    //         const poolA = a.baseSymbol + a.quoteSymbol;
    //         const poolB = b.baseSymbol + b.quoteSymbol;
    //         return poolA.localeCompare(poolB);
    //     });
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
        // ... alphanumeric sort fails so we're running a BigNumber comparison
        const sortedNoENS: TransactionIF[] = txsNoENS.sort((a, b) => {
            const walletA = BigNumber.from(a.user);
            const walletB = BigNumber.from(b.user);
            return walletA.gte(walletB) ? 1 : -1;
        });
        // combine and return sorted arrays
        return [...sortedENS, ...sortedNoENS];
    };
    // sort by limit price
    // const sortByPrice = (unsortedData: TransactionIF[]): TransactionIF[] =>
    //     [...unsortedData].sort((a, b) => b.limitPrice - a.limitPrice);
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
    const [sortBy, setSortBy] = useState<columnSlugsType>(defaultSort);
    // whether the sort should be ascending or descending
    const [reverseSort, setReverseSort] = useState<boolean>(false);

    function updateSort(slug: columnSlugsType): void {
        if (sortBy === slug) {
            if (reverseSort === true) {
                setSortBy(defaultSort);
                setReverseSort(false);
            } else {
                setReverseSort(true);
            };
        } else {
            setSortBy(slug);
            setReverseSort(false);
        }
    };

    // router to pass data through the appropriate sort function
    const sortData = (data: TransactionIF[]): TransactionIF[] => {
        // variable to hold output
        let sortedData: TransactionIF[];
        // router to apply a specific sort function
        switch (sortBy) {
            case 'txWallet':
                sortedData = sortByWallet(data);
                break;
            case 'txValue':
                sortedData = sortByValue(data);
                break;
            case 'timeStamp':
            default:
                sortedData = sortByUpdateTime(data);
                break;
        }
        // return reversed data if user wants data reversed
        return reverseSort ? [...sortedData].reverse() : sortedData;
    };

    // Generates a fingerprint from the positions objects. Used for comparison
    // in below React hook
    const ordersHashSum = useMemo<string>(
        () => diffHashSig(transactions),
        [transactions]
    );

    // array of positions sorted by the relevant column
    const sortedTransactions = useMemo<TransactionIF[]>(
        () => sortData(transactions),
        [sortBy, reverseSort, ordersHashSum]
    );

    return {
        update: updateSort,
        data: sortedTransactions
    };
};
