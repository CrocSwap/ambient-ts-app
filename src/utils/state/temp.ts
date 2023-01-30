import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { goerliETH } from '../data/defaultTokens';
import { TokenIF } from '../interfaces/exports';

export interface stuff {
    token: TokenIF;
}

const initialState: stuff = {
    token: goerliETH,
};

export const tempSlice = createSlice({
    name: 'temp',
    initialState,
    reducers: {
        setToken: (state, action: PayloadAction<TokenIF>) => {
            state.token = action.payload;
        },
    },
});

// action creators are generated for each case reducer function
export const { setToken } = tempSlice.actions;

export default tempSlice.reducer;
