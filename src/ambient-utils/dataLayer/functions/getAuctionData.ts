import {
    mockAccountData1,
    mockAccountData2,
    mockGlobalAuctionData,
} from '../../../pages/platformFuta/mockAuctionData';
// import { GCGO_OVERRIDE_URL } from '../../constants';
import { memoizeCacheQueryFn } from './memoizePromiseFn';

export interface AuctionListServerDataIF {
    auctionList: AuctionDataIF[];
}

export interface TickerAvailabilityServerDataIF {
    ticker: string;
    chainId: string;
    isAvailable: boolean;
}

// interface for auction data used to generate auction list views
// for both global and user specific lists
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
    qtyUserBidFilledInNativeTokenWei?: string | undefined;
    qtyUnclaimedByUserInAuctionedTokenWei?: string | undefined;
    qtyClaimedByUserInAuctionedTokenWei?: string | undefined;
    qtyUnreturnedToUserInNativeTokenWei?: string | undefined;
    qtyReturnedToUserInNativeTokenWei?: string | undefined;
}

// interface for auction status data used to generate auction details view
export interface AuctionStatusDataServerIF {
    ticker: string;
    chainId: string;
    createdAt: number;
    auctionLength: number;
    filledClearingPriceInNativeTokenWei: string;

    // open bid data
    openBidClearingPriceInNativeTokenWei?: string | undefined;
    openBidQtyFilledInNativeTokenWei?: string | undefined;
}

const getGlobalAuctionsList = async (
    chainId: string,
    // graphCacheUrl: string,
    _cacheTimeTag: number | string,
): Promise<AuctionDataIF[]> => {
    // const auctionsListEndpoint = GCGO_OVERRIDE_URL
    //     ? GCGO_OVERRIDE_URL + '/auctions?'
    //     : graphCacheUrl + '/auctions?';
    false && console.log({ chainId });
    return mockGlobalAuctionData.auctionList;
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
        return mockAccountData1.auctionList;
    }
    return mockAccountData2.auctionList;
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

const excludedTickers = [
    'ambi',
    'amb',
    'futa',
    'nft',
    'eth',
    'weth',
    'btc',
    'wbtc',
    'usd',
    'usdc',
    'usdt',
    'dai',
];

// Regular expression pattern for Latin alphabet characters (both uppercase and lowercase), digits, and emoji
const validTickerPattern = /^[A-Za-z0-9\p{Extended_Pictographic}]+$/u;
/* 
        Example usage of the pattern
        console.log(isValidString("Hello123")); // true (Latin alphanumeric)
        console.log(isValidString("Hello😊123")); // true (Latin alphanumeric + Extended Pictographic)
        console.log(isValidString("こんにちは")); // false (Non-Latin characters)
        console.log(isValidString("1234😊😊")); // true (Digits + Extended Pictographic)
        console.log(isValidString("Hello!")); // false (Special character '!')
*/

export const checkTickerPattern = (ticker: string) => {
    if (ticker.length === 0) return true;
    return validTickerPattern.test(ticker);
};

export const checkTickerValidity = async (
    chainId: string,
    ticker: string,
    // graphCacheUrl: string,
): Promise<{ isValid: boolean; invalidReason?: string }> => {
    const isExcluded = excludedTickers.includes(ticker.toLowerCase());
    const lengthIsValid = ticker.length > 0 && ticker.length <= 10;
    const isTickerPatternValid = checkTickerPattern(ticker);

    let isTickerValid = true;

    if (isExcluded || !isTickerPatternValid || !lengthIsValid)
        isTickerValid = false;

    if (!isTickerValid)
        console.log('checking ticker validity', {
            ticker,
            chainId,
            isTickerValid,
        });
    const invalidReason = isExcluded ? 'Excluded ticker' : 'Invalid ticker';
    if (!isTickerValid) return { isValid: false, invalidReason: invalidReason };

    // const tickerAvailabilityEndpoint = GCGO_OVERRIDE_URL
    //     ? GCGO_OVERRIDE_URL + '/ticker_available?'
    //     : graphCacheUrl + '/ticker_available?';

    let isTickerAvailable = true;

    if (ticker.toLowerCase().includes('bentest')) isTickerAvailable = false;

    // isTickerAvailable = fetch(
    //     tickerAvailabilityEndpoint +
    //         new URLSearchParams({
    //             chainId: chainId,
    //             ticker: ticker,
    //         }),
    // )
    //     .then((response) => response?.json())
    //     .then((json) => {
    //         if (!json?.data) {
    //             return false;
    //         }

    //         const payload = json.data as TickerAvailabilityServerDataIF;
    //         return payload.isAvailable;
    //     })
    //     .catch(() => {
    //         return false;
    //     });

    console.log('checking ticker validity', {
        ticker,
        chainId,
        isTickerAvailable,
    });

    return { isValid: isTickerAvailable, invalidReason: 'Unavailable ticker' };
};

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
