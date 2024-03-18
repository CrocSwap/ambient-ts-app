import * as localLogos from '../../../assets/images/tokens/exports';
import { uriToHttp } from '../../../ambient-utils/dataLayer';
import { TokenIF } from '../../../ambient-utils/types';

// all args are optional; calling fn without data is handled
interface argsIF {
    token?: TokenIF;
    sourceURI?: string;
}

// return a preferred URI for a token logo, local if it exists, remote otherwise
export default function processLogoSrc(args: argsIF): string {
    // consume URI from TokenIF obj preferentially, use string as fallback if missing
    const uri: string | undefined = args.token?.logoURI ?? args.sourceURI;
    // early return if no URI was received in args
    if (!uri) return '';
    // return a filepath (if local) or a URI string (if remote)
    return (
        localLogos[
            args.token?.symbol.toUpperCase() as keyof typeof localLogos
        ] ?? uriToHttp(uri)
    );
}
