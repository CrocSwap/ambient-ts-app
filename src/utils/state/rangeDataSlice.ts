import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface rangeData {
    addressTokenA: string;
    addressTokenB: string;
    denomInBase: boolean;
    primQty: string;
    isTokenAPrimary: boolean;
    isTokenABase: boolean;
    dexBalTokenA: boolean;
    dexBalTokenB: boolean;
    withdrawTokens: boolean;
}

const initialState: rangeData = {
    addressTokenA: '0x0000000000000000000000000000000000000000',
    addressTokenB: '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa',
    denomInBase: true,
    primQty: '0',
    isTokenAPrimary: true,
    isTokenABase: true,
    dexBalTokenA: false,
    dexBalTokenB: false,
    withdrawTokens: true,
};

export const rangeDataSlice = createSlice({
    name: 'rangeData',
    initialState,
    reducers: {
        setAddressTokenA: (state, action: PayloadAction<string>) => {
            state.addressTokenA = action.payload;
        },
        setAddressTokenB: (state, action: PayloadAction<string>) => {
            state.addressTokenB = action.payload;
        },
        setDenomInBase: (state, action: PayloadAction<boolean>) => {
            state.denomInBase = action.payload;
        },
        toggleDenomInBase: (state) => {
            state.denomInBase = !state.denomInBase;
        },
        setPrimQty: (state, action: PayloadAction<string>) => {
            state.primQty = action.payload;
        },
        setIsTokenAPrimary: (state, action: PayloadAction<boolean>) => {
            state.isTokenAPrimary = action.payload;
        },
        toggleIsTokenAPrimary: (state) => {
            state.isTokenAPrimary = !state.isTokenAPrimary;
        },
        setIsTokenABase: (state, action: PayloadAction<boolean>) => {
            state.isTokenABase = action.payload;
        },
        toggleIsTokenABase: (state) => {
            state.isTokenABase = !state.isTokenABase;
        },
        setDexBalTokenA: (state, action: PayloadAction<boolean>) => {
            state.dexBalTokenA = action.payload;
        },
        toggleDexBalTokenA: (state) => {
            state.dexBalTokenA = !state.dexBalTokenA;
        },
        setDexBalTokenB: (state, action: PayloadAction<boolean>) => {
            state.dexBalTokenB = action.payload;
        },
        toggleDexBalTokenB: (state) => {
            state.dexBalTokenB = !state.dexBalTokenB;
        },
        setWithdrawTokens: (state, action: PayloadAction<boolean>) => {
            state.withdrawTokens = action.payload;
        },
        toggleWithdrawTokens: (state) => {
            state.withdrawTokens = !state.withdrawTokens;
        },

        resetValues: (state) => {
            state.addressTokenA = initialState.addressTokenA;
            state.addressTokenB = initialState.addressTokenB;
            state.denomInBase = initialState.denomInBase;
            state.primQty = initialState.primQty;
            state.isTokenAPrimary = initialState.isTokenAPrimary;
            state.isTokenABase = initialState.isTokenABase;
            state.dexBalTokenA = initialState.dexBalTokenA;
            state.dexBalTokenB = initialState.dexBalTokenB;
        },
    },
});

// action creators are generated for each case reducer function
export const {
    setAddressTokenA,
    setAddressTokenB,
    setDenomInBase,
    toggleDenomInBase,
    setPrimQty,
    setIsTokenAPrimary,
    toggleIsTokenAPrimary,
    setIsTokenABase,
    toggleIsTokenABase,
    setDexBalTokenA,
    toggleDexBalTokenA,
    setDexBalTokenB,
    toggleDexBalTokenB,
} = rangeDataSlice.actions;

export default rangeDataSlice.reducer;
