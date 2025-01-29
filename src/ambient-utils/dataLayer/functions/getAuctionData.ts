import { CrocEnv } from '@crocswap-libs/sdk';
import {
    mockAccountData1,
    mockAccountData2,
    mockAuctionDetailsServerResponseGenerator,
    mockGlobalAuctionData,
} from '../../../pages/platformFuta/mockAuctionData';
import { CURRENT_AUCTION_VERSION } from '../../constants';
import { memoizeCacheQueryFn } from './memoizePromiseFn';

export interface PriceImpactIF {
    ticker: string;
    version: number;
    chainId: string;
    selectedMaxMarketCapInWei: string;
    bidQtyInNativeTokenWei: string;
    priceImpactPercentage: number;
}

export interface TickerValidityIF {
    isValid: boolean;
    invalidReason?: string;
}

export interface AuctionTxResponseIF {
    txType: 'create' | 'bid' | 'claim' | 'return' | 'claimAll';
    isSuccess: boolean;
    failureReason?: string;
}

export interface AuctionListResponseIF {
    auctionList: AuctionDataIF[];
}

// interface for auction data used to generate auction list views
// for both global and user specific lists
export interface AuctionDataIF {
    ticker: string;
    chainId: string;
    createdAt: number;
    auctionLength: number;
    filledClearingPriceInNativeTokenWei: string;
    // @Ben:    I'm making this optional for ease rn but I think it
    // @Ben:    ... should prolly be a non-optional property
    createdBy?: `0x${string}`;

    // user specific data received for account queries
    userAddress?: string;
    userBidClearingPriceInNativeTokenWei?: string | undefined;
    qtyBidByUserInNativeTokenWei?: string | undefined;
    qtyUserBidFilledInNativeTokenWei?: string | undefined;
    qtyUnclaimedByUserInAuctionedTokenWei?: string | undefined;
    qtyClaimedByUserInAuctionedTokenWei?: string | undefined;
    qtyUnreturnedToUserInNativeTokenWei?: string | undefined;
    qtyReturnedToUserInNativeTokenWei?: string | undefined;
    nativeTokenCommitted?: string | undefined;
    nativeTokenReward?: string | undefined;
}

// interface for auction status data used to generate auction details view
export interface AuctionStatusResponseIF {
    data: {
        ticker: string;
        version: number;
        chainId: string;
        createdAt: number;
        auctionLength: number;
        filledClearingPriceInNativeTokenWei: string;

        // open bid data
        openBidClearingPriceInNativeTokenWei?: string | undefined;
        openBidQtyFilledInNativeTokenWei?: string | undefined;

        // closed auction data
        tokenAddress?: string | undefined;
    };
}

const getGlobalAuctionsList = async (
    chainId: string,
    // GCGO_URL: string,
    _cacheTimeTag: number | string,
): Promise<AuctionDataIF[]> => {
    // const auctionsListEndpoint =  GCGO_URL + '/auctions?';
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

    //         const payload = json.data as AuctionListResponseIF;
    //         return payload.auctionList;
    //     })
    //     .catch(() => {
    //         return undefined;
    //     });
};

const getUserAuctionsList = async (
    chainId: string,
    userAddress: string,
    // GCGO_URL: string,
    _cacheTimeTag: number | string,
): Promise<AuctionDataIF[]> => {
    // const auctionsListEndpoint =GCGO_URL + '/auctions?';
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

    //         const payload = json.data as AuctionListResponseIF;
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
export const validTickerPattern = /^[A-Za-z0-9\p{Extended_Pictographic}]+$/u;
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
    env: CrocEnv,
    ticker: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _lastBlockNumber?: number,
): Promise<TickerValidityIF> => {
    const isExcluded = excludedTickers.includes(ticker.toLowerCase());
    const lengthIsValid = ticker.length > 0 && ticker.length <= 10;
    const isTickerPatternValid = checkTickerPattern(ticker);

    let isTickerValid = true;

    if (isExcluded || !isTickerPatternValid || !lengthIsValid)
        isTickerValid = false;

    if (!isTickerValid)
        console.log('checking ticker validity', {
            ticker,
            isTickerValid,
        });
    const invalidReason = isExcluded ? 'Excluded ticker' : 'Invalid ticker';
    if (!isTickerValid) return { isValid: false, invalidReason: invalidReason };

    if (!env) return { isValid: false, invalidReason: 'Invalid CrocEnv' };

    try {
        //     const auctionPlan = env.auction(ticker, CURRENT_AUCTION_VERSION);

        //    const isTickerAvailable = await !auctionPlan.isInitialized();

        const mockIsTickerAvailable = !ticker.toLowerCase().includes('test');

        console.log('checking ticker validity', {
            ticker,
            mockIsTickerAvailable,
        });

        return {
            isValid: mockIsTickerAvailable,
            invalidReason: 'Unavailable ticker',
        };
    } catch (error) {
        return { isValid: false, invalidReason: 'Unknown Error' };
    }
};

