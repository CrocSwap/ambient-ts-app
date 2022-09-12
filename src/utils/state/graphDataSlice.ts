import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PositionIF } from '../interfaces/PositionIF';
export interface graphData {
    positionsByUser: PositionsByUser;
    positionsByPool: PositionsByPool;
    swapsByUser: SwapsByUser;
    swapsByPool: SwapsByPool;
    candlesForAllPools: CandlesForAllPools;
    liquidityForAllPools: LiquidityForAllPools;
    poolVolumeSeries: PoolVolumeSeries;
    poolTvlSeries: PoolTvlSeries;
    limitOrdersByUser: LimitOrdersByUser;
    limitOrdersByPool: LimitOrdersByPool;
}

export interface LimitOrdersByUser {
    dataReceived: boolean;
    limitOrders: Array<ILimitOrderState>;
}
export interface LimitOrdersByPool {
    dataReceived: boolean;
    limitOrders: Array<ILimitOrderState>;
}

export interface ILimitOrderState {
    id: string;
    positionId: string;
    network: string;
    block: number;
    time: number;
    user: string;
    base: string;
    quote: string;
    poolIdx: number;
    poolHash: string;
    bidTick: number;
    askTick: number;
    isBid: boolean;
    price: number;
    deflator: number;
    concGrowth: number;
    positionLiq: number;
    positionLiqBase: number;
    positionLiqBaseDecimalCorrected: number;
    positionLiqQuoteDecimalCorrected: number;
    positionLiqQuote: number;
    updateType: string;
    latestUpdateBlock: number;
    latestUpdateTime: number;
    latestCrossBlock: number;
    latestCrossTime: number;
    latestCrossTransaction: string;
    knockoutChanges: number;
    baseSymbol: string;
    baseDecimals: number;
    quoteSymbol: string;
    quoteDecimals: number;
    limitPrice: number;
    invLimitPrice: number;
    limitPriceDecimalCorrected: number;
    invLimitPriceDecimalCorrected: number;
    ensResolution: string;
    ensResolutionAge: number;
    basePrice: number;
    quotePrice: number;
    positionLiqBaseUSD: number;
    positionLiqQuoteUSD: number;
    positionLiqTotalUSD: number;
    chainId: string;
}
export interface PoolVolumeSeries {
    dataReceived: boolean;
    pools: Array<VolumeSeriesByPool>;
}

export interface PoolTvlSeries {
    dataReceived: boolean;
    pools: Array<TvlSeriesByPool>;
}

export interface TvlSeriesByPool {
    dataReceived: boolean;
    pool: {
        base: string;
        quote: string;
        poolIdx: number;
        chainId: string;
    };
    tvlData: TvlSeriesByPoolTimeAndResolution;
}

export interface VolumeSeriesByPool {
    dataReceived: boolean;
    pool: {
        base: string;
        quote: string;
        poolIdx: number;
        chainId: string;
    };
    volumeData: VolumeSeriesByPoolTimeAndResolution;
}

export interface TvlSeriesByPoolTimeAndResolution {
    network: string;
    base: string;
    quote: string;
    poolIdx: number;
    timeStart: number;
    timeEnd: number;
    resolution: number;
    seriesData: Array<TvlByTimeData>;
}

export interface VolumeSeriesByPoolTimeAndResolution {
    network: string;
    base: string;
    quote: string;
    poolIdx: number;
    timeStart: number;
    timeEnd: number;
    resolution: number;
    seriesData: Array<VolumeByTimeData>;
}

export interface TvlByTimeData {
    time: number;
    tvl: number;
    method: string;
}

export interface VolumeByTimeData {
    time: number;
    volumeDay: number;
    method: string;
}

export interface LiquidityForAllPools {
    pools: Array<LiquidityByPool>;
}

export interface LiquidityByPool {
    pool: { baseAddress: string; quoteAddress: string; poolIdx: number; chainId: string };
    liquidityData: Array<Range>;
}

