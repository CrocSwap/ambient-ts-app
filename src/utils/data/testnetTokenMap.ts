import {
    goerliDAI,
    goerliUSDC,
    goerliUSDT,
    mainnetDAI,
    mainnetUSDC,
    mainnetUSDT,
    scrollSepoliaUSDC,
} from './defaultTokens';

/* Translates testnet token addresses to their canonical production network
 * representations. Note that chain ID is not required, sicne token addresses
 * are unique across chains. */
export function translateTestnetToken(tokenAddr: string): string {
    const mapped = TESTNET_TOKEN_MAP.get(tokenAddr);
    return mapped ? mapped : tokenAddr;
}

const TESTNET_TOKEN_MAP = new Map<string, string>();

TESTNET_TOKEN_MAP.set(goerliDAI.address, mainnetDAI.address);
TESTNET_TOKEN_MAP.set(goerliUSDC.address, mainnetUSDC.address);
TESTNET_TOKEN_MAP.set(goerliUSDT.address, mainnetUSDT.address);
TESTNET_TOKEN_MAP.set(scrollSepoliaUSDC.address, mainnetUSDC.address);
