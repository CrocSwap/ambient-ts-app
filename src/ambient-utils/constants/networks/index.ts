import { NetworkIF, TokenIF } from '../../types';
import { arbitrumGoerli } from './arbitrumGoerli';
import { ethereumGoerli } from './ethereumGoerli';
import { ethereumSepolia } from './ethereumSepolia';
import { ethereumMainnet } from './ethereumMainnet';
import { scrollMainnet } from './scrollMainnet';
import { scrollSepolia } from './scrollSepolia';
import { blastSepolia } from './blastSepolia';
import { blast } from './blastNetwork';

export const IS_BLAST_SITE = process.env.REACT_APP_IS_BLAST_SITE
    ? process.env.REACT_APP_IS_BLAST_SITE?.toLowerCase() === 'true'
    : false;

export const IS_SCROLL_SITE =
    process.env.REACT_APP_IS_SCROLL_SITE !== undefined
        ? process.env.REACT_APP_IS_SCROLL_SITE.toLowerCase() === 'true'
        : false;

export const IS_PRODUCTION_SITE =
    process.env.REACT_APP_IS_PRODUCTION_SITE !== undefined
        ? process.env.REACT_APP_IS_PRODUCTION_SITE.toLowerCase() === 'true'
        : false;

export const IS_TESTNET_SITE =
    process.env.REACT_APP_IS_TESTNET_SITE !== undefined
        ? process.env.REACT_APP_IS_TESTNET_SITE.toLowerCase() === 'true'
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
          [ethereumGoerli.chainId]: ethereumGoerli,
          [arbitrumGoerli.chainId]: arbitrumGoerli,
      };

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
