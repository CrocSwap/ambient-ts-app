import {
    AuctionDataIF,
    AuctionStatusDataServerIF,
} from '../../contexts/AuctionsContext';

export const mockAuctionData: AuctionDataIF[] = [
    {
        ticker: 'DOGE',
        marketCap: 3.63798,
        createdAt: 1719948920,
        auctionLength: 86400,
    },
    {
        ticker: 'MOG',
        marketCap: 0.25,
        createdAt: 1719548920,
        auctionLength: 604800,
    },
    {
        ticker: 'PEPE',
        marketCap: 17.347235,
        createdAt: 1718225986,
        auctionLength: 604800,
    },
    {
        ticker: 'JUNIOR',
        marketCap: 1.86264525,
        createdAt: 1719148920,
        auctionLength: 604800,
    },
    {
        ticker: 'JUNIOR1',
        marketCap: 1.86264525,
        createdAt: 1719248920,
        auctionLength: 604800,
    },
    {
        ticker: 'JUNIOR2',
        marketCap: 1.86264525,
        createdAt: 1719448920,
        auctionLength: 604800,
    },
    {
        ticker: 'JUNIOR3',
        marketCap: 1.86264525,
        createdAt: 1719648920,
        auctionLength: 604800,
    },
    {
        ticker: 'JUNIOR4',
        marketCap: 1.86264525,
        createdAt: 1719548920,
        auctionLength: 604800,
    },
    {
        ticker: 'BODEN',
        marketCap: 1.953125,
        createdAt: 1718447920,
        auctionLength: 604800,
    },
    {
        ticker: 'APU',
        marketCap: 0.7629395,
        createdAt: 1718235814,
        auctionLength: 604800,
    },
    {
        ticker: 'BOME',
        marketCap: 1.953125,
        createdAt: 1718249226,
        auctionLength: 604800,
    },
    {
        ticker: 'USA',
        marketCap: 3.63798,
        createdAt: 1717224639,
        auctionLength: 604800,
    },
    {
        ticker: 'BITCOIN',
        marketCap: 1.953125,
        createdAt: 1718275051,
        auctionLength: 604800,
    },
    {
        ticker: 'WIF',
        marketCap: 1.953125,
        createdAt: 1718293065,
        auctionLength: 604800,
    },
    {
        ticker: 'TRUMP',
        marketCap: 1.86264525,
        createdAt: 1718367476,
        auctionLength: 604800,
    },
    {
        ticker: 'EMILY',
        marketCap: 0.48828125,
        createdAt: 1719140920,
        auctionLength: 604800,
    },
    {
        ticker: 'DEGEN',
        marketCap: 0.7629395,
        createdAt: 1719548920,
        auctionLength: 604800,
    },
    {
        ticker: 'LOCKIN',
        marketCap: 0.48828125,
        createdAt: 1718447920,
        auctionLength: 604800,
    },
    {
        ticker: 'TRUMP1',
        marketCap: 1.86264525,
        createdAt: 1719188920,
        auctionLength: 604800,
    },
    {
        ticker: 'EMILY1',
        marketCap: 0.48828125,
        createdAt: 1719170920,
        auctionLength: 604800,
    },
    {
        ticker: 'DEGEN1',
        marketCap: 0.7629395,
        createdAt: 1719648920,
        auctionLength: 604800,
    },
    {
        ticker: 'LOCKIN1',
        marketCap: 0.48828125,
        createdAt: 1718637920,
        auctionLength: 604800,
    },
    {
        ticker: 'TRUMP2',
        marketCap: 1.86264525,
        createdAt: 1719179920,
        auctionLength: 604800,
    },
    {
        ticker: 'EMILY2',
        marketCap: 0.48828125,
        createdAt: 1718638920,
        auctionLength: 604800,
    },
    {
        ticker: 'DEGEN2',
        marketCap: 0.7629395,
        createdAt: 1718858920,
        auctionLength: 604800,
    },
    {
        ticker: 'LOCKIN2',
        marketCap: 0.48828125,
        createdAt: 1718847920,
        auctionLength: 604800,
    },
    {
        ticker: 'TRUMP3',
        marketCap: 1.86264525,
        createdAt: 1719180920,
        auctionLength: 604800,
    },
    {
        ticker: 'EMILY3',
        marketCap: 0.48828125,
        createdAt: 1718648920,
        auctionLength: 604800,
    },
    {
        ticker: 'BEN',
        marketCap: 3.63798,
        createdAt: 1718948920,
        auctionLength: 604800,
    },
    {
        ticker: 'BEN2',
        marketCap: 3.63798,
        createdAt: 1719948920,
        auctionLength: 604800,
    },
    {
        ticker: 'BEN3',
        marketCap: 3.63798,
        createdAt: 1718958920,
        auctionLength: 604800,
    },
    {
        ticker: 'BEN4',
        marketCap: 3.63798,
        createdAt: 1718968920,
        auctionLength: 604800,
    },
    {
        ticker: 'DEGEN3',
        marketCap: 0.7629395,
        createdAt: 1718958920,
        auctionLength: 604800,
    },
    {
        ticker: 'LOCKIN3',
        marketCap: 0.48828125,
        createdAt: 1718867920,
        auctionLength: 604800,
    },
    {
        ticker: 'TRUMP4',
        marketCap: 1.86264525,
        createdAt: 1719170920,
        auctionLength: 604800,
    },
    {
        ticker: 'EMILY4',
        marketCap: 0.48828125,
        createdAt: 1718758920,
        auctionLength: 604800,
    },
    {
        ticker: 'DEGEN4',
        marketCap: 0.7629395,
        createdAt: 1718978920,
        auctionLength: 604800,
    },
    {
        ticker: 'LOCKIN4',
        marketCap: 0.48828125,
        createdAt: 1718868920,
        auctionLength: 604800,
    },
    {
        ticker: 'TRUMP5',
        marketCap: 1.86264525,
        createdAt: 1719160920,
        auctionLength: 604800,
    },
    {
        ticker: 'EMILY5',
        marketCap: 0.48828125,
        createdAt: 1718998920,
        auctionLength: 604800,
    },
    {
        ticker: 'DEGEN5',
        marketCap: 0.7629395,
        createdAt: 1719078920,
        auctionLength: 604800,
    },
    {
        ticker: 'LOCKIN5',
        marketCap: 0.48828125,
        createdAt: 1718869920,
        auctionLength: 604800,
    },
    {
        ticker: 'TRUMP6',
        marketCap: 1.86264525,
        createdAt: 1719150920,
        auctionLength: 604800,
    },
    {
        ticker: 'EMILY6',
        marketCap: 0.48828125,
        createdAt: 1719178920,
        auctionLength: 604800,
    },
    {
        ticker: 'DEGEN6',
        marketCap: 0.7629395,
        createdAt: 1719278920,
        auctionLength: 604800,
    },
    {
        ticker: 'LOCKIN6',
        marketCap: 0.48828125,
        createdAt: 1718870920,
        auctionLength: 604800,
    },
];

