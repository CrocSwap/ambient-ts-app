import {
    AccountDataIF,
    AuctionDataIF,
    AuctionStatusDataServerIF,
} from '../../contexts/AuctionsContext';

export const mockAuctionData: AuctionDataIF[] = [
    {
        ticker: 'DOGE',
        createdAt: 1718125986,
        auctionLength: 86400,
        highestFilledBidInEth: 0.25,
    },
    {
        ticker: 'DOGE1',
        createdAt: 1719452820,
        auctionLength: 86400,
        highestFilledBidInEth: 0.25,
    },
    {
        ticker: 'DOGE2',
        createdAt: 1719452820,
        auctionLength: 86400,
        highestFilledBidInEth: 0.25,
    },
    {
        ticker: 'DOGE3',
        createdAt: 1719452820,
        auctionLength: 86400,
        highestFilledBidInEth: 0.25,
    },
    {
        ticker: 'DOGE4',
        createdAt: 1719452820,
        auctionLength: 86400,
        highestFilledBidInEth: 0.25,
    },
    {
        ticker: 'DOGE5',
        createdAt: 1719452820,
        auctionLength: 86400,
        highestFilledBidInEth: 0.25,
    },
    {
        ticker: 'DOGE6',
        createdAt: 1719452820,
        auctionLength: 86400,
        highestFilledBidInEth: 0.25,
    },
    {
        ticker: 'PEPE',
        createdAt: 1717125986,
        auctionLength: 604800,
        highestFilledBidInEth: 0.3125,
    },
    {
        ticker: 'JUNIOR',
        createdAt: 1718025986,
        auctionLength: 604800,
        highestFilledBidInEth: 0.7629395,
    },
    {
        ticker: 'EMILY',
        createdAt: 1716125986,
        auctionLength: 604800,
        highestFilledBidInEth: 11.10223,
    },
    {
        ticker: 'DEGEN',
        createdAt: 1718225986,
        auctionLength: 604800,
        highestFilledBidInEth: 21.6840425,
    },

    {
        ticker: 'PEPE1',
        createdAt: 1719548920,
        auctionLength: 604800,
        highestFilledBidInEth: 0.3125,
    },
    {
        ticker: 'JUNIOR1',
        createdAt: 1719148920,
        auctionLength: 604800,
        highestFilledBidInEth: 1.490116,
    },
    {
        ticker: 'EMILY1',
        createdAt: 1719248920,
        auctionLength: 604800,
        highestFilledBidInEth: 11.10223,
    },
    {
        ticker: 'DEGEN1',
        createdAt: 1718225986,
        auctionLength: 604800,
        highestFilledBidInEth: 21.6840425,
    },

    {
        ticker: 'PEPE2',
        createdAt: 1719548920,
        auctionLength: 604800,
        highestFilledBidInEth: 0.3125,
    },
    {
        ticker: 'JUNIOR2',
        createdAt: 1719148920,
        auctionLength: 604800,
        highestFilledBidInEth: 1.192093,
    },
    {
        ticker: 'EMILY2',
        createdAt: 1719248920,
        auctionLength: 604800,
        highestFilledBidInEth: 11.10223,
    },
    {
        ticker: 'DEGEN2',
        createdAt: 1718215986,
        auctionLength: 604800,
        highestFilledBidInEth: 21.6840425,
    },

    {
        ticker: 'PEPE3',
        createdAt: 1719548920,
        auctionLength: 604800,
        highestFilledBidInEth: 0.3125,
    },
    {
        ticker: 'JUNIOR3',
        createdAt: 1719148920,
        auctionLength: 604800,
        highestFilledBidInEth: 1.192093,
    },
    {
        ticker: 'EMILY3',
        createdAt: 1719248920,
        auctionLength: 604800,
        highestFilledBidInEth: 11.10223,
    },
    {
        ticker: 'DEGEN3',
        createdAt: 1719448920,
        auctionLength: 604800,
        highestFilledBidInEth: 21.6840425,
    },

    {
        ticker: 'PEPE4',
        createdAt: 1719548920,
        auctionLength: 604800,
        highestFilledBidInEth: 0.3125,
    },
    {
        ticker: 'JUNIOR4',
        createdAt: 1719148920,
        auctionLength: 604800,
        highestFilledBidInEth: 1.192093,
    },
    {
        ticker: 'EMILY4',
        createdAt: 1719248920,
        auctionLength: 604800,
        highestFilledBidInEth: 11.10223,
    },
    {
        ticker: 'DEGEN4',
        createdAt: 1719448920,
        auctionLength: 604800,
        highestFilledBidInEth: 21.6840425,
    },

    {
        ticker: 'PEPE5',
        createdAt: 1719548920,
        auctionLength: 604800,
        highestFilledBidInEth: 0.3125,
    },
    {
        ticker: 'JUNIOR5',
        createdAt: 1719148920,
        auctionLength: 604800,
        highestFilledBidInEth: 1.192093,
    },
    {
        ticker: 'EMILY5',
        createdAt: 1719248920,
        auctionLength: 604800,
        highestFilledBidInEth: 11.10223,
    },
    {
        ticker: 'DEGEN5',
        createdAt: 1719448920,
        auctionLength: 604800,
        highestFilledBidInEth: 21.6840425,
    },

    {
        ticker: 'PEPE6',
        createdAt: 1719548920,
        auctionLength: 604800,
        highestFilledBidInEth: 0.3125,
    },
    {
        ticker: 'JUNIOR6',
        createdAt: 1719148920,
        auctionLength: 604800,
        highestFilledBidInEth: 1.192093,
    },
    {
        ticker: 'EMILY6',
        createdAt: 1719248920,
        auctionLength: 604800,
        highestFilledBidInEth: 11.10223,
    },
    {
        ticker: 'DEGEN6',
        createdAt: 1719448920,
        auctionLength: 604800,
        highestFilledBidInEth: 21.6840425,
    },
];

