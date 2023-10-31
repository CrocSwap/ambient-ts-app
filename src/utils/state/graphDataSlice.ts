import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CandleData } from '../../App/functions/fetchCandleSeries';
import { LiquidityDataIF } from '../../App/functions/fetchPoolLiquidity';
import { LimitOrderIF } from '../interfaces/exports';

interface graphData {
    liquidityData?: LiquidityDataIF;
    liquidityRequest?: PoolRequestParams;
    userLimitOrdersByPool: LimitOrdersByPool;
    limitOrdersByPool: LimitOrdersByPool;
}

interface PoolRequestParams {
    baseAddress: string;
    quoteAddress: string;
    poolIndex: number;
    chainId: string;
}

interface LimitOrdersByPool {
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

const initialState: graphData = {
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
    setLiquidity,
    setLiquidityPending,
    setUserLimitOrdersByPool,
    setLimitOrdersByPool,
} = graphDataSlice.actions;

export default graphDataSlice.reducer;
