import {
    AuctionListResponseIF,
    AuctionStatusResponseIF,
} from '../../ambient-utils/dataLayer';
import { AccountDataIF } from '../../contexts/AuctionsContext';

const nowInSeconds = Math.floor(Date.now() / 1000);

const nowMinus60sec = nowInSeconds - 60;

const nowMinus10hr = nowInSeconds - 36000;

const nowMinus1dayLess1min = nowInSeconds - 86340;

const nowMinus1dayPlus1min = nowInSeconds - 86460;

const nowMinus1dayLess3min = nowInSeconds - 85800;

const nowMinus2andAHalfdays = nowInSeconds - 216000;

const nowMinus1week = nowInSeconds - 604800;

const nowMinus1weekLess10hr = nowInSeconds - 568800;

const nowMinus4days = nowInSeconds - 345600;

const nowMinus5days = nowInSeconds - 432000;
const nowMinus4andAHalfdays = nowInSeconds - 389000;

// const nowMinus4days = nowInSeconds - 345600;

const nowMinus2days = nowInSeconds - 172800;

export const mockGlobalAuctionData: AuctionListResponseIF = {
    auctionList: [
        {
            ticker: 'HELLO😊',
            chainId: '0x2105',
            createdAt: 1718125986,
            createdBy: '0x8a8b00B332c5eD50466e31FCCdd4dc2170b4F78f',
            auctionLength: 86400,
            filledClearingPriceInNativeTokenWei: '250000000000000000',
        },
        {
            ticker: 'HELLO😊😊1',
            chainId: '0x2105',
            createdAt: nowMinus1dayLess1min,
            createdBy: '0x8a8b00B332c5eD50466e31FCCdd4dc2170b4F78f',
            auctionLength: 86400,
            filledClearingPriceInNativeTokenWei: '250000000000000000',
        },
        {
            ticker: 'HELLO😊2',
            chainId: '0x2105',
            createdAt: nowMinus60sec,
            createdBy: '0x8a8b00B332c5eD50466e31FCCdd4dc2170b4F78f',
            auctionLength: 86400,
            filledClearingPriceInNativeTokenWei: '250000000000000000',
        },
        {
            ticker: 'HELLO😊3',
            chainId: '0x2105',
            createdAt: nowMinus1dayPlus1min,
            auctionLength: 86400,
            filledClearingPriceInNativeTokenWei: '250000000000000000',
        },
        {
            ticker: 'HELLO😊4',
            chainId: '0x2105',
            createdAt: nowMinus2andAHalfdays,
            auctionLength: 86400,
            filledClearingPriceInNativeTokenWei: '250000000000000000',
        },
        {
            ticker: 'HELLO😊5',
            chainId: '0x2105',
            createdAt: nowMinus1dayLess3min,
            auctionLength: 86400,
            filledClearingPriceInNativeTokenWei: '250000000000000000',
        },
        {
            ticker: 'HELLO😊6',
            chainId: '0x2105',
            createdAt: nowMinus60sec,
            auctionLength: 86400,
            filledClearingPriceInNativeTokenWei: '250000000000000000',
        },
        {
            ticker: 'PEPE',
            chainId: '0x2105',
            createdAt: 1717125986,
            auctionLength: 604800,
            filledClearingPriceInNativeTokenWei: '312500000000000000',
        },
        {
            ticker: 'JUNIOR',
            chainId: '0x2105',
            createdAt: 1718025986,
            auctionLength: 604800,
            filledClearingPriceInNativeTokenWei: '762939500000000000',
        },
        {
            ticker: 'EMILY',
            chainId: '0x2105',
            createdAt: 1716125986,
            auctionLength: 604800,
            filledClearingPriceInNativeTokenWei: '11102230000000000000',
        },

        {
            ticker: 'JUNIOR1234',
            chainId: '0x2105',
            createdAt: nowMinus4andAHalfdays,
            auctionLength: 604800,
            filledClearingPriceInNativeTokenWei: '1192093000000000000',
        },
        {
            ticker: 'JUNIOR2',
            chainId: '0x2105',
            createdAt: nowMinus1week,
            auctionLength: 604800,
            filledClearingPriceInNativeTokenWei: '1192093000000000000',
        },
        {
            ticker: 'JUNIOR3',
            chainId: '0x2105',
            createdAt: nowMinus1weekLess10hr,
            auctionLength: 604800,
            filledClearingPriceInNativeTokenWei: '1192093000000000000',
        },
        {
            ticker: 'JUNIOR4',
            chainId: '0x2105',
            createdAt: nowMinus5days,
            auctionLength: 604800,
            filledClearingPriceInNativeTokenWei: '1192093000000000000',
        },
        {
            ticker: 'JUNIOR5',
            chainId: '0x2105',
            createdAt: nowMinus4days,
            auctionLength: 604800,
            filledClearingPriceInNativeTokenWei: '1192093000000000000',
        },
        {
            ticker: 'JUNIOR6',
            chainId: '0x2105',
            createdAt: nowMinus5days,
            auctionLength: 604800,
            filledClearingPriceInNativeTokenWei: '1192093000000000000',
        },
        {
            ticker: 'EMILY1',
            chainId: '0x2105',
            createdAt: nowMinus10hr,
            auctionLength: 604800,
            filledClearingPriceInNativeTokenWei: '11102230000000000000',
        },
        {
            ticker: 'EMILY2',
            chainId: '0x2105',
            createdAt: nowMinus10hr,
            auctionLength: 604800,
            filledClearingPriceInNativeTokenWei: '11102230000000000000',
        },
        {
            ticker: 'EMILY3',
            chainId: '0x2105',
            createdAt: nowMinus10hr,
            auctionLength: 604800,
            filledClearingPriceInNativeTokenWei: '11102230000000000000',
        },
        {
            ticker: 'EMILY4',
            chainId: '0x2105',
            createdAt: nowMinus10hr,
            auctionLength: 604800,
            filledClearingPriceInNativeTokenWei: '11102230000000000000',
        },
        {
            ticker: 'EMILY5',
            chainId: '0x2105',
            createdAt: nowInSeconds,
            auctionLength: 604800,
            filledClearingPriceInNativeTokenWei: '11102230000000000000',
        },
        {
            ticker: 'EMILY6',
            chainId: '0x2105',
            createdAt: nowInSeconds,
            auctionLength: 604800,
            filledClearingPriceInNativeTokenWei: '11102230000000000000',
        },
        {
            ticker: 'PEPE1',
            chainId: '0x2105',
            createdAt: nowMinus4days,
            auctionLength: 604800,
            filledClearingPriceInNativeTokenWei: '212500000000000000',
        },
        {
            ticker: 'PEPE2',
            chainId: '0x2105',
            createdAt: nowMinus4days,
            auctionLength: 604800,
            filledClearingPriceInNativeTokenWei: '312500000000000000',
        },

        {
            ticker: 'PEPE3',
            chainId: '0x2105',
            createdAt: nowMinus4days,
            auctionLength: 604800,
            filledClearingPriceInNativeTokenWei: '312500000000000000',
        },

        {
            ticker: 'PEPE4',
            chainId: '0x2105',
            createdAt: nowMinus4days,
            auctionLength: 604800,
            filledClearingPriceInNativeTokenWei: '312500000000000000',
        },

        {
            ticker: 'PEPE5',
            chainId: '0x2105',
            createdAt: nowMinus2days,
            auctionLength: 604800,
            filledClearingPriceInNativeTokenWei: '312500000000000000',
        },

        {
            ticker: 'PEPE6',
            chainId: '0x2105',
            createdAt: nowMinus2days,
            auctionLength: 604800,
            filledClearingPriceInNativeTokenWei: '312500000000000000',
        },
    ],
};

