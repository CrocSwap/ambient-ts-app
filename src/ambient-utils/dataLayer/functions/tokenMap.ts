import { ZERO_ADDRESS } from '../../constants';
import { mainnetUSDC } from '../../constants/networks/ethereumMainnet';
import { sepoliaUSDC } from '../../constants/networks/ethereumSepolia';
import { scrollSepoliaUSDC } from '../../constants/networks/scrollSepolia';
import { TokenIF } from '../../types';

/* Translates testnet token addresses to their canonical production network
 * representations. Note that chain ID is not required, since token addresses
 * are unique across chains. */
export function translateToken(tokenAddr: string, chainId?: string): string {
    let mapped;
    if (chainId && tokenAddr === ZERO_ADDRESS) {
        mapped = NATIVE_TOKEN_MAP.get(chainId.toLowerCase());
    } else {
        mapped = TOKEN_MAP.get(tokenAddr.toLowerCase());
    }
    return mapped ? mapped : tokenAddr;
}

// maps tokens from one chain to another (usually testnet to mainnet)
const TOKEN_MAP = new Map<string, string>();

// holds different addresses for the "same" token on different chains
const NATIVE_TOKEN_MAP = new Map<string, string>();

function addToMap(testnet: TokenIF, mainnet: TokenIF) {
    TOKEN_MAP.set(testnet.address.toLowerCase(), mainnet.address.toLowerCase());
}

addToMap(sepoliaUSDC, mainnetUSDC);
addToMap(scrollSepoliaUSDC, mainnetUSDC);

NATIVE_TOKEN_MAP.set('0x82750', '0x5300000000000000000000000000000000000004'); // showing Bridged Wrapped Ether (Scroll) on scroll
NATIVE_TOKEN_MAP.set('0x8274f', '0x5300000000000000000000000000000000000004'); // showing Bridged Wrapped Ether (Scroll) on scroll sepolia
NATIVE_TOKEN_MAP.set('0x1', '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'); // showing WETH mainnet addr on mainnet
