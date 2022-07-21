import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TokenIF } from '../interfaces/TokenIF';

export interface tokenData {
    tokens: TokenIF[];
}

const initialState: tokenData = {
    tokens: [],
};

export const tokenDataSlice = createSlice({
    name: 'tokenData',
    initialState,
    reducers: {
        setTokens: (state, action: PayloadAction<TokenIF[]>) => {
            state.tokens = action.payload;
        },
        resetTokenData: () => initialState,
    },
});

// action creators are generated for each case reducer function
export const { setTokens, resetTokenData } = tokenDataSlice.actions;

export default tokenDataSlice.reducer;