export const createAuction = async (
    env: CrocEnv | undefined,
    ticker: string,
): Promise<AuctionTxResponseIF> => {
    if (!env)
        return {
            txType: 'create',
            isSuccess: false,
            failureReason: 'Invalid CrocEnv',
        };
    try {
        console.log(`clicked Create Auction for ${ticker}`);
        const isTickerAvailableAndValid = (
            await checkTickerValidity(env, ticker)
        ).isValid;

        if (isTickerAvailableAndValid) {
            // const auctionPlan = env.auction(ticker, CURRENT_AUCTION_VERSION);
            // const isAuctionCreated: TickerCreationResponseIF = await auctionPlan.create();

            // 2 second timeout to simulate transaction
            await new Promise((resolve) => setTimeout(resolve, 2000));

            const mockIsAuctionCreated: AuctionTxResponseIF = {
                txType: 'create',
                isSuccess: !ticker.toLowerCase().includes('fail'),
            };

            return mockIsAuctionCreated;
        } else {
            return {
                txType: 'create',
                isSuccess: false,
                failureReason: 'Invalid Ticker',
            };
        }
    } catch (error) {
        return {
            txType: 'create',
            isSuccess: false,
            failureReason: 'Unknown Error',
        };
    }
};

export const calcBidImpact = async (
    env: CrocEnv,
    ticker: string,
    selectedMaxMarketCapInWei: string,
    bidQtyInNativeTokenWei: string,
): Promise<PriceImpactIF | undefined> => {
    if (!env) return undefined;
    try {
        // const bidPlan = env
        //     .auction(ticker, CURRENT_AUCTION_VERSION)
        //     .bid(openBidClearingPriceInNativeTokenWei, bidQtyInNativeTokenWei);

        // const priceImpact = await bidPlan.impact;
        const mockPriceImpact = {
            ticker,
            version: CURRENT_AUCTION_VERSION,
            chainId: '1',
            selectedMaxMarketCapInWei,
            bidQtyInNativeTokenWei,
            priceImpactPercentage: Math.random() * 0.1,
        };

        console.log('price impact: ', { mockPriceImpact });

        return mockPriceImpact;
    } catch (error) {
        return undefined;
    }
};

export const createBid = async (
    env: CrocEnv | undefined,
    ticker: string,
    bidQtyInNativeTokenWei: string,
    selectedMaxMarketCapInWei: string,
): Promise<AuctionTxResponseIF> => {
    if (!env)
        return {
            txType: 'bid',
            isSuccess: false,
            failureReason: 'Invalid CrocEnv',
        };
    try {
        console.log(
            `clicked Bid for ${ticker} in the amount of ${bidQtyInNativeTokenWei} at max market cap ${selectedMaxMarketCapInWei}`,
        );

        // const auctionPlan = env.auction(ticker, CURRENT_AUCTION_VERSION);
        // const bidParams = {
        //     bidQtyInWei: bidQtyInNativeTokenWei,
        //     maxMarketCapInWei: selectedMaxMarketCapInWei,
        // };
        // const bidResponse: AuctionTxResponseIF =
        //     await auctionPlan.bid(bidParams);

        // 2 second timeout to simulate transaction
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const mockBidResponse: AuctionTxResponseIF = {
            txType: 'bid',
            isSuccess: !ticker.toLowerCase().includes('fail'),
            failureReason: ticker.toLowerCase().includes('fail')
                ? 'Bid Failed'
                : undefined,
        };

        return mockBidResponse;
    } catch (error) {
        return {
            txType: 'bid',
            isSuccess: false,
            failureReason: 'Unknown Error',
        };
    }
};

export const claimAllocation = async (
    env: CrocEnv | undefined,
    ticker: string,
    // qtyInWei: string,
): Promise<AuctionTxResponseIF> => {
    if (!env)
        return {
            txType: 'claim',
            isSuccess: false,
            failureReason: 'Invalid CrocEnv',
        };
    try {
        console.log(`clicked Claim for ${ticker}`);

        // const auctionPlan = env.auction(ticker, CURRENT_AUCTION_VERSION);

        // // if qtyInWei is needed
        // const claimParams = {
        //     claimQtyInWei: qtyInWei,
        // };

        // // if qtyInWei is not needed
        // const claimResponse: AuctionTxResponseIF =
        //     await auctionPlan.claim();

        // 2 second timeout to simulate transaction
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const mockClaimResponse: AuctionTxResponseIF = {
            txType: 'claim',
            isSuccess: !ticker.toLowerCase().includes('fail'),
            failureReason: ticker.toLowerCase().includes('fail')
                ? 'Claim Failed'
                : undefined,
        };

        return mockClaimResponse;
    } catch (error) {
        return {
            txType: 'claim',
            isSuccess: false,
            failureReason: 'Unknown Error',
        };
    }
};

