import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// import { ethers } from 'ethers';

export interface receiptData {
    sessionReceipts: Array<string>;
    pendingTransactions: Array<string>;
    positionsPendingUpdate: Array<string>;
    // sessionReceipts: Array<ethers.providers.TransactionReceipt>;
}

const initialState: receiptData = {
    sessionReceipts: [],
    pendingTransactions: [],
    positionsPendingUpdate: [],
};

export const receiptDataSlice = createSlice({
    name: 'receiptData',
    initialState,
    reducers: {
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
    addReceipt,
    addPendingTx,
    addPositionPendingUpdate,
    removePendingTx,
    removePositionPendingUpdate,
    resetReceiptData,
} = receiptDataSlice.actions;

export default receiptDataSlice.reducer;
