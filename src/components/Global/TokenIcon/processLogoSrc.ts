import * as localLogos from '../../../assets/images/tokens/exports';
import { uriToHttp } from '../../../ambient-utils/dataLayer';
import { TokenIF } from '../../../ambient-utils/types';

// return a preferred URI for a token logo, local if it exists, remote otherwise
export default function processLogoSrc(token?: TokenIF): string {
    if (!token) return '';
    return (
        localLogos[token.symbol as keyof typeof localLogos] ??
        uriToHttp(token.logoURI)
    );
}
