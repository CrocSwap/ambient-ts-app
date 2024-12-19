import {
    ambientProductionBrandAssets,
    ambientTestnetBrandAssets,
    baseSepoliaBrandAssets,
    blastBrandAssets,
    defaultBrandAssets,
    futaBrandAssets,
    plumeBrandAssets,
    plumeSepoliaBrandAssets,
    scrollBrandAssets,
    swellBrandAssets,
    swellSepoliaBrandAssets,
} from '../../../assets/branding';
import { NetworkIF, TokenIF, chainHexIds } from '../../types';
import { baseSepolia } from './baseSepolia';
import { blastMainnet } from './blastMainnet';
import { blastSepolia } from './blastSepolia';
import { ethereumMainnet } from './ethereumMainnet';
import { ethereumSepolia } from './ethereumSepolia';
import { plumeMainnet } from './plumeMainnet';
import { plumeSepolia } from './plumeSepolia';
import { scrollMainnet } from './scrollMainnet';
import { scrollSepolia } from './scrollSepolia';
import { swellMainnet } from './swellMainnet';
import { swellSepolia } from './swellSepolia';

export const brand: string | undefined =
    import.meta.env.VITE_BRAND_ASSET_SET ?? '';

const networkDefinitions: NetworkIF[] = [
    ethereumMainnet,
    scrollMainnet,
    blastMainnet,
    plumeMainnet,
    swellMainnet,
    ethereumSepolia,
    plumeSepolia,
    blastSepolia,
    swellSepolia,
    scrollSepolia,
    baseSepolia,
];

function getNetworks(chns: (string | chainHexIds)[]): {
    [x: string]: NetworkIF;
} {
    const networksToShow: NetworkIF[] = chns
        .map((c: string) => {
            const network: NetworkIF | undefined = networkDefinitions.find(
                (n: NetworkIF) => n.chainId.toLowerCase() === c,
            );
            return network;
        })
        .filter((n: NetworkIF | undefined) => !!n) as NetworkIF[];
    const output: { [x: string]: NetworkIF } = {};
    networksToShow.forEach((n: NetworkIF) => (output[n.chainId] = n));
    return output;
}

export const allNetworks: { [x: string]: NetworkIF } = getNetworks(
    Object.keys(defaultBrandAssets.networks),
);

export const supportedNetworks: { [x: string]: NetworkIF } =
    brand === 'ambientProduction'
        ? getNetworks(Object.keys(ambientProductionBrandAssets.networks))
        : brand === 'ambientTestnet'
          ? getNetworks(Object.keys(ambientTestnetBrandAssets.networks))
          : brand === 'scroll'
            ? getNetworks(Object.keys(scrollBrandAssets.networks))
            : brand === 'swell'
              ? getNetworks(Object.keys(swellBrandAssets.networks))
              : brand === 'blast'
                ? getNetworks(Object.keys(blastBrandAssets.networks))
                : brand === 'plume'
                  ? getNetworks(Object.keys(plumeBrandAssets.networks))
                  : brand === 'futa'
                    ? getNetworks(Object.keys(futaBrandAssets.networks))
                    : brand === 'plumeSepolia'
                      ? getNetworks(
                            Object.keys(plumeSepoliaBrandAssets.networks),
                        )
                      : brand === 'swellSepolia'
                        ? getNetworks(
                              Object.keys(swellSepoliaBrandAssets.networks),
                          )
                        : brand === 'baseSepolia'
                          ? getNetworks(
                                Object.keys(baseSepoliaBrandAssets.networks),
                            )
                          : getNetworks(
                                Object.keys(defaultBrandAssets.networks),
                            );

export const vaultSupportedNetworkIds = [
    '0x1', // ethereum mainnet
    '0x82750', // scroll mainnet
    // '0x783', // swell mainnet
];
export const vaultSupportedNetworks = getNetworks(vaultSupportedNetworkIds);

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

export {
    baseSepolia,
    blastMainnet,
    blastSepolia,
    ethereumMainnet,
    ethereumSepolia,
    plumeMainnet,
    plumeSepolia,
    scrollMainnet,
    scrollSepolia,
    swellMainnet,
    swellSepolia,
};
