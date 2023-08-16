import * as localLogos from '../../assets/images/tokens/exports';
import * as addresses from '../tokens/exports';

const idToken = (chn: string, addr: string): string | undefined => {
    const logoURIMap = new Map<string, string>();
    Object.entries(addresses)
        .map((e) => e.reverse())
        .forEach(([obj, tokenSymbol]) => {
            const kvPairs: [string, string][] = Object.entries(obj);
            kvPairs.forEach((kvPair) =>
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

export default function handleTokenLogo(addr: string) {
    const verifiedSymbol: string | undefined = idToken(
        '0x1',
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    );
    const logoMap = new Map<string, string>();
    // localLogos.forEach()
    false && addr;
    Object.entries(localLogos).forEach(([symbol, path]) =>
        logoMap.set(symbol, path),
    );
    const localSrc: string | undefined = logoMap.get(verifiedSymbol as string);
    console.log(localSrc);
    // FIRST determine if the token logo is available locally in the codebase
    // SECOND return the URI passed through the `uriToHttp()` fn
    return localLogos.ASTR;
}
