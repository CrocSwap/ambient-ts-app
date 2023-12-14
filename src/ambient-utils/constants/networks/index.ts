import { NetworkIF, NetworkSessionIF, TokenIF } from '../../types';
import { arbitrumGoerli } from './arbitrumGoerli';
import { ethereumGoerli } from './ethereumGoerli';
import { ethereumMainnet } from './ethereumMainnet';
import { scrollMainnet } from './scrollMainnet';
import { scrollSepolia } from './scrollSepolia';

import { ethers } from 'ethers';
import { fetchBlockNumber } from '../../api/fetchBlockNumber';
import { CrocEnv } from '@crocswap-libs/sdk';

export const supportedNetworks: { [x: string]: NetworkIF } = {
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

// Make a best effort, based off chain ID, to give back several useful chain objects.
// Note: A lot of work could be done with this method to create a broadly useful session object, which could provide downstream consumers with the session related information they need.

export const createNetworkSession = async ({
    chainId,
    tokenUniverse,
    infuraUrl,
}: {
    chainId: string;
    tokenUniverse: TokenIF[];
    infuraUrl: string;
}): NetworkSessionIF => {
    if (chainId.length === 0) {
        throw new Error('Chain ID is a required parameter');
    }
    if (
        !['0x5', '0x1'].includes(chainId) &&
        tokenUniverse.length === 0 &&
        infuraUrl.length === 0
    ) {
        throw new Error(
            'Not a supported autoconfigured chain yet. You must specify the token Universe and infura URL',
        );
    }

    const network = supportedNetworks[chainId];
    const provider = new ethers.providers.JsonRpcProvider(infuraUrl);
    const signer = undefined;
    return {
        tokenUniv: tokenUniverse,
        infuraUrl: infuraUrl,
        provider: provider,
        chainId: chainId,
        lastBlockNumber: await fetchBlockNumber(infuraUrl),
        signer: undefined,
        gcUrl: network.graphCacheUrl,
        crocEnv: new CrocEnv(provider, signer),
    };
};

export { arbitrumGoerli };
export { ethereumGoerli };
export { ethereumMainnet };
export { scrollMainnet };
export { scrollSepolia };
