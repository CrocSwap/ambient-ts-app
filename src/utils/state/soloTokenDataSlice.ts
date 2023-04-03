import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { goerliETH } from '../data/defaultTokens';
import { TokenIF } from '../interfaces/exports';

interface soloTokenData {
    token: TokenIF;
}

const initialState: soloTokenData = {
    token: goerliETH,
};

const soloTokenDataSlice = createSlice({
    name: 'soloTokenData',
    initialState,
    reducers: {
        setSoloToken: (state, action: PayloadAction<TokenIF>) => {
            state.token = action.payload;
        },
    },
});

// action creators are generated for each case reducer function
export const { setSoloToken } = soloTokenDataSlice.actions;

export default soloTokenDataSlice.reducer;
