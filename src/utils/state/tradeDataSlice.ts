import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface tradeData {
    addressTokenA: string;
    addressTokenB: string;
    isDenomBase: boolean;
    advancedMode: boolean;
    isTokenAPrimary: boolean;
    primaryQuantity: string;
}

const initialState: tradeData = {
    addressTokenA: '0x0000000000000000000000000000000000000000',
    addressTokenB: '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa',
    isDenomBase: true,
    advancedMode: false,
    isTokenAPrimary: true,
    primaryQuantity: '',
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
            state.isDenomBase = action.payload;
        },
        toggleDenomInBase: (state) => {
            state.isDenomBase = !state.isDenomBase;
        },
        setAdvancedMode: (state, action: PayloadAction<boolean>) => {
            state.advancedMode = action.payload;
        },
        toggleAdvancedMode: (state) => {
            state.advancedMode = !state.advancedMode;
        },
        setIsTokenAPrimary: (state, action: PayloadAction<boolean>) => {
            state.isTokenAPrimary = action.payload;
        },
        toggleIsTokenAPrimary: (state) => {
            state.isTokenAPrimary = !state.isTokenAPrimary;
        },
        setPrimaryQuantity: (state, action: PayloadAction<string>) => {
            state.primaryQuantity = action.payload;
        },
    },
});

// action creators are generated for each case reducer function
export const {
    setAddressTokenA,
    setAddressTokenB,
    setDenomInBase,
    toggleDenomInBase,
    setAdvancedMode,
    toggleAdvancedMode,
    setIsTokenAPrimary,
    toggleIsTokenAPrimary,
    setPrimaryQuantity,
} = tradeDataSlice.actions;

export default tradeDataSlice.reducer;

// ETH:   0x0000000000000000000000000000000000000000
// DAI:   0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa
// USDC:  0xb7a4F3E9097C08dA09517b5aB877F7a917224ede
