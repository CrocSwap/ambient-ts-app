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
