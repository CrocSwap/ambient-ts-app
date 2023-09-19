import { TokenIF } from '../interfaces/exports';
import { supportedNetworks } from '../networks';

// fn to remove the wrapped native token of the current chain from a token array
export default function removeWrappedNative(
    chainId: string | number,
    tokens: TokenIF[],
): TokenIF[] {
    // get the address of the wrapped native on the current chain from data
    const wnAddr: string | undefined = supportedNetworks[chainId].tokens.WETH;
    // return the token array with the wrapped native removed, or the original
    // ... token array if the current chain has no wrapped native token specified
    return wnAddr
        ? tokens.filter(
              (tkn: TokenIF) =>
                  tkn.address.toLowerCase() !== wnAddr.toLowerCase(),
          )
        : tokens;
}
