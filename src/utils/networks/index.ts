import { arbitrumGoerli } from './arbitrumGoerli';
import { ethereumGoerli } from './ethereumGoerli';
import { ethereumMainnet } from './ethereumMainnet';

export const supportedNetworks = {
    [ethereumMainnet.chainId]: ethereumMainnet,
    [ethereumGoerli.chainId]: ethereumGoerli,
    [arbitrumGoerli.chainId]: arbitrumGoerli,
};
