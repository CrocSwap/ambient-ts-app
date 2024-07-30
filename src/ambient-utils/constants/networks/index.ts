import { NetworkIF, TokenIF, chainIds } from '../../types';
import { ethereumSepolia } from './ethereumSepolia';
import { ethereumMainnet } from './ethereumMainnet';
import { scrollMainnet } from './scrollMainnet';
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
} from '../../../assets/branding';

export const brand: string | undefined =
    import.meta.env.VITE_BRAND_ASSET_SET ?? '';

const networks: NetworkIF[] = [
    ethereumSepolia,
    ethereumMainnet,
    scrollMainnet,
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
          : brand === 'futa'
            ? getNetworks(Object.keys(futaBrandAssets.networks))
            : brand === 'ambientProduction'
              ? getNetworks(Object.keys(ambientProductionBrandAssets.networks))
              : brand === 'ambientTestnet'
                ? getNetworks(Object.keys(ambientTestnetBrandAssets.networks))
                : getNetworks(Object.keys(defaultBrandAssets.networks));

export function getDefaultPairForChain(chainId: string): [TokenIF, TokenIF] {
    if (brand === 'futa') {
        return (
            supportedNetworks[chainId].defaultPairFuta ?? [
                supportedNetworks[chainId].defaultPair[0],
                supportedNetworks[chainId].defaultPair[1],
            ]
        );
    } else {
        return [
            supportedNetworks[chainId].defaultPair[0],
            supportedNetworks[chainId].defaultPair[1],
        ];
    }
}

export { ethereumSepolia };
export { ethereumMainnet };
export { scrollMainnet };
export { scrollSepolia };
export { blastSepolia };
export { blast };
