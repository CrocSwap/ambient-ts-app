import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TokenIF } from '../interfaces/TokenIF';

export interface tradeData {
    tokenA: TokenIF;
    tokenB: TokenIF;
    addressTokenA: string;
    addressTokenB: string;
    didUserFlipDenom: boolean;
    isDenomBase: boolean;
    advancedMode: boolean;
    isTokenAPrimary: boolean;
    primaryQuantity: string;
    isTokenAPrimaryRange: boolean;
    primaryQuantityRange: string;
}

const initialState: tradeData = {
    tokenA: {
        name: 'Native Ether',
        address: '0x0000000000000000000000000000000000000000',
        symbol: 'ETH',
        decimals: 18,
        chainId: 42,
        logoURI:
            'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
    },
    tokenB: {
        name: 'Dai Stablecoin',
        address: '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa',
        symbol: 'DAI',
        decimals: 18,
        chainId: 42,
        logoURI: 'https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png',
    },
    addressTokenA: '0x0000000000000000000000000000000000000000',
    addressTokenB: '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa',
    didUserFlipDenom: false,
    isDenomBase: true,
    advancedMode: false,
    isTokenAPrimary: true,
    primaryQuantity: '',
    isTokenAPrimaryRange: true,
    primaryQuantityRange: '',
};

export const tradeDataSlice = createSlice({
    name: 'tradeData',
    initialState,
    reducers: {
        setTokenA: (state, action: PayloadAction<TokenIF>) => {
            state.tokenA = action.payload;
        },
        setTokenB: (state, action: PayloadAction<TokenIF>) => {
            state.tokenB = action.payload;
        },
        setAddressTokenA: (state, action: PayloadAction<string>) => {
            state.addressTokenA = action.payload;
        },
        setAddressTokenB: (state, action: PayloadAction<string>) => {
            state.addressTokenB = action.payload;
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
    },
});

// action creators are generated for each case reducer function
export const {
    setTokenA,
    setTokenB,
    setAddressTokenA,
    setAddressTokenB,
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
