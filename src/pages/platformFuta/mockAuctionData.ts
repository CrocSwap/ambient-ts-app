import { AuctionDataIF } from '../../ambient-utils/dataLayer';
import {
    AccountDataIF,
    AuctionStatusDataServerIF,
} from '../../contexts/AuctionsContext';

export const mockAuctionData: AuctionDataIF[] = [
    {
        ticker: 'DOGE',
        chainId: '0x2105',
        createdAt: 1718125986,
        auctionLength: 86400,
        filledClearingPriceInNativeTokenWei: '250000000000000000',
    },
    {
        ticker: 'DOGE1',
        chainId: '0x2105',
        createdAt: 1719868980,
        auctionLength: 86400,
        filledClearingPriceInNativeTokenWei: '250000000000000000',
    },
    {
        ticker: 'DOGE2',
        chainId: '0x2105',
        createdAt: 1719868980,
        auctionLength: 86400,
        filledClearingPriceInNativeTokenWei: '250000000000000000',
    },
    {
        ticker: 'DOGE3',
        chainId: '0x2105',
        createdAt: 1719868980,
        auctionLength: 86400,
        filledClearingPriceInNativeTokenWei: '250000000000000000',
    },
    {
        ticker: 'DOGE4',
        chainId: '0x2105',
        createdAt: 1719868980,
        auctionLength: 86400,
        filledClearingPriceInNativeTokenWei: '250000000000000000',
    },
    {
        ticker: 'DOGE5',
        chainId: '0x2105',
        createdAt: 1719868980,
        auctionLength: 86400,
        filledClearingPriceInNativeTokenWei: '250000000000000000',
    },
    {
        ticker: 'DOGE6',
        chainId: '0x2105',
        createdAt: 1719868980,
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
        ticker: 'DEGEN',
        chainId: '0x2105',
        createdAt: 1718225986,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: '21684042500000002000',
    },

    {
        ticker: 'PEPE1',
        chainId: '0x2105',
        createdAt: 1719548920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: '212500000000000000',
    },
    {
        ticker: 'JUNIOR1',
        chainId: '0x2105',
        createdAt: 1719398920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: '1192093000000000000',
    },
    {
        ticker: 'JUNIOR2',
        chainId: '0x2105',
        createdAt: 1719398920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: '1192093000000000000',
    },
    {
        ticker: 'JUNIOR3',
        chainId: '0x2105',
        createdAt: 1719398920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: '1192093000000000000',
    },
    {
        ticker: 'JUNIOR4',
        chainId: '0x2105',
        createdAt: 1719398920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: '1192093000000000000',
    },
    {
        ticker: 'JUNIOR5',
        chainId: '0x2105',
        createdAt: 1719398920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: '1192093000000000000',
    },
    {
        ticker: 'JUNIOR6',
        chainId: '0x2105',
        createdAt: 1719398920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: '1192093000000000000',
    },
    {
        ticker: 'EMILY1',
        chainId: '0x2105',
        createdAt: 1719358920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: '11102230000000000000',
    },
    {
        ticker: 'EMILY2',
        chainId: '0x2105',
        createdAt: 1719357920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: '11102230000000000000',
    },
    {
        ticker: 'EMILY3',
        chainId: '0x2105',
        createdAt: 1719358920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: '11102230000000000000',
    },
    {
        ticker: 'EMILY4',
        chainId: '0x2105',
        createdAt: 1719358920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: '11102230000000000000',
    },
    {
        ticker: 'EMILY5',
        chainId: '0x2105',
        createdAt: 1719358920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: '11102230000000000000',
    },
    {
        ticker: 'EMILY6',
        chainId: '0x2105',
        createdAt: 1719358920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: '11102230000000000000',
    },
    {
        ticker: 'DEGEN1',
        chainId: '0x2105',
        createdAt: 1718225986,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: '21684042500000002000',
    },

    {
        ticker: 'PEPE2',
        chainId: '0x2105',
        createdAt: 1719548920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: '312500000000000000',
    },

    {
        ticker: 'DEGEN2',
        chainId: '0x2105',
        createdAt: 1718215986,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: '21684042500000002000',
    },

    {
        ticker: 'PEPE3',
        chainId: '0x2105',
        createdAt: 1719548920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: '312500000000000000',
    },

    {
        ticker: 'DEGEN3',
        chainId: '0x2105',
        createdAt: 1719448920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: '21684042500000002000',
    },

    {
        ticker: 'PEPE4',
        chainId: '0x2105',
        createdAt: 1719548920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: '312500000000000000',
    },

    {
        ticker: 'DEGEN4',
        chainId: '0x2105',
        createdAt: 1719448920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: '21684042500000002000',
    },

    {
        ticker: 'PEPE5',
        chainId: '0x2105',
        createdAt: 1719548920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: '312500000000000000',
    },

    {
        ticker: 'DEGEN5',
        chainId: '0x2105',
        createdAt: 1719448920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: '21684042500000002000',
    },

    {
        ticker: 'PEPE6',
        chainId: '0x2105',
        createdAt: 1719548920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: '312500000000000000',
    },

    {
        ticker: 'DEGEN6',
        chainId: '0x2105',
        createdAt: 1719448920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: '21684042500000002000',
    },
];

