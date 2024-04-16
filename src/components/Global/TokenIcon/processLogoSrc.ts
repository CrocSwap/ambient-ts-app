import * as localLogos from '../../../assets/images/tokens/exports';
import { uriToHttp } from '../../../ambient-utils/dataLayer';
import { TokenIF } from '../../../ambient-utils/types';

// all args are optional; calling fn without data is handled
interface argsIF {
    token?: TokenIF;
    symbol?: string;
    sourceURI?: string;
}

// return a preferred URI for a token logo, local if it exists, remote otherwise
export default function processLogoSrc(args: argsIF): string {
    // consume URI from TokenIF obj preferentially, use string as fallback if missing
    const uri: string | undefined = args.token?.logoURI ?? args.sourceURI;
    // early return if no URI was received in args

    let localLogoLookupSymbol =
        args.token?.symbol.toUpperCase() ?? args.symbol?.toUpperCase();
    if (localLogoLookupSymbol === 'USD+') localLogoLookupSymbol = 'USDPLUS';
    // return a filepath (if local) or a URI string (if remote)
    return (
        localLogos[localLogoLookupSymbol as keyof typeof localLogos] ??
        uriToHttp(uri || '')
    );
}
