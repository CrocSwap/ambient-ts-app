import { TokenIF } from '../types/token/TokenIF';
import { arbitrumGoerli } from './arbitrumGoerli';
import { ethereumGoerli } from './ethereumGoerli';
import { ethereumMainnet } from './ethereumMainnet';
import { scrollMainnet } from './scrollMainnet';
import { scrollSepolia } from './scrollSepolia';

export const supportedNetworks = {
    [ethereumMainnet.chainId]: ethereumMainnet,
    [ethereumGoerli.chainId]: ethereumGoerli,
    [arbitrumGoerli.chainId]: arbitrumGoerli,
    [scrollSepolia.chainId]: scrollSepolia,
    [scrollMainnet.chainId]: scrollMainnet,
};

export function getDefaultPairForChain(chainId: string): [TokenIF, TokenIF] {
    return [
        supportedNetworks[chainId].defaultPair[0],
        supportedNetworks[chainId].defaultPair[1],
    ];
}

export { arbitrumGoerli };
export { ethereumGoerli };
export { ethereumMainnet };
export { scrollMainnet };
export { scrollSepolia };
