export const stableTokens = {
    '0x5': {
        dai: '0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60',
        usdc: '0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C',
    },
    '0x2a': {
        dai: '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa',
        usdc: '0xb7a4F3E9097C08dA09517b5aB877F7a917224ede',
    }
};

export const goerliStableTokens = stableTokens['0x5'];
export const kovanStableTokens = stableTokens['0x2a'];

export const stablePairs = {
    '0x5': [
        [goerliStableTokens.dai, goerliStableTokens.usdc]
    ],
    '0x2a': [
        [kovanStableTokens.dai, kovanStableTokens.usdc]
    ]
};

export function getStableTokensByChain(chain:string) {
    let tokens;
    switch (chain) {
        case '0x5':
            tokens = stableTokens['0x5'];
            break;
        case '0x2a':
            tokens = stableTokens['0x2a'];
            break;
        default:
            console.warn(`Could not process argument <<<chain>>> in function getStableTokensByChain(). Recognized values include <<<'0x5', '0x2a'>>> of type <<<string>>>; received value <<<${chain}>>> of type <<<${typeof chain}>>>. Refer to file stablePairs.ts for troubleshooting. Returning stable tokens for Goerli testnet as a default value.`);
            tokens = stableTokens['0x5'];
    }
    return tokens;
}

export function getStablePairsByChain(chain:string) {
    let tokenPairs;
    switch (chain) {
        case '0x5':
            tokenPairs = stablePairs['0x5'];
            break;
        case '0x2a':
            tokenPairs = stablePairs['0x2a'];
            break;
        default:
            console.warn(`Could not process argument <<<chain>>> in function getStablePairsByChain(). Recognized values include <<<'0x5', '0x2a'>>> of type <<<string>>>; received value <<<${chain}>>> of type <<<${typeof chain}>>>. Refer to file stablePairs.ts for troubleshooting. Returning stable tokens for Goerli testnet as a default value.`);
            tokenPairs = stablePairs['0x5'];
    }
    return tokenPairs;
}

export function checkIsStable(addr1:string, addr2:string, chain:string) {
    console.log('running function checkIsStable()');
    const stablePairs = getStablePairsByChain(chain);
    let pairIsIncluded = false;
    stablePairs.forEach((stablePair:string[]) => {
        if (stablePair.includes(addr1) && stablePair.includes(addr2)) {
            pairIsIncluded = true;
        }
    })
    return pairIsIncluded;
}