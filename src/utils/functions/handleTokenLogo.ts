import * as localLogos from '../../assets/images/tokens/exports';
import { TokenIF } from '../interfaces/exports';
import * as addresses from '../tokens/exports';
import uriToHttp from './uriToHttp';

const idToken = (chn: string, addr: string): string | undefined => {
    const logoURIMap = new Map<string, string>();
    Object.entries(addresses)
        .map((e) => e.reverse())
        .forEach(([obj, tokenSymbol]) => {
            const kvPairs: [string, string][] = Object.entries(obj);
            kvPairs.forEach((kvPair: [string, string]) =>
                logoURIMap.set(
                    kvPair[0].toLowerCase() + '_' + kvPair[1].toLowerCase(),
                    tokenSymbol as string,
                ),
            );
        });
    const requestedLogoKey: string =
        chn.toLowerCase() + '_' + addr.toLowerCase();
    return logoURIMap.get(requestedLogoKey);
};

export default function handleTokenLogo(token?: TokenIF): string {
    if (!token) return '';
    const verifiedSymbol: string | undefined = idToken(
        '0x' + token.chainId.toString(16),
        token.address,
    );
    const logoMap = new Map<string, string>();
    Object.entries(localLogos).forEach(([symbol, path]) =>
        logoMap.set(symbol, path),
    );
    const localSrc: string | undefined = logoMap.get(verifiedSymbol as string);
    return localSrc ?? uriToHttp(token.logoURI);
}