export const mockAccountData1: AuctionDataIF[] = [
    {
        ticker: 'DOGE',
        chainId: '0x2105',
        createdAt: 1718125986,
        auctionLength: 86400,
        filledClearingPriceInNativeTokenWei: '250000000000000000',
        userAddress: '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
        userBidClearingPriceInNativeTokenWei: '250000000000000000',
        qtyBidByUserInNativeTokenWei: '120000000000000000',
        qtyUnclaimedByUserInAuctionedTokenWei: '50000000000000000000000',
    },
    {
        ticker: 'PEPE',
        chainId: '0x2105',
        createdAt: 1717125986,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: '312500000000000000',
        userAddress: '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
        userBidClearingPriceInNativeTokenWei: '250000000000000000',
        qtyBidByUserInNativeTokenWei: '100000000000000000',
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
        qtyUnreturnedToUserInNativeTokenWei: '50000000000000000',
    },
    {
        ticker: 'DEGEN',
        chainId: '0x2105',
        createdAt: 1718225986,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: '21684042500000002000',
        userAddress: '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
        userBidClearingPriceInNativeTokenWei: '21684042500000002000',
        qtyBidByUserInNativeTokenWei: '500000000000000000',
        qtyUnclaimedByUserInAuctionedTokenWei: '100000000000000000000000', // 100000 scaled
    },
    {
        ticker: 'DOGE1',
        chainId: '0x2105',
        createdAt: 1719868980,
        auctionLength: 86400,
        filledClearingPriceInNativeTokenWei: '250000000000000000',
        userAddress: '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
        userBidClearingPriceInNativeTokenWei: '3637980000000000000',
        qtyBidByUserInNativeTokenWei: '500000000000000000',
    },
    {
        ticker: 'PEPE1',
        chainId: '0x2105',
        createdAt: 1719548920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: '312500000000000000',
        userAddress: '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
        userBidClearingPriceInNativeTokenWei: '250000000000000000',
        qtyBidByUserInNativeTokenWei: '100000000000000000',
    },

    {
        ticker: 'JUNIOR1',
        chainId: '0x2105',
        createdAt: 1719398920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: '1192093000000000000',
        userAddress: '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
        userBidClearingPriceInNativeTokenWei: '1490116000000000000',
        qtyBidByUserInNativeTokenWei: '50000000000000000',
    },

    {
        ticker: 'EMILY1',
        chainId: '0x2105',
        createdAt: 1719248920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: '11102230000000000000',
        userAddress: '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
        userBidClearingPriceInNativeTokenWei: '762939500000000000',
        qtyBidByUserInNativeTokenWei: '200000000000000000',
    },

    {
        ticker: 'DEGEN1',
        chainId: '0x2105',
        createdAt: 1718225986,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: '21684042500000002000',
        userAddress: '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
        userBidClearingPriceInNativeTokenWei: '1490116000000000000',
        qtyBidByUserInNativeTokenWei: '300000000000000000',
    },
];

