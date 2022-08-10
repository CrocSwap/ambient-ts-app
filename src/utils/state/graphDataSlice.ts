import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PositionIF } from '../interfaces/PositionIF';
export interface graphData {
    positionsByUser: PositionsByUser;
    positionsByPool: PositionsByPool;
    swapsByUser: SwapsByUser;
    swapsByPool: SwapsByPool;
    candlesForAllPools: CandlesForAllPools;
}

export interface CandlesForAllPools {
    pools: Array<Pool>;
}

export interface Pool {
    pool: { baseAddress: string; quoteAddress: string; poolIdx: number; network: string };
    candlesByPoolAndDuration: Array<CandlesByPoolAndDuration>;
}

export interface CandlesByPoolAndDuration {
    pool: { baseAddress: string; quoteAddress: string; poolIdx: number; network: string };
    duration: number;
    candles: Array<CandleData>;
}

export interface CandleData {
    time: number;
    poolHash: string;
    firstBlock: number;
    lastBlock: number;
    minPrice: number;
    maxPrice: number;
    priceOpen: number;
    priceClose: number;
    numSwaps: number;
    netBaseFlow: string;
    netQuoteFlow: string;
    totalBaseFlow: string;
    totalQuoteFlow: string;
    firstSwap: string;
    lastSwap: string;
    numSwapsFromCroc: number;
    numSwapsFromUniV3: number;
    network: string;
    chainId: string;
    base: string;
    quote: string;
    poolIdx: number;
    period: number;
    allSwaps: Array<string>;
}

export interface PositionsByUser {
    dataReceived: boolean;
    positions: Array<PositionIF>;
}

export interface PositionsByPool {
    dataReceived: boolean;
    positions: Array<PositionIF>;
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
    dataReceived: boolean;
    swaps: Array<ISwap>;
}

export interface SwapsByPool {
    dataReceived: boolean;
    swaps: Array<ISwap>;
}

const initialState: graphData = {
    positionsByUser: { dataReceived: false, positions: [] },
    positionsByPool: { dataReceived: false, positions: [] },
    swapsByUser: { dataReceived: false, swaps: [] },
    swapsByPool: { dataReceived: false, swaps: [] },
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
        setCandles: (state, action: PayloadAction<CandlesByPoolAndDuration>) => {
            const poolToFind = JSON.stringify(action.payload.pool);
            const indexOfPool = state.candlesForAllPools.pools
                .map((item) => JSON.stringify(item.pool))
                .findIndex((pool) => pool === poolToFind);

            // if candles for pool not yet saved in RTK, add to RTK
            if (indexOfPool === -1) {
                // console.log('pool not found in RTK for new candle data');

                state.candlesForAllPools.pools = state.candlesForAllPools.pools.concat({
                    pool: action.payload.pool,
                    candlesByPoolAndDuration: [
                        {
                            pool: action.payload.pool,
                            duration: action.payload.duration,
                            candles: action.payload.candles,
                        },
                    ],
                });
                // else, check if duration exists
            } else {
                // console.log('pool found in RTK for new candle data');
                const durationToFind = action.payload.duration;
                const indexOfDuration = state.candlesForAllPools.pools[
                    indexOfPool
                ].candlesByPoolAndDuration
                    .map((item) => item.duration)
                    .findIndex((duration) => duration === durationToFind);

                if (indexOfDuration === -1) {
                    console.log('duration not found');

                    state.candlesForAllPools.pools[indexOfPool].candlesByPoolAndDuration =
                        state.candlesForAllPools.pools[indexOfPool].candlesByPoolAndDuration.concat(
                            [
                                {
                                    pool: action.payload.pool,
                                    duration: action.payload.duration,
                                    candles: action.payload.candles,
                                },
                            ],
                        );
                } else {
                    // console.log('duration found');
                    state.candlesForAllPools.pools[indexOfPool].candlesByPoolAndDuration[
                        indexOfDuration
                    ] = {
                        pool: action.payload.pool,
                        duration: action.payload.duration,
                        candles: action.payload.candles,
                    };
                }
                // state.candlesForAllPools.pools[indexOfPool] = action.payload;
            }
        },
        addCandles: (state, action: PayloadAction<CandlesByPoolAndDuration>) => {
            const poolToFind = JSON.stringify(action.payload.pool).toLowerCase();
            const indexOfPool = state.candlesForAllPools.pools
                .map((item) => JSON.stringify(item.pool).toLowerCase())
                .findIndex((pool) => pool === poolToFind);

            // if candles for pool not yet saved in RTK, add to RTK
            if (indexOfPool === -1) {
                console.error('pool not found in RTK for new candle subscription data');
                state.candlesForAllPools.pools = state.candlesForAllPools.pools.concat({
                    pool: action.payload.pool,
                    candlesByPoolAndDuration: [
                        {
                            pool: action.payload.pool,
                            duration: action.payload.duration,
                            candles: action.payload.candles,
                        },
                    ],
                });
                // else, replace candles for pool if different
            } else {
                // console.log('pool found in RTK for new candle subscription data');
                const durationToFind = action.payload.duration;
                const indexOfDuration = state.candlesForAllPools.pools[
                    indexOfPool
                ].candlesByPoolAndDuration
                    .map((item) => item.duration)
                    .findIndex((duration) => duration === durationToFind);

                if (indexOfDuration === -1) {
                    // console.log('duration not found');
                    state.candlesForAllPools.pools[indexOfPool].candlesByPoolAndDuration =
                        state.candlesForAllPools.pools[indexOfPool].candlesByPoolAndDuration.concat(
                            [
                                {
                                    pool: action.payload.pool,
                                    duration: action.payload.duration,
                                    candles: action.payload.candles,
                                },
                            ],
                        );
                } else {
                    const timeToFind = action.payload.candles[0].time;
                    const indexOfDuplicate = state.candlesForAllPools.pools[
                        indexOfPool
                    ].candlesByPoolAndDuration[indexOfDuration].candles
                        .map((item) => {
                            if (!item) {
                                return null;
                            } else {
                                return item.time;
                            }
                        })
                        .findIndex((time) => time === timeToFind);

                    // if new candle data not already in RTK, add
                    if (indexOfDuplicate === -1) {
                        // console.log('no duplicate found, adding');
                        state.candlesForAllPools.pools[indexOfPool].candlesByPoolAndDuration[
                            indexOfDuration
                        ].candles = action.payload.candles.concat(
                            state.candlesForAllPools.pools[indexOfPool].candlesByPoolAndDuration[
                                indexOfDuration
                            ].candles,
                        );
                    }
                }
            }
        },
        resetGraphData: (state) => {
            state.positionsByUser = initialState.positionsByUser;
            state.swapsByUser = initialState.swapsByUser;
        },
    },
});

// action creators are generated for each case reducer function
export const {
    setPositionsByUser,
    setPositionsByPool,
    setCandles,
    addCandles,
    setSwapsByUser,
    setSwapsByPool,
    resetGraphData,
} = graphDataSlice.actions;

export default graphDataSlice.reducer;
