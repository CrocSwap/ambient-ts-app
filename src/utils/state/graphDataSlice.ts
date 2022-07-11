import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface graphData {
    positionsByUser: PositionsByUser2;
    // positionsByUser: positionsByUser;
    positionsByPool: PositionsByPool2;
    // positionsByPool: PositionsByPool2;
}

export interface PositionsByUser2 {
    positions: Array<Position2>;
}

// export interface positionsByUser {
//     id: string;
//     positions: Array<Position2>;
//     denomInBase: boolean;
//     primQty: string;
//     isTokenABase: boolean;
//     dexBalTokenA: boolean;
//     dexBalTokenB: boolean;
// }

export interface positionsByPool {
    id: string;
    positions: Array<position>;
}
export interface PositionsByPool2 {
    positions: Array<Position2>;
}

export interface Position2 {
    ambient: boolean;
    askTick: number;
    bidTick: number;
    id: string;
    isBid: boolean;
    knockout: boolean;
    poolIdx: number;
    base: string;
    baseTokenLogoURI: string;
    quoteTokenLogoURI: string;
    quote: string;
    user: string;
    userEnsName: string;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    poolPriceInTicks: number;
    lowRangeDisplayInBase: string;
    highRangeDisplayInBase: string;
    lowRangeDisplayInQuote: string;
    highRangeDisplayInQuote: string;
    tokenAQtyDisplay: string;
    tokenBQtyDisplay: string;
    baseTokenDecimals: number;
    quoteTokenDecimals: number;
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
    baseTokenDecimals: number;
    quoteTokenSymbol: string;
    quoteTokenDecimals: number;
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
    positionsByUser: { positions: [] },
    positionsByPool: { positions: [] },
};

// const initialState: graphData = {
//     positionsByUser: {
//         id: '',
//         positions: [],
//         denomInBase: true,
//         primQty: '',
//         isTokenABase: true,
//         dexBalTokenA: false,
//         dexBalTokenB: false,
//     },
//     positionsByPool: {
//         // id: '',
//         positions: [],
//     },
// };

export const graphDataSlice = createSlice({
    name: 'graphData',
    initialState,
    reducers: {
        setPositionsByUser: (state, action: PayloadAction<PositionsByUser2>) => {
            state.positionsByUser = action.payload;
        },
        setPositionsByPool: (state, action: PayloadAction<PositionsByPool2>) => {
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
