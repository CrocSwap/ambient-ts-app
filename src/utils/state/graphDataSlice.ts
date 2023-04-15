import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IS_LOCAL_ENV } from '../../constants';
import { LimitOrderIF, PositionIF, TransactionIF } from '../interfaces/exports';

export interface graphData {
    lastBlock: number;
    lastBlockPoll?: NodeJS.Timer;
    positionsByUser: PositionsByUser;
    positionsByPool: PositionsByPool;
    leaderboardByPool: PositionsByPool;
    changesByUser: ChangesByUser;
    changesByPool: ChangesByPool;
    candlesForAllPools: CandlesForAllPools;
    liquidityData: LiquidityData;
    poolVolumeSeries: PoolVolumeSeries;
    poolTvlSeries: PoolTvlSeries;
    limitOrdersByUser: LimitOrdersByUser;
    limitOrdersByPool: LimitOrdersByPool;
    dataLoadingStatus: DataLoadingStatus;
}

export interface DataLoadingStatus {
    isConnectedUserTxDataLoading: boolean;
    isConnectedUserOrderDataLoading: boolean;
    isConnectedUserRangeDataLoading: boolean;
    isLookupUserTxDataLoading: boolean;
    isLookupUserOrderDataLoading: boolean;
    isLookupUserRangeDataLoading: boolean;
    isPoolTxDataLoading: boolean;
    isPoolOrderDataLoading: boolean;
    isPoolRangeDataLoading: boolean;
    isCandleDataLoading: boolean;
}

export interface LimitOrdersByUser {
    dataReceived: boolean;
    limitOrders: LimitOrderIF[];
}
export interface LimitOrdersByPool {
    dataReceived: boolean;
    limitOrders: LimitOrderIF[];
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

// export interface LiquidityForAllPools {
//     pools: Array<LiquidityByPool>;
// }

export interface LiquidityData {
    time: number;
    currentTick: number;
    ranges: Array<Range>;
}

// export interface LiquidityByPool {
//     pool: { baseAddress: string; quoteAddress: string; poolIdx: number; chainId: string };
//     liquidityData: liquidityData;
// }

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
    deltaAverageUSD: number;
    cumAverageUSD: number;
}

export interface CandlesForAllPools {
    pools: Array<Pool>;
}

export interface Pool {
    pool: {
        baseAddress: string;
        quoteAddress: string;
        poolIdx: number;
        network: string;
    };
    candlesByPoolAndDuration: Array<CandlesByPoolAndDuration>;
}