export const returnBid = async (
    env: CrocEnv | undefined,
    ticker: string,
    // qtyInWei: string,
): Promise<AuctionTxResponseIF> => {
    if (!env)
        return {
            txType: 'return',
            isSuccess: false,
            failureReason: 'Invalid CrocEnv',
        };
    try {
        console.log(`clicked Return for ${ticker} `);

        // const auctionPlan = env.auction(ticker, CURRENT_AUCTION_VERSION);

        // // if qtyInWei is needed
        // const returnParams = {
        //     returnQtyInWei: qtyInWei,
        // };
        // const returnResponse: AuctionTxResponseIF =
        //     await auctionPlan.return(returnParams);

        // // if qtyInWei is not needed
        // const returnResponse: AuctionTxResponseIF =
        //     await auctionPlan.return();

        // 2 second timeout to simulate transaction
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const mockReturnResponse: AuctionTxResponseIF = {
            txType: 'return',
            isSuccess: !ticker.toLowerCase().includes('fail'),
            failureReason: ticker.toLowerCase().includes('fail')
                ? 'Return Failed'
                : undefined,
        };

        return mockReturnResponse;
    } catch (error) {
        return {
            txType: 'return',
            isSuccess: false,
            failureReason: 'Unknown Error',
        };
    }
};

export const claimAndReturnAll = async (
    env: CrocEnv | undefined,
): Promise<AuctionTxResponseIF> => {
    if (!env)
        return {
            txType: 'claimAll',
            isSuccess: false,
            failureReason: 'Invalid CrocEnv',
        };
    try {
        console.log('clicked Claim All');

        // const auctionAcccountPlan = env.auctionAcccount();

        // const claimAllResponse: AuctionTxResponseIF =
        //     await auctionAcccountPlan.claimAll();

        // 2 second timeout to simulate transaction
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const senderAddr = (await env.context).senderAddr;

        const mockClaimResponse: AuctionTxResponseIF = {
            txType: 'claimAll',
            isSuccess: !senderAddr?.toLowerCase().includes('0xe09d'),
            failureReason: senderAddr?.toLowerCase().includes('0xe09d')
                ? 'Claim All Transaction Failed'
                : undefined,
        };

        return mockClaimResponse;
    } catch (error) {
        return {
            txType: 'claimAll',
            isSuccess: false,
            failureReason: 'Unknown Error',
        };
    }
};

export const fetchFreshAuctionStatusData = async (
    ticker: string,
    version: number,
    chainId: string,
): Promise<AuctionStatusResponseIF> => {
    // const auctionsStatusEndpoint = GCGO_URL + '/auctionStatus?';
    return mockAuctionDetailsServerResponseGenerator(ticker, version, chainId);
    // return fetch(
    //     auctionsStatusEndpoint +
    //         new URLSearchParams({
    //             ticker: ticker,
    //             version: version.toString(),
    //             chainId: chainId,
    //         }),
    // )
    //     .then((response) => response?.json())
    //     .then((json) => {
    //         if (!json?.data) {
    //             return undefined;
    //         }

    //         const payload = json.data as AuctionListResponseIF;
    //         return payload;
    //     })
    //     .catch(() => {
    //         return undefined;
    //     });
};

export type GlobalAuctionListQueryFn = (
    chainId: string,
    // GCGO_URL: string,
    _cacheTimeTag: number | string,
) => Promise<AuctionDataIF[] | undefined>;

export type UserAuctionListQueryFn = (
    chainId: string,
    userAddress: string,
    // GCGO_URL: string,
    _cacheTimeTag: number | string,
) => Promise<AuctionDataIF[] | undefined>;

export type AuctionStatusQueryFn = (
    ticker: string,
    version: number,
    chainId: string,
    // GCGO_URL: string,
    _cacheTimeTag: number | string,
) => Promise<AuctionStatusResponseIF | undefined>;

export function memoizeGetGlobalAuctionsList(): GlobalAuctionListQueryFn {
    return memoizeCacheQueryFn(
        getGlobalAuctionsList,
    ) as GlobalAuctionListQueryFn;
}

export function memoizeGetAuctionStatus(): AuctionStatusQueryFn {
    return memoizeCacheQueryFn(
        fetchFreshAuctionStatusData,
    ) as AuctionStatusQueryFn;
}

export function memoizeGetUserAuctionsList(): UserAuctionListQueryFn {
    return memoizeCacheQueryFn(getUserAuctionsList) as UserAuctionListQueryFn;
}
