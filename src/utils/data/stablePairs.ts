// list of all stable tokens, organized by chain ID
export const stableTokens = {
    '0x5': {
        dai: '0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60'.toLowerCase(),
        usdc: '0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C'.toLowerCase(),
    },
};

// references to each set of stable tokens by chain for convenience
export const goerliStableTokens = stableTokens['0x5'];

// list of all recogized stable pairs, organized by chain ID
// remember there may be stable pairs not made of stable tokens
export const stablePairs = {
    '0x5': [[goerliStableTokens.dai, goerliStableTokens.usdc]],
};

// TODO:  @Ben  we should restructure these functions to look up the value for `chain` dynamically
// TODO:        ... in the respective data objects rather than having hardcoded references to each
// TODO:        ... existing valid value, personally I think a try-catch-finally makes the most sense

// function to return a list of all stable token addresses by chain ID
export function getStableTokensByChain(chain: string) {
    let tokens;
    switch (chain) {
        case '0x5':
            tokens = stableTokens['0x5'];
            break;
        default:
            console.warn(
                `Could not process argument <<<chain>>> in function getStableTokensByChain(). Recognized values include <<<'0x5', '0x2a'>>> of type <<<string>>>; received value <<<${chain}>>> of type <<<${typeof chain}>>>. Refer to file stablePairs.ts for troubleshooting. Returning stable tokens for Goerli testnet as a default value.`,
            );
            tokens = stableTokens['0x5'];
    }
    return tokens;
}

// function to return a list of all stable address pairs by chain ID
export function getStablePairsByChain(chain: string) {
    let tokenPairs;
    switch (chain) {
        case '0x5':
            tokenPairs = stablePairs['0x5'];
            break;
        default:
            console.warn(
                `Could not process argument <<<chain>>> in function getStablePairsByChain(). Recognized values include <<<'0x5', '0x2a'>>> of type <<<string>>>; received value <<<${chain}>>> of type <<<${typeof chain}>>>. Refer to file stablePairs.ts for troubleshooting. Returning stable tokens for Goerli testnet as a default value.`,
            );
            tokenPairs = stablePairs['0x5'];
    }
    return tokenPairs;
}

// function to check if a given pair of addresses on a given chain is stable
export function checkIsStable(addr1: string, addr2: string, chain: string) {
    const stablePairs = getStablePairsByChain(chain);
    let pairIsIncluded = false;
    stablePairs.forEach((stablePair: string[]) => {
        if (stablePair.includes(addr1.toLowerCase()) && stablePair.includes(addr2.toLowerCase())) {
            pairIsIncluded = true;
        }
    });
    // console.log({ pairIsIncluded });
    return pairIsIncluded;
}