export interface CandlesByPoolAndDuration {
    pool: {
        baseAddress: string;
        quoteAddress: string;
        poolIdx: number;
        network: string;
    };
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
    averageLiquidityFee: number;
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

export interface ChangesByUser {
    dataReceived: boolean;
    changes: Array<TransactionIF>;
}

export interface ChangesByPool {
    dataReceived: boolean;
    changes: Array<TransactionIF>;
}

const initialState: graphData = {
    lastBlock: 0,
    positionsByUser: { dataReceived: false, positions: [] },
    positionsByPool: { dataReceived: false, positions: [] },
    leaderboardByPool: { dataReceived: false, positions: [] },
    changesByUser: { dataReceived: false, changes: [] },
    changesByPool: { dataReceived: false, changes: [] },
    limitOrdersByUser: { dataReceived: false, limitOrders: [] },
    limitOrdersByPool: { dataReceived: false, limitOrders: [] },
    candlesForAllPools: { pools: [] },
    liquidityData: { time: 0, currentTick: 0, ranges: [] },
    poolVolumeSeries: { dataReceived: false, pools: [] },
    poolTvlSeries: { dataReceived: false, pools: [] },
    dataLoadingStatus: {
        isConnectedUserTxDataLoading: true,
        isConnectedUserOrderDataLoading: true,
        isConnectedUserRangeDataLoading: true,
        isLookupUserTxDataLoading: true,
        isLookupUserOrderDataLoading: true,
        isLookupUserRangeDataLoading: true,
        isPoolTxDataLoading: true,
        isPoolOrderDataLoading: true,
        isPoolRangeDataLoading: true,
        isCandleDataLoading: true,
    },
};

export const graphDataSlice = createSlice({
    name: 'graphData',
    initialState,
    reducers: {
        setLastBlock: (state, action: PayloadAction<number>) => {
            state.lastBlock = action.payload;
        },
        setLastBlockPoll: (state, action: PayloadAction<NodeJS.Timer>) => {
            clearInterval(state.lastBlockPoll);
            state.lastBlockPoll = action.payload;
        },
        setPositionsByUser: (state, action: PayloadAction<PositionsByUser>) => {
            state.positionsByUser = action.payload;
        },
        addPositionsByUser: (
            state,
            action: PayloadAction<Array<PositionIF>>,
        ) => {
            for (let index = 0; index < action.payload.length; index++) {
                const updatedPosition = action.payload[index];
                const positionIdToFind =
                    updatedPosition.positionId.toLowerCase();
                const indexOfPositionInState =
                    state.positionsByUser.positions.findIndex(
                        (position) =>
                            position.positionId.toLowerCase() ===
                            positionIdToFind,
                    );
                if (indexOfPositionInState === -1) {
                    state.positionsByUser.positions = [
                        action.payload[index],
                    ].concat(state.positionsByUser.positions);
                } else {
                    const existingPosition =
                        state.positionsByUser.positions[indexOfPositionInState];
                    const updatedPosition = action.payload[index];

                    if (!updatedPosition.latestUpdateTime) {
                        updatedPosition.latestUpdateTime =
                            existingPosition.latestUpdateTime;
                    }

                    state.positionsByUser.positions[indexOfPositionInState] =
                        updatedPosition;
                }
            }
        },
        setPositionsByPool: (state, action: PayloadAction<PositionsByPool>) => {
            state.positionsByPool = action.payload;
        },
        setLeaderboardByPool: (
            state,
            action: PayloadAction<PositionsByPool>,
        ) => {
            state.leaderboardByPool = action.payload;
        },
        setLimitOrdersByUser: (
            state,
            action: PayloadAction<LimitOrdersByUser>,
        ) => {
            state.limitOrdersByUser = action.payload;
        },
        setLimitOrdersByPool: (
            state,
            action: PayloadAction<LimitOrdersByPool>,
        ) => {
            state.limitOrdersByPool = action.payload;
        },
        addPositionsByPool: (
            state,
            action: PayloadAction<Array<PositionIF>>,
        ) => {
            for (let index = 0; index < action.payload.length; index++) {
                const updatedPosition = action.payload[index];
                const positionIdToFind =
                    updatedPosition.positionId.toLowerCase();
                const indexOfPositionInState =
                    state.positionsByPool.positions.findIndex(
                        (position) =>
                            position.positionId.toLowerCase() ===
                            positionIdToFind,
                    );
                if (indexOfPositionInState === -1) {
                    state.positionsByPool.positions = [
                        action.payload[index],
                    ].concat(state.positionsByPool.positions);
                } else {
                    state.positionsByPool.positions[indexOfPositionInState] =
                        action.payload[index];
                }
            }
        },
        updateLeaderboard: (
            state,
            action: PayloadAction<Array<PositionIF>>,
        ) => {
            for (let index = 0; index < action.payload.length; index++) {
                const updatedPosition = action.payload[index];
                const positionIdToFind =
                    updatedPosition.positionId.toLowerCase();
                const indexOfPositionInState =
                    state.leaderboardByPool.positions.findIndex(
                        (position) =>
                            position.positionId.toLowerCase() ===
                            positionIdToFind,
                    );
                if (indexOfPositionInState === -1) {
                    state.leaderboardByPool.positions = [
                        action.payload[index],
                    ].concat(state.leaderboardByPool.positions);
                } else {
                    state.leaderboardByPool.positions[indexOfPositionInState] =
                        action.payload[index];
                }
            }
        },
        setPoolVolumeSeries: (
            state,
            action: PayloadAction<PoolVolumeSeries>,
        ) => {
            state.poolVolumeSeries = action.payload;
        },
        setPoolTvlSeries: (state, action: PayloadAction<PoolTvlSeries>) => {
            state.poolTvlSeries = action.payload;
        },
        setChangesByUser: (state, action: PayloadAction<ChangesByUser>) => {
            state.changesByUser = action.payload;
        },
        addChangesByUser: (
            state,
            action: PayloadAction<Array<TransactionIF>>,
        ) => {
            // const payload = action.payload;
            // console.log({ payload });
            const newChangesArray: Array<TransactionIF> = [];

            for (let index = 0; index < action.payload.length; index++) {
                const updatedTx = action.payload[index];
                const txToFind = updatedTx.tx.toLowerCase();
                const indexOfTxInState = state.changesByUser.changes.findIndex(
                    (tx) => tx.tx.toLowerCase() === txToFind,
                );
                if (indexOfTxInState === -1) {
                    newChangesArray.push(action.payload[index]);
                    // state.changesByUser.changes = [action.payload[index]].concat(
                    //     state.changesByUser.changes,
                    // );
                } else {
                    state.changesByUser.changes[indexOfTxInState] =
                        action.payload[index];
                }
            }
            if (newChangesArray.length)
                state.changesByUser.changes = newChangesArray.concat(
                    state.changesByUser.changes,
                );
        },
        addLimitOrderChangesByUser: (
            state,
            action: PayloadAction<LimitOrderIF[]>,
        ) => {
            for (let index = 0; index < action.payload.length; index++) {
                const updatedTx = action.payload[index];
                IS_LOCAL_ENV && console.debug({ updatedTx });
                const idToFind = updatedTx.limitOrderIdentifier.toLowerCase();
                const indexOfOrderInState =
                    state.limitOrdersByUser.limitOrders.findIndex(
                        (order) =>
                            order.limitOrderIdentifier.toLowerCase() ===
                            idToFind,
                    );
                if (indexOfOrderInState === -1) {
                    state.limitOrdersByUser.limitOrders = [
                        action.payload[index],
                    ].concat(state.limitOrdersByUser.limitOrders);
                } else {
                    state.limitOrdersByUser.limitOrders[indexOfOrderInState] =
                        action.payload[index];
                }
            }
        },
        addLimitOrderChangesByPool: (
            state,
            action: PayloadAction<LimitOrderIF[]>,
        ) => {
            for (let index = 0; index < action.payload.length; index++) {
                const updatedTx = action.payload[index];
                const idToFind = updatedTx.limitOrderIdentifier?.toLowerCase();
                const indexOfOrderInState =
                    state.limitOrdersByPool.limitOrders.findIndex(
                        (order) =>
                            order.limitOrderIdentifier?.toLowerCase() ===
                            idToFind,
                    );
                if (indexOfOrderInState === -1) {
                    state.limitOrdersByPool.limitOrders = [
                        action.payload[index],
                    ].concat(state.limitOrdersByPool.limitOrders);
                } else {
                    state.limitOrdersByPool.limitOrders[indexOfOrderInState] =
                        action.payload[index];
                }
            }
        },
        setChangesByPool: (state, action: PayloadAction<ChangesByPool>) => {
            state.changesByPool = action.payload;
        },
        addChangesByPool: (
            state,
            action: PayloadAction<Array<TransactionIF>>,
        ) => {
            for (let index = 0; index < action.payload.length; index++) {
                const updatedTx = action.payload[index];
                const txToFind = updatedTx.tx.toLowerCase();
                const indexOfTxInState = state.changesByPool.changes.findIndex(
                    (tx) => tx.tx.toLowerCase() === txToFind,
                );
                if (indexOfTxInState === -1) {
                    state.changesByPool.changes = [
                        action.payload[index],
                    ].concat(state.changesByPool.changes);
                } else {
                    state.changesByPool.changes[indexOfTxInState] =
                        action.payload[index];
                }
            }
        },
        setLiquidity: (state, action: PayloadAction<LiquidityData>) => {
            // console.log('pool found in RTK for new liquidity data');

            state.liquidityData = action.payload;
        },
        setCandles: (
            state,
            action: PayloadAction<CandlesByPoolAndDuration>,
        ) => {
            const poolToFind = JSON.stringify(action.payload.pool);
            const indexOfPool = state.candlesForAllPools.pools
                .map((item) => JSON.stringify(item.pool))
                .findIndex((pool) => pool === poolToFind);

            // if candles for pool not yet saved in RTK, add to RTK
            if (indexOfPool === -1) {
                // console.log('pool not found in RTK for new candle data');

                state.candlesForAllPools.pools =
                    state.candlesForAllPools.pools.concat({
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
                    IS_LOCAL_ENV && console.debug('duration not found');

                    state.candlesForAllPools.pools[
                        indexOfPool
                    ].candlesByPoolAndDuration = state.candlesForAllPools.pools[
                        indexOfPool
                    ].candlesByPoolAndDuration.concat([
                        {
                            pool: action.payload.pool,
                            duration: action.payload.duration,
                            candles: action.payload.candles,
                        },
                    ]);
                } else {
                    // console.log('duration found');
                    state.candlesForAllPools.pools[
                        indexOfPool
                    ].candlesByPoolAndDuration[indexOfDuration] = {
                        pool: action.payload.pool,
                        duration: action.payload.duration,
                        candles: action.payload.candles,
                    };
                }
                // state.candlesForAllPools.pools[indexOfPool] = action.payload;
            }
        },
        addCandles: (
            state,
            action: PayloadAction<CandlesByPoolAndDuration>,
        ) => {
            const poolToFind = JSON.stringify(
                action.payload.pool,
            ).toLowerCase();
            const indexOfPool = state.candlesForAllPools.pools
                .map((item) => JSON.stringify(item.pool).toLowerCase())
                .findIndex((pool) => pool === poolToFind);

            // if candles for pool not yet saved in RTK, add to RTK
            if (indexOfPool === -1) {
                console.error(
                    'pool not found in RTK for new candle subscription data',
                );
                state.candlesForAllPools.pools =
                    state.candlesForAllPools.pools.concat({
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
                    state.candlesForAllPools.pools[
                        indexOfPool
                    ].candlesByPoolAndDuration = state.candlesForAllPools.pools[
                        indexOfPool
                    ].candlesByPoolAndDuration.concat([
                        {
                            pool: action.payload.pool,
                            duration: action.payload.duration,
                            candles: action.payload.candles,
                        },
                    ]);
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
                        state.candlesForAllPools.pools[
                            indexOfPool
                        ].candlesByPoolAndDuration[indexOfDuration].candles =
                            action.payload.candles.concat(
                                state.candlesForAllPools.pools[indexOfPool]
                                    .candlesByPoolAndDuration[indexOfDuration]
                                    .candles,
                            );
                    }
                }
            }
        },
        setDataLoadingStatus: (
            state,
            action: PayloadAction<{
                datasetName: string;
                loadingStatus: boolean;
            }>,
        ) => {
            switch (action.payload.datasetName) {
                case 'connectedUserTxData':
                    state.dataLoadingStatus.isConnectedUserTxDataLoading =
                        action.payload.loadingStatus;
                    break;
                case 'connectedUserOrderData':
                    state.dataLoadingStatus.isConnectedUserOrderDataLoading =
                        action.payload.loadingStatus;
                    break;
                case 'connectedUserRangeData':
                    state.dataLoadingStatus.isConnectedUserRangeDataLoading =
                        action.payload.loadingStatus;
                    break;
                case 'lookupUserTxData':
                    state.dataLoadingStatus.isLookupUserTxDataLoading =
                        action.payload.loadingStatus;
                    break;
                case 'lookupUserOrderData':
                    state.dataLoadingStatus.isLookupUserOrderDataLoading =
                        action.payload.loadingStatus;
                    break;
                case 'lookupUserRangeData':
                    state.dataLoadingStatus.isLookupUserRangeDataLoading =
                        action.payload.loadingStatus;
                    break;
                case 'poolTxData':
                    state.dataLoadingStatus.isPoolTxDataLoading =
                        action.payload.loadingStatus;
                    break;
                case 'poolOrderData':
                    state.dataLoadingStatus.isPoolOrderDataLoading =
                        action.payload.loadingStatus;
                    break;
                case 'poolRangeData':
                    state.dataLoadingStatus.isPoolRangeDataLoading =
                        action.payload.loadingStatus;
                    break;
                case 'candleData':
                    state.dataLoadingStatus.isCandleDataLoading =
                        action.payload.loadingStatus;
                    break;
                default:
                    break;
            }
        },
        resetConnectedUserDataLoadingStatus: (state) => {
            state.dataLoadingStatus.isConnectedUserTxDataLoading = true;
            state.dataLoadingStatus.isConnectedUserOrderDataLoading = true;
            state.dataLoadingStatus.isConnectedUserRangeDataLoading = true;
            // state.dataLoadingStatus.isLookupUserTxDataLoading = true;
            // state.dataLoadingStatus.isLookupUserOrderDataLoading = true;
            // state.dataLoadingStatus.isLookupUserRangeDataLoading = true;
            // state.dataLoadingStatus.isPoolTxDataLoading = true;
            // state.dataLoadingStatus.isPoolOrderDataLoading = true;
            // state.dataLoadingStatus.isPoolRangeDataLoading = true;
            // state.dataLoadingStatus.isCandleDataLoading = true;
        },
        resetLookupUserDataLoadingStatus: (state) => {
            state.dataLoadingStatus.isLookupUserTxDataLoading = true;
            state.dataLoadingStatus.isLookupUserOrderDataLoading = true;
            state.dataLoadingStatus.isLookupUserRangeDataLoading = true;
        },
        resetUserGraphData: (state) => {
            state.positionsByUser = initialState.positionsByUser;
            state.changesByUser = initialState.changesByUser;
            state.limitOrdersByUser = initialState.limitOrdersByUser;
        },
    },
});

// action creators are generated for each case reducer function
export const {
    setLastBlock,
    setLastBlockPoll,
    setPositionsByUser,
    addPositionsByUser,
    setPositionsByPool,
    setLeaderboardByPool,
    updateLeaderboard,
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
    setDataLoadingStatus,
    resetUserGraphData,
    resetConnectedUserDataLoadingStatus,
    resetLookupUserDataLoadingStatus,
} = graphDataSlice.actions;

export default graphDataSlice.reducer;
