import { TokenIF } from '../interfaces/exports';
import { wrappedNatives } from '../data/wrappedNatives';

// fn to remove the wrapped native token of the current chain from a token array
export default function removeWrappedNative(
    chainId: string | number,
    tokens: TokenIF[],
): TokenIF[] {
    // convert the chainId to a 0x hex string, if necessary
    const chainAsString: string =
        typeof chainId === 'number' ? '0x' + chainId.toString(16) : chainId;
    // get the address of the wrapped native on the current chain from data
    const wnAddr: string | undefined = wrappedNatives.get(chainAsString);
    // return the token array with the wrapped native removed, or the original
    // ... token array if the current chain has no wrapped native token specified
    return wnAddr
        ? tokens.filter(
              (tkn: TokenIF) =>
                  tkn.address.toLowerCase() !== wnAddr.toLowerCase(),
          )
        : tokens;
}
