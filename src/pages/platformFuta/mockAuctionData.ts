import {
    AuctionDataIF,
    AuctionStatusDataServerIF,
} from '../../contexts/AuctionsContext';

export const mockAuctionData: AuctionDataIF[] = [
    {
        ticker: 'DOGE',
        marketCap: 55.51115,
        createdAt: 1718354594,
    },
    {
        ticker: 'MOG',
        marketCap: 1.953125,
        createdAt: 1718054594,
    },
    {
        ticker: 'PEPE',
        marketCap: 1.953125,
        createdAt: 1718225986,
    },
    {
        ticker: 'BODEN',
        marketCap: 1.953125,
        createdAt: 1718148398,
    },
    {
        ticker: 'APU',
        marketCap: 2.441406,
        createdAt: 1718295814,
    },
    {
        ticker: 'BOME',
        marketCap: 1.953125,
        createdAt: 1718210226,
    },
    {
        ticker: 'USA',
        marketCap: 55.51115,
        createdAt: 1718224639,
    },
    {
        ticker: 'BITCOIN',
        marketCap: 1.953125,
        createdAt: 1718275051,
    },
    {
        ticker: 'WIF',
        marketCap: 1.953125,
        createdAt: 1718293065,
    },
    {
        ticker: 'TRUMP',
        marketCap: 1.953125,
        createdAt: 1718307476,
    },
    {
        ticker: 'EMILY',
        marketCap: 1.953125,
        createdAt: 1718311100,
    },
    {
        ticker: 'DEGEN',
        marketCap: 2.441406,
        createdAt: 1718361510,
    },
    {
        ticker: 'LOCKIN',
        marketCap: 1.953125,
        createdAt: 1718447920,
    },
];

export const mockAccountData: AuctionDataIF[] = [
    {
        ticker: 'DOGE',
        marketCap: 55.51115,
        createdAt: 1718354594,
        unclaimedAllocation: 100000,
    },
    {
        ticker: 'MOG',
        marketCap: 1.953125,
        createdAt: 1718054594,
        unclaimedAllocation: 168200,
    },
    {
        ticker: 'BODEN',
        marketCap: 1.953125,
        createdAt: 1718148398,
    },
    {
        ticker: 'APU',
        marketCap: 2.441406,
        createdAt: 1718295814,
    },
];

export const mockAuctionStatus1: AuctionStatusDataServerIF = {
    openBidMarketCap: 3.051758,
    openBidSize: 0.271,
    openBidAmountFilled: 0.066,
};

export const mockAuctionStatus2: AuctionStatusDataServerIF = {
    openBidMarketCap: 69.38894,
    openBidSize: 0.471,
    openBidAmountFilled: 0.166,
};

export const mockAuctionStatus3: AuctionStatusDataServerIF = {
    openBidMarketCap: 2.441406,
    openBidSize: 0.471,
    openBidAmountFilled: 0.166,
};

export const marketCapMultipliers = [
    1, 1.25, 1.5625, 1.953125, 2.441406, 3.051758, 3.814697, 4.768372, 5.960464,
    7.450581, 9.313226, 11.64153, 14.55192, 18.18989, 22.73737, 28.42171,
    35.52714, 44.40892, 55.51115, 69.38894, 86.73617, 108.4202, 135.5253,
    169.4066, 211.7582, 264.6978,
];
