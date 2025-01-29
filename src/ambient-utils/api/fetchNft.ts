import { CrocEnv } from '@crocswap-libs/sdk';
import { ALCHEMY_API_KEY } from '../constants';
import { memoizePromiseFn } from '../dataLayer/functions/memoizePromiseFn';

export const fetchNFT = async (
    address: string,
    crocEnv: CrocEnv | undefined,
    pageKey: string,
    pageSize: number,
): Promise<fetchNFTReturn> => {
    if (!crocEnv || !ALCHEMY_API_KEY) return;

    const options = { method: 'GET', headers: { accept: 'application/json' } };

    try {
        const response = await fetch(
            `https://eth-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getNFTsForOwner?owner=${address}&withMetadata=true&pageSize=${pageSize}&pageKey=${pageKey}`,
            options,
        );

        const data = await response.json();

        const nftData = data.ownedNfts;
        const totalNFTCount = data.totalCount;
        const pageKeyResponse = data.pageKey;

        return {
            NFTData: nftData,
            totalNFTCount: totalNFTCount,
            pageKey: pageKeyResponse,
            userHasNFT: totalNFTCount > 0,
        };
    } catch (error) {
        console.error(error);
        return undefined;
    }
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
    pageKey: string,
    pageSize: number,
) => Promise<fetchNFTReturn>;

export function memoizeFetchNFT(): NFTQueryFn {
    return memoizePromiseFn(fetchNFT) as NFTQueryFn;
}