export const mockAccountData1: AuctionListResponseIF = {
    auctionList: [
        {
            ticker: 'HELLO😊',
            chainId: '0x2105',
            createdBy: '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
            createdAt: 1718125986,
            auctionLength: 86400,
            filledClearingPriceInNativeTokenWei: '250000000000000000',
            userAddress: '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
            userBidClearingPriceInNativeTokenWei: '250000000000000000',
            qtyBidByUserInNativeTokenWei: '120000000000000000',
            qtyUserBidFilledInNativeTokenWei: '40000000000000000',
            qtyUnclaimedByUserInAuctionedTokenWei: '50000000000000000000000',
        },
        {
            ticker: 'PEPE',
            chainId: '0x2105',
            createdAt: 1717125986,
            createdBy: '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
            auctionLength: 604800,
            filledClearingPriceInNativeTokenWei: '312500000000000000',
            userAddress: '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
            userBidClearingPriceInNativeTokenWei: '250000000000000000',
            qtyBidByUserInNativeTokenWei: '100000000000000000',
            qtyUserBidFilledInNativeTokenWei: '100000000000000000',
            qtyUnreturnedToUserInNativeTokenWei: '100000000000000000',
        },
        {
            ticker: 'JUNIOR',
            chainId: '0x2105',
            createdAt: 1718025986,
            auctionLength: 604800,
            filledClearingPriceInNativeTokenWei: '762939500000000000',
            userAddress: '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
            userBidClearingPriceInNativeTokenWei: '762939500000000000',
            qtyBidByUserInNativeTokenWei: '150000000000000000',
            qtyUserBidFilledInNativeTokenWei: '150000000000000000',
            qtyUnclaimedByUserInAuctionedTokenWei: '168200000000000000000000',
        },
        {
            ticker: 'EMILY',
            chainId: '0x2105',
            createdAt: 1716125986,
            auctionLength: 604800,
            filledClearingPriceInNativeTokenWei: '11102230000000000000',
            userAddress: '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
            userBidClearingPriceInNativeTokenWei: '762939500000000000',
            qtyBidByUserInNativeTokenWei: '50000000000000000',
            qtyUserBidFilledInNativeTokenWei: '50000000000000000',
            qtyUnreturnedToUserInNativeTokenWei: '50000000000000000',
        },
        {
            ticker: 'HELLO😊1',
            chainId: '0x2105',
            createdAt: nowMinus60sec,
            createdBy: '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
            auctionLength: 86400,
            filledClearingPriceInNativeTokenWei: '250000000000000000',
            userAddress: '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
            userBidClearingPriceInNativeTokenWei: '3637980000000000000',
            qtyBidByUserInNativeTokenWei: '500000000000000000',
            qtyUserBidFilledInNativeTokenWei: '500000000000000000',
            nativeTokenCommitted: '17200000000000003',
            nativeTokenReward: '22000000000000004',
        },
        {
            ticker: 'PEPE1',
            chainId: '0x2105',
            createdAt: nowMinus4days,
            auctionLength: 604800,
            filledClearingPriceInNativeTokenWei: '312500000000000000',
            userAddress: '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
            userBidClearingPriceInNativeTokenWei: '250000000000000000',
            qtyBidByUserInNativeTokenWei: '100000000000000000',
            qtyUserBidFilledInNativeTokenWei: '50000000000000000',
        },

        {
            ticker: 'JUNIOR1234',
            chainId: '0x2105',
            createdAt: nowMinus5days,
            auctionLength: 604800,
            filledClearingPriceInNativeTokenWei: '1192093000000000000',
            userAddress: '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
            userBidClearingPriceInNativeTokenWei: '1490116000000000000',
            qtyBidByUserInNativeTokenWei: '50000000000000000',
            qtyUserBidFilledInNativeTokenWei: '50000000000000000',
        },

        {
            ticker: 'EMILY1',
            chainId: '0x2105',
            createdAt: nowMinus10hr,
            auctionLength: 604800,
            filledClearingPriceInNativeTokenWei: '11102230000000000000',
            userAddress: '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
            userBidClearingPriceInNativeTokenWei: '762939500000000000',
            qtyBidByUserInNativeTokenWei: '200000000000000000',
            qtyUserBidFilledInNativeTokenWei: '200000000000000000',
        },
    ],
};

