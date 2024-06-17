export interface auctionDataIF {
    ticker: string;
    marketCap: number;
    createdAt: number;
    status?: null;
}

export const mockAuctionData: auctionDataIF[] = [
    {
        ticker: 'DOGE',
        marketCap: 67316,
        createdAt: 1718054594,
    },
    {
        ticker: 'PEPE',
        marketCap: 34466,
        createdAt: 1718130986,
    },
    {
        ticker: 'BODEN',
        marketCap: 27573,
        createdAt: 1718181398,
    },
    {
        ticker: 'APU',
        marketCap: 979579,
        createdAt: 1718195814,
    },
    {
        ticker: 'BOME',
        marketCap: 626930,
        createdAt: 1718210226,
    },
    {
        ticker: 'USA',
        marketCap: 11294,
        createdAt: 1718224639,
    },
    {
        ticker: 'BITCOIN',
        marketCap: 17647,
        createdAt: 1718275051,
    },
    {
        ticker: 'WIF',
        marketCap: 5782,
        createdAt: 1718293065,
    },
    {
        ticker: 'TRUMP',
        marketCap: 22058,
        createdAt: 1718307476,
    },
    {
        ticker: 'EMILY',
        marketCap: 27673,
        createdAt: 1718311100,
    },
    {
        ticker: 'DEGEN',
        marketCap: 5782,
        createdAt: 1718361510,
    },
    {
        ticker: 'LOCKIN',
        marketCap: 27573,
        createdAt: 1718447920,
    },
];
