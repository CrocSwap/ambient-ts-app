import { NetworkIF, TokenIF } from '../../types';
import { ethereumSepolia } from './ethereumSepolia';
import { ethereumMainnet } from './ethereumMainnet';
import { scrollMainnet } from './scrollMainnet';
import { scrollSepolia } from './scrollSepolia';
import { blastSepolia } from './blastSepolia';
import { blast } from './blastNetwork';

export const IS_BLAST_SITE = import.meta.env.VITE_IS_BLAST_SITE
    ? import.meta.env.VITE_IS_BLAST_SITE?.toLowerCase() === 'true'
    : false;

export const IS_SCROLL_SITE =
    import.meta.env.VITE_IS_SCROLL_SITE !== undefined
        ? import.meta.env.VITE_IS_SCROLL_SITE.toLowerCase() === 'true'
        : false;

export const IS_PRODUCTION_SITE =
    import.meta.env.VITE_IS_PRODUCTION_SITE !== undefined
        ? import.meta.env.VITE_IS_PRODUCTION_SITE.toLowerCase() === 'true'
        : false;

export const IS_TESTNET_SITE =
    import.meta.env.VITE_IS_TESTNET_SITE !== undefined
        ? import.meta.env.VITE_IS_TESTNET_SITE.toLowerCase() === 'true'
        : false;

export const supportedNetworks: { [x: string]: NetworkIF } = IS_BLAST_SITE
    ? {
          [blast.chainId]: blast,
      }
    : IS_SCROLL_SITE
    ? {
          [scrollMainnet.chainId]: scrollMainnet,
      }
    : IS_PRODUCTION_SITE
    ? {
          [ethereumMainnet.chainId]: ethereumMainnet,
          [blast.chainId]: blast,
          [scrollMainnet.chainId]: scrollMainnet,
      }
    : IS_TESTNET_SITE
    ? {
          [ethereumSepolia.chainId]: ethereumSepolia,
          [blastSepolia.chainId]: blastSepolia,
          [scrollSepolia.chainId]: scrollSepolia,
      }
    : {
          [ethereumMainnet.chainId]: ethereumMainnet,
          [blast.chainId]: blast,
          [scrollMainnet.chainId]: scrollMainnet,
          [blastSepolia.chainId]: blastSepolia,
          [ethereumSepolia.chainId]: ethereumSepolia,
          [scrollSepolia.chainId]: scrollSepolia,
      };

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
