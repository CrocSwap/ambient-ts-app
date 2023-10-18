import { isWethToken } from '../data/stablePairs';
import { TokenIF } from '../interfaces/exports';
import { supportedNetworks } from '../networks';

// fn to remove the wrapped native token of the current chain from a token array
export default function removeWrappedNative(
    chainId: string | number,
    tokens: TokenIF[],
): TokenIF[] {
    // return the token array with the wrapped native removed, or the original
    // ... token array if the current chain has no wrapped native token specified
    return tokens.filter((tkn: TokenIF) => isWethToken(tkn.address));
}
