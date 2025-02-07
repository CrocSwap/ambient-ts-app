// @return true if the two tokens constitute a stable pair (USD based stables only for now)
//
// NOTE: Definition of what constitutes a "stable pair" is arbitrary and just based
//       on the devs discretion. Users should not assume that true/false implies

import { getMoneynessRankByAddr } from '.';
import { ZERO_ADDRESS } from '../../constants';
import { BASE_SEPOLIA_TOKENS } from '../../constants/networks/baseSepolia';
import { BLAST_TOKENS } from '../../constants/networks/blastMainnet';
import { BLAST_SEPOLIA_TOKENS } from '../../constants/networks/blastSepolia';
import { MAINNET_TOKENS } from '../../constants/networks/ethereumMainnet';
import { SEPOLIA_TOKENS } from '../../constants/networks/ethereumSepolia';
import { PLUME_TOKENS } from '../../constants/networks/plumeMainnet';
import { PLUME_SEPOLIA_TOKENS } from '../../constants/networks/plumeSepolia';
import { SCROLL_TOKENS } from '../../constants/networks/scrollMainnet';
import { SCROLL_SEPOLIA_TOKENS } from '../../constants/networks/scrollSepolia';
import { SWELL_TOKENS } from '../../constants/networks/swellMainnet';
import { SWELL_SEPOLIA_TOKENS } from '../../constants/networks/swellSepolia';

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

export function isPriorityStakedUSD(addr: string): boolean {
    return PLUME_TOKENS.pUSD.address.toLowerCase() === addr.toLowerCase();
}

export function isBlastRewardToken(addr: string): boolean {
    return BLAST_REWARD_TOKENS.includes(addr.toLowerCase());
}

export function isUSDQtoken(addr: string): boolean {
    return SCROLL_TOKENS.USDQ.address.toLowerCase() === addr.toLowerCase();
}

export function isPriorityStakedETH(addr: string): boolean {
    return PLUME_TOKENS.pETH.address.toLowerCase() === addr.toLowerCase();
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
    MAINNET_TOKENS.USDC,
    BLAST_TOKENS.USDB,
    PLUME_TOKENS.USDC,
    SEPOLIA_TOKENS.USDC,
    BLAST_SEPOLIA_TOKENS.USDB,
    SCROLL_SEPOLIA_TOKENS.USDC,
    SCROLL_TOKENS.USDC,
    SWELL_SEPOLIA_TOKENS.USDC,
    BASE_SEPOLIA_TOKENS.USDC,
].map((x) => x.address.toLowerCase());

export const STABLE_USD_TOKENS = [
    MAINNET_TOKENS.DAI,
    MAINNET_TOKENS.USDT,
    PLUME_TOKENS.NRWA,
    PLUME_TOKENS.pUSD,
    PLUME_TOKENS.USDT,
    PLUME_TOKENS.NTBILL,
    PLUME_TOKENS.NYIELD,
    PLUME_TOKENS.nELIXIR,
    BLAST_TOKENS.USDPLUS,
    SCROLL_TOKENS.USDT,
    SCROLL_TOKENS.USDQ,
    SCROLL_TOKENS.DAI,
    SCROLL_TOKENS.axlUSDC,
    SCROLL_TOKENS.USDE,
    SCROLL_TOKENS.SUSDe,
    PLUME_SEPOLIA_TOKENS.pUSD,
    PLUME_SEPOLIA_TOKENS.NEV,
    SWELL_SEPOLIA_TOKENS.USDT,
    SWELL_TOKENS.USDe,
    SWELL_TOKENS.SUSDe,
    BASE_SEPOLIA_TOKENS.USDT,
]
    .map((x) => x.address.toLowerCase())
    .concat(USDC_TOKENS);

export const BLAST_REWARD_TOKENS = [BLAST_TOKENS.BLAST.address].map((x) =>
    x.toLowerCase(),
);

export const WBTC_TOKENS = [
    MAINNET_TOKENS.WBTC,
    SCROLL_TOKENS.WBTC,
    SEPOLIA_TOKENS.WBTC,
].map((x) => x.address.toLowerCase());

export const STAKED_ETH_TOKENS = [
    MAINNET_TOKENS.SWETH,
    MAINNET_TOKENS.RSETH,
    MAINNET_TOKENS.RSWETH,
    MAINNET_TOKENS.STONE,
    SCROLL_TOKENS.wstETH,
    SCROLL_TOKENS.wrsETH,
    SCROLL_TOKENS.rsETH,
    SCROLL_TOKENS.rswETH,
    SCROLL_TOKENS.STONE,
    SCROLL_TOKENS.uniETH,
    SCROLL_TOKENS.weETH,
    SCROLL_TOKENS.pxETH,
    SCROLL_TOKENS.pufETH,
    SCROLL_TOKENS.rETH,
    BLAST_TOKENS.wrsETH,
    BLAST_TOKENS.ezETH,
    BLAST_TOKENS.weETH,
    PLUME_TOKENS.pETH,
    SWELL_TOKENS.wstETH,
    SWELL_TOKENS.pzETH,
    SWELL_TOKENS.ezETH,
    SWELL_TOKENS.weETH,
    SWELL_TOKENS.rsETH,
    SWELL_TOKENS.swETH,
    SWELL_TOKENS.rswETH,
].map((x) => x.address.toLowerCase());

export const USD_EXCLUDED_TOKENS = [
    MAINNET_TOKENS.SWELL.address,
    SWELL_TOKENS.SWELL.address,
].map((x) => x.toLowerCase());

export const STAKED_BTC_TOKENS = [
    SCROLL_TOKENS.SolvBTC,
    MAINNET_TOKENS.TBTC,
    SWELL_TOKENS.UBTC,
    SWELL_TOKENS.swBTC,
    SWELL_TOKENS.stBTC,
].map((x) => x.address.toLowerCase());

export const WRAPPED_NATIVE_TOKENS = [
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // Mainnet
    '0x5300000000000000000000000000000000000004', // Scroll (test and main)
    '0x4300000000000000000000000000000000000004', // Blast
    '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14', // Sepolia
    '0x4200000000000000000000000000000000000023', // Blast Sepolia
    '0xaA6210015fbf0855F0D9fDA3C415c1B12776Ae74', // Plume Sepolia
    '0x863d7abb9c62d8bc69ea9ebc3e3583057d533e6f', // Scroll Sepolia
].map((x) => x.toLowerCase());
