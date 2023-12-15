import { ethers } from 'ethers';
import { fetchBlockNumber } from '../../api/fetchBlockNumber';
import { CrocEnv } from '@crocswap-libs/sdk';
import { tokenListURIs } from '../constants/tokenListURIs';
import { fetchTokenList, fetchTokenUniverse } from '../../api';
import { Provider } from '@ethersproject/providers';
import { supportedNetworks } from './index';

// Make a best effort, based off chain ID, to give back several useful chain objects.
// Should also support "bringing your own" values, so on the front end we can make sure not to redefine objects that are already present.
// On the other hand, should only ever need chainId, to derive all other needed objects from scratch.
export const createNetworkSession = async ({
    chainId,
    tokenUniverse,
    gcUrl,
    infuraUrl,
    provider,
    crocEnv,
    lastBlockNumber,
}: {
    chainId: string;
    tokenUniverse?: TokenIF[];
    gcUrl?: string;
    infuraUrl?: string;
    provider?: Provider;
    crocEnv?: CrocEnv;
    lastBlockNumber?: number;
}): Promise<NetworkSessionIF> => {
    if (chainId.length === 0) {
        throw new Error('Chain ID is a required parameter');
    }

    const defaultSigner = undefined;
    const network = supportedNetworks[chainId];

    if (!infuraUrl) infuraUrl = network.wagmiChain.rpcUrls.default.http;
    if (!gcUrl) gcUrl = network.graphCacheUrl;
    if (!tokenUniverse) tokenUniverse = fetchTokenUniverse(network.chainId);
    if (!provider) provider = new ethers.providers.JsonRpcProvider(infuraUrl);
    if (!crocEnv) crocEnv = new CrocEnv(provider, defaultSigner);
    if (!lastBlockNumber)
        lastBlockNumber = await fetchBlockNumber(
            (provider as ethers.providers.JsonRpcProvider).connection.url,
        );

    return {
        tokenUniv: tokenUniverse,
        infuraUrl: infuraUrl,
        provider: provider,
        chainId: chainId,
        lastBlockNumber: lastBlockNumber,
        signer: undefined,
        gcUrl: gcUrl,
        crocEnv: crocEnv,
    };
};
