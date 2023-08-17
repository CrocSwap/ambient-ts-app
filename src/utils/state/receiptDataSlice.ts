import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// import { ethers } from 'ethers';

interface TransactionByType {
    txHash: string;
    txAction: 'New' | 'Edit';
    txType:
        | 'Swap'
        | 'Limit'
        | 'Range'
        | 'Deposit'
        | 'Withdraw'
        | 'Transfer'
        | 'Init'
        | 'Approve';
    txTypeDetails: string;
}
export interface receiptData {
    sessionReceipts: Array<string>;
    pendingTransactions: Array<string>;
    positionsPendingUpdate: Array<string>;
    transactionsByType: Array<TransactionByType>;
    // sessionReceipts: Array<ethers.providers.TransactionReceipt>;
}

const initialState: receiptData = {
    sessionReceipts: [],
    pendingTransactions: [],
    positionsPendingUpdate: [],
    transactionsByType: [],
};

export const receiptDataSlice = createSlice({
    name: 'receiptData',
    initialState,
    reducers: {
        addTransactionByType: (
            state,
            action: PayloadAction<TransactionByType>,
        ) => {
            state.transactionsByType.push(action.payload);
        },
        updateTransactionHash: (
            state,
            action: PayloadAction<{ oldHash: string; newHash: string }>,
        ) => {
            const txIndex = state.transactionsByType.findIndex(
                (tx) => tx.txHash === action.payload.oldHash,
            );
            if (txIndex !== -1) {
                state.transactionsByType[txIndex] = {
                    ...state.transactionsByType[txIndex],
                    txHash: action.payload.newHash,
                };
            }
        },
        addReceipt: (state, action: PayloadAction<string>) => {
            state.sessionReceipts.unshift(action.payload);
        },
        addPendingTx: (state, action: PayloadAction<string>) => {
            state.pendingTransactions.unshift(action.payload);
        },
        addPositionPendingUpdate: (state, action: PayloadAction<string>) => {
            state.positionsPendingUpdate.unshift(action.payload);
        },
        removePendingTx: (state, action: PayloadAction<string>) => {
            const index = state.pendingTransactions.indexOf(action.payload);
            if (index > -1) {
                state.pendingTransactions.splice(index, 1);
            }
        },
        removeReceipt: (state, action: PayloadAction<string>) => {
            const sessionReceipts = state.sessionReceipts;
            const pendingTransactions = state.pendingTransactions;
            const txHash = action.payload;

            const indexOfPendingTransaction = pendingTransactions.indexOf(
                action.payload,
            );
            const indexOfSessionReceipt = sessionReceipts.findIndex(
                (receipt) =>
                    JSON.parse(receipt).transactionHash.toLowerCase() ===
                    txHash.toLowerCase(),
            );
            if (indexOfPendingTransaction > -1) {
                state.pendingTransactions.splice(indexOfPendingTransaction, 1);
            }
            if (indexOfSessionReceipt > -1) {
                state.sessionReceipts.splice(indexOfSessionReceipt, 1);
            }
        },
        removePositionPendingUpdate: (state, action: PayloadAction<string>) => {
            const index = state.positionsPendingUpdate.indexOf(action.payload);
            if (index > -1) {
                state.positionsPendingUpdate.splice(index, 1);
            }
        },
        resetReceiptData: () => initialState,
    },
});

// action creators are generated for each case reducer function
export const {
    addTransactionByType,
    addReceipt,
    addPendingTx,
    addPositionPendingUpdate,
    updateTransactionHash,
    removePendingTx,
    removeReceipt,
    removePositionPendingUpdate,
    resetReceiptData,
} = receiptDataSlice.actions;

export default receiptDataSlice.reducer;
