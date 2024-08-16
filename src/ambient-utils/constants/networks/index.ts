import { NetworkIF, TokenIF, chainIds } from '../../types';
import { ethereumSepolia } from './ethereumSepolia';
import { ethereumMainnet } from './ethereumMainnet';
import { scrollMainnet } from './scrollMainnet';
import { zircuitMainnet } from './zircuitMainnet';
import { scrollSepolia } from './scrollSepolia';
import { blastSepolia } from './blastSepolia';
import { blast } from './blastNetwork';
import {
    ambientProductionBrandAssets,
    ambientTestnetBrandAssets,
    defaultBrandAssets,
    blastBrandAssets,
    scrollBrandAssets,
    futaBrandAssets,
    zircuitBrandAssets,
} from '../../../assets/branding';

export const brand: string | undefined =
    import.meta.env.VITE_BRAND_ASSET_SET ?? '';

const networks: NetworkIF[] = [
    ethereumSepolia,
    ethereumMainnet,
    scrollMainnet,
    zircuitMainnet,
    scrollSepolia,
    blastSepolia,
    blast,
];

function getNetworks(chns: (string | chainIds)[]): {
    [x: string]: NetworkIF;
} {
    const networksToShow: NetworkIF[] = chns
        .map((c: string) => {
            const network: NetworkIF | undefined = networks.find(
                (n: NetworkIF) => n.chainId.toLowerCase() === c,
            );
            return network;
        })
        .filter((n: NetworkIF | undefined) => !!n) as NetworkIF[];
    const output: { [x: string]: NetworkIF } = {};
    networksToShow.forEach((n: NetworkIF) => (output[n.chainId] = n));
    return output;
}

export const supportedNetworks: { [x: string]: NetworkIF } =
    brand === 'blast'
        ? getNetworks(Object.keys(blastBrandAssets.networks))
        : brand === 'scroll'
          ? getNetworks(Object.keys(scrollBrandAssets.networks))
          : brand === 'zircuit'
            ? getNetworks(Object.keys(zircuitBrandAssets.networks))
            : brand === 'futa'
              ? getNetworks(Object.keys(futaBrandAssets.networks))
              : brand === 'ambientProduction'
                ? getNetworks(
                      Object.keys(ambientProductionBrandAssets.networks),
                  )
                : brand === 'ambientTestnet'
                  ? getNetworks(Object.keys(ambientTestnetBrandAssets.networks))
                  : getNetworks(Object.keys(defaultBrandAssets.networks));

console.log({ brand, supportedNetworks });

export function getDefaultPairForChain(chainId: string): [TokenIF, TokenIF] {
    return [
        supportedNetworks[chainId].defaultPair[0],
        supportedNetworks[chainId].defaultPair[1],
    ];
}

export { ethereumSepolia };
export { ethereumMainnet };
export { scrollMainnet };
export { zircuitMainnet };
export { scrollSepolia };
export { blastSepolia };
export { blast };
