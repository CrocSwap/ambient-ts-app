import { sortBaseQuoteTokens } from '@crocswap-libs/sdk';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { goerliETH, goerliUSDC } from '../data/defaultTokens';
import { TokenIF } from '../interfaces/TokenIF';

export interface targetData {
    name: string;
    value: number | undefined;
}

export interface tradeData {
    tokenA: TokenIF;
    tokenB: TokenIF;
    baseToken: TokenIF;
    quoteToken: TokenIF;
    didUserFlipDenom: boolean;
    isDenomBase: boolean;
    advancedMode: boolean;
    isTokenAPrimary: boolean;
    primaryQuantity: string;
    isTokenAPrimaryRange: boolean;
    primaryQuantityRange: string;
    limitPrice: string;
    advancedLowTick: number;
    advancedHighTick: number;
    simpleRangeWidth: number;
    slippageTolerance: number;
    activeChartPeriod: number;
    targetData: targetData[];
}

const initialState: tradeData = {
    tokenA: goerliETH,
    tokenB: goerliUSDC,
    baseToken: goerliETH,
    quoteToken: goerliUSDC,
    didUserFlipDenom: false,
    isDenomBase: true,
    advancedMode: false,
    isTokenAPrimary: true,
    primaryQuantity: '',
    isTokenAPrimaryRange: true,
    primaryQuantityRange: '',
    limitPrice: '',
    advancedLowTick: 0,
    advancedHighTick: 0,
    simpleRangeWidth: 100,
    slippageTolerance: 0.05,
    activeChartPeriod: 300,
    targetData: [
        { name: 'high', value: 0 },
        { name: 'low', value: 0 },
    ],
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
            } else if (action.payload.address.toLowerCase() === quoteTokenAddress.toLowerCase()) {
                state.quoteToken = action.payload;
                state.baseToken = state.tokenB;
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
            } else if (action.payload.address.toLowerCase() === quoteTokenAddress.toLowerCase()) {
                state.quoteToken = action.payload;
                state.baseToken = state.tokenA;
            }
        },
        setDidUserFlipDenom: (state, action: PayloadAction<boolean>) => {
            state.didUserFlipDenom = action.payload;
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
        setLimitPrice: (state, action: PayloadAction<string>) => {
            state.limitPrice = action.payload;
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

        resetTradeData: () => initialState,
    },
});

// action creators are generated for each case reducer function
export const {
    setTokenA,
    setTokenB,
    setDidUserFlipDenom,
    toggleDidUserFlipDenom,
    setDenomInBase,
    toggleDenomInBase,
    setAdvancedMode,
    toggleAdvancedMode,
    setIsTokenAPrimary,
    toggleIsTokenAPrimary,
    setPrimaryQuantity,
    setIsTokenAPrimaryRange,
    setPrimaryQuantityRange,
    setLimitPrice,
    setAdvancedLowTick,
    setAdvancedHighTick,
    setSimpleRangeWidth,
    setSlippageTolerance,
    setActiveChartPeriod,
    setTargetData,
    resetTradeData,
    resetTokens,
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