export interface Range {
    lowerBound: number | string;
    lowerBoundPrice: number;
    lowerBoundInvPrice: number | string;
    lowerBoundPriceDecimalCorrected: number;
    lowerBoundInvPriceDecimalCorrected: number | string;
    upperBound: number;
    upperBoundPrice: number;
    upperBoundInvPrice: number;
    upperBoundPriceDecimalCorrected: number;
    upperBoundInvPriceDecimalCorrected: number;
    activeLiq: string;
    activeAmbientLiq: string;
    activeConcLiq: string;
    cumAskLiq: string;
    cumAmbientAskLiq: string;
    cumConcAskLiq: string;
    cumBidLiq: string;
    cumAmbientBidLiq: string;
    cumConcBidLiq: string;
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
    minPriceDecimalCorrected: number;
    maxPriceDecimalCorrected: number;
    priceOpenDecimalCorrected: number;
    priceCloseDecimalCorrected: number;
    priceCloseExclMEVDecimalCorrected: number;
    invPriceCloseExclMEVDecimalCorrected: number;
    invMinPriceDecimalCorrected: number;
    invMaxPriceDecimalCorrected: number;
    invPriceOpenDecimalCorrected: number;
    invPriceCloseDecimalCorrected: number;
    minPriceExclMEVDecimalCorrected: number;
    invMinPriceExclMEVDecimalCorrected: number;
    maxPriceExclMEVDecimalCorrected: number;
    invMaxPriceExclMEVDecimalCorrected: number;
    priceOpenExclMEVDecimalCorrected: number;
    invPriceOpenExclMEVDecimalCorrected: number;
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

export interface pool {
    base: string;
    id: string;
    poolIdx: string;
    quote: string;
}

export interface ISwap {
    base: string;
    baseDecimals: number;
    baseFlow: string;
    baseSymbol: string;
    block: number;
    chainId: string;
    network: string;
    dex: string;
    id: string;
    inBaseQty: boolean;
    isBuy: boolean;
    minOut: string;
    poolHash: string;
    poolIdx: number;
    qty: string;
    quote: string;
    quoteDecimals: number;
    quoteFlow: string;
    quoteSymbol: string;
    source: string;
    time: number;
    tx: string;
    user: string;
    userEnsName: string;
    limitPrice: number;
    price: number;
    invPrice: number;
    priceDecimalCorrected: number;
    invPriceDecimalCorrected: number;
    valueUSD: number;
    ensResolution: string;
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
    limitOrdersByUser: { dataReceived: false, limitOrders: [] },
    limitOrdersByPool: { dataReceived: false, limitOrders: [] },
    swapsByPool: { dataReceived: false, swaps: [] },
    candlesForAllPools: { pools: [] },
    liquidityForAllPools: { pools: [] },
    poolVolumeSeries: { dataReceived: false, pools: [] },
    poolTvlSeries: { dataReceived: false, pools: [] },
};

export const graphDataSlice = createSlice({
    name: 'graphData',
    initialState,
    reducers: {
        setPositionsByUser: (state, action: PayloadAction<PositionsByUser>) => {
            state.positionsByUser = action.payload;
        },
        addPositionsByUser: (state, action: PayloadAction<Array<PositionIF>>) => {
            if (action.payload[0].positionType === 'knockout') {
                const slotToFind = action.payload[0].merkleStorageSlot?.toLowerCase();
                const indexOfSlot = state.positionsByUser.positions
                    .map((position) =>
                        position.positionType === 'knockout'
                            ? position.merkleStorageSlot?.toLowerCase()
                            : false,
                    )
                    .findIndex((slot) => slot === slotToFind);
                if (indexOfSlot === -1) {
                    state.positionsByUser.positions = action.payload.concat(
                        state.positionsByUser.positions,
                    );
                } else {
                    state.positionsByUser.positions[indexOfSlot] = action.payload[0];
                }
            } else {
                const slotToFind = action.payload[0].positionStorageSlot?.toLowerCase();
                const indexOfSlot = state.positionsByUser.positions
                    .map((position) => position.positionStorageSlot?.toLowerCase())
                    .findIndex((slot) => slot === slotToFind);
                if (indexOfSlot === -1) {
                    state.positionsByUser.positions = action.payload.concat(
                        state.positionsByUser.positions,
                    );
                } else {
                    state.positionsByUser.positions[indexOfSlot] = action.payload[0];
                }
            }
        },
        setPositionsByPool: (state, action: PayloadAction<PositionsByPool>) => {
            state.positionsByPool = action.payload;
        },
        setLimitOrdersByUser: (state, action: PayloadAction<LimitOrdersByUser>) => {
            state.limitOrdersByUser = action.payload;
        },
        setLimitOrdersByPool: (state, action: PayloadAction<LimitOrdersByPool>) => {
            state.limitOrdersByPool = action.payload;
        },
        addPositionsByPool: (state, action: PayloadAction<Array<PositionIF>>) => {
            if (action.payload[0].positionType === 'knockout') {
                const slotToFind = action.payload[0].merkleStorageSlot?.toLowerCase();
                const indexOfSlot = state.positionsByPool.positions
                    .map((position) => position.merkleStorageSlot?.toLowerCase())
                    .findIndex((slot) => slot === slotToFind);
                if (indexOfSlot === -1) {
                    state.positionsByPool.positions = action.payload.concat(
                        state.positionsByPool.positions,
                    );
                } else {
                    state.positionsByPool.positions[indexOfSlot] = action.payload[0];
                }
            } else {
                const slotToFind = action.payload[0].positionStorageSlot?.toLowerCase();
                const indexOfSlot = state.positionsByPool.positions
                    .map((position) => position.positionStorageSlot?.toLowerCase())
                    .findIndex((slot) => slot === slotToFind);
                if (indexOfSlot === -1) {
                    state.positionsByPool.positions = action.payload.concat(
                        state.positionsByPool.positions,
                    );
                } else {
                    state.positionsByPool.positions[indexOfSlot] = action.payload[0];
                }
            }
        },
        setPoolVolumeSeries: (state, action: PayloadAction<PoolVolumeSeries>) => {
            state.poolVolumeSeries = action.payload;
        },
        setPoolTvlSeries: (state, action: PayloadAction<PoolTvlSeries>) => {
            state.poolTvlSeries = action.payload;
        },
        setSwapsByUser: (state, action: PayloadAction<SwapsByUser>) => {
            state.swapsByUser = action.payload;
        },
        addSwapsByUser: (state, action: PayloadAction<Array<ISwap>>) => {
            const swapTxToFind = action.payload[0].tx.toLowerCase();
            const indexOfTx = state.swapsByUser.swaps
                .map((item) => item.tx.toLowerCase())
                .findIndex((tx) => tx === swapTxToFind);
            if (indexOfTx === -1) {
                state.swapsByUser.swaps = action.payload.concat(state.swapsByUser.swaps);
            } else {
                state.swapsByUser.swaps[indexOfTx] = action.payload[0];
            }
        },
        setSwapsByPool: (state, action: PayloadAction<SwapsByPool>) => {
            state.swapsByPool = action.payload;
        },
        addSwapsByPool: (state, action: PayloadAction<Array<ISwap>>) => {
            const swapTxToFind = action.payload[0].tx.toLowerCase();
            const indexOfTx = state.swapsByPool.swaps
                .map((item) => item.tx.toLowerCase())
                .findIndex((tx) => tx === swapTxToFind);
            if (indexOfTx === -1) {
                state.swapsByPool.swaps = action.payload.concat(state.swapsByPool.swaps);
            } else {
                state.swapsByPool.swaps[indexOfTx] = action.payload[0];
            }
        },
        setLiquidity: (state, action: PayloadAction<LiquidityByPool>) => {
            const poolToFind = JSON.stringify(action.payload.pool);
            const indexOfPool = state.liquidityForAllPools.pools
                .map((item) => JSON.stringify(item.pool))
                .findIndex((pool) => pool === poolToFind);

            // if candles for pool not yet saved in RTK, add to RTK
            if (indexOfPool === -1) {
                // console.log('pool not found in RTK for new candle data');

                state.liquidityForAllPools.pools = state.liquidityForAllPools.pools.concat({
                    pool: action.payload.pool,
                    liquidityData: action.payload.liquidityData,
                });
                // else, check if duration exists
            } else {
                // console.log('pool found in RTK for new liquidity data');

                state.liquidityForAllPools.pools[indexOfPool].liquidityData =
                    action.payload.liquidityData;
            }
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
    addPositionsByUser,
    setPositionsByPool,
    addPositionsByPool,
    setPoolVolumeSeries,
    setPoolTvlSeries,
    setLiquidity,
    setCandles,
    addCandles,
    setLimitOrdersByUser,
    setLimitOrdersByPool,
    setSwapsByUser,
    addSwapsByUser,
    addSwapsByPool,
    setSwapsByPool,
    resetGraphData,
} = graphDataSlice.actions;

export default graphDataSlice.reducer;
