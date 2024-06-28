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
        filledClearingPriceInNativeTokenWei: 0.25,
    },
    {
        ticker: 'DOGE1',
        chainId: '0x2105',
        createdAt: 1719522820,
        auctionLength: 86400,
        filledClearingPriceInNativeTokenWei: 0.25,
    },
    {
        ticker: 'DOGE2',
        chainId: '0x2105',
        createdAt: 1719522820,
        auctionLength: 86400,
        filledClearingPriceInNativeTokenWei: 0.25,
    },
    {
        ticker: 'DOGE3',
        chainId: '0x2105',
        createdAt: 1719522820,
        auctionLength: 86400,
        filledClearingPriceInNativeTokenWei: 0.25,
    },
    {
        ticker: 'DOGE4',
        chainId: '0x2105',
        createdAt: 1719522820,
        auctionLength: 86400,
        filledClearingPriceInNativeTokenWei: 0.25,
    },
    {
        ticker: 'DOGE5',
        chainId: '0x2105',
        createdAt: 1719522820,
        auctionLength: 86400,
        filledClearingPriceInNativeTokenWei: 0.25,
    },
    {
        ticker: 'DOGE6',
        chainId: '0x2105',
        createdAt: 1719522820,
        auctionLength: 86400,
        filledClearingPriceInNativeTokenWei: 0.25,
    },
    {
        ticker: 'PEPE',
        chainId: '0x2105',
        createdAt: 1717125986,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: 0.3125,
    },
    {
        ticker: 'JUNIOR',
        chainId: '0x2105',
        createdAt: 1718025986,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: 0.7629395,
    },
    {
        ticker: 'EMILY',
        chainId: '0x2105',
        createdAt: 1716125986,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: 11.10223,
    },
    {
        ticker: 'DEGEN',
        chainId: '0x2105',
        createdAt: 1718225986,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: 21.6840425,
    },

    {
        ticker: 'PEPE1',
        chainId: '0x2105',
        createdAt: 1719548920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: 0.3125,
    },
    {
        ticker: 'JUNIOR1',
        chainId: '0x2105',
        createdAt: 1719148920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: 1.490116,
    },
    {
        ticker: 'EMILY1',
        chainId: '0x2105',
        createdAt: 1719248920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: 11.10223,
    },
    {
        ticker: 'DEGEN1',
        chainId: '0x2105',
        createdAt: 1718225986,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: 21.6840425,
    },

    {
        ticker: 'PEPE2',
        chainId: '0x2105',
        createdAt: 1719548920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: 0.3125,
    },
    {
        ticker: 'JUNIOR2',
        chainId: '0x2105',
        createdAt: 1719148920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: 1.192093,
    },
    {
        ticker: 'EMILY2',
        chainId: '0x2105',
        createdAt: 1719248920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: 11.10223,
    },
    {
        ticker: 'DEGEN2',
        chainId: '0x2105',
        createdAt: 1718215986,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: 21.6840425,
    },

    {
        ticker: 'PEPE3',
        chainId: '0x2105',
        createdAt: 1719548920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: 0.3125,
    },
    {
        ticker: 'JUNIOR3',
        chainId: '0x2105',
        createdAt: 1719148920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: 1.192093,
    },
    {
        ticker: 'EMILY3',
        chainId: '0x2105',
        createdAt: 1719248920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: 11.10223,
    },
    {
        ticker: 'DEGEN3',
        chainId: '0x2105',
        createdAt: 1719448920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: 21.6840425,
    },

    {
        ticker: 'PEPE4',
        chainId: '0x2105',
        createdAt: 1719548920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: 0.3125,
    },
    {
        ticker: 'JUNIOR4',
        chainId: '0x2105',
        createdAt: 1719148920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: 1.192093,
    },
    {
        ticker: 'EMILY4',
        chainId: '0x2105',
        createdAt: 1719248920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: 11.10223,
    },
    {
        ticker: 'DEGEN4',
        chainId: '0x2105',
        createdAt: 1719448920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: 21.6840425,
    },

    {
        ticker: 'PEPE5',
        chainId: '0x2105',
        createdAt: 1719548920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: 0.3125,
    },
    {
        ticker: 'JUNIOR5',
        chainId: '0x2105',
        createdAt: 1719148920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: 1.192093,
    },
    {
        ticker: 'EMILY5',
        chainId: '0x2105',
        createdAt: 1719248920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: 11.10223,
    },
    {
        ticker: 'DEGEN5',
        chainId: '0x2105',
        createdAt: 1719448920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: 21.6840425,
    },

    {
        ticker: 'PEPE6',
        chainId: '0x2105',
        createdAt: 1719548920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: 0.3125,
    },
    {
        ticker: 'JUNIOR6',
        chainId: '0x2105',
        createdAt: 1719148920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: 1.192093,
    },
    {
        ticker: 'EMILY6',
        chainId: '0x2105',
        createdAt: 1719248920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: 11.10223,
    },
    {
        ticker: 'DEGEN6',
        chainId: '0x2105',
        createdAt: 1719448920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: 21.6840425,
    },
];

