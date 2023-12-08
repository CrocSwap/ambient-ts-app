import React, { createContext } from 'react';

interface ReceiptContextIF {
    sessionReceipts: Array<string>;
    pendingTransactions: Array<string>;
    transactionsByType: Array<TransactionByType>;
    addTransactionByType: (txByType: TransactionByType) => void;
    addReceipt: (receipt: string) => void;
    addPendingTx: (tx: string) => void;
    updateTransactionHash: (oldHash: string, newHash: string) => void;
    removePendingTx: (pendingTx: string) => void;
    removeReceipt: (txHash: string) => void;
    resetReceiptData: () => void;
}

interface TransactionByType {
    txHash: string;
    txAction?:
        | 'Sell'
        | 'Buy'
        | 'Add'
        | 'Remove'
        | 'Harvest'
        | 'Claim'
        | 'Reposition';
    txType:
        | 'Market'
        | 'Limit'
        | 'Range'
        | 'Deposit'
        | 'Withdraw'
        | 'Transfer'
        | 'Init'
        | 'Approve';
    txDescription: string;
    txDetails?: {
        baseAddress: string;
        quoteAddress: string;
        poolIdx: number;
        baseSymbol?: string;
        quoteSymbol?: string;
        baseTokenDecimals?: number;
        quoteTokenDecimals?: number;
        isAmbient?: boolean;
        lowTick?: number;
        highTick?: number;
        isBid?: boolean;
        gridSize?: number;
    };
}

export const ReceiptContext = createContext<ReceiptContextIF>(
    {} as ReceiptContextIF,
);

export const ReceiptContextProvider = (props: {
    children: React.ReactNode;
}) => {
    const [sessionReceipts, setSessionReceipts] = React.useState<string[]>([]);
    const [pendingTransactions, setPendingTransactions] = React.useState<
        string[]
    >([]);

    console.log({ pendingTransactions });
    const [transactionsByType, setTransactionsByType] = React.useState<
        TransactionByType[]
    >([]);

    const addTransactionByType = (txByType: TransactionByType) => {
        setTransactionsByType((prev) => [...prev, txByType]);
    };
    const addReceipt = (receipt: string) => {
        setSessionReceipts((prev) => [receipt, ...prev]);
    };
    const addPendingTx = (tx: string) => {
        setPendingTransactions((prev) => [tx, ...prev]);
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
        const index = pendingTransactions.indexOf(pendingTx);
        console.log({ pendingTransactions, pendingTx, index });
        if (index > -1) {
            pendingTransactions.splice(index, 1);
        }
    };
    const removeReceipt = (txHash: string) => {
        const indexOfPendingTransaction = pendingTransactions.indexOf(txHash);
        const indexOfSessionReceipt = sessionReceipts.findIndex(
            (receipt) =>
                JSON.parse(receipt).transactionHash.toLowerCase() ===
                txHash.toLowerCase(),
        );
        console.log({
            txHash,
            pendingTransactions,
            sessionReceipts,
            indexOfPendingTransaction,
            indexOfSessionReceipt,
        });

        if (indexOfPendingTransaction > -1) {
            pendingTransactions.splice(indexOfPendingTransaction, 1);
        }
        if (indexOfSessionReceipt > -1) {
            sessionReceipts.splice(indexOfSessionReceipt, 1);
        }
    };

    const resetReceiptData = () => {
        setSessionReceipts([]);
        setPendingTransactions([]);
        setTransactionsByType([]);
    };

    const receiptContext: ReceiptContextIF = {
        sessionReceipts,
        transactionsByType,
        pendingTransactions,
        addTransactionByType,
        addReceipt,
        addPendingTx,
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