export const mockAccountData2: AuctionListResponseIF = {
    auctionList: [
        {
            ticker: 'PEPE',
            chainId: '0x2105',
            createdAt: 1717125986,
            auctionLength: 604800,
            filledClearingPriceInNativeTokenWei: '312500000000000000',
            userAddress: '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
            userBidClearingPriceInNativeTokenWei: '250000000000000000',
            qtyBidByUserInNativeTokenWei: '100000000000000000',
            qtyUserBidFilledInNativeTokenWei: '100000000000000000',
            qtyUnreturnedToUserInNativeTokenWei: '100000000000000000',
        },
        {
            ticker: 'JUNIOR',
            chainId: '0x2105',
            createdAt: 1718025986,
            auctionLength: 604800,
            filledClearingPriceInNativeTokenWei: '762939500000000000',
            userAddress: '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
            userBidClearingPriceInNativeTokenWei: '762939500000000000',
            qtyBidByUserInNativeTokenWei: '150000000000000000',
            qtyUserBidFilledInNativeTokenWei: '150000000000000000',
            qtyUnclaimedByUserInAuctionedTokenWei: '168200000000000000000000',
        },
        {
            ticker: 'EMILY',
            chainId: '0x2105',
            createdAt: 1716125986,
            auctionLength: 604800,
            filledClearingPriceInNativeTokenWei: '11102230000000000000',
            userAddress: '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
            userBidClearingPriceInNativeTokenWei: '762939500000000000',
            qtyBidByUserInNativeTokenWei: '50000000000000000',
            qtyUserBidFilledInNativeTokenWei: '50000000000000000',
            qtyUnreturnedToUserInNativeTokenWei: '50000000000000000',
        },

        {
            ticker: 'HELLO😊1',
            chainId: '0x2105',
            createdAt: nowMinus60sec,
            createdBy: '0x8a8b00B332c5eD50466e31FCCdd4dc2170b4F78f',
            auctionLength: 86400,
            filledClearingPriceInNativeTokenWei: '250000000000000000',
            userAddress: '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
            userBidClearingPriceInNativeTokenWei: '3637980000000000000',
            qtyBidByUserInNativeTokenWei: '500000000000000000',
            qtyUserBidFilledInNativeTokenWei: '500000000000000000',
            nativeTokenCommitted: '17200000000000003',
            nativeTokenReward: '22000000000000004',
        },
        {
            ticker: 'PEPE1',
            chainId: '0x2105',
            createdAt: nowMinus4days,
            createdBy: '0x8a8b00B332c5eD50466e31FCCdd4dc2170b4F78f',
            auctionLength: 604800,
            filledClearingPriceInNativeTokenWei: '312500000000000000',
            userAddress: '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
            userBidClearingPriceInNativeTokenWei: '250000000000000000',
            qtyBidByUserInNativeTokenWei: '100000000000000000',
            qtyUserBidFilledInNativeTokenWei: '50000000000000000',
            nativeTokenCommitted: '17200000000000001',
            nativeTokenReward: '22000000000000002',
        },

        {
            ticker: 'JUNIOR1234',
            chainId: '0x2105',
            createdAt: nowMinus5days,
            auctionLength: 604800,
            filledClearingPriceInNativeTokenWei: '1192093000000000000',
            userAddress: '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
            userBidClearingPriceInNativeTokenWei: '1490116000000000000',
            qtyBidByUserInNativeTokenWei: '50000000000000000',
            qtyUserBidFilledInNativeTokenWei: '50000000000000000',
        },

        {
            ticker: 'EMILY1',
            chainId: '0x2105',
            createdAt: nowMinus10hr,
            auctionLength: 604800,
            filledClearingPriceInNativeTokenWei: '11102230000000000000',
            userAddress: '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
            userBidClearingPriceInNativeTokenWei: '762939500000000000',
            qtyBidByUserInNativeTokenWei: '200000000000000000',
            qtyUserBidFilledInNativeTokenWei: '200000000000000000',
        },
    ],
};

