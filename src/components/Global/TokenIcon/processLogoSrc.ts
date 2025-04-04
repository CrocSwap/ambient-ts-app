import { excludedTokenAddressesLowercase } from '../../../ambient-utils/constants';
import { uriToHttp } from '../../../ambient-utils/dataLayer';
import { TokenIF } from '../../../ambient-utils/types';
import * as localLogos from '../../../assets/images/tokens/exports';

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
        args.token?.symbol?.toUpperCase() ?? args.symbol?.toUpperCase();

    // Filter out excluded addresses
    if (
        excludedTokenAddressesLowercase.includes(
            args.token?.address?.toLowerCase() ?? '',
        )
    ) {
        return '';
    }

    if (localLogoLookupSymbol === 'USD+') {
        localLogoLookupSymbol = 'USDPLUS';
    } else if (localLogoLookupSymbol === 'USD₮0') {
        localLogoLookupSymbol = 'USDT0';
    } else if (localLogoLookupSymbol === 'USDC.E') {
        localLogoLookupSymbol = 'USDC';
    } else if (localLogoLookupSymbol === 'PUNKETH-20') {
        localLogoLookupSymbol = 'PUNKETH20';
    }
    // return a filepath (if local) or a URI string (if remote)
    return (
        localLogos[localLogoLookupSymbol as keyof typeof localLogos] ??
        uriToHttp(uri || '')
    );
}