export const mockAccountData: AuctionDataIF[] = [
    {
        ticker: 'DOGE',
        createdAt: 1718125986,
        auctionLength: 86400,
        highestFilledBidInEth: 0.25,
        highestBidByUserInEth: 0.25,
        userBidSizeUserInEth: 0.12,
        tokenAllocationUnclaimedByUser: 50000,
    },
    {
        ticker: 'PEPE',
        createdAt: 1717125986,
        auctionLength: 604800,
        highestFilledBidInEth: 0.3125,
        highestBidByUserInEth: 0.25,
        userBidSizeUserInEth: 0.1,
        ethUnclaimedByUser: 0.1,
    },
    {
        ticker: 'JUNIOR',
        createdAt: 1718025986,
        auctionLength: 604800,
        highestFilledBidInEth: 0.7629395,
        highestBidByUserInEth: 0.7629395,
        userBidSizeUserInEth: 0.15,
        tokenAllocationUnclaimedByUser: 168200,
    },
    {
        ticker: 'EMILY',
        createdAt: 1716125986,
        auctionLength: 604800,
        highestFilledBidInEth: 11.10223,
        highestBidByUserInEth: 0.7629395,
        userBidSizeUserInEth: 0.05,
        ethUnclaimedByUser: 0.05,
    },
    {
        ticker: 'DEGEN',
        createdAt: 1718225986,
        auctionLength: 604800,
        highestFilledBidInEth: 21.6840425,
        highestBidByUserInEth: 21.6840425,
        userBidSizeUserInEth: 0.5,
        tokenAllocationUnclaimedByUser: 100000,
    },
    {
        ticker: 'DOGE1',
        createdAt: 1719948920,
        auctionLength: 86400,
        highestFilledBidInEth: 0.25,
        highestBidByUserInEth: 3.63798,
        userBidSizeUserInEth: 0.5,
    },
    {
        ticker: 'PEPE1',
        createdAt: 1719548920,
        auctionLength: 604800,
        highestFilledBidInEth: 0.3125,
        highestBidByUserInEth: 0.25,
        userBidSizeUserInEth: 0.1,
    },

    {
        ticker: 'JUNIOR1',
        createdAt: 1719148920,
        auctionLength: 604800,
        highestFilledBidInEth: 1.490116,
        highestBidByUserInEth: 1.490116,
        userBidSizeUserInEth: 0.05,
    },

    {
        ticker: 'EMILY1',
        createdAt: 1719248920,
        auctionLength: 604800,
        highestFilledBidInEth: 11.10223,
        highestBidByUserInEth: 0.7629395,
        userBidSizeUserInEth: 0.2,
    },

    {
        ticker: 'DEGEN1',
        createdAt: 1718225986,
        auctionLength: 604800,
        highestFilledBidInEth: 21.6840425,
        highestBidByUserInEth: 1.490116,
        userBidSizeUserInEth: 0.3,
    },
];

