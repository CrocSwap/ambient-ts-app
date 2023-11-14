import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface targetData {
    name: string;
    value: number | undefined;
}

export interface candleDomain {
    lastCandleDate: number | undefined;
    domainBoundry: number | undefined;
}

export interface candleScale {
    lastCandleDate: number | undefined;
    nCandles: number;
    isFetchForTimeframe: boolean;
    isShowLatestCandle: boolean;
}

export interface TradeDataIF {
    // Look into this
    shouldSwapDirectionReverse: boolean;

    // swap and  limit order UI
    primaryQuantity: string;
    slippageTolerance: number; // swap and range, not limit

    // background computations
    poolPriceNonDisplay: number;

    // Limit order
    limitTick: number | undefined; // values that affects price? just in limit order

    // // not used
    // isTokenABase?: boolean;
    // tokenA?: TokenIF;
    // tokenB?: TokenIF;
}

const initialState: TradeDataIF = {
    shouldSwapDirectionReverse: false,
    primaryQuantity: '',
    limitTick: undefined,
    poolPriceNonDisplay: 0,
    slippageTolerance: 0.05,
};

export const tradeDataSlice = createSlice({
    name: 'tradeData',
    initialState,
    reducers: {
        setShouldSwapDirectionReverse: (
            state,
            action: PayloadAction<boolean>,
        ) => {
            state.shouldSwapDirectionReverse = action.payload;
        },
        setPrimaryQuantity: (state, action: PayloadAction<string>) => {
            state.primaryQuantity = action.payload;
        },
        setLimitTick: (state, action: PayloadAction<number | undefined>) => {
            state.limitTick = action.payload;
        },
        setPoolPriceNonDisplay: (state, action: PayloadAction<number>) => {
            state.poolPriceNonDisplay = action.payload;
        },
        setSlippageTolerance: (state, action: PayloadAction<number>) => {
            state.slippageTolerance = action.payload;
        },
    },
});

// action creators are generated for each case reducer function
export const {
    setShouldSwapDirectionReverse,
    setPrimaryQuantity,
    setLimitTick,
    setPoolPriceNonDisplay,
    setSlippageTolerance,
} = tradeDataSlice.actions;

export default tradeDataSlice.reducer;
