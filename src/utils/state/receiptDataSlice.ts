import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// import { ethers } from 'ethers';

export interface receiptData {
    sessionReceipts: Array<string>;
    pendingTransactions: Array<string>;
    // sessionReceipts: Array<ethers.providers.TransactionReceipt>;
}

const initialState: receiptData = {
    sessionReceipts: [],
    pendingTransactions: [],
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
        removePendingTx: (state, action: PayloadAction<string>) => {
            const indexOfTxInState = state.pendingTransactions.indexOf(action.payload);
            if (indexOfTxInState > -1) {
                state.pendingTransactions.splice(indexOfTxInState, 1);
            }
        },
        // addReceipt: (state, action: PayloadAction<ethers.providers.TransactionReceipt>) => {
        //     state.sessionReceipts.push(action.payload);
        // },
        resetReceiptData: () => initialState,
    },
});

// action creators are generated for each case reducer function
export const { addReceipt, addPendingTx, removePendingTx, resetReceiptData } =
    receiptDataSlice.actions;

export default receiptDataSlice.reducer;
