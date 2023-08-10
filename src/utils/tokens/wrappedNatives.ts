import { WETH } from './WETH';

// map of wrapped native tokens on each chain
export const wrappedNatives = new Map<string, string>([
    // wrapped eth on ethereum mainnet
    ['0x1', WETH['0x1']],
    // wrapped eth on goerli mainnet
    ['0x5', WETH['0x5']],
]);