export const mockAuctionDetailsServerResponseGenerator = (
    ticker: string,
    version: number,
    chainId: string,
): AuctionStatusResponseIF => {
    false && console.log({ ticker, chainId });
    let output: AuctionStatusResponseIF;
    switch (ticker.slice(0, 4)) {
        case 'HELL':
            output = {
                data: {
                    ticker: ticker,
                    version: version,
                    chainId: '0x2105',
                    createdAt: 1719438920,
                    auctionLength: 86400,
                    filledClearingPriceInNativeTokenWei: '250000000000000000',
                    openBidClearingPriceInNativeTokenWei: '312500000000000000',
                    openBidQtyFilledInNativeTokenWei: '56000000000000000',
                    tokenAddress: '0x60bBA138A74C5e7326885De5090700626950d509',
                },
            };
            break;
        case 'PEPE':
            output = {
                data: {
                    ticker: ticker,
                    version: version,
                    chainId: '0x2105',
                    createdAt: nowMinus4days,
                    auctionLength: 604800,
                    filledClearingPriceInNativeTokenWei: '312500000000000000',
                    openBidClearingPriceInNativeTokenWei: '390625000000000000',
                    openBidQtyFilledInNativeTokenWei: '166000000000000000',
                },
            };
            break;
        case 'JUNI':
            output = {
                data: {
                    ticker: ticker,
                    version: version,
                    chainId: '0x2105',
                    createdAt: 1719148920,
                    auctionLength: 604800,
                    filledClearingPriceInNativeTokenWei: '1192093000000000000',
                    openBidClearingPriceInNativeTokenWei: '1490116119384765625',
                    openBidQtyFilledInNativeTokenWei: '1266000000000000000',
                    tokenAddress: '0xCA97CC9c1a1dfA54A252DaAFE9b5Cd1E16C81328',
                },
            };
            break;
        case 'EMIL':
            output = {
                data: {
                    ticker: ticker,
                    version: version,
                    chainId: '0x2105',
                    createdAt: 1719248920,
                    auctionLength: 604800,
                    filledClearingPriceInNativeTokenWei: '610351500000000000',
                    openBidClearingPriceInNativeTokenWei: '762939500000000000',
                    openBidQtyFilledInNativeTokenWei: '560000000000000060',
                    tokenAddress: '0xCA97CC9c1a1dfA54A252DaAFE9b5Cd1E16C81328',
                },
            };
            break;
        default:
            output = {
                data: {
                    ticker: ticker,
                    version: version,
                    chainId: '0x2105',
                    createdAt: 1718235814,
                    auctionLength: 86400,
                    filledClearingPriceInNativeTokenWei: '610351500000000000',
                    openBidClearingPriceInNativeTokenWei: '762939500000000000',
                    openBidQtyFilledInNativeTokenWei: '560000000000000060',
                    tokenAddress: '0xCA97CC9c1a1dfA54A252DaAFE9b5Cd1E16C81328',
                },
            };
    }
    return output;
};