export const mockAccountData: AuctionDataIF[] = [
    {
        ticker: 'DOGE',
        chainId: '0x2105',
        createdAt: 1718125986,
        auctionLength: 86400,
        filledClearingPriceInNativeTokenWei: 0.25,
        userBidClearingPriceInNativeTokenWei: 0.25,
        qtyBidByUserInNativeTokenWei: 0.12,
        qtyUnclaimedByUserInAuctionedTokenWei: 50000,
    },
    {
        ticker: 'PEPE',
        chainId: '0x2105',
        createdAt: 1717125986,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: 0.3125,
        userBidClearingPriceInNativeTokenWei: 0.25,
        qtyBidByUserInNativeTokenWei: 0.1,
        qtyUnreturnedToUserInNativeTokenWei: 0.1,
    },
    {
        ticker: 'JUNIOR',
        chainId: '0x2105',
        createdAt: 1718025986,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: 0.7629395,
        userBidClearingPriceInNativeTokenWei: 0.7629395,
        qtyBidByUserInNativeTokenWei: 0.15,
        qtyUnclaimedByUserInAuctionedTokenWei: 168200,
    },
    {
        ticker: 'EMILY',
        chainId: '0x2105',
        createdAt: 1716125986,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: 11.10223,
        userBidClearingPriceInNativeTokenWei: 0.7629395,
        qtyBidByUserInNativeTokenWei: 0.05,
        qtyUnreturnedToUserInNativeTokenWei: 0.05,
    },
    {
        ticker: 'DEGEN',
        chainId: '0x2105',
        createdAt: 1718225986,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: 21.6840425,
        userBidClearingPriceInNativeTokenWei: 21.6840425,
        qtyBidByUserInNativeTokenWei: 0.5,
        qtyUnclaimedByUserInAuctionedTokenWei: 100000,
    },
    {
        ticker: 'DOGE1',
        chainId: '0x2105',
        createdAt: 1719948920,
        auctionLength: 86400,
        filledClearingPriceInNativeTokenWei: 0.25,
        userBidClearingPriceInNativeTokenWei: 3.63798,
        qtyBidByUserInNativeTokenWei: 0.5,
    },
    {
        ticker: 'PEPE1',
        chainId: '0x2105',
        createdAt: 1719548920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: 0.3125,
        userBidClearingPriceInNativeTokenWei: 0.25,
        qtyBidByUserInNativeTokenWei: 0.1,
    },

    {
        ticker: 'JUNIOR1',
        chainId: '0x2105',
        createdAt: 1719148920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: 1.490116,
        userBidClearingPriceInNativeTokenWei: 1.490116,
        qtyBidByUserInNativeTokenWei: 0.05,
    },

    {
        ticker: 'EMILY1',
        chainId: '0x2105',
        createdAt: 1719248920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: 11.10223,
        userBidClearingPriceInNativeTokenWei: 0.7629395,
        qtyBidByUserInNativeTokenWei: 0.2,
    },

    {
        ticker: 'DEGEN1',
        chainId: '0x2105',
        createdAt: 1718225986,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: 21.6840425,
        userBidClearingPriceInNativeTokenWei: 1.490116,
        qtyBidByUserInNativeTokenWei: 0.3,
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
                filledClearingPriceInNativeTokenWei: 0.25,
                openBidClearingPriceInNativeTokenWei: 0.3125,
                openBidQtyFilledInNativeTokenWei: 0.056,
            };
        case 'PEPE':
            return {
                ticker: ticker,
                chainId: '0x2105',
                createdAt: 1719548920,
                auctionLength: 604800,
                filledClearingPriceInNativeTokenWei: 0.3125,
                openBidClearingPriceInNativeTokenWei: 0.390625,
                openBidQtyFilledInNativeTokenWei: 0.166,
            };
        case 'JUNI':
            return {
                ticker: ticker,
                chainId: '0x2105',
                createdAt: 1719148920,
                auctionLength: 604800,
                filledClearingPriceInNativeTokenWei: 1.192093,
                openBidClearingPriceInNativeTokenWei: 1.490116,
                openBidQtyFilledInNativeTokenWei: 1.266,
            };
        case 'EMIL':
            return {
                ticker: ticker,
                chainId: '0x2105',
                createdAt: 1719248920,
                auctionLength: 604800,
                filledClearingPriceInNativeTokenWei: 11.10223,
                openBidClearingPriceInNativeTokenWei: 13.8777875,
                openBidQtyFilledInNativeTokenWei: 5.5,
            };
        case 'DEGE':
            return {
                ticker: ticker,
                chainId: '0x2105',
                createdAt: 1718225986,
                auctionLength: 604800,
                filledClearingPriceInNativeTokenWei: 21.6840425,
                openBidClearingPriceInNativeTokenWei: 27.10505,
                openBidQtyFilledInNativeTokenWei: 15,
            };
        default:
            return {
                ticker: ticker,
                chainId: '0x2105',
                createdAt: 1718235814,
                auctionLength: 86400,
                filledClearingPriceInNativeTokenWei: 0.6103515,
                openBidClearingPriceInNativeTokenWei: 0.7629395,
                openBidQtyFilledInNativeTokenWei: 0.566,
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
