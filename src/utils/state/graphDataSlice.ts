import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface graphData {
    positionsByUser: PositionsByUser;
    positionsByPool: PositionsByPool;
    swapsByUser: SwapsByUser;
    swapsByPool: SwapsByPool;
    candlesForAllPools: CandlesForAllPools;
}

export interface CandlesForAllPools {
    pools: Array<CandlesByPool>;
}

export interface CandlesByPool {
    pool: { baseAddress: string; quoteAddress: string; poolIdx: number };
    candles: Array<CandleData>;
}

export interface CandleData {
    base: string;
    firstBlock: number;
    id: string;
    lastBlock: number;
    numSwaps: number;
    period: number;
    poolHash: string;
    poolIdx: number;
    priceClose: number;
    priceMax: number;
    priceMin: number;
    priceOpen: number;
    quote: string;
    source: string;
    time: number;
    totalBaseQty: number;
    totalQuoteQty: number;
}

export interface PositionsByUser {
    positions: Array<Position>;
}

export interface PositionsByPool {
    positions: Array<Position>;
}

export interface Position {
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

export interface ISwap {
    base: string;
    block: number;
    id: string;
    inBaseQty: boolean;
    isBuy: boolean;
    limitPrice: number;
    minOut: number;
    poolHash: string;
    poolIdx: number;
    qty: number;
    quote: string;
    source: string;
    time: number;
    user: string;
}

export interface SwapsByUser {
    swaps: Array<ISwap>;
}

export interface SwapsByPool {
    swaps: Array<ISwap>;
}

const initialState: graphData = {
    positionsByUser: { positions: [] },
    positionsByPool: { positions: [] },
    swapsByUser: { swaps: [] },
    swapsByPool: { swaps: [] },
    candlesForAllPools: { pools: [] },
};

export const graphDataSlice = createSlice({
    name: 'graphData',
    initialState,
    reducers: {
        setPositionsByUser: (state, action: PayloadAction<PositionsByUser>) => {
            state.positionsByUser = action.payload;
        },
        setPositionsByPool: (state, action: PayloadAction<PositionsByPool>) => {
            state.positionsByPool = action.payload;
        },
        setSwapsByUser: (state, action: PayloadAction<SwapsByUser>) => {
            state.swapsByUser = action.payload;
        },
        setSwapsByPool: (state, action: PayloadAction<SwapsByPool>) => {
            state.swapsByPool = action.payload;
        },
        setCandlesByPool: (state, action: PayloadAction<CandlesByPool>) => {
            const poolToFind = JSON.stringify(action.payload.pool);
            const index = state.candlesForAllPools.pools
                .map((item) => JSON.stringify(item.pool))
                .findIndex((pool) => pool === poolToFind);

            // if candles for pool not yet saved in RTK, add to RTK
            if (index === -1) {
                // console.log('pool not found in RTK for new candle data');

                state.candlesForAllPools.pools = state.candlesForAllPools.pools.concat(
                    action.payload,
                );
                // else, replace candles for pool if different
            } else if (state.candlesForAllPools.pools[index] !== action.payload) {
                state.candlesForAllPools.pools[index] = action.payload;
            }
        },
        addCandlesByPool: (state, action: PayloadAction<CandlesByPool>) => {
            const poolToFind = JSON.stringify(action.payload.pool).toLowerCase();
            const index = state.candlesForAllPools.pools
                .map((item) => JSON.stringify(item.pool).toLowerCase())
                .findIndex((pool) => pool === poolToFind);

            // if candles for pool not yet saved in RTK, add to RTK
            if (index === -1) {
                console.error('pool not found in RTK for new candle subscription data');
                // state.candlesForAllPools.pools = state.candlesForAllPools.pools.concat(
                //     action.payload,
                // );
                // else, replace candles for pool if different
            } else {
                state.candlesForAllPools.pools[index].candles = action.payload.candles.concat(
                    state.candlesForAllPools.pools[index].candles,
                );
            }
        },
        resetGraphData: (state) => {
            state.positionsByUser = initialState.positionsByUser;
        },
    },
});

// action creators are generated for each case reducer function
export const {
    setPositionsByUser,
    setPositionsByPool,
    setCandlesByPool,
    addCandlesByPool,
    setSwapsByUser,
    setSwapsByPool,
    resetGraphData,
} = graphDataSlice.actions;

export default graphDataSlice.reducer;
