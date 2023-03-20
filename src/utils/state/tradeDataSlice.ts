import { sortBaseQuoteTokens } from '@crocswap-libs/sdk';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { goerliETH, goerliUSDC } from '../data/defaultTokens';
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
    activeChartPeriod: number;
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

const initialState: tradeData = {
    tokenA: goerliUSDC,
    tokenB: goerliETH,
    baseToken: goerliETH,
    quoteToken: goerliUSDC,
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
    activeChartPeriod: 3600,
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

export const tradeDataSlice = createSlice({
    name: 'tradeData',
    initialState,
    reducers: {
        setTokenA: (state, action: PayloadAction<TokenIF>) => {
            state.tokenA = action.payload;
            const [baseTokenAddress, quoteTokenAddress] = sortBaseQuoteTokens(
                action.payload.address,
                state.tokenB.address,
            );
            if (action.payload.address.toLowerCase() === baseTokenAddress.toLowerCase()) {
                state.baseToken = action.payload;
                state.quoteToken = state.tokenB;
                state.isTokenABase = true;
            } else if (action.payload.address.toLowerCase() === quoteTokenAddress.toLowerCase()) {
                state.quoteToken = action.payload;
                state.baseToken = state.tokenB;
                state.isTokenABase = false;
            }
        },
        setTokenB: (state, action: PayloadAction<TokenIF>) => {
            state.tokenB = action.payload;
            const [baseTokenAddress, quoteTokenAddress] = sortBaseQuoteTokens(
                action.payload.address,
                state.tokenA.address,
            );
            if (action.payload.address.toLowerCase() === baseTokenAddress.toLowerCase()) {
                state.baseToken = action.payload;
                state.quoteToken = state.tokenA;
                state.isTokenABase = false;
            } else if (action.payload.address.toLowerCase() === quoteTokenAddress.toLowerCase()) {
                state.quoteToken = action.payload;
                state.baseToken = state.tokenA;
                state.isTokenABase = true;
            }
        },
        setLiquidityFee: (state, action: PayloadAction<number>) => {
            state.liquidityFee = action.payload;
        },
        setDidUserFlipDenom: (state, action: PayloadAction<boolean>) => {
            state.didUserFlipDenom = action.payload;
        },
        setShouldSwapConverterUpdate: (state, action: PayloadAction<boolean>) => {
            state.shouldSwapConverterUpdate = action.payload;
        },
        setShouldLimitConverterUpdate: (state, action: PayloadAction<boolean>) => {
            state.shouldLimitConverterUpdate = action.payload;
        },
        setShouldLimitDirectionReverse: (state, action: PayloadAction<boolean>) => {
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
        setActiveChartPeriod: (state, action: PayloadAction<number>) => {
            state.activeChartPeriod = action.payload;
        },
        setTargetData: (state, action: PayloadAction<targetData[]>) => {
            state.targetData = action.payload;
        },
        resetTokens: (state, action: PayloadAction<string>) => {
            if (action.payload === '0x5') {
                state.tokenA = initialState.tokenA;
                state.tokenB = initialState.tokenB;
            }
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
        setMainnetBaseTokenReduxAddress: (state, action: PayloadAction<string>) => {
            state.mainnetBaseTokenAddress = action.payload;
        },
        setMainnetQuoteTokenReduxAddress: (state, action: PayloadAction<string>) => {
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
    setActiveChartPeriod,
    resetTradeData,
    resetTokens,
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

// ETH:   0x0000000000000000000000000000000000000000
// DAI:   0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa
// USDC:  0xb7a4F3E9097C08dA09517b5aB877F7a917224ede

// ETH
/*
{
    name: 'Native Ether',
    address: '0x0000000000000000000000000000000000000000',
    symbol: 'ETH',
    decimals: 18,
    chainId: 42,
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
}
*/

// DAI
/*
{
    name: 'Dai Stablecoin',
    address: '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa',
    symbol: 'DAI',
    decimals: 18,
    chainId: 42,
    logoURI: 'https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png'
}
*/

// USDC
/*
{
    name: 'USDCoin',
    address: '0xb7a4F3E9097C08dA09517b5aB877F7a917224ede',
    symbol: 'USDC',
    decimals: 6,
    chainId: 42,
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png'
}
*/
