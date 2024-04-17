import { CrocEnv } from '@crocswap-libs/sdk';
import { memoizePromiseFn } from '../dataLayer/functions/memoizePromiseFn';
import { Alchemy } from 'alchemy-sdk';

export const fetchNFT = async (
    address: string,
    crocEnv: CrocEnv | undefined,
    client: Alchemy,
    pageKey: string,
    pageSize: number,
): Promise<fetchNFTReturn> => {
    if (!crocEnv) return;

    const nftsForOwnerResponse = await client.nft.getNftsForOwner(address, {
        pageKey: pageKey,
        pageSize: pageSize,
    });

    const nftData = nftsForOwnerResponse.ownedNfts;
    const totalNFTCount = nftsForOwnerResponse.totalCount;
    const pageKeyResponse = nftsForOwnerResponse.pageKey;

    return {
        NFTData: nftData,
        totalNFTCount: totalNFTCount,
        pageKey: pageKeyResponse,
        userHasNFT: nftsForOwnerResponse.totalCount > 0,
    };
};

export type fetchNFTReturn =
    | {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          NFTData: any;
          totalNFTCount: number;
          pageKey: string | undefined;
          userHasNFT: boolean;
      }
    | undefined;

export type NFTQueryFn = (
    address: string,
    crocEnv: CrocEnv | undefined,
    client: Alchemy,
    pageKey: string,
    pageSize: number,
) => Promise<fetchNFTReturn>;

export function memoizeFetchNFT(): NFTQueryFn {
    return memoizePromiseFn(fetchNFT) as NFTQueryFn;
}
