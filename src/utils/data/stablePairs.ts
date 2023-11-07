// @return true if the two tokens constitute a stable pair (USD based stables only for now)
//
// NOTE: Definition of what constitutes a "stable pair" is arbitrary and just based
//       on the devs discretion. Users should not assume that true/false implies

import {
    arbGoerliDAI,
    arbGoerliUSDC,
    goerliDAI,
    goerliUSDC,
    goerliUSDT,
    mainnetDAI,
    mainnetUSDC,
    mainnetUSDT,
    scrollAxlUSDC,
    scrollSepoliaUSDC,
    scrollUSDC,
} from './defaultTokens';

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

// @return true if the token is a WETH or wrapped native token asset
export function isWethToken(addr: string): boolean {
    return WETH_TOKENS.includes(addr.toLowerCase());
}

// No need to specify chain ID because token address is unique even across chains
export const STABLE_USD_TOKENS = [
    mainnetDAI.address,
    mainnetUSDC.address,
    mainnetUSDT.address,
    goerliDAI.address,
    goerliUSDC.address,
    goerliUSDT.address,
    arbGoerliDAI.address,
    arbGoerliUSDC.address,
    scrollUSDC.address,
    scrollAxlUSDC.address,
    scrollSepoliaUSDC.address,
].map((x) => x.toLowerCase());

export const USDC_TOKENS = [
    mainnetUSDC.address,
    goerliUSDC.address,
    arbGoerliUSDC.address,
    scrollSepoliaUSDC.address,
    scrollUSDC.address,
].map((x) => x.toLowerCase());

export const WETH_TOKENS = [
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // Mainnet
    '0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6', // Goerli
    '0x5300000000000000000000000000000000000004', // Scroll (test and main)
].map((x) => x.toLowerCase());
