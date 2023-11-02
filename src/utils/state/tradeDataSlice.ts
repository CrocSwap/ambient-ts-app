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

    // Range
    isTokenAPrimaryRange: boolean;
    primaryQuantityRange: string; // Value input into Range
    rangeTicksCopied: boolean;
    simpleRangeWidth: number;
    // advanced range
    advancedMode: boolean;
    advancedLowTick: number;
    advancedHighTick: number;
    isLinesSwitched: boolean | undefined;

    // swap and  limit order UI
    // isTokenAPrimary: boolean;
    primaryQuantity: string;
    slippageTolerance: number; // swap and range, not limit

    // background computations
    poolPriceNonDisplay: number;

    // Limit order
    limitTick: number | undefined; // values that affects price? just in limit order
}

// Have to set these values to something on load, so we use default pair
// for default chain. Don't worry if user is coming in to another chain,
// since these will get updated by useUrlParams() in any context where a
// pair is necessary at load time
// const dfltChainId = getDefaultChainId();
// const dfltTokenA = getDefaultPairForChain(dfltChainId)[0];
// const dfltTokenB = getDefaultPairForChain(dfltChainId)[1];

const initialState: TradeDataIF = {
    shouldSwapDirectionReverse: false,
    advancedMode: false,
    primaryQuantity: '',
    isTokenAPrimaryRange: true,
    primaryQuantityRange: '',
    limitTick: undefined,
    rangeTicksCopied: false,
    poolPriceNonDisplay: 0,
    advancedLowTick: 0,
    advancedHighTick: 0,
    simpleRangeWidth: 10,
    slippageTolerance: 0.05,
    isLinesSwitched: undefined,
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

        setAdvancedMode: (state, action: PayloadAction<boolean>) => {
            state.advancedMode = action.payload;
        },
        toggleAdvancedMode: (state) => {
            state.advancedMode = !state.advancedMode;
        },
        setPrimaryQuantity: (state, action: PayloadAction<string>) => {
            state.primaryQuantity = action.payload;
        },
        setIsTokenAPrimaryRange: (state, action: PayloadAction<boolean>) => {
            state.isTokenAPrimaryRange = action.payload;
        },
        setPrimaryQuantityRange: (state, action: PayloadAction<string>) => {
            state.primaryQuantityRange = action.payload;
        },
        setLimitTick: (state, action: PayloadAction<number | undefined>) => {
            state.limitTick = action.payload;
        },
        setRangeTicksCopied: (state, action: PayloadAction<boolean>) => {
            state.rangeTicksCopied = action.payload;
        },
        setPoolPriceNonDisplay: (state, action: PayloadAction<number>) => {
            state.poolPriceNonDisplay = action.payload;
        },
        setAdvancedLowTick: (state, action: PayloadAction<number>) => {
            state.advancedLowTick = action.payload;
        },
        setAdvancedHighTick: (state, action: PayloadAction<number>) => {
            state.advancedHighTick = action.payload;
        },
        setSimpleRangeWidth: (state, action: PayloadAction<number>) => {
            state.simpleRangeWidth = action.payload;
        },
        setSlippageTolerance: (state, action: PayloadAction<number>) => {
            state.slippageTolerance = action.payload;
        },

        setIsLinesSwitched: (state, action: PayloadAction<boolean>) => {
            state.isLinesSwitched = action.payload;
        },
    },
});

// action creators are generated for each case reducer function
export const {
    setShouldSwapDirectionReverse,
    setAdvancedMode,
    toggleAdvancedMode,
    setPrimaryQuantity,
    setIsTokenAPrimaryRange,
    setPrimaryQuantityRange,
    setLimitTick,
    setRangeTicksCopied,
    setPoolPriceNonDisplay,
    setAdvancedLowTick,
    setAdvancedHighTick,
    setSimpleRangeWidth,
    setSlippageTolerance,
    setIsLinesSwitched,
} = tradeDataSlice.actions;

export default tradeDataSlice.reducer;
