import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ethers } from 'ethers';

export interface receiptData {
    sessionReceipts: Array<ethers.providers.TransactionReceipt>;
}

const initialState: receiptData = {
    sessionReceipts: [],
};

export const receiptDataSlice = createSlice({
    name: 'receiptData',
    initialState,
    reducers: {
        addReceipt: (state, action: PayloadAction<ethers.providers.TransactionReceipt>) => {
            state.sessionReceipts.push(action.payload);
        },
        resetReceiptData: () => initialState,
    },
});

// action creators are generated for each case reducer function
export const { addReceipt, resetReceiptData } = receiptDataSlice.actions;

export default receiptDataSlice.reducer;
