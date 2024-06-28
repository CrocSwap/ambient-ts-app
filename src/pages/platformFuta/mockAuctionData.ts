import {
    AccountDataIF,
    AuctionDataIF,
    AuctionStatusDataServerIF,
} from '../../contexts/AuctionsContext';

export const mockAuctionData: AuctionDataIF[] = [
    {
        ticker: 'DOGE',
        chainId: '0x2105',
        createdAt: 1718125986,
        auctionLength: 86400,
        clearingPriceInEth: 0.25,
    },
    {
        ticker: 'DOGE1',
        chainId: '0x2105',
        createdAt: 1719515820,
        auctionLength: 86400,
        clearingPriceInEth: 0.25,
    },
    {
        ticker: 'DOGE2',
        chainId: '0x2105',
        createdAt: 1719515820,
        auctionLength: 86400,
        clearingPriceInEth: 0.25,
    },
    {
        ticker: 'DOGE3',
        chainId: '0x2105',
        createdAt: 1719515820,
        auctionLength: 86400,
        clearingPriceInEth: 0.25,
    },
    {
        ticker: 'DOGE4',
        chainId: '0x2105',
        createdAt: 1719515820,
        auctionLength: 86400,
        clearingPriceInEth: 0.25,
    },
    {
        ticker: 'DOGE5',
        chainId: '0x2105',
        createdAt: 1719515820,
        auctionLength: 86400,
        clearingPriceInEth: 0.25,
    },
    {
        ticker: 'DOGE6',
        chainId: '0x2105',
        createdAt: 1719515820,
        auctionLength: 86400,
        clearingPriceInEth: 0.25,
    },
    {
        ticker: 'PEPE',
        chainId: '0x2105',
        createdAt: 1717125986,
        auctionLength: 604800,
        clearingPriceInEth: 0.3125,
    },
    {
        ticker: 'JUNIOR',
        chainId: '0x2105',
        createdAt: 1718025986,
        auctionLength: 604800,
        clearingPriceInEth: 0.7629395,
    },
    {
        ticker: 'EMILY',
        chainId: '0x2105',
        createdAt: 1716125986,
        auctionLength: 604800,
        clearingPriceInEth: 11.10223,
    },
    {
        ticker: 'DEGEN',
        chainId: '0x2105',
        createdAt: 1718225986,
        auctionLength: 604800,
        clearingPriceInEth: 21.6840425,
    },

    {
        ticker: 'PEPE1',
        chainId: '0x2105',
        createdAt: 1719548920,
        auctionLength: 604800,
        clearingPriceInEth: 0.3125,
    },
    {
        ticker: 'JUNIOR1',
        chainId: '0x2105',
        createdAt: 1719148920,
        auctionLength: 604800,
        clearingPriceInEth: 1.490116,
    },
    {
        ticker: 'EMILY1',
        chainId: '0x2105',
        createdAt: 1719248920,
        auctionLength: 604800,
        clearingPriceInEth: 11.10223,
    },
    {
        ticker: 'DEGEN1',
        chainId: '0x2105',
        createdAt: 1718225986,
        auctionLength: 604800,
        clearingPriceInEth: 21.6840425,
    },

    {
        ticker: 'PEPE2',
        chainId: '0x2105',
        createdAt: 1719548920,
        auctionLength: 604800,
        clearingPriceInEth: 0.3125,
    },
    {
        ticker: 'JUNIOR2',
        chainId: '0x2105',
        createdAt: 1719148920,
        auctionLength: 604800,
        clearingPriceInEth: 1.192093,
    },
    {
        ticker: 'EMILY2',
        chainId: '0x2105',
        createdAt: 1719248920,
        auctionLength: 604800,
        clearingPriceInEth: 11.10223,
    },
    {
        ticker: 'DEGEN2',
        chainId: '0x2105',
        createdAt: 1718215986,
        auctionLength: 604800,
        clearingPriceInEth: 21.6840425,
    },

    {
        ticker: 'PEPE3',
        chainId: '0x2105',
        createdAt: 1719548920,
        auctionLength: 604800,
        clearingPriceInEth: 0.3125,
    },
    {
        ticker: 'JUNIOR3',
        chainId: '0x2105',
        createdAt: 1719148920,
        auctionLength: 604800,
        clearingPriceInEth: 1.192093,
    },
    {
        ticker: 'EMILY3',
        chainId: '0x2105',
        createdAt: 1719248920,
        auctionLength: 604800,
        clearingPriceInEth: 11.10223,
    },
    {
        ticker: 'DEGEN3',
        chainId: '0x2105',
        createdAt: 1719448920,
        auctionLength: 604800,
        clearingPriceInEth: 21.6840425,
    },

    {
        ticker: 'PEPE4',
        chainId: '0x2105',
        createdAt: 1719548920,
        auctionLength: 604800,
        clearingPriceInEth: 0.3125,
    },
    {
        ticker: 'JUNIOR4',
        chainId: '0x2105',
        createdAt: 1719148920,
        auctionLength: 604800,
        clearingPriceInEth: 1.192093,
    },
    {
        ticker: 'EMILY4',
        chainId: '0x2105',
        createdAt: 1719248920,
        auctionLength: 604800,
        clearingPriceInEth: 11.10223,
    },
    {
        ticker: 'DEGEN4',
        chainId: '0x2105',
        createdAt: 1719448920,
        auctionLength: 604800,
        clearingPriceInEth: 21.6840425,
    },

    {
        ticker: 'PEPE5',
        chainId: '0x2105',
        createdAt: 1719548920,
        auctionLength: 604800,
        clearingPriceInEth: 0.3125,
    },
    {
        ticker: 'JUNIOR5',
        chainId: '0x2105',
        createdAt: 1719148920,
        auctionLength: 604800,
        clearingPriceInEth: 1.192093,
    },
    {
        ticker: 'EMILY5',
        chainId: '0x2105',
        createdAt: 1719248920,
        auctionLength: 604800,
        clearingPriceInEth: 11.10223,
    },
    {
        ticker: 'DEGEN5',
        chainId: '0x2105',
        createdAt: 1719448920,
        auctionLength: 604800,
        clearingPriceInEth: 21.6840425,
    },

    {
        ticker: 'PEPE6',
        chainId: '0x2105',
        createdAt: 1719548920,
        auctionLength: 604800,
        clearingPriceInEth: 0.3125,
    },
    {
        ticker: 'JUNIOR6',
        chainId: '0x2105',
        createdAt: 1719148920,
        auctionLength: 604800,
        clearingPriceInEth: 1.192093,
    },
    {
        ticker: 'EMILY6',
        chainId: '0x2105',
        createdAt: 1719248920,
        auctionLength: 604800,
        clearingPriceInEth: 11.10223,
    },
    {
        ticker: 'DEGEN6',
        chainId: '0x2105',
        createdAt: 1719448920,
        auctionLength: 604800,
        clearingPriceInEth: 21.6840425,
    },
];

