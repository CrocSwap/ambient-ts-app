import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CandleData } from '../../App/functions/fetchCandleSeries';
import { LiquidityDataIF } from '../../App/functions/fetchPoolLiquidity';
import { IS_LOCAL_ENV } from '../../constants';
import { LimitOrderIF, PositionIF, TransactionIF } from '../interfaces/exports';

export interface graphData {
    lastBlock: number;
    lastBlockPoll?: NodeJS.Timer;
    positionsByUser: PositionsByUser;
    userPositionsByPool: PositionsByPool;
    positionsByPool: PositionsByPool;
    leaderboardByPool: PositionsByPool;
    changesByUser: ChangesByUser;
    changesByPool: ChangesByPool;
    candlesForAllPools: CandlesForAllPools;
    liquidityData?: LiquidityDataIF;
    liquidityRequest?: PoolRequestParams;
    limitOrdersByUser: LimitOrdersByUser;
    userLimitOrdersByPool: LimitOrdersByPool;
    limitOrdersByPool: LimitOrdersByPool;
    dataLoadingStatus: DataLoadingStatus;
}

export interface PoolRequestParams {
    baseAddress: string;
    quoteAddress: string;
    poolIndex: number;
    chainId: string;
}

export interface DataLoadingStatus {
    isConnectedUserTxDataLoading: boolean;
    isConnectedUserOrderDataLoading: boolean;
    isConnectedUserPoolOrderDataLoading: boolean;
    isConnectedUserRangeDataLoading: boolean;
    isConnectedUserPoolRangeDataLoading: boolean;
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

export interface CandlesForAllPools {
    pools: Array<Pool>;
}

export interface Pool {
    pool: {
        baseAddress: string;
        quoteAddress: string;
        poolIdx: number;
    };
    candlesByPoolAndDuration: Array<CandlesByPoolAndDuration>;
}

export interface CandlesByPoolAndDuration {
    pool: {
        baseAddress: string;
        quoteAddress: string;
        poolIdx: number;
        chainId: string;
    };
    duration: number;
    candles: Array<CandleData>;
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
    userPositionsByPool: { dataReceived: false, positions: [] },
    positionsByPool: { dataReceived: false, positions: [] },
    leaderboardByPool: { dataReceived: false, positions: [] },
    changesByUser: { dataReceived: false, changes: [] },
    changesByPool: { dataReceived: false, changes: [] },
    limitOrdersByUser: { dataReceived: false, limitOrders: [] },
    userLimitOrdersByPool: { dataReceived: false, limitOrders: [] },
    limitOrdersByPool: { dataReceived: false, limitOrders: [] },
    candlesForAllPools: { pools: [] },
    liquidityData: undefined,
    liquidityRequest: undefined,
    dataLoadingStatus: {
        isConnectedUserTxDataLoading: true,
        isConnectedUserOrderDataLoading: true,
        isConnectedUserPoolOrderDataLoading: true,
        isConnectedUserRangeDataLoading: true,
        isConnectedUserPoolRangeDataLoading: true,
        isLookupUserTxDataLoading: true,
        isLookupUserOrderDataLoading: true,
        isLookupUserRangeDataLoading: true,
        isPoolTxDataLoading: true,
        isPoolOrderDataLoading: true,
        isPoolRangeDataLoading: true,
        isCandleDataLoading: true,
    },
};

function normalizeAddr(addr: string): string {
    const caseAddr = addr.toLowerCase();
    return caseAddr.startsWith('0x') ? caseAddr : '0x' + caseAddr;
}

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
        setUserPositionsByPool: (
            state,
            action: PayloadAction<PositionsByPool>,
        ) => {
            state.userPositionsByPool = action.payload;
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
        setUserLimitOrdersByPool: (
            state,
            action: PayloadAction<LimitOrdersByPool>,
        ) => {
            state.userLimitOrdersByPool = action.payload;
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
        setChangesByUser: (state, action: PayloadAction<ChangesByUser>) => {
            state.changesByUser = action.payload;
        },
        addChangesByUser: (
            state,
            action: PayloadAction<Array<TransactionIF>>,
        ) => {
            const newChangesArray: Array<TransactionIF> = [];

            for (let index = 0; index < action.payload.length; index++) {
                const updatedTx = action.payload[index];
                const txToFind = updatedTx.txHash.toLowerCase();
                const indexOfTxInState = state.changesByUser.changes.findIndex(
                    (tx) => tx.txHash.toLowerCase() === txToFind,
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
                const idToFind = updatedTx.limitOrderId.toLowerCase();
                const indexOfOrderInState =
                    state.limitOrdersByUser.limitOrders.findIndex(
                        (order) =>
                            order.limitOrderId.toLowerCase() === idToFind,
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
                const idToFind = updatedTx.limitOrderId?.toLowerCase();
                const indexOfOrderInState =
                    state.limitOrdersByPool.limitOrders.findIndex(
                        (order) =>
                            order.limitOrderId?.toLowerCase() === idToFind,
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
                const txToFind = updatedTx.txHash.toLowerCase();
                const indexOfTxInState = state.changesByPool.changes.findIndex(
                    (tx) => tx.txHash.toLowerCase() === txToFind,
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

        setLiquidity: (state, action: PayloadAction<LiquidityDataIF>) => {
            // Sanitize the raw result from the backend
            const curve = action.payload.curveState;
            const base = normalizeAddr(curve.base);
            const quote = normalizeAddr(curve.quote);
            const chainId = curve.chainId;

            // Verify that the result matches the current request in case multiple are in-flight
            if (
                state.liquidityRequest?.baseAddress.toLowerCase() === base &&
                state.liquidityRequest?.quoteAddress.toLowerCase() === quote &&
                state.liquidityRequest?.poolIndex === curve.poolIdx &&
                state.liquidityRequest?.chainId === chainId
            ) {
                state.liquidityData = action.payload;
                state.liquidityData.curveState.base = base;
                state.liquidityData.curveState.quote = quote;
                state.liquidityData.curveState.chainId = chainId;
            } else {
                console.warn(
                    'Discarding mismatched liquidity curve request',
                    base,
                    quote,
                    chainId,
                );
            }
        },

        setLiquidityPending: (
            state,
            action: PayloadAction<PoolRequestParams>,
        ) => {
            state.liquidityData = undefined;
            state.liquidityRequest = action.payload;
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
                    state.candlesForAllPools.pools[
                        indexOfPool
                    ].candlesByPoolAndDuration[indexOfDuration] = {
                        pool: action.payload.pool,
                        duration: action.payload.duration,
                        candles: action.payload.candles,
                    };
                }
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
                const durationToFind = action.payload.duration;
                const indexOfDuration = state.candlesForAllPools.pools[
                    indexOfPool
                ].candlesByPoolAndDuration
                    .map((item) => item.duration)
                    .findIndex((duration) => duration === durationToFind);

                if (indexOfDuration === -1) {
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
                case 'connectedUserPoolOrderData':
                    state.dataLoadingStatus.isConnectedUserPoolOrderDataLoading =
                        action.payload.loadingStatus;
                    break;
                case 'connectedUserRangeData':
                    state.dataLoadingStatus.isConnectedUserRangeDataLoading =
                        action.payload.loadingStatus;
                    break;
                case 'connectedUserPoolRangeData':
                    state.dataLoadingStatus.isConnectedUserPoolRangeDataLoading =
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
        resetPoolDataLoadingStatus: (state) => {
            state.dataLoadingStatus.isPoolTxDataLoading = true;
            state.dataLoadingStatus.isPoolOrderDataLoading = true;
            state.dataLoadingStatus.isPoolRangeDataLoading = true;
        },
        resetConnectedUserDataLoadingStatus: (state) => {
            state.dataLoadingStatus.isConnectedUserTxDataLoading = true;
            state.dataLoadingStatus.isConnectedUserOrderDataLoading = true;
            state.dataLoadingStatus.isConnectedUserRangeDataLoading = true;
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
    setUserPositionsByPool,
    setPositionsByPool,
    setLeaderboardByPool,
    updateLeaderboard,
    addPositionsByPool,
    setLiquidity,
    setLiquidityPending,
    setCandles,
    addCandles,
    setLimitOrdersByUser,
    setUserLimitOrdersByPool,
    setLimitOrdersByPool,
    setChangesByUser,
    addChangesByUser,
    addLimitOrderChangesByUser,
    addLimitOrderChangesByPool,
    addChangesByPool,
    setChangesByPool,
    setDataLoadingStatus,
    resetUserGraphData,
    resetPoolDataLoadingStatus,
    resetConnectedUserDataLoadingStatus,
    resetLookupUserDataLoadingStatus,
} = graphDataSlice.actions;

export default graphDataSlice.reducer;
