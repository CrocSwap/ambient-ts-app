import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PositionIF } from '../interfaces/PositionIF';
export interface graphData {
    lastBlock: number;
    positionsByUser: PositionsByUser;
    positionsByPool: PositionsByPool;
    changesByUser: ChangesByUser;
    changesByPool: ChangesByPool;
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
    limitOrderIdentifier: string;
    tx: string;
    positionId: string;
    source: string;
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
    baseFlowDecimalCorrected: number;
    quoteFlowDecimalCorrected: number;
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
    baseTokenLogoURI: string;
    quoteSymbol: string;
    quoteDecimals: number;
    quoteTokenLogoURI: string;
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

export interface TvlData {
    interpBadness: number;
    interpDistHigher: number;
    interpDistLower: number;
    method: string;
    time: number;
    tvl: number;
}

export interface CandleData {
    tvlData: TvlData;
    volumeUSD: number;
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

export interface ITransaction {
    base: string;
    baseDecimals: number;
    baseFlow: string;
    baseSymbol: string;
    baseTokenLogoURI: string;
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
    quoteTokenLogoURI: string;
    source: string;
    entityType: string;
    changeType: string;
    time: number;
    tx: string;
    user: string;
    userEnsName: string;
    limitPrice: number;
    price: number;
    invPrice: number;
    limitPriceDecimalCorrected: number;
    invLimitPriceDecimalCorrected: number;
    priceDecimalCorrected: number;
    invPriceDecimalCorrected: number;
    valueUSD: number;
    ensResolution: string;
}

export interface ChangesByUser {
    dataReceived: boolean;
    changes: Array<ITransaction>;
}

export interface ChangesByPool {
    dataReceived: boolean;
    changes: Array<ITransaction>;
}

const initialState: graphData = {
    lastBlock: 0,
    positionsByUser: { dataReceived: false, positions: [] },
    positionsByPool: { dataReceived: false, positions: [] },
    changesByUser: { dataReceived: false, changes: [] },
    changesByPool: { dataReceived: false, changes: [] },
    limitOrdersByUser: { dataReceived: false, limitOrders: [] },
    limitOrdersByPool: { dataReceived: false, limitOrders: [] },
    candlesForAllPools: { pools: [] },
    liquidityForAllPools: { pools: [] },
    poolVolumeSeries: { dataReceived: false, pools: [] },
    poolTvlSeries: { dataReceived: false, pools: [] },
};

export const graphDataSlice = createSlice({
    name: 'graphData',
    initialState,
    reducers: {
        setLastBlock: (state, action: PayloadAction<number>) => {
            state.lastBlock = action.payload;
        },
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
        setChangesByUser: (state, action: PayloadAction<ChangesByUser>) => {
            state.changesByUser = action.payload;
        },
        addChangesByUser: (state, action: PayloadAction<Array<ITransaction>>) => {
            for (let index = 0; index < action.payload.length; index++) {
                const updatedTx = action.payload[index];
                const txToFind = updatedTx.tx.toLowerCase();
                const indexOfTxInState = state.changesByUser.changes.findIndex(
                    (tx) => tx.tx.toLowerCase() === txToFind,
                );
                if (indexOfTxInState === -1) {
                    state.changesByUser.changes = action.payload.concat(
                        state.changesByUser.changes,
                    );
                } else {
                    state.changesByUser.changes[indexOfTxInState] = action.payload[index];
                }
            }
        },
        addLimitOrderChangesByUser: (state, action: PayloadAction<Array<ILimitOrderState>>) => {
            for (let index = 0; index < action.payload.length; index++) {
                const updatedTx = action.payload[index];
                const idToFind = updatedTx.limitOrderIdentifier.toLowerCase();
                const indexOfOrderInState = state.limitOrdersByUser.limitOrders.findIndex(
                    (order) => order.limitOrderIdentifier.toLowerCase() === idToFind,
                );
                if (indexOfOrderInState === -1) {
                    state.limitOrdersByUser.limitOrders = action.payload.concat(
                        state.limitOrdersByUser.limitOrders,
                    );
                } else {
                    state.limitOrdersByUser.limitOrders[indexOfOrderInState] =
                        action.payload[index];
                }
            }
        },
        addLimitOrderChangesByPool: (state, action: PayloadAction<Array<ILimitOrderState>>) => {
            for (let index = 0; index < action.payload.length; index++) {
                const updatedTx = action.payload[index];
                const idToFind = updatedTx.limitOrderIdentifier.toLowerCase();
                const indexOfOrderInState = state.limitOrdersByPool.limitOrders.findIndex(
                    (order) => order.limitOrderIdentifier.toLowerCase() === idToFind,
                );
                if (indexOfOrderInState === -1) {
                    state.limitOrdersByPool.limitOrders = action.payload.concat(
                        state.limitOrdersByPool.limitOrders,
                    );
                } else {
                    state.limitOrdersByPool.limitOrders[indexOfOrderInState] =
                        action.payload[index];
                }
            }
        },
        setChangesByPool: (state, action: PayloadAction<ChangesByPool>) => {
            state.changesByPool = action.payload;
        },
        addChangesByPool: (state, action: PayloadAction<Array<ITransaction>>) => {
            for (let index = 0; index < action.payload.length; index++) {
                const updatedTx = action.payload[index];
                const txToFind = updatedTx.tx.toLowerCase();
                const indexOfTxInState = state.changesByPool.changes.findIndex(
                    (tx) => tx.tx.toLowerCase() === txToFind,
                );
                if (indexOfTxInState === -1) {
                    state.changesByPool.changes = action.payload.concat(
                        state.changesByPool.changes,
                    );
                } else {
                    state.changesByPool.changes[indexOfTxInState] = action.payload[index];
                }
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
            state.changesByUser = initialState.changesByUser;
        },
    },
});

// action creators are generated for each case reducer function
export const {
    setLastBlock,
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
    setChangesByUser,
    addChangesByUser,
    addLimitOrderChangesByUser,
    addLimitOrderChangesByPool,
    addChangesByPool,
    setChangesByPool,
    resetGraphData,
} = graphDataSlice.actions;

export default graphDataSlice.reducer;
