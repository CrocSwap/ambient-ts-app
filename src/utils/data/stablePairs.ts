// @return true if the two tokens constitute a stable pair (USD based stables only for now)
//
// NOTE: Definition of what constitutes a "stable pair" is arbitrary and just based
//       on the devs discretion. Users should not assume that true/false implies

import { supportedNetworks } from '../networks';

//       any sort of specific guaranteed relation between the tokens.
export function isStablePair(
    addr1: string,
    addr2: string,
    chain: string,
): boolean {
    return isStableToken(addr1, chain) && isStableToken(addr2, chain);
}

// @return true if the token represents a USD-based stablecoin
// NOTE: Decision of whether a token counts as stable or not is arbitrary and just at the
//       discretion of the app authors
export function isStableToken(addr: string, chain: string): boolean {
    return supportedNetworks[chain].stableTokens.includes(addr);
}
