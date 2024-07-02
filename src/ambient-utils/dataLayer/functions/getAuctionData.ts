import {
    mockAccountData1,
    mockAccountData2,
    mockAuctionData,
} from '../../../pages/platformFuta/mockAuctionData';
// import { GCGO_OVERRIDE_URL } from '../../constants';
import { memoizeCacheQueryFn } from './memoizePromiseFn';

const getGlobalAuctionsList = async (
    chainId: string,
    // graphCacheUrl: string,
    _cacheTimeTag: number | string,
): Promise<AuctionDataIF[]> => {
    // const auctionsListEndpoint = GCGO_OVERRIDE_URL
    //     ? GCGO_OVERRIDE_URL + '/auctions?'
    //     : graphCacheUrl + '/auctions?';
    false && console.log({ chainId });
    return mockAuctionData;
    // return fetch(
    //     auctionsListEndpoint +
    //         new URLSearchParams({
    //             chainId: chainId,
    //         }),
    // )
    //     .then((response) => response?.json())
    //     .then((json) => {
    //         if (!json?.data) {
    //             return undefined;
    //         }

    //         const payload = json.data as AuctionListServerDataIF;
    //         return payload.auctionList;
    //     })
    //     .catch(() => {
    //         return undefined;
    //     });
};

const getUserAuctionsList = async (
    chainId: string,
    userAddress: string,
    // graphCacheUrl: string,
    _cacheTimeTag: number | string,
): Promise<AuctionDataIF[]> => {
    // const auctionsListEndpoint = GCGO_OVERRIDE_URL
    //     ? GCGO_OVERRIDE_URL + '/auctions?'
    //     : graphCacheUrl + '/auctions?';
    false && console.log({ userAddress, chainId });
    if (
        userAddress.toLowerCase() ===
        '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc'.toLowerCase()
    ) {
        return mockAccountData1;
    }
    return mockAccountData2;
    // return fetch(
    //     auctionsListEndpoint +
    //         new URLSearchParams({
    //             chainId: chainId,
    //         }),
    // )
    //     .then((response) => response?.json())
    //     .then((json) => {
    //         if (!json?.data) {
    //             return undefined;
    //         }

    //         const payload = json.data as AuctionListServerDataIF;
    //         return payload.auctionList;
    //     })
    //     .catch(() => {
    //         return undefined;
    //     });
};

// interface AuctionListServerDataIF {
//     auctionList: AuctionDataIF[];
// }

export interface AuctionDataIF {
    ticker: string;
    chainId: string;
    createdAt: number;
    auctionLength: number;
    filledClearingPriceInNativeTokenWei: string;

    // user specific data received for account queries
    userAddress?: string;
    userBidClearingPriceInNativeTokenWei?: string | undefined;
    qtyBidByUserInNativeTokenWei?: string | undefined;
    qtyUnclaimedByUserInAuctionedTokenWei?: string | undefined;
    qtyClaimedByUserInAuctionedTokenWei?: string | undefined;
    qtyUnreturnedToUserInNativeTokenWei?: string | undefined;
    qtyReturnedToUserInNativeTokenWei?: string | undefined;
}

export type GlobalAuctionListQueryFn = (
    chainId: string,
    // graphCacheUrl: string,
    _cacheTimeTag: number | string,
) => Promise<AuctionDataIF[] | undefined>;

export type UserAuctionListQueryFn = (
    chainId: string,
    userAddress: string,
    // graphCacheUrl: string,
    _cacheTimeTag: number | string,
) => Promise<AuctionDataIF[] | undefined>;

export function memoizeGetGlobalAuctionsList(): GlobalAuctionListQueryFn {
    return memoizeCacheQueryFn(
        getGlobalAuctionsList,
    ) as GlobalAuctionListQueryFn;
}

export function memoizeGetUserAuctionsList(): UserAuctionListQueryFn {
    return memoizeCacheQueryFn(getUserAuctionsList) as UserAuctionListQueryFn;
}
