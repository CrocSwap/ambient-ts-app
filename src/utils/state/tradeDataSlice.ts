import { sortBaseQuoteTokens } from '@crocswap-libs/sdk';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getDefaultChainId } from '../data/chains';
import { getDefaultPairForChain } from '../data/defaultTokens';
import { TokenIF } from '../interfaces/exports';

export interface targetData {
    name: string;
    value: number | undefined;
}

export interface candleDomain {
    lastCandleDate: number | undefined;
    domainBoundry: number | undefined;
}

export interface tradeData {
    tokenA: TokenIF;
    tokenB: TokenIF;
    baseToken: TokenIF;
    quoteToken: TokenIF;
    isTokenABase: boolean;
    liquidityFee: number;
    didUserFlipDenom: boolean;
    shouldSwapConverterUpdate: boolean;
    shouldLimitConverterUpdate: boolean;
    shouldLimitDirectionReverse: boolean;
    isDenomBase: boolean;
    advancedMode: boolean;
    isTokenAPrimary: boolean;
    primaryQuantity: string;
    isTokenAPrimaryRange: boolean;
    primaryQuantityRange: string;
    limitTick: number | undefined;
    limitTickCopied: boolean;
    poolPriceNonDisplay: number;
    advancedLowTick: number;
    advancedHighTick: number;
    simpleRangeWidth: number;
    slippageTolerance: number;
    targetData: targetData[];
    pinnedMaxPriceDisplayTruncated: number | undefined;
    pinnedMinPriceDisplayTruncated: number | undefined;
    rangeModuleTriggered: boolean;
    rangeLowLineTriggered: boolean | undefined;
    isLinesSwitched: boolean | undefined;
    rangeHighLineTriggered: boolean | undefined;
    candleDomains: candleDomain;
    rescaleRangeBoundaries: boolean | undefined;
    mainnetBaseTokenAddress: string;
    mainnetQuoteTokenAddress: string;
}

// Have to set these values to something on load, so we use default pair
// for default chain. Don't worry if user is coming in to another chain,
// since these will get updated by useUrlParams() in any context where a
// pair is necessary at load time
const dfltChainId = getDefaultChainId();
const dfltTokenA = getDefaultPairForChain(dfltChainId)[0];
const dfltTokenB = getDefaultPairForChain(dfltChainId)[1];

const initialState: tradeData = {
    tokenA: dfltTokenA,
    tokenB: dfltTokenB,
    baseToken: dfltTokenA, // We sort these in the next line
    quoteToken: dfltTokenB,
    isTokenABase: true,
    liquidityFee: 0,
    didUserFlipDenom: false,
    shouldSwapConverterUpdate: false,
    shouldLimitConverterUpdate: false,
    shouldLimitDirectionReverse: false,
    isDenomBase: true,
    advancedMode: false,
    isTokenAPrimary: true,
    primaryQuantity: '',
    isTokenAPrimaryRange: true,
    primaryQuantityRange: '',
    limitTick: undefined,
    limitTickCopied: false,
    poolPriceNonDisplay: 0,
    advancedLowTick: 0,
    advancedHighTick: 0,
    simpleRangeWidth: 10,
    slippageTolerance: 0.05,
    targetData: [
        { name: 'Min', value: undefined },
        { name: 'Max', value: undefined },
    ],
    candleDomains: { lastCandleDate: undefined, domainBoundry: undefined },
    pinnedMaxPriceDisplayTruncated: undefined,
    pinnedMinPriceDisplayTruncated: undefined,
    rangeModuleTriggered: false,
    rangeLowLineTriggered: undefined,
    isLinesSwitched: undefined,
    rangeHighLineTriggered: undefined,
    rescaleRangeBoundaries: undefined,
    mainnetBaseTokenAddress: '',
    mainnetQuoteTokenAddress: '',
};

sortTokens(initialState);

function sortTokens(state: tradeData) {
    const [baseTokenAddress] = sortBaseQuoteTokens(
        state.tokenA.address,
        state.tokenB.address,
    );

    if (state.tokenA.address.toLowerCase() === baseTokenAddress.toLowerCase()) {
        state.baseToken = state.tokenA;
        state.quoteToken = state.tokenB;
        state.isTokenABase = true;
    } else {
        state.baseToken = state.tokenB;
        state.quoteToken = state.tokenA;
        state.isTokenABase = false;
    }
}

