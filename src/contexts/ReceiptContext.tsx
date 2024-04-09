import React, { createContext } from 'react';
import { TransactionReceipt } from 'viem';

interface ReceiptContextIF {
    sessionReceipts: Array<TransactionReceipt>;
    allReceipts: Array<TransactionReceipt>;
    pendingTransactions: Array<`0x${string}`>;
    transactionsByType: Array<TransactionByType>;
    sessionPositionUpdates: PositionUpdateIF[];
    addTransactionByType: (txByType: TransactionByType) => void;
    addReceipt: (receipt: TransactionReceipt) => void;
    addPendingTx: (tx: `0x${string}`) => void;
    addPositionUpdate: (positionUpdate: PositionUpdateIF) => void;
    updateTransactionHash: (
        oldHash: `0x${string}`,
        newHash: `0x${string}`,
    ) => void;
    removePendingTx: (pendingTx: `0x${string}`) => void;
    removeReceipt: (txHash: `0x${string}`) => void;
    resetReceiptData: () => void;
}

interface TransactionByType {
    userAddress: string;
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
        originalLowTick?: number;
        originalHighTick?: number;
    };
}

export interface PositionUpdateIF {
    positionID: string;
    isLimit: boolean;
    isFullRemoval?: boolean;
    txHash?: `0x${string}`;
    unixTimeAdded?: number;
    unixTimeIndexed?: number;
    unixTimeReceipt?: number;
}

export const ReceiptContext = createContext<ReceiptContextIF>(
    {} as ReceiptContextIF,
);

export const ReceiptContextProvider = (props: {
    children: React.ReactNode;
}) => {
    const [sessionReceipts, setSessionReceipts] = React.useState<
        TransactionReceipt[]
    >([]);
    const [allReceipts, setAllReceipts] = React.useState<TransactionReceipt[]>(
        [],
    );
    const [pendingTransactions, setPendingTransactions] = React.useState<
        `0x${string}`[]
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
    const addReceipt = (receipt: TransactionReceipt) => {
        setSessionReceipts((prev) => [receipt, ...prev]);
        setAllReceipts((prev) => [receipt, ...prev]);
    };
    const addPendingTx = (tx: `0x${string}`) => {
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
                (r) => r.transactionHash.toLowerCase() !== txHash.toLowerCase(),
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
