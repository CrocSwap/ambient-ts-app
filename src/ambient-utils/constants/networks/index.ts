import { NetworkIF, TokenIF, chainIds } from '../../types';
import { arbitrumGoerli } from './arbitrumGoerli';
import { ethereumGoerli } from './ethereumGoerli';
import { ethereumSepolia } from './ethereumSepolia';
import { ethereumMainnet } from './ethereumMainnet';
import { scrollMainnet } from './scrollMainnet';
import { scrollSepolia } from './scrollSepolia';
import { blastSepolia } from './blastSepolia';
import { blast } from './blastNetwork';
import {
    ambientBrandAssets,
    blastBrandAssets,
    scrollBrandAssets,
} from '../../../assets/branding';

export const brand: string | undefined =
    process.env.REACT_APP_BRAND_ASSET_SET ?? 'ambient';

const networks: NetworkIF[] = [
    arbitrumGoerli,
    ethereumGoerli,
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
        : brand === 'ambient'
        ? getNetworks(...ambientBrandAssets.networks)
        : brand === 'testnet'
        ? getNetworks(
              ethereumSepolia.chainId,
              blastSepolia.chainId,
              scrollSepolia.chainId,
          )
        : getNetworks(
              ethereumMainnet.chainId,
              blast.chainId,
              scrollMainnet.chainId,
              blastSepolia.chainId,
              ethereumSepolia.chainId,
              scrollSepolia.chainId,
              ethereumGoerli.chainId,
              arbitrumGoerli.chainId,
          );

export function getDefaultPairForChain(chainId: string): [TokenIF, TokenIF] {
    return [
        supportedNetworks[chainId].defaultPair[0],
        supportedNetworks[chainId].defaultPair[1],
    ];
}

export { arbitrumGoerli };
export { ethereumGoerli };
export { ethereumSepolia };
export { ethereumMainnet };
export { scrollMainnet };
export { scrollSepolia };
export { blastSepolia };
export { blast };
