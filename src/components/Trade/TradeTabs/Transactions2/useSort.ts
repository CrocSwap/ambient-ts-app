import { useMemo, useRef } from 'react';
import { TransactionIF } from '../../../../ambient-utils/types';
import { columnSlugsType } from './Transactions2';
import { BigNumber } from 'ethers';
import { diffHashSig } from '../../../../ambient-utils/dataLayer';

interface useSortIF {
    sortedTransactions: TransactionIF[];
    updateSort: (s: columnSlugsType | 'default') => void;
};

export default function useSort(rawTxs: TransactionIF[]): useSortIF {
    // data to specify the current sort indicated by the user
    const activeSort = useRef<
        {
            slug: columnSlugsType | 'default';
            count: number;
        }
    >({slug: 'default', count: 0});

    // const cycles = useRef<number>(0);
    // console.log(cycles);
    // cycles.current++;

    // fn to update `activeSort` intelligently
    function updateSort(s:columnSlugsType|'default') {
        console.log('updating!!');
        const oldSort = activeSort.current.slug;
        const oldCount = activeSort.current.count;

        const setNewSort = (newSlug: columnSlugsType|'default', newCount: number) => {
            // console.log({ slug: newSlug, count: newCount });
            activeSort.current = { slug: newSlug, count: newCount };
        }

        if (s === oldSort) {
            switch (oldCount) {
                case 0:
                case 1:
                    setNewSort(s, oldCount + 1);
                    break;
                default:
                    setNewSort(s, 0);
                    break;
            }
        } else {
            setNewSort(s, 0);
        }
    };

    const ordersHashSum = useMemo<string>(() => diffHashSig(rawTxs), [rawTxs]);

    const sortedTransactions = useMemo<TransactionIF[]>(
        () => {
            // console.log('sorting!');
            const sortByWallet = (unsortedData: TransactionIF[]): TransactionIF[] => {
                console.log('sorting by wallet');
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
            const sortByPrice = (unsortedData: TransactionIF[]): TransactionIF[] => {
                console.log('sorting by value');
                return [...unsortedData].sort((a, b) => b.limitPrice - a.limitPrice);
            }
            let output: TransactionIF[];
            const slugForSort: columnSlugsType | 'default' = activeSort.current.slug;
            console.log('sorting by: ' + slugForSort);
            if (slugForSort === 'txWallet') {            
                output = sortByWallet(rawTxs);
            } else if (slugForSort === 'txValue') {
                output = sortByPrice(rawTxs);
            } else {
                console.log('sorting by time');
                output = rawTxs;
            }
            // switch(slugForSort) {
            //     case 'txWallet':
            //         console.log('party time');
            //         output = sortByWallet(rawTxs);
            //         break;
            //     case 'txValue':
            //         console.log('ouchies')
            //         output = sortByPrice(rawTxs);
            //         break;
            //     case 'timeStamp':
            //     default:
            //         console.log('the original')
            //         output = rawTxs;
            //         break;
            // }
            // reverse sort if user clicks the column a second time
            const directional = activeSort.current.count === 2 ? output.reverse() : output;
            // console.clear();
            // console.log(directional[0]?.txHash);
            return directional;
        }, [activeSort.current, ordersHashSum]
    );

    // console.log({sortedTransactions});

    return {
        sortedTransactions,
        updateSort,
    };
}