export const NUM_WEI_IN_ETH_BIG_INT = 10n ** 18n;
// current min bid size is 0.25 ETH
export const MIN_BID_SIZE_IN_WEI_BIG_INT = NUM_WEI_IN_ETH_BIG_INT / 4n;
// current market cap multiplier is 5x
export const MARKET_CAP_MULTIPLIER_BIG_INT = 5n;

const length = 50;
// const base = 1.25;
// export const bidSizeMultipliers = Array.from({ length }, (_, i) => base ** i);
// export const bidSizeMultipliers = Array.from(
//     { length },
//     (_, i) => (5n / 4n) ** BigInt(i),
// );

export const maxClearingPricesInWei = Array.from(
    { length },
    (_, i) => (5n ** BigInt(i) * MIN_BID_SIZE_IN_WEI_BIG_INT) / 4n ** BigInt(i),
);

export const maxMarketCapWeiValues = maxClearingPricesInWei.map((item) => {
    return item * MARKET_CAP_MULTIPLIER_BIG_INT;
});

export const getFreshAuctionDetailsForAccount = async (
    ticker: string,
    accountData: AccountDataIF,
) => {
    return accountData.auctions
        ? accountData.auctions.find(
              (data) => data.ticker.toLowerCase() === ticker.toLowerCase(),
          )
        : undefined;
};

export const getRetrievedAuctionDetailsForAccount = (
    ticker: string,
    accountData: AccountDataIF,
) => {
    return accountData.auctions
        ? accountData.auctions.find(
              (data) => data.ticker.toLowerCase() === ticker.toLowerCase(),
          )
        : undefined;
};
