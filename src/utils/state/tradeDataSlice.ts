import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface tradeData {
    addressTokenA: string;
    addressTokenB: string;
    denomInBase: boolean;
    primQty: string;
    isTokenABase: boolean;
    dexBalTokenA: boolean;
    dexBalTokenB: boolean;
}

const initialState: tradeData = {
    addressTokenA: '0x0000000000000000000000000000000000000000',
    addressTokenB: '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa',
    denomInBase: true,
    primQty: '0',
    isTokenABase: true,
    dexBalTokenA: false,
    dexBalTokenB: false,
};

export const tradeDataSlice = createSlice({
    name: 'tradeData',
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
        resetValues: (state) => {
            state.addressTokenA = initialState.addressTokenA;
            state.addressTokenB = initialState.addressTokenB;
            state.denomInBase = initialState.denomInBase;
            state.primQty = initialState.primQty;
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
    setIsTokenABase,
    toggleIsTokenABase,
    setDexBalTokenA,
    toggleDexBalTokenA,
    setDexBalTokenB,
    toggleDexBalTokenB,
} = tradeDataSlice.actions;

export default tradeDataSlice.reducer;
