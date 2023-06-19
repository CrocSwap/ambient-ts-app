// Arbitrary list of stable or stabl-ish USD pegged coins indexed by chain ID
const STABLE_TOKENS_BY_CHAIN = {
    '0x1': [
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
        '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
    ],
    '0x5': [
        '0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60', // DAI
        '0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C', // USDC
    ],
    '0x66eed': [
        '0xc944b73fba33a773a4a07340333a3184a70af1ae', // USDC
    ],
};

type StableMapKey = keyof typeof STABLE_TOKENS_BY_CHAIN;

// @return true if the two tokens constitute a stable pair (USD based stables only for now)
//
// NOTE: Definition of what constitutes a "stable pair" is arbitrary and just based
//       on the devs discretion. Users should not assume that true/false implies
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
    if (!(chain in STABLE_TOKENS_BY_CHAIN)) {
        return false;
    }

    return STABLE_TOKENS_BY_CHAIN[chain as StableMapKey]
        .map((x: string) => x.toLowerCase())
        .includes(addr.toLowerCase());
}
