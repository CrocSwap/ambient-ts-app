export const stableTokens = {
    '0x5': {
        dai: '0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60',
        usdc: '0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C',
    }
};

export const goerliStableTokens = stableTokens['0x5'];

export const stablePairs = {
    '0x5': [
        [goerliStableTokens.dai, goerliStableTokens.usdc]
    ]
};