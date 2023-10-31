import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CandleData } from '../../App/functions/fetchCandleSeries';
import { LiquidityDataIF } from '../../App/functions/fetchPoolLiquidity';
import { LimitOrderIF, PositionIF, TransactionIF } from '../interfaces/exports';

export interface graphData {
    lastBlock: number;
    userPositionsByPool: PositionsByPool;
    positionsByPool: PositionsByPool;
    leaderboardByPool: PositionsByPool;
    changesByPool: ChangesByPool;
    liquidityData?: LiquidityDataIF;
    liquidityRequest?: PoolRequestParams;
    userLimitOrdersByPool: LimitOrdersByPool;
    limitOrdersByPool: LimitOrdersByPool;
}

export interface PoolRequestParams {
    baseAddress: string;
    quoteAddress: string;
    poolIndex: number;
    chainId: string;
}

export interface LimitOrdersByPool {
    dataReceived: boolean;
    limitOrders: LimitOrderIF[];
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

export interface PositionsByPool {
    dataReceived: boolean;
    positions: Array<PositionIF>;
}

export interface ChangesByPool {
    dataReceived: boolean;
    changes: Array<TransactionIF>;
}

const initialState: graphData = {
    lastBlock: 0,
    userPositionsByPool: { dataReceived: false, positions: [] },
    positionsByPool: { dataReceived: false, positions: [] },
    leaderboardByPool: { dataReceived: false, positions: [] },
    changesByPool: { dataReceived: false, changes: [] },
    userLimitOrdersByPool: { dataReceived: false, limitOrders: [] },
    limitOrdersByPool: { dataReceived: false, limitOrders: [] },
    liquidityData: undefined,
    liquidityRequest: undefined,
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
        setChangesByPool: (state, action: PayloadAction<ChangesByPool>) => {
            state.changesByPool = action.payload;
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
    },
});

// action creators are generated for each case reducer function
export const {
    setLastBlock,
    setUserPositionsByPool,
    setPositionsByPool,
    setLeaderboardByPool,
    setLiquidity,
    setLiquidityPending,
    setUserLimitOrdersByPool,
    setLimitOrdersByPool,
    setChangesByPool,
} = graphDataSlice.actions;

export default graphDataSlice.reducer;
