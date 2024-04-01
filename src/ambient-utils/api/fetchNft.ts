import { CrocEnv } from '@crocswap-libs/sdk';
import { memoizePromiseFn } from '../dataLayer/functions/memoizePromiseFn';
import { Alchemy, GetBaseNftsForOwnerOptions } from 'alchemy-sdk';

export const fetchNFT = async (
    address: string,
    crocEnv: CrocEnv | undefined,
    client: Alchemy,
): Promise<any> => {
    if (!crocEnv) return;

    const nftsForOwnerResponse = await client.nft.getNftsForOwner(address, {
        pageKey: '1',
        pageSize: 50,
    });

    const nftData = nftsForOwnerResponse.ownedNfts;

    return nftData;
};

export type NFTQueryFn = (
    address: string,
    crocEnv: CrocEnv | undefined,
    client: Alchemy,
) => Promise<any>;

export function memoizeFetchNFT(): NFTQueryFn {
    return memoizePromiseFn(fetchNFT) as NFTQueryFn;
}