export const mockAccountData: AuctionDataIF[] = [
    {
        ticker: 'DOGE',
        chainId: '0x2105',
        createdAt: 1718125986,
        auctionLength: 86400,
        clearingPriceInEth: 0.25,
        clearingPriceForUserBidInEth: 0.25,
        userBidSizeUserInEth: 0.12,
        tokenAllocationUnclaimedByUser: 50000,
    },
    {
        ticker: 'PEPE',
        chainId: '0x2105',
        createdAt: 1717125986,
        auctionLength: 604800,
        clearingPriceInEth: 0.3125,
        clearingPriceForUserBidInEth: 0.25,
        userBidSizeUserInEth: 0.1,
        ethUnclaimedByUser: 0.1,
    },
    {
        ticker: 'JUNIOR',
        chainId: '0x2105',
        createdAt: 1718025986,
        auctionLength: 604800,
        clearingPriceInEth: 0.7629395,
        clearingPriceForUserBidInEth: 0.7629395,
        userBidSizeUserInEth: 0.15,
        tokenAllocationUnclaimedByUser: 168200,
    },
    {
        ticker: 'EMILY',
        chainId: '0x2105',
        createdAt: 1716125986,
        auctionLength: 604800,
        clearingPriceInEth: 11.10223,
        clearingPriceForUserBidInEth: 0.7629395,
        userBidSizeUserInEth: 0.05,
        ethUnclaimedByUser: 0.05,
    },
    {
        ticker: 'DEGEN',
        chainId: '0x2105',
        createdAt: 1718225986,
        auctionLength: 604800,
        clearingPriceInEth: 21.6840425,
        clearingPriceForUserBidInEth: 21.6840425,
        userBidSizeUserInEth: 0.5,
        tokenAllocationUnclaimedByUser: 100000,
    },
    {
        ticker: 'DOGE1',
        chainId: '0x2105',
        createdAt: 1719948920,
        auctionLength: 86400,
        clearingPriceInEth: 0.25,
        clearingPriceForUserBidInEth: 3.63798,
        userBidSizeUserInEth: 0.5,
    },
    {
        ticker: 'PEPE1',
        chainId: '0x2105',
        createdAt: 1719548920,
        auctionLength: 604800,
        clearingPriceInEth: 0.3125,
        clearingPriceForUserBidInEth: 0.25,
        userBidSizeUserInEth: 0.1,
    },

    {
        ticker: 'JUNIOR1',
        chainId: '0x2105',
        createdAt: 1719148920,
        auctionLength: 604800,
        clearingPriceInEth: 1.490116,
        clearingPriceForUserBidInEth: 1.490116,
        userBidSizeUserInEth: 0.05,
    },

    {
        ticker: 'EMILY1',
        chainId: '0x2105',
        createdAt: 1719248920,
        auctionLength: 604800,
        clearingPriceInEth: 11.10223,
        clearingPriceForUserBidInEth: 0.7629395,
        userBidSizeUserInEth: 0.2,
    },

    {
        ticker: 'DEGEN1',
        chainId: '0x2105',
        createdAt: 1718225986,
        auctionLength: 604800,
        clearingPriceInEth: 21.6840425,
        clearingPriceForUserBidInEth: 1.490116,
        userBidSizeUserInEth: 0.3,
    },
];

