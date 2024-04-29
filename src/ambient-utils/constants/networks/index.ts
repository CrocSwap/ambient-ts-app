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
} from '../../../assets/branding';

export const brand: string | undefined =
    process.env.REACT_APP_BRAND_ASSET_SET ?? 'ambient';

const networks: NetworkIF[] = [
    ethereumSepolia,
    ethereumMainnet,
    scrollMainnet,
    scrollSepolia,
    blastSepolia,
    blast,
];

function getNetworks(...chns: (string | chainIds)[]): {
    [x: string]: NetworkIF;
} {
    const chains: string[] = [chns].flat();
    const networksToShow: NetworkIF[] = chains
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
        ? getNetworks(...blastBrandAssets.networks)
        : brand === 'scroll'
        ? getNetworks(...scrollBrandAssets.networks)
        : brand === 'ambientProduction'
        ? getNetworks(...ambientProductionBrandAssets.networks)
        : brand === 'ambientTestnet'
        ? getNetworks(...ambientTestnetBrandAssets.networks)
        : getNetworks(...defaultBrandAssets.networks);

export function getDefaultPairForChain(chainId: string): [TokenIF, TokenIF] {
    return [
        supportedNetworks[chainId].defaultPair[0],
        supportedNetworks[chainId].defaultPair[1],
    ];
}

export { ethereumSepolia };
export { ethereumMainnet };
export { scrollMainnet };
export { scrollSepolia };
export { blastSepolia };
export { blast };
