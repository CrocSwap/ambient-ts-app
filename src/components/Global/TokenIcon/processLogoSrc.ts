import * as localLogos from '../../../assets/images/tokens/exports';
import * as addresses from '../../../utils/tokens/exports';
import uriToHttp from '../../../utils/functions/uriToHttp';
import { TokenIF } from '../../../utils/interfaces/TokenIF';

// fn to find a canonical token symbol locally by its address and chain
const idToken = (chn: string, addr: string): string | undefined => {
    // map to connect token addresses to a canonical symbol
    const logoURIMap = new Map<string, string>();
    // iterate over all data in the `/src/utils/tokens` directory
    Object.entries(addresses)
        // reverse sequence of data in tuples (optional but makes life easier)
        .map((e) => e.reverse())
        // iterate over every key-val tuple
        .forEach(([obj, tokenSymbol]) => {
            // build tuples for canonical token address on each chain
            const kvPairs: [string, string][] = Object.entries(obj);
            // iterate over tuples and map addr/chn combos to token symbols
            // this might be faster or easier in the future with a `.find()`
            kvPairs.forEach((kvPair: [string, string]) =>
                logoURIMap.set(
                    kvPair[0].toLowerCase() + '_' + kvPair[1].toLowerCase(),
                    tokenSymbol as string,
                ),
            );
        });
    // lookup a canonical symbol for a given token's address and chain ID
    const requestedLogoKey: string =
        chn.toLowerCase() + '_' + addr.toLowerCase();
    // return canonical symbol or `undefined` if not found
    return logoURIMap.get(requestedLogoKey);
};

// return a preferred URI for a token logo, local if it exists, remote otherwise
export default function processLogoSrc(token?: TokenIF): string {
    // return empty string if `token` is undefined (app will use `<NoTokenIcon/>`)
    if (!token) return '';
    // find a canonical symbol for a given token by its contract address
    const verifiedSymbol: string | undefined = idToken(
        '0x' + token.chainId.toString(16),
        token.address,
    );
    // map to connect token symbol to a local logo URIs
    const logoMap = new Map<string, string>();
    // iterate over all data in the `/src/assets/images/tokens` directory
    Object.entries(localLogos).forEach(([symbol, path]) =>
        logoMap.set(symbol, path),
    );
    // use verified symbol to locate a URI for a local-hosted logo, if present
    const localSrc: string | undefined = logoMap.get(verifiedSymbol as string);
    // return local source URI if present, otherwise return remote URI
    return localSrc ?? uriToHttp(token.logoURI);
}
