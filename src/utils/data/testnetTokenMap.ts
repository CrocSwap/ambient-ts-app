import { TokenIF } from '../interfaces/TokenIF';
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
    const mapped = TESTNET_TOKEN_MAP.get(tokenAddr.toLowerCase());
    return mapped ? mapped : tokenAddr;
}

const TESTNET_TOKEN_MAP = new Map<string, string>();

function addTestnetMap(testnet: TokenIF, mainnet: TokenIF) {
    TESTNET_TOKEN_MAP.set(
        testnet.address.toLowerCase(),
        mainnet.address.toLowerCase(),
    );
}

addTestnetMap(goerliDAI, mainnetDAI);
addTestnetMap(goerliUSDC, mainnetUSDC);
addTestnetMap(goerliUSDT, mainnetUSDT);
addTestnetMap(scrollSepoliaUSDC, mainnetUSDC);
