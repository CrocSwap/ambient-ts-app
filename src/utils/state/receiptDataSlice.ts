import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface parsedReceipt {
    receiptType: string;
    txHash: string;
    isTxSuccess: boolean;
    blockNumber: number;
    unixTimestamp: number;
    gasPriceInGwei: number;
    gasUsed: number;
    tokenAAddress: string;
    tokenBAddress: string;
    isTokenABase: boolean;
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
    sessionReceipts: Array<parsedReceipt>;
}

const initialState: receiptData = {
    sessionReceipts: [
        {
            receiptType: '',
            txHash: '',
            isTxSuccess: false,
            blockNumber: 0,
            unixTimestamp: 0,
            gasPriceInGwei: 0,
            gasUsed: 0,
            tokenAAddress: '',
            tokenBAddress: '',
            isTokenABase: true,
            tokenAQtyUnscaled: 0,
            tokenAQtyScaled: 0,
            tokenBQtyUnscaled: 0,
            tokenBQtyScaled: 0,
            tokenASymbol: '',
            tokenBSymbol: '',
            lessExpensiveTokenSymbol: '',
            moreExpensiveTokenSymbol: '',
            readableConversionRate: 0,
        },
    ],
};

export const receiptDataSlice = createSlice({
    name: 'receiptData',
    initialState,
    reducers: {
        addParsedReceipt: (state, action: PayloadAction<parsedReceipt>) => {
            state.sessionReceipts.push(action.payload);
        },
    },
});

// action creators are generated for each case reducer function
export const { addParsedReceipt } = receiptDataSlice.actions;

// export const receiptDataSlice = createSlice({
//     name: 'receiptData',
//     initialState,
//     reducers: {
//         setReceiptType: (state, action: PayloadAction<string>) => {
//             state.receiptType = action.payload;
//         },
//         setTxHash: (state, action: PayloadAction<string>) => {
//             state.txHash = action.payload;
//         },
//         setIsTxSuccess: (state, action: PayloadAction<boolean>) => {
//             state.isTxSuccess = action.payload;
//         },
//         setBlockNumber: (state, action: PayloadAction<number>) => {
//             state.blockNumber = action.payload;
//         },
//         setUnixTimestamp: (state, action: PayloadAction<number>) => {
//             state.unixTimestamp = action.payload;
//         },
//         setGasPriceInGwei: (state, action: PayloadAction<number>) => {
//             state.gasPriceInGwei = action.payload;
//         },
//         setGasUsed: (state, action: PayloadAction<number>) => {
//             state.gasUsed = action.payload;
//         },
//         setTokenAAddress: (state, action: PayloadAction<string>) => {
//             state.tokenAAddress = action.payload;
//         },
//         setTokenBAddress: (state, action: PayloadAction<string>) => {
//             state.tokenBAddress = action.payload;
//         },
//         setIsTokenABase: (state, action: PayloadAction<boolean>) => {
//             state.isTokenABase = action.payload;
//         },
//         setTokenAQtyUnscaled: (state, action: PayloadAction<number>) => {
//             state.tokenAQtyUnscaled = action.payload;
//         },
//         setTokenAQtyScaled: (state, action: PayloadAction<number>) => {
//             state.tokenAQtyScaled = action.payload;
//         },
//         setTokenBQtyUnscaled: (state, action: PayloadAction<number>) => {
//             state.tokenBQtyUnscaled = action.payload;
//         },
//         setTokenBQtyScaled: (state, action: PayloadAction<number>) => {
//             state.tokenBQtyScaled = action.payload;
//         },
//         setTokenASymbol: (state, action: PayloadAction<string>) => {
//             state.tokenASymbol = action.payload;
//         },
//         setTokenBSymbol: (state, action: PayloadAction<string>) => {
//             state.tokenBSymbol = action.payload;
//         },
//         setLessExpensiveTokenSymbol: (state, action: PayloadAction<string>) => {
//             state.lessExpensiveTokenSymbol = action.payload;
//         },
//         setMoreExpensiveTokenSymbol: (state, action: PayloadAction<string>) => {
//             state.moreExpensiveTokenSymbol = action.payload;
//         },
//         setReadableConversionRate: (state, action: PayloadAction<number>) => {
//             state.readableConversionRate = action.payload;
//         },
//     },
// });

// // action creators are generated for each case reducer function
// export const {
//     setReceiptType,
//     setTxHash,
//     setIsTxSuccess,
//     setBlockNumber,
//     setUnixTimestamp,
//     setGasPriceInGwei,
//     setGasUsed,
//     setTokenAAddress,
//     setTokenBAddress,
//     setIsTokenABase,
//     setTokenAQtyUnscaled,
//     setTokenAQtyScaled,
//     setTokenBQtyUnscaled,
//     setTokenBQtyScaled,
//     setTokenASymbol,
//     setTokenBSymbol,
//     setLessExpensiveTokenSymbol,
//     setMoreExpensiveTokenSymbol,
//     setReadableConversionRate,
// } = receiptDataSlice.actions;

export default receiptDataSlice.reducer;
