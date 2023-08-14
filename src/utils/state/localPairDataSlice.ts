import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getDefaultChainId } from '../data/chains';
import { getDefaultPairForChain } from '../data/defaultTokens';
import { TokenIF } from '../interfaces/exports';

export interface PairDataIF {
    tokenA: TokenIF;
    tokenB: TokenIF;
    baseToken: TokenIF;
    quoteToken: TokenIF;
}
type TokenTuple = [TokenIF, TokenIF];
export interface LocalPairDataIF {
    tokens: TokenTuple;
}

// Have to set these values to something on load, so we use default pair
// for default chain. Don't worry if user is coming in to another chain,
// since these will get updated by useUrlParams() in any context where a
// pair is necessary at load time
const dfltChainId = getDefaultChainId();
const dfltTokenA = getDefaultPairForChain(dfltChainId)[0];
const dfltTokenB = getDefaultPairForChain(dfltChainId)[1];
const initialState: LocalPairDataIF = {
    tokens: [dfltTokenA, dfltTokenB], // Set the initial tokens in the tuple
};
const localPairDataSlice = createSlice({
    name: 'localPairData',
    initialState,
    reducers: {
        setLocalTokenA: (state, action: PayloadAction<TokenIF>) => {
            state.tokens[0] = action.payload;
        },
        setLocalTokenB: (state, action: PayloadAction<TokenIF>) => {
            state.tokens[1] = action.payload;
        },
    },
});

export const { setLocalTokenA, setLocalTokenB } = localPairDataSlice.actions;
export default localPairDataSlice.reducer;
