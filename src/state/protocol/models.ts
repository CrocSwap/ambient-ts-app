import { ChartDayData, Transaction } from '../../types';

export interface ProtocolData {
    // volume
    volumeUSD: number;
    volumeUSDChange: number;

    // in range liquidity
    tvlUSD: number;
    tvlUSDChange: number;

    // fees
    feesUSD: number;
    feeChange: number;

    // transactions
    txCount: number;
    txCountChange: number;
}

export interface ProtocolState {
    [networkId: string]: {
        // timestamp for last updated fetch
        readonly lastUpdated: number | undefined;
        // overview data
        readonly data: ProtocolData | undefined;
        readonly chartData: ChartDayData[] | undefined;
        readonly transactions: Transaction[] | undefined;
    };
}
