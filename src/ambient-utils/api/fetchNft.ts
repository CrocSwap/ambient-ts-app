import { CrocEnv } from '@crocswap-libs/sdk';
import { memoizePromiseFn } from '../dataLayer/functions/memoizePromiseFn';
import { Client } from '@covalenthq/client-sdk';
import { Chains } from '@covalenthq/client-sdk/dist/services/Client';
import { COVALENT_CHAIN_IDS } from './fetchTokenBalances';

export const fetchNFT = async (
    address: string,
    chain: string,
    crocEnv: CrocEnv | undefined,
    client: Client,
): Promise<any> => {
    if (!crocEnv) return;

    const covalentChainString =
        COVALENT_CHAIN_IDS[chain as keyof typeof COVALENT_CHAIN_IDS] ||
        'eth-goerli';

    const covalentNFTResponse = await client.NftService.getNftsForAddress(
        covalentChainString as Chains,
        address,
        {
            withUncached: true,
        },
    );

    const covalentData = covalentNFTResponse.data.items;

    return covalentData;
};

export type NFTQueryFn = (
    address: string,
    chain: string,
    crocEnv: CrocEnv | undefined,
    client: Client,
) => Promise<any>;

export function memoizeFetchNFT(): NFTQueryFn {
    return memoizePromiseFn(fetchNFT) as NFTQueryFn;
}
