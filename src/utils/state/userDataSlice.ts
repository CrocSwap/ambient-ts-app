import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TokenIF } from '../interfaces/TokenIF';

export interface userData {
    isLoggedIn: boolean;
    tokens: tokenData;
}

export interface tokenData {
    nativeToken: TokenIF | undefined;
    erc20Tokens: TokenIF[];
}

const initialState: userData = {
    isLoggedIn: false,
    tokens: {
        nativeToken: undefined,
        erc20Tokens: [],
    },
};

export const userDataSlice = createSlice({
    name: 'userData',
    initialState,
    reducers: {
        setIsLoggedIn: (state, action: PayloadAction<boolean>) => {
            state.isLoggedIn = action.payload;
        },
        setNativeToken: (state, action: PayloadAction<TokenIF>) => {
            state.tokens.nativeToken = action.payload;
        },
        setErc20Tokens: (state, action: PayloadAction<TokenIF[]>) => {
            state.tokens.erc20Tokens = action.payload;
        },
        resetTokenData: (state) => {
            state.tokens = initialState.tokens;
        },
    },
});

// action creators are generated for each case reducer function
export const {
    setIsLoggedIn,
    setNativeToken,
    setErc20Tokens,
    //  addNativeBalance,
    resetTokenData,
} = userDataSlice.actions;

export default userDataSlice.reducer;
