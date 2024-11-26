import {
    ambientProductionBrandAssets,
    ambientTestnetBrandAssets,
    blastBrandAssets,
    defaultBrandAssets,
    futaBrandAssets,
    plumeSepoliaBrandAssets,
    scrollBrandAssets,
} from '../../../assets/branding';
import { swellSepoliaBrandAssets } from '../../../assets/branding/swellSepoliaBrandAssets';
import { NetworkIF, TokenIF, chainIds } from '../../types';
import { blastMainnet } from './blastMainnet';
import { blastSepolia } from './blastSepolia';
import { ethereumMainnet } from './ethereumMainnet';
import { ethereumSepolia } from './ethereumSepolia';
import { plumeSepolia } from './plumeSepolia';
import { scrollMainnet } from './scrollMainnet';
import { scrollSepolia } from './scrollSepolia';
import { swellSepolia } from './swellSepolia';

export const brand: string | undefined =
    import.meta.env.VITE_BRAND_ASSET_SET ?? '';

const networks: NetworkIF[] = [
    ethereumSepolia,
    ethereumMainnet,
    scrollMainnet,
    scrollSepolia,
    blastSepolia,
    blastMainnet,
    plumeSepolia,
    swellSepolia,
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
                : brand === 'plumeSepolia'
                  ? getNetworks(Object.keys(plumeSepoliaBrandAssets.networks))
                  : brand === 'swellSepolia'
                    ? getNetworks(Object.keys(swellSepoliaBrandAssets.networks))
                    : getNetworks(Object.keys(defaultBrandAssets.networks));

export const vaultSupportedNetworkIds = ['0x1', '0x82750'];
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
    blastMainnet,
    blastSepolia,
    ethereumMainnet,
    ethereumSepolia,
    plumeSepolia,
    scrollMainnet,
    scrollSepolia,
    swellSepolia,
};
