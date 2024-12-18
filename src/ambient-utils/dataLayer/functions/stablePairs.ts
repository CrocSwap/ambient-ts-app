// @return true if the two tokens constitute a stable pair (USD based stables only for now)
//
// NOTE: Definition of what constitutes a "stable pair" is arbitrary and just based
//       on the devs discretion. Users should not assume that true/false implies

import { getMoneynessRankByAddr } from '.';
import { ZERO_ADDRESS } from '../../constants';
import {
    baseSepoliaUSDC,
    baseSepoliaUSDT,
    blastBLAST,
    blastEzETH,
    blastSepoliaUSDB,
    blastUSDB,
    blastUSDPLUS,
    blastWEETH,
    blastWrsETH,
    mainnetDAI,
    mainnetLUSD,
    mainnetRSETH,
    mainnetRSWETH,
    mainnetSTONE,
    mainnetSWELL,
    mainnetSWETH,
    mainnetTBTC,
    mainnetUSDC,
    mainnetUSDT,
    mainnetWBTC,
    mainnetWstETH,
    plumeNEV,
    plumePETH,
    plumePUSD,
    plumeSepoliaNEV,
    plumeSepoliaUSD,
    plumeUSDC,
    scrollAxlUSDC,
    scrollDAI,
    scrollPufETH,
    scrollPxETH,
    scrollRocketPoolETH,
    scrollRsETH,
    scrollRswETH,
    scrollSOLVBTC,
    scrollSTONE,
    scrollSepoliaUSDC,
    scrollUSDC,
    scrollUSDE,
    scrollUSDT,
    scrollUniETH,
    scrollWBTC,
    scrollWeETH,
    scrollWrsETH,
    scrollWstETH,
    scrollsUSDe,
    sepoliaUSDC,
    sepoliaWBTC,
    swellSepoliaUSDC,
    swellSepoliaUSDT,
} from '../../constants/defaultTokens';

//       any sort of specific guaranteed relation between the tokens.
export function isStablePair(addr1: string, addr2: string): boolean {
    return isUsdStableToken(addr1) && isUsdStableToken(addr2);
}

// @return true if the token represents a USD-based stablecoin
// NOTE: Decision of whether a token counts as stable or not is arbitrary and just at the
//       discretion of the app authors
export function isUsdStableToken(addr: string): boolean {
    return STABLE_USD_TOKENS.includes(addr.toLowerCase());
}

export function isUsdcToken(addr: string): boolean {
    return USDC_TOKENS.includes(addr.toLowerCase());
}

export function isBlastRewardToken(addr: string): boolean {
    return BLAST_REWARD_TOKENS.includes(addr.toLowerCase());
}

export function isETHorStakedEthToken(addr: string): boolean {
    return (
        addr === ZERO_ADDRESS || STAKED_ETH_TOKENS.includes(addr.toLowerCase())
    );
}

export function isWbtcOrStakedBTCToken(addr: string): boolean {
    return isWbtcToken(addr) || STAKED_BTC_TOKENS.includes(addr.toLowerCase());
}

export function isETHPair(addr1: string, addr2: string): boolean {
    return isETHorStakedEthToken(addr1) && isETHorStakedEthToken(addr2);
}

export function isBtcPair(addr1: string, addr2: string): boolean {
    return isWbtcOrStakedBTCToken(addr1) && isWbtcOrStakedBTCToken(addr2);
}

export function isWbtcToken(addr: string): boolean {
    return WBTC_TOKENS.includes(addr.toLowerCase());
}

// added so rswETH / SWELL would be denominated in SWELL by default
export function isDefaultDenomTokenExcludedFromUsdConversion(
    baseToken: string,
    quoteToken: string,
): boolean {
    const isBaseTokenMoneynessGreaterOrEqual =
        getMoneynessRankByAddr(baseToken) -
            getMoneynessRankByAddr(quoteToken) >=
        0;
    return USD_EXCLUDED_TOKENS.includes(
        isBaseTokenMoneynessGreaterOrEqual
            ? baseToken.toLowerCase()
            : quoteToken.toLowerCase(),
    );
}

// @return true if the token is a WETH or wrapped native token asset
export function isWrappedNativeToken(addr: string): boolean {
    return WRAPPED_NATIVE_TOKENS.includes(addr.toLowerCase());
}

export function remapTokenIfWrappedNative(addr: string): string {
    if (isWrappedNativeToken(addr)) {
        return ZERO_ADDRESS;
    }
    return addr;
}

// USDC prioritized in some lists
export const USDC_TOKENS = [
    mainnetUSDC.address,
    blastUSDB.address,
    plumeUSDC.address,
    sepoliaUSDC.address,
    blastSepoliaUSDB.address,
    scrollSepoliaUSDC.address,
    scrollUSDC.address,
    swellSepoliaUSDC.address,
    baseSepoliaUSDC.address,
].map((x) => x.toLowerCase());

export const STABLE_USD_TOKENS = [
    mainnetDAI.address,
    mainnetUSDT.address,
    mainnetLUSD.address,
    plumeNEV.address,
    plumePUSD.address,
    blastUSDPLUS.address,
    scrollUSDT.address,
    scrollDAI.address,
    scrollAxlUSDC.address,
    scrollUSDE.address,
    scrollsUSDe.address,
    plumeSepoliaUSD.address,
    plumeSepoliaNEV.address,
    swellSepoliaUSDT.address,
    baseSepoliaUSDT.address,
]
    .concat(USDC_TOKENS)
    .map((x) => x.toLowerCase());

export const BLAST_REWARD_TOKENS = [blastBLAST.address].map((x) =>
    x.toLowerCase(),
);

export const WBTC_TOKENS = [
    mainnetWBTC.address,
    scrollWBTC.address,
    sepoliaWBTC.address,
].map((x) => x.toLowerCase());

export const STAKED_ETH_TOKENS = [
    mainnetWstETH.address,
    mainnetSWETH.address,
    mainnetRSETH.address,
    mainnetRSWETH.address,
    mainnetSTONE.address,
    scrollWstETH.address,
    scrollWrsETH.address,
    scrollRsETH.address,
    scrollRswETH.address,
    scrollSTONE.address,
    scrollUniETH.address,
    scrollWeETH.address,
    scrollPxETH.address,
    scrollPufETH.address,
    scrollRocketPoolETH.address,
    blastWrsETH.address,
    blastEzETH.address,
    blastWEETH.address,
    plumePETH.address,
].map((x) => x.toLowerCase());

export const USD_EXCLUDED_TOKENS = [mainnetSWELL.address].map((x) =>
    x.toLowerCase(),
);

export const STAKED_BTC_TOKENS = [
    scrollSOLVBTC.address,
    mainnetTBTC.address,
].map((x) => x.toLowerCase());

export const WRAPPED_NATIVE_TOKENS = [
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // Mainnet
    '0x5300000000000000000000000000000000000004', // Scroll (test and main)
    '0x4300000000000000000000000000000000000004', // Blast
    '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14', // Sepolia
    '0x4200000000000000000000000000000000000023', // Blast Sepolia
    '0xaA6210015fbf0855F0D9fDA3C415c1B12776Ae74', // Plume Sepolia
    '0x863d7abb9c62d8bc69ea9ebc3e3583057d533e6f', // Scroll Sepolia
].map((x) => x.toLowerCase());
