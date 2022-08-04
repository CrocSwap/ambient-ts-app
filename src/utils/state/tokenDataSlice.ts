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
            // state.tokens = action.payload;
            action.payload.forEach((erc20Token) => {
                const erc20TokenIndex = state.tokens?.findIndex(
                    (obj) => obj.token_address === erc20Token.token_address,
                );
                if (erc20TokenIndex === undefined || erc20TokenIndex === -1) {
                    state.tokens = state.tokens.concat(action.payload);
                } else {
                    if (
                        JSON.stringify(state.tokens[erc20TokenIndex]) !==
                        JSON.stringify(action.payload[0])
                    ) {
                        state.tokens[erc20TokenIndex] = erc20Token;
                    }
                }
            });
        },
        addNativeBalance: (state, action: PayloadAction<TokenIF[]>) => {
            const nativeTokenIndex = state.tokens?.findIndex(
                (obj) => obj.token_address === action.payload[0].token_address,
            );
            if (nativeTokenIndex === undefined || nativeTokenIndex === -1) {
                state.tokens = action.payload.concat(state.tokens);
            } else {
                if (
                    JSON.stringify(state.tokens[nativeTokenIndex]) !==
                    JSON.stringify(action.payload[0])
                ) {
                    state.tokens[nativeTokenIndex] = action.payload[0];
                }
            }
        },
        resetTokenData: () => initialState,
    },
});

// action creators are generated for each case reducer function
export const { setTokens, addNativeBalance, resetTokenData } = tokenDataSlice.actions;

export default tokenDataSlice.reducer;