export const tradeDataSlice = createSlice({
    name: 'tradeData',
    initialState,
    reducers: {
        setChainId: (state, action: PayloadAction<string>) => {
            const chainNum = parseInt(action.payload);

            // If token pair isn't set to a chain token, always reset to default
            // pair for the chain
            if (state.tokenA.chainId !== chainNum) {
                const [tokenA, tokenB] = getDefaultPairForChain(action.payload);
                state.tokenA = tokenA;
                state.tokenB = tokenB;
                sortTokens(state);
            }
        },

        setTokenA: (state, action: PayloadAction<TokenIF>) => {
            state.tokenA = action.payload;
            sortTokens(state);
        },
        setTokenB: (state, action: PayloadAction<TokenIF>) => {
            state.tokenB = action.payload;
            sortTokens(state);
        },
        setLiquidityFee: (state, action: PayloadAction<number>) => {
            state.liquidityFee = action.payload;
        },
        setDidUserFlipDenom: (state, action: PayloadAction<boolean>) => {
            state.didUserFlipDenom = action.payload;
        },
        setShouldSwapConverterUpdate: (
            state,
            action: PayloadAction<boolean>,
        ) => {
            state.shouldSwapConverterUpdate = action.payload;
        },
        setShouldLimitConverterUpdate: (
            state,
            action: PayloadAction<boolean>,
        ) => {
            state.shouldLimitConverterUpdate = action.payload;
        },
        setShouldLimitDirectionReverse: (
            state,
            action: PayloadAction<boolean>,
        ) => {
            state.shouldLimitDirectionReverse = action.payload;
        },
        toggleDidUserFlipDenom: (state) => {
            state.didUserFlipDenom = !state.didUserFlipDenom;
        },
        setDenomInBase: (state, action: PayloadAction<boolean>) => {
            state.isDenomBase = action.payload;
        },
        toggleDenomInBase: (state) => {
            state.isDenomBase = !state.isDenomBase;
        },
        setAdvancedMode: (state, action: PayloadAction<boolean>) => {
            state.advancedMode = action.payload;
        },
        toggleAdvancedMode: (state) => {
            state.advancedMode = !state.advancedMode;
        },
        setIsTokenAPrimary: (state, action: PayloadAction<boolean>) => {
            state.isTokenAPrimary = action.payload;
        },
        toggleIsTokenAPrimary: (state) => {
            state.isTokenAPrimary = !state.isTokenAPrimary;
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
        setLimitTickCopied: (state, action: PayloadAction<boolean>) => {
            state.limitTickCopied = action.payload;
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
        setTargetData: (state, action: PayloadAction<targetData[]>) => {
            state.targetData = action.payload;
        },
        reverseTokensInRTK: (state) => {
            state.tokenA = state.tokenB;
            state.tokenB = state.tokenA;
        },
        setPinnedMaxPrice: (state, action: PayloadAction<number>) => {
            state.pinnedMaxPriceDisplayTruncated = action.payload;
        },
        setPinnedMinPrice: (state, action: PayloadAction<number>) => {
            state.pinnedMinPriceDisplayTruncated = action.payload;
        },
        setRangeModuleTriggered: (state, action: PayloadAction<boolean>) => {
            state.rangeModuleTriggered = action.payload;
        },
        setRangeHighLineTriggered: (state, action: PayloadAction<boolean>) => {
            state.rangeHighLineTriggered = action.payload;
        },
        setRescaleRangeBoundaries: (state, action: PayloadAction<boolean>) => {
            state.rescaleRangeBoundaries = action.payload;
        },
        setMainnetBaseTokenReduxAddress: (
            state,
            action: PayloadAction<string>,
        ) => {
            state.mainnetBaseTokenAddress = action.payload;
        },
        setMainnetQuoteTokenReduxAddress: (
            state,
            action: PayloadAction<string>,
        ) => {
            state.mainnetQuoteTokenAddress = action.payload;
        },
        setRangeLowLineTriggered: (state, action: PayloadAction<boolean>) => {
            state.rangeLowLineTriggered = action.payload;
        },
        setIsLinesSwitched: (state, action: PayloadAction<boolean>) => {
            state.isLinesSwitched = action.payload;
        },
        setCandleDomains: (state, action: PayloadAction<candleDomain>) => {
            state.candleDomains = action.payload;
        },

        resetTradeData: () => initialState,
    },
});

// action creators are generated for each case reducer function
export const {
    setChainId,
    setTokenA,
    setTokenB,
    setLiquidityFee,
    setDidUserFlipDenom,
    toggleDidUserFlipDenom,
    setShouldSwapConverterUpdate,
    setShouldLimitConverterUpdate,
    setShouldLimitDirectionReverse,
    setDenomInBase,
    toggleDenomInBase,
    setAdvancedMode,
    toggleAdvancedMode,
    setIsTokenAPrimary,
    toggleIsTokenAPrimary,
    setPrimaryQuantity,
    setIsTokenAPrimaryRange,
    setPrimaryQuantityRange,
    setLimitTick,
    setLimitTickCopied,
    setPoolPriceNonDisplay,
    setAdvancedLowTick,
    setAdvancedHighTick,
    setSimpleRangeWidth,
    setSlippageTolerance,
    resetTradeData,
    reverseTokensInRTK,
    setPinnedMaxPrice,
    setPinnedMinPrice,
    setTargetData,
    setRangeModuleTriggered,
    setRangeLowLineTriggered,
    setIsLinesSwitched,
    setRangeHighLineTriggered,
    setRescaleRangeBoundaries,
    setCandleDomains,
    setMainnetBaseTokenReduxAddress,
    setMainnetQuoteTokenReduxAddress,
} = tradeDataSlice.actions;

export default tradeDataSlice.reducer;
