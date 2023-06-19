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
    tokens: tokenData;
    recentTokens: TokenIF[] | undefined;
    secondaryImageData: string[];
    resolvedAddress: string | undefined;
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
        setNativeToken: (state, action: PayloadAction<TokenIF>) => {
            state.tokens.nativeToken = action.payload;
        },
        updateNativeTokenWalletBalance: (
            state,
            action: PayloadAction<{
                walletBalance: string;
                walletBalanceDisplay: string;
                walletBalanceDisplayTruncated: string;
            }>,
        ) => {
            if (!state.tokens.nativeToken) return;
            state.tokens.nativeToken.walletBalance =
                action.payload.walletBalance;
            state.tokens.nativeToken.walletBalanceDisplay =
                action.payload.walletBalanceDisplay;
            state.tokens.nativeToken.walletBalanceDisplayTruncated =
                action.payload.walletBalanceDisplayTruncated;
        },
        updateNativeTokenDexBalance: (
            state,
            action: PayloadAction<{
                dexBalance: string;
                dexBalanceDisplay: string;
                dexBalanceDisplayTruncated: string;
            }>,
        ) => {
            if (!state.tokens.nativeToken) return;
            state.tokens.nativeToken.dexBalance = action.payload.dexBalance;
            state.tokens.nativeToken.dexBalanceDisplay =
                action.payload.dexBalanceDisplay;
            state.tokens.nativeToken.dexBalanceDisplayTruncated =
                action.payload.dexBalanceDisplayTruncated;
        },
        updateErc20TokenWalletBalance: (
            state,
            action: PayloadAction<{
                indexOfExistingErc20Token: number;
                walletBalance: string;
                walletBalanceDisplay: string;
                walletBalanceDisplayTruncated: string;
            }>,
        ) => {
            if (!state.tokens.erc20Tokens) return;
            const index = action.payload.indexOfExistingErc20Token;
            state.tokens.erc20Tokens[index].walletBalance =
                action.payload.walletBalance;
            state.tokens.erc20Tokens[index].walletBalanceDisplay =
                action.payload.walletBalanceDisplay;
            state.tokens.erc20Tokens[index].walletBalanceDisplayTruncated =
                action.payload.walletBalanceDisplayTruncated;
        },
        updateErc20TokenDexBalance: (
            state,
            action: PayloadAction<{
                indexOfExistingErc20Token: number;
                dexBalance: string;
                dexBalanceDisplay: string;
                dexBalanceDisplayTruncated: string;
            }>,
        ) => {
            if (!state.tokens.erc20Tokens) return;
            const index = action.payload.indexOfExistingErc20Token;
            state.tokens.erc20Tokens[index].dexBalance =
                action.payload.dexBalance;
            state.tokens.erc20Tokens[index].dexBalanceDisplay =
                action.payload.dexBalanceDisplay;
            state.tokens.erc20Tokens[index].dexBalanceDisplayTruncated =
                action.payload.dexBalanceDisplayTruncated;
        },
        setErc20Tokens: (state, action: PayloadAction<TokenIF[]>) => {
            state.tokens.erc20Tokens = action.payload;
        },
        setRecentTokens: (state, action: PayloadAction<TokenIF[]>) => {
            state.recentTokens = action.payload;
        },
        resetTokenData: (state) => {
            state.tokens = initialState.tokens;
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
    setNativeToken,
    setErc20Tokens,
    setRecentTokens,
    updateNativeTokenWalletBalance,
    updateNativeTokenDexBalance,
    updateErc20TokenWalletBalance,
    updateErc20TokenDexBalance,
    resetTokenData,
    resetUserAddresses,
    setSecondaryImageDataRedux,
    setResolvedAddressRedux,
} = userDataSlice.actions;

export default userDataSlice.reducer;
