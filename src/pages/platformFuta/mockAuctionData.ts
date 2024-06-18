export interface auctionDataIF {
    ticker: string;
    marketCap: number;
    createdAt: number;
    status?: null;
}

export const mockAuctionData: auctionDataIF[] = [
    {
        ticker: 'DOGE',
        marketCap: 20,
        createdAt: 1718054594,
    },
    {
        ticker: 'PEPE',
        marketCap: 15,
        createdAt: 1718118986,
        // createdAt: 1718130986,
    },
    {
        ticker: 'BODEN',
        marketCap: 25,
        createdAt: 1718181398,
    },
    {
        ticker: 'APU',
        marketCap: 12,
        createdAt: 1718195814,
    },
    {
        ticker: 'BOME',
        marketCap: 1,
        createdAt: 1718210226,
    },
    {
        ticker: 'USA',
        marketCap: 50,
        createdAt: 1718224639,
    },
    {
        ticker: 'BITCOIN',
        marketCap: 32,
        createdAt: 1718275051,
    },
    {
        ticker: 'WIF',
        marketCap: 11,
        createdAt: 1718293065,
    },
    {
        ticker: 'TRUMP',
        marketCap: 45,
        createdAt: 1718307476,
    },
    {
        ticker: 'EMILY',
        marketCap: 27,
        createdAt: 1718311100,
    },
    {
        ticker: 'DEGEN',
        marketCap: 16,
        createdAt: 1718361510,
    },
    {
        ticker: 'LOCKIN',
        marketCap: 24,
        createdAt: 1718447920,
    },
];
