import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TokenIF } from '../interfaces/TokenIF';

export interface userData {
    isLoggedIn: boolean | undefined;
    addressAtLogin: string | undefined;
    addressCurrent: string | undefined;
    ensNameAtLogin: string | undefined;
    ensNameCurrent: string | undefined;
    ensOrAddressTruncated: string | undefined;
    isUserIdle: boolean;
    tokens: tokenData;
}

export interface tokenData {
    nativeToken: TokenIF | undefined;
    erc20Tokens: TokenIF[] | undefined;
}

const initialState: userData = {
    isLoggedIn: undefined,
    addressAtLogin: undefined,
    addressCurrent: undefined,
    ensNameAtLogin: undefined,
    ensNameCurrent: undefined,
    ensOrAddressTruncated: undefined,
    isUserIdle: false,
    tokens: {
        nativeToken: undefined,
        erc20Tokens: undefined,
    },
};

export const userDataSlice = createSlice({
    name: 'userData',
    initialState,
    reducers: {
        setIsLoggedIn: (state, action: PayloadAction<boolean>) => {
            state.isLoggedIn = action.payload;
        },
        setAddressAtLogin: (state, action: PayloadAction<string>) => {
            state.addressAtLogin = action.payload;
        },
        setAddressCurrent: (state, action: PayloadAction<string | undefined>) => {
            state.addressCurrent = action.payload;
        },
        setEnsNameAtLogin: (state, action: PayloadAction<string>) => {
            state.ensNameAtLogin = action.payload;
        },
        setEnsNameCurrent: (state, action: PayloadAction<string | undefined>) => {
            state.ensNameCurrent = action.payload;
        },
        setEnsOrAddressTruncated: (state, action: PayloadAction<string | undefined>) => {
            state.ensOrAddressTruncated = action.payload;
        },
        setIsUserIdle: (state, action: PayloadAction<boolean>) => {
            state.isUserIdle = action.payload;
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
        resetUserAddresses: (state) => {
            state.addressAtLogin = initialState.addressAtLogin;
            state.addressCurrent = initialState.addressCurrent;
            state.ensNameAtLogin = initialState.ensNameAtLogin;
            state.ensNameAtLogin = initialState.ensNameAtLogin;
            state.ensOrAddressTruncated = initialState.ensOrAddressTruncated;
        },
    },
});

// action creators are generated for each case reducer function
export const {
    setIsLoggedIn,
    setAddressAtLogin,
    setAddressCurrent,
    setEnsNameAtLogin,
    setEnsNameCurrent,
    setEnsOrAddressTruncated,
    setIsUserIdle,
    setNativeToken,
    setErc20Tokens,
    //  addNativeBalance,
    resetTokenData,
    resetUserAddresses,
} = userDataSlice.actions;

export default userDataSlice.reducer;