export const mockAuctionDetailsServerResponseGenerator = (
    ticker: string,
    chainId: string,
): AuctionStatusDataServerIF => {
    false && console.log({ ticker, chainId });
    switch (ticker.slice(0, 4)) {
        case 'DOGE':
            return {
                ticker: ticker,
                chainId: '0x2105',
                createdAt: 1719438920,
                auctionLength: 86400,
                clearingPriceInEth: 0.25,
                openBidInEth: 0.3125,
                openBidAmountFilledInEth: 0.056,
            };
        case 'PEPE':
            return {
                ticker: ticker,
                chainId: '0x2105',
                createdAt: 1719548920,
                auctionLength: 604800,
                clearingPriceInEth: 0.3125,
                openBidInEth: 0.390625,
                openBidAmountFilledInEth: 0.166,
            };
        case 'JUNI':
            return {
                ticker: ticker,
                chainId: '0x2105',
                createdAt: 1719148920,
                auctionLength: 604800,
                clearingPriceInEth: 1.192093,
                openBidInEth: 1.490116,
                openBidAmountFilledInEth: 1.266,
            };
        case 'EMIL':
            return {
                ticker: ticker,
                chainId: '0x2105',
                createdAt: 1719248920,
                auctionLength: 604800,
                clearingPriceInEth: 11.10223,
                openBidInEth: 13.8777875,
                openBidAmountFilledInEth: 5.5,
            };
        case 'DEGE':
            return {
                ticker: ticker,
                chainId: '0x2105',
                createdAt: 1718225986,
                auctionLength: 604800,
                clearingPriceInEth: 21.6840425,
                openBidInEth: 27.10505,
                openBidAmountFilledInEth: 15,
            };
        default:
            return {
                ticker: ticker,
                chainId: '0x2105',
                createdAt: 1718235814,
                auctionLength: 86400,
                clearingPriceInEth: 0.6103515,
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
