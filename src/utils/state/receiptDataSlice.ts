import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface unifiedReceipt {
    receiptType: string;
    txHash: string;
    isTxSuccess: boolean;
    blockNumber: number;
    unixTimestamp: number;
    gasPriceInGwei: number;
    gasUsed: number;
    tokenAAddress: string;
    tokenBAddress: string;
    tokenAQtyUnscaled: number;
    tokenAQtyScaled: number;
    tokenBQtyUnscaled: number;
    tokenBQtyScaled: number;
    tokenASymbol: string;
    tokenBSymbol: string;
    lessExpensiveTokenSymbol: string;
    moreExpensiveTokenSymbol: string;
    readableConversionRate: number;
    // isTokenAPrimary: boolean;
    // primaryQuantity: string;
}

export interface receiptData {
    sessionReceipts: Array<unifiedReceipt>;
}

const initialState: receiptData = {
    sessionReceipts: [],
};

export const receiptDataSlice = createSlice({
    name: 'receiptData',
    initialState,
    reducers: {
        addReceipt: (state, action: PayloadAction<unifiedReceipt>) => {
            state.sessionReceipts.push(action.payload);
        },
    },
});

// action creators are generated for each case reducer function
export const { addReceipt } = receiptDataSlice.actions;

export default receiptDataSlice.reducer;
