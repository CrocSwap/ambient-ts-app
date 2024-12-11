import React, { createContext } from 'react';
import {
    PositionUpdateIF,
    ReceiptContextIF,
    TransactionByType,
} from '../ambient-utils/types/contextTypes';

export const ReceiptContext = createContext({} as ReceiptContextIF);

export const ReceiptContextProvider = (props: {
    children: React.ReactNode;
}) => {
    const [sessionReceipts, setSessionReceipts] = React.useState<string[]>([]);
    const [allReceipts, setAllReceipts] = React.useState<string[]>([]);
    const [pendingTransactions, setPendingTransactions] = React.useState<
        string[]
    >([]);

    const [sessionPositionUpdates, setSessionPositionUpdates] = React.useState<
        Array<PositionUpdateIF>
    >([]);

    const [transactionsByType, setTransactionsByType] = React.useState<
        TransactionByType[]
    >([]);

    const addTransactionByType = (txByType: TransactionByType) => {
        setTransactionsByType((prev) => [...prev, txByType]);
    };
    const addReceipt = (receipt: string) => {
        setSessionReceipts((prev) => [receipt, ...prev]);
        setAllReceipts((prev) => [receipt, ...prev]);
    };
    const addPendingTx = (tx: string) => {
        setPendingTransactions((prev) => [tx, ...prev]);
    };
    const addPositionUpdate = (positionUpdate: PositionUpdateIF) => {
        setSessionPositionUpdates((prev) => [positionUpdate, ...prev]);
    };
    const updateTransactionHash = (oldHash: string, newHash: string) => {
        const txIndex = transactionsByType.findIndex(
            (tx) => tx.txHash === oldHash,
        );
        if (txIndex !== -1) {
            transactionsByType[txIndex] = {
                ...transactionsByType[txIndex],
                txHash: newHash,
            };
        }
    };

    const removePendingTx = (pendingTx: string) => {
        setPendingTransactions((pendingTransactions) =>
            pendingTransactions.filter((p) => p !== pendingTx),
        );
    };

    const removeReceipt = (txHash: string) => {
        removePendingTx(txHash);

        setSessionReceipts((sessionReceipts) =>
            sessionReceipts.filter(
                (r) =>
                    JSON.parse(r).hash.toLowerCase() !== txHash.toLowerCase(),
            ),
        );
    };

    const resetReceiptData = () => {
        setSessionReceipts([]);
        setPendingTransactions([]);
        setTransactionsByType([]);
    };

    const receiptContext: ReceiptContextIF = {
        sessionReceipts,
        allReceipts,
        transactionsByType,
        pendingTransactions,
        sessionPositionUpdates,
        addTransactionByType,
        addReceipt,
        addPendingTx,
        addPositionUpdate,
        updateTransactionHash,
        removePendingTx,
        removeReceipt,
        resetReceiptData,
    };

    return (
        <ReceiptContext.Provider value={receiptContext}>
            {props.children}
        </ReceiptContext.Provider>
    );
};
