/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { CrocEnv } from '@crocswap-libs/sdk';
import { ethers, Provider } from 'ethers';
import { fetchTokenUniverse } from '../../api/fetchTokenUniverse';
import { NetworkSessionIF, TokenIF } from '../../types';
import { supportedNetworks } from './index';

// Make a best effort, based off chain ID, to give back several useful chain objects.
// Should also support "bringing your own" values, so on the front end we can make sure not to redefine objects that are already present.
// On the other hand, should only ever need chainId, to derive all other needed objects from scratch.
// TODO/ENHANCEMENT add in support for signers. For now sessions only support unsiged reading ops
// TODO/ENHANCEMENT save the session objects in memory to avoid re-creating similar sessions
export const createNetworkSession = async ({
    chainId,
    tokenUniv,
    gcUrl,
    infuraUrl,
    provider,
    crocEnv,
}: {
    chainId: string;
    tokenUniv?: TokenIF[];
    gcUrl?: string;
    infuraUrl?: string;
    provider?: Provider;
    crocEnv?: CrocEnv;
}): Promise<NetworkSessionIF> => {
    if (chainId.length === 0) {
        throw new Error('Chain ID is a required parameter');
    }

    const defaultSigner = undefined;
    const network = supportedNetworks[chainId];
    const assertExists = async <T>(
        data: T,
        setter: () => Promise<T>,
    ): Promise<T> => {
        let retData = data;
        if (retData === undefined || retData === null) {
            retData = await setter();
        }
        if (retData === undefined || retData === null) {
            throw new Error('Could not set a required variable');
        }
        return retData;
    };
    // Following for the compiler, because it has a low IQ

    // By the end of the block, we will have all the required dependencies in a non missing state (or error trying)
    infuraUrl = await assertExists(infuraUrl, async () => network.evmRpcUrl);
    gcUrl = await assertExists(gcUrl, async () => network.GCGO_URL);
    tokenUniv = await assertExists(tokenUniv, async () =>
        fetchTokenUniverse(network.chainId),
    );
    provider = await assertExists(
        provider,
        async () => new ethers.JsonRpcProvider(infuraUrl),
    );
    crocEnv = await assertExists(
        crocEnv,
        async () => new CrocEnv(provider as Provider, defaultSigner),
    );

    return {
        tokenUniv: tokenUniv!,
        infuraUrl: infuraUrl!,
        provider: provider!,
        chainId: chainId,
        signer: undefined,
        gcUrl: gcUrl!,
        crocEnv: crocEnv!,
    };
};
