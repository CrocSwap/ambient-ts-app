export interface auctionDataIF {
    ticker: string;
    marketCap: number;
    timeRem: string;
    status?: null;
}

export const mockAuctionData: auctionDataIF[] = [
    {
        ticker: 'DOGE',
        marketCap: 67316,
        timeRem: '40m',
    },
    {
        ticker: 'PEPE',
        marketCap: 34466,
        timeRem: '15h',
    },
    {
        ticker: 'BODEN',
        marketCap: 27573,
        timeRem: '21h',
    },
    {
        ticker: 'APU',
        marketCap: 979579,
        timeRem: '07h',
    },
    {
        ticker: 'BOME',
        marketCap: 626930,
        timeRem: '40m',
    },
    {
        ticker: 'USA',
        marketCap: 11294,
        timeRem: '05h',
    },
    {
        ticker: 'BITCOIN',
        marketCap: 17647,
        timeRem: '01h',
    },
    {
        ticker: 'WIF',
        marketCap: 5782,
        timeRem: '10h',
    },
    {
        ticker: 'TRUMP',
        marketCap: 22058,
        timeRem: '07h',
    },
    {
        ticker: 'EMILY',
        marketCap: 27673,
        timeRem: 'COMPLETE',
    },
    {
        ticker: 'DEGEN',
        marketCap: 5782,
        timeRem: '05h',
    },
    {
        ticker: 'LOCKIN',
        marketCap: 27573,
        timeRem: '05m',
    },
];