export const mockAuctionDetailsServerResponseGenerator = (
    ticker: string,
): AuctionStatusDataServerIF => {
    switch (ticker.slice(0, 4)) {
        case 'DOGE':
            return {
                ticker: ticker,
                createdAt: 1719438920,
                auctionLength: 86400,
                highestFilledBidInEth: 0.25,
                openBidInEth: 0.3125,
                openBidAmountFilledInEth: 0.056,
            };
        case 'PEPE':
            return {
                ticker: ticker,
                createdAt: 1719548920,
                auctionLength: 604800,
                highestFilledBidInEth: 0.3125,
                openBidInEth: 0.390625,
                openBidAmountFilledInEth: 0.166,
            };
        case 'JUNI':
            return {
                ticker: ticker,
                createdAt: 1719148920,
                auctionLength: 604800,
                highestFilledBidInEth: 1.192093,
                openBidInEth: 1.490116,
                openBidAmountFilledInEth: 1.266,
            };
        case 'EMIL':
            return {
                ticker: ticker,
                createdAt: 1719248920,
                auctionLength: 604800,
                highestFilledBidInEth: 11.10223,
                openBidInEth: 13.8777875,
                openBidAmountFilledInEth: 5.5,
            };
        case 'DEGE':
            return {
                ticker: ticker,
                createdAt: 1718225986,
                auctionLength: 604800,
                highestFilledBidInEth: 21.6840425,
                openBidInEth: 27.10505,
                openBidAmountFilledInEth: 15,
            };
        default:
            return {
                ticker: ticker,
                createdAt: 1718235814,
                auctionLength: 86400,
                highestFilledBidInEth: 0.6103515,
                openBidInEth: 0.7629395,
                openBidAmountFilledInEth: 0.566,
            };
    }
};

export const bidSizeMultipliers = [
    1, 1.25, 1.5625, 1.953125, 2.441406, 3.051758, 3.814697, 4.768372, 5.960464,
    7.450581, 9.313226, 11.64153, 14.55192, 18.18989, 22.73737, 28.42171,
    35.52714, 44.40892, 55.51115, 69.38894, 86.73617, 108.4202, 135.5253,
    169.4066, 211.7582, 264.6978,
];

export const minBidSizeInEth = 0.25;
export const marketCapMultiplier = 5;

export const getFreshAuctionDetailsForAccount = async (
    ticker: string,
    accountData: AccountDataIF,
) => {
    return accountData.auctions.find(
        (data) => data.ticker.toLowerCase() === ticker.toLowerCase(),
    );
};

export const getRetrievedAuctionDetailsForAccount = (
    ticker: string,
    accountData: AccountDataIF,
) => {
    return accountData.auctions.find(
        (data) => data.ticker.toLowerCase() === ticker.toLowerCase(),
    );
};