export const mockAccountData2: AuctionDataIF[] = [
    {
        ticker: 'PEPE',
        chainId: '0x2105',
        createdAt: 1717125986,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: '312500000000000000',
        userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
        userBidClearingPriceInNativeTokenWei: '250000000000000000',
        qtyBidByUserInNativeTokenWei: '100000000000000000',
        qtyUnreturnedToUserInNativeTokenWei: '100000000000000000',
    },
    {
        ticker: 'JUNIOR',
        chainId: '0x2105',
        createdAt: 1718025986,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: '762939500000000000',
        userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
        userBidClearingPriceInNativeTokenWei: '762939500000000000',
        qtyBidByUserInNativeTokenWei: '150000000000000000',
        qtyUnclaimedByUserInAuctionedTokenWei: '168200000000000000000000',
    },
    {
        ticker: 'EMILY',
        chainId: '0x2105',
        createdAt: 1716125986,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: '11102230000000000000',
        userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
        userBidClearingPriceInNativeTokenWei: '762939500000000000',
        qtyBidByUserInNativeTokenWei: '50000000000000000',
        qtyUnreturnedToUserInNativeTokenWei: '50000000000000000',
    },
    {
        ticker: 'DEGEN',
        chainId: '0x2105',
        createdAt: 1718225986,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: '21684042500000002000',
        userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
        userBidClearingPriceInNativeTokenWei: '21684042500000002000',
        qtyBidByUserInNativeTokenWei: '500000000000000000',
        qtyUnclaimedByUserInAuctionedTokenWei: '100000000000000000000000', // 100000 scaled
    },
    {
        ticker: 'DOGE1',
        chainId: '0x2105',
        createdAt: 1719868980,
        auctionLength: 86400,
        filledClearingPriceInNativeTokenWei: '250000000000000000',
        userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
        userBidClearingPriceInNativeTokenWei: '3637980000000000000',
        qtyBidByUserInNativeTokenWei: '500000000000000000',
    },
    {
        ticker: 'PEPE1',
        chainId: '0x2105',
        createdAt: 1719548920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: '312500000000000000',
        userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
        userBidClearingPriceInNativeTokenWei: '250000000000000000',
        qtyBidByUserInNativeTokenWei: '100000000000000000',
    },

    {
        ticker: 'JUNIOR1',
        chainId: '0x2105',
        createdAt: 1719398920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: '1192093000000000000',
        userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
        userBidClearingPriceInNativeTokenWei: '1490116000000000000',
        qtyBidByUserInNativeTokenWei: '50000000000000000',
    },

    {
        ticker: 'EMILY1',
        chainId: '0x2105',
        createdAt: 1719248920,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: '11102230000000000000',
        userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
        userBidClearingPriceInNativeTokenWei: '762939500000000000',
        qtyBidByUserInNativeTokenWei: '200000000000000000',
    },

    {
        ticker: 'DEGEN1',
        chainId: '0x2105',
        createdAt: 1718225986,
        auctionLength: 604800,
        filledClearingPriceInNativeTokenWei: '21684042500000002000',
        userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
        userBidClearingPriceInNativeTokenWei: '1490116000000000000',
        qtyBidByUserInNativeTokenWei: '300000000000000000',
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
                filledClearingPriceInNativeTokenWei: '250000000000000000',
                openBidClearingPriceInNativeTokenWei: '312500000000000000',
                openBidQtyFilledInNativeTokenWei: '56000000000000000',
            };
        case 'PEPE':
            return {
                ticker: ticker,
                chainId: '0x2105',
                createdAt: 1719548920,
                auctionLength: 604800,
                filledClearingPriceInNativeTokenWei: '312500000000000000',
                openBidClearingPriceInNativeTokenWei: '390625000000000000',
                openBidQtyFilledInNativeTokenWei: '166000000000000000',
            };
        case 'JUNI':
            return {
                ticker: ticker,
                chainId: '0x2105',
                createdAt: 1719148920,
                auctionLength: 604800,
                filledClearingPriceInNativeTokenWei: '1192093000000000000',
                openBidClearingPriceInNativeTokenWei: '1490116000000000000',
                openBidQtyFilledInNativeTokenWei: '1266000000000000000',
            };
        case 'EMIL':
            return {
                ticker: ticker,
                chainId: '0x2105',
                createdAt: 1719248920,
                auctionLength: 604800,
                filledClearingPriceInNativeTokenWei: '11102230000000000000',
                openBidClearingPriceInNativeTokenWei: '13877787500000000000',
                openBidQtyFilledInNativeTokenWei: '5500000000000000000',
            };
        case 'DEGE':
            return {
                ticker: ticker,
                chainId: '0x2105',
                createdAt: 1718225986,
                auctionLength: 604800,
                filledClearingPriceInNativeTokenWei: '21684042500000002000',
                openBidClearingPriceInNativeTokenWei: '27105050000000000000',
                openBidQtyFilledInNativeTokenWei: '15000000000000000000',
            };
        default:
            return {
                ticker: ticker,
                chainId: '0x2105',
                createdAt: 1718235814,
                auctionLength: 86400,
                filledClearingPriceInNativeTokenWei: '610351500000000000',
                openBidClearingPriceInNativeTokenWei: '762939500000000000',
                openBidQtyFilledInNativeTokenWei: '560000000000000060',
            };
    }
};

const length = 50;
const base = 1.25;
export const bidSizeMultipliers = Array.from({ length }, (_, i) => base ** i);

export const minBidSizeInEth = 0.25;
export const marketCapMultiplier = 5;

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
