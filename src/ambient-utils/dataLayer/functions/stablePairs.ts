// @return true if the two tokens constitute a stable pair (USD based stables only for now)
//
// NOTE: Definition of what constitutes a "stable pair" is arbitrary and just based
//       on the devs discretion. Users should not assume that true/false implies

import { ZERO_ADDRESS } from '../../constants';
import {
    mainnetDAI,
    mainnetUSDC,
    blastUSDB,
    blastSepoliaUSDB,
    mainnetUSDT,
    scrollAxlUSDC,
    sepoliaUSDC,
    scrollSepoliaUSDC,
    scrollUSDC,
    scrollUSDT,
    mainnetWBTC,
    scrollWBTC,
    mainnetWstETH,
    scrollWstETH,
    blastEzETH,
    mainnetSWETH,
    scrollWrsETH,
    blastWrsETH,
    blastUSDPLUS,
    mainnetLUSD,
    scrollSTONE,
    scrollUniETH,
    scrollDAI,
    scrollPxETH,
    scrollRocketPoolETH,
    scrollPufETH,
    blastWEETH,
    plumeSepoliaUSDC,
    plumeSepoliaUSD,
    plumeSepoliaP,
} from '../../constants/defaultTokens';

//       any sort of specific guaranteed relation between the tokens.
export function isStablePair(addr1: string, addr2: string): boolean {
    return isStableToken(addr1) && isStableToken(addr2);
}

// @return true if the token represents a USD-based stablecoin
// NOTE: Decision of whether a token counts as stable or not is arbitrary and just at the
//       discretion of the app authors
export function isStableToken(addr: string): boolean {
    return STABLE_USD_TOKENS.includes(addr.toLowerCase());
}

export function isUsdcToken(addr: string): boolean {
    return USDC_TOKENS.includes(addr.toLowerCase());
}

export function isETHorStakedEthToken(addr: string): boolean {
    return (
        addr === ZERO_ADDRESS || STAKED_ETH_TOKENS.includes(addr.toLowerCase())
    );
}

export function isETHPair(addr1: string, addr2: string): boolean {
    return isETHorStakedEthToken(addr1) && isETHorStakedEthToken(addr2);
}

export function isWbtcToken(addr: string): boolean {
    return WBTC_TOKENS.includes(addr.toLowerCase());
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

// No need to specify chain ID because token address is unique even across chains
export const STABLE_USD_TOKENS = [
    mainnetDAI.address,
    mainnetUSDC.address,
    mainnetUSDT.address,
    mainnetLUSD.address,
    blastUSDB.address,
    blastUSDPLUS.address,
    scrollUSDC.address,
    scrollUSDT.address,
    scrollDAI.address,
    scrollAxlUSDC.address,
    sepoliaUSDC.address,
    blastSepoliaUSDB.address,
    scrollSepoliaUSDC.address,
    plumeSepoliaUSDC.address,
    plumeSepoliaUSD.address,
    plumeSepoliaP.address,
].map((x) => x.toLowerCase());

export const USDC_TOKENS = [
    mainnetUSDC.address,
    blastUSDB.address,
    sepoliaUSDC.address,
    blastSepoliaUSDB.address,
    scrollSepoliaUSDC.address,
    scrollUSDC.address,
    plumeSepoliaUSDC.address,
].map((x) => x.toLowerCase());

export const WBTC_TOKENS = [mainnetWBTC.address, scrollWBTC.address].map((x) =>
    x.toLowerCase(),
);

export const STAKED_ETH_TOKENS = [
    mainnetWstETH.address,
    mainnetSWETH.address,
    scrollWstETH.address,
    scrollWrsETH.address,
    scrollSTONE.address,
    scrollUniETH.address,
    scrollPxETH.address,
    scrollPufETH.address,
    scrollRocketPoolETH.address,
    blastWrsETH.address,
    blastEzETH.address,
    blastWEETH.address,
].map((x) => x.toLowerCase());

export const WRAPPED_NATIVE_TOKENS = [
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // Mainnet
    '0x5300000000000000000000000000000000000004', // Scroll (test and main)
    '0x863d7abb9c62d8bc69ea9ebc3e3583057d533e6f', // Scroll Sepolia
    '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14', // Sepolia
    '0x4300000000000000000000000000000000000004', // Blast
    '0x4200000000000000000000000000000000000023', // Blast Seploia
].map((x) => x.toLowerCase());
