import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface rangeData {
    addressTokenA: string;
    addressTokenB: string;
    isDenomBase: boolean;
}

const initialState: rangeData = {
    addressTokenA: '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa',
    addressTokenB: '0xb7a4F3E9097C08dA09517b5aB877F7a917224ede',
    isDenomBase: true,
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
            state.isDenomBase = action.payload;
        },
        toggleDenomInBase: (state) => {
            state.isDenomBase = !state.isDenomBase;
        },
    },
});

// action creators are generated for each case reducer function
export const { setAddressTokenA, setAddressTokenB, setDenomInBase, toggleDenomInBase } =
    rangeDataSlice.actions;

export default rangeDataSlice.reducer;

// ETH:   0x0000000000000000000000000000000000000000
// DAI:   0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa
// USDC:  0xb7a4F3E9097C08dA09517b5aB877F7a917224ede
