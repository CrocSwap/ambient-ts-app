import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TokenIF } from '../interfaces/exports';

export interface userData {
    isLoggedIn: boolean | undefined;
    addressAtLogin: `0x${string}` | undefined;
    addressCurrent: `0x${string}` | undefined;
    ensNameAtLogin: string | undefined;
    ensNameCurrent: string | undefined;
    ensOrAddressTruncated: string | undefined;
    isUserIdle: boolean;
    tokenBalances: TokenIF[] | undefined;
    recentTokens: TokenIF[] | undefined;
    secondaryImageData: string[];
    resolvedAddress: string | undefined;
}

const initialState: userData = {
    isLoggedIn: undefined,
    addressAtLogin: undefined,
    addressCurrent: undefined,
    ensNameAtLogin: undefined,
    ensNameCurrent: undefined,
    ensOrAddressTruncated: undefined,
    isUserIdle: false,
    tokenBalances: undefined,
    recentTokens: undefined,
    secondaryImageData: [],
    resolvedAddress: undefined,
};

export const userDataSlice = createSlice({
    name: 'userData',
    initialState,
    reducers: {
        setIsLoggedIn: (state, action: PayloadAction<boolean>) => {
            state.isLoggedIn = action.payload;
        },
        setAddressAtLogin: (state, action: PayloadAction<`0x${string}`>) => {
            state.addressAtLogin = action.payload;
        },
        setAddressCurrent: (
            state,
            action: PayloadAction<`0x${string}` | undefined>,
        ) => {
            state.addressCurrent = action.payload;
        },
        setEnsNameAtLogin: (state, action: PayloadAction<string>) => {
            state.ensNameAtLogin = action.payload;
        },
        setEnsNameCurrent: (
            state,
            action: PayloadAction<string | undefined>,
        ) => {
            state.ensNameCurrent = action.payload;
        },
        setEnsOrAddressTruncated: (
            state,
            action: PayloadAction<string | undefined>,
        ) => {
            state.ensOrAddressTruncated = action.payload;
        },
        setIsUserIdle: (state, action: PayloadAction<boolean>) => {
            state.isUserIdle = action.payload;
        },
        setTokenBalances: (state, action: PayloadAction<TokenIF[]>) => {
            state.tokenBalances = action.payload;
        },
        setRecentTokens: (state, action: PayloadAction<TokenIF[]>) => {
            state.recentTokens = action.payload;
        },
        resetTokenData: (state) => {
            state.tokenBalances = initialState.tokenBalances;
            state.recentTokens = initialState.recentTokens;
        },
        resetUserAddresses: (state) => {
            state.addressAtLogin = initialState.addressAtLogin;
            state.addressCurrent = initialState.addressCurrent;
            state.ensNameAtLogin = initialState.ensNameAtLogin;
            state.ensNameAtLogin = initialState.ensNameAtLogin;
            state.ensOrAddressTruncated = initialState.ensOrAddressTruncated;
        },
        setSecondaryImageDataRedux: (
            state,
            action: PayloadAction<string[]>,
        ) => {
            state.secondaryImageData = action.payload;
        },
        setResolvedAddressRedux: (
            state,
            action: PayloadAction<string | undefined>,
        ) => {
            state.resolvedAddress = action.payload;
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
    setTokenBalances,
    setRecentTokens,
    resetTokenData,
    resetUserAddresses,
    setSecondaryImageDataRedux,
    setResolvedAddressRedux,
} = userDataSlice.actions;

export default userDataSlice.reducer;
