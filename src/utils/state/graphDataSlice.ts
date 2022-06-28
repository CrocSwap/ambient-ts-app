import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface graphData {
    positionsByUser: positionsByUser;
}

export interface positionsByUser {
    id: string;
    positions: Array<position>;
    denomInBase: boolean;
    primQty: string;
    isTokenABase: boolean;
    dexBalTokenA: boolean;
    dexBalTokenB: boolean;
}

export interface positionsByPool {
    id: string;
    positions: Array<position>;
    denomInBase: boolean;
    primQty: string;
    isTokenABase: boolean;
    dexBalTokenA: boolean;
    dexBalTokenB: boolean;
}

export interface position {
    ambient: boolean;
    askTick: number;
    bidTick: number;
    id: string;
    accountId: string;
    pool: pool;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    lowRangeDisplay: string;
    highRangeDisplay: string;
    tokenAQtyDisplay: string;
    tokenBQtyDisplay: string;
}

export interface pool {
    base: string;
    id: string;
    poolIdx: string;
    quote: string;
}

const initialState: graphData = {
    positionsByUser: {
        id: '',
        positions: [],
        denomInBase: true,
        primQty: '',
        isTokenABase: true,
        dexBalTokenA: false,
        dexBalTokenB: false,
    },
};

export const graphDataSlice = createSlice({
    name: 'graphData',
    initialState,
    reducers: {
        setPositionsByUser: (state, action: PayloadAction<positionsByUser>) => {
            state.positionsByUser = action.payload;
        },
        resetGraphData: () => initialState,
    },
});

// action creators are generated for each case reducer function
export const { setPositionsByUser, resetGraphData } = graphDataSlice.actions;

export default graphDataSlice.reducer;
