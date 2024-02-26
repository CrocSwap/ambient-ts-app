import { NetworkIF, TokenIF } from '../../types';
import { arbitrumGoerli } from './arbitrumGoerli';
import { ethereumGoerli } from './ethereumGoerli';
import { ethereumSepolia } from './ethereumSepolia';
import { ethereumMainnet } from './ethereumMainnet';
import { scrollMainnet } from './scrollMainnet';
import { scrollSepolia } from './scrollSepolia';

export const supportedNetworks: { [x: string]: NetworkIF } = {
    [ethereumMainnet.chainId]: ethereumMainnet,
    [ethereumGoerli.chainId]: ethereumGoerli,
    [ethereumSepolia.chainId]: ethereumSepolia,
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
export { ethereumSepolia };
export { ethereumMainnet };
export { scrollMainnet };
export { scrollSepolia };
