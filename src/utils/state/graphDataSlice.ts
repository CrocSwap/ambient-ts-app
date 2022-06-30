import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface graphData {
    positionsByUser: positionsByUser;
    positionsByPool: positionsByPool;
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
}

export interface position {
    ambient: boolean;
    askTick: number;
    bidTick: number;
    id: string;
    accountId: string;
    ensName: string;
    pool: pool;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    lowRangeDisplay: string;
    highRangeDisplay: string;
    tokenAQtyDisplay: string;
    tokenBQtyDisplay: string;
    poolPriceInTicks: number;
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
    positionsByPool: {
        id: '',
        positions: [],
    },
};

export const graphDataSlice = createSlice({
    name: 'graphData',
    initialState,
    reducers: {
        setPositionsByUser: (state, action: PayloadAction<positionsByUser>) => {
            state.positionsByUser = action.payload;
        },
        setPositionsByPool: (state, action: PayloadAction<positionsByPool>) => {
            state.positionsByPool = action.payload;
        },
        resetGraphData: (state) => {
            state.positionsByUser = initialState.positionsByUser;
        },
    },
});

// action creators are generated for each case reducer function
export const { setPositionsByUser, setPositionsByPool, resetGraphData } = graphDataSlice.actions;

export default graphDataSlice.reducer;