export const mockAccountData: AuctionDataIF[] = [
    {
        ticker: 'DOGE',
        marketCap: 3.63798,
        createdAt: 1718235814,
        // createdAt: 1719948920,
        auctionLength: 86400,
        currentUserBid: 3.63798,
    },
    {
        ticker: 'MOG',
        marketCap: 0.25,
        createdAt: 1718547920,
        unclaimedEthAllocation: 100000,
        auctionLength: 604800,
        currentUserBid: 0.25,
    },
    {
        ticker: 'BODEN',
        marketCap: 0.95367425,
        createdAt: 1718447920,
        auctionLength: 604800,
        unclaimedTokenAllocation: 100000,
        currentUserBid: 1.490116,
    },
    {
        ticker: 'APU',
        marketCap: 0.7629395,
        createdAt: 1718235814,
        auctionLength: 604800,
        currentUserBid: 0.7629395,
        unclaimedTokenAllocation: 168200,
    },
];

export const mockAuctionStatus1: AuctionStatusDataServerIF = {
    openBidMarketCap: 0.95367425,
    openBidSize: 0.271,
    openBidAmountFilled: 0.066,
};

export const mockAuctionStatus2: AuctionStatusDataServerIF = {
    openBidMarketCap: 4.5474725,
    openBidSize: 0.471,
    openBidAmountFilled: 0.166,
};

export const mockAuctionStatus3: AuctionStatusDataServerIF = {
    openBidMarketCap: 0.3125,
    openBidSize: 0.471,
    openBidAmountFilled: 0.166,
};

export const mockAuctionStatus4: AuctionStatusDataServerIF = {
    openBidMarketCap: 0.6103515,
    openBidSize: 0.571,
    openBidAmountFilled: 0.366,
};

export const mockAuctionStatus5: AuctionStatusDataServerIF = {
    openBidMarketCap: 2.3283065,
    openBidSize: 0.571,
    openBidAmountFilled: 0.366,
};

export const marketCapMultipliers = [
    1, 1.25, 1.5625, 1.953125, 2.441406, 3.051758, 3.814697, 4.768372, 5.960464,
    7.450581, 9.313226, 11.64153, 14.55192, 18.18989, 22.73737, 28.42171,
    35.52714, 44.40892, 55.51115, 69.38894, 86.73617, 108.4202, 135.5253,
    169.4066, 211.7582, 264.6978,
];
