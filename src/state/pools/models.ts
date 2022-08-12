import { Transaction } from '../../types';
import { SerializedToken } from '../../utils/tokens';

export interface Pool {
    address: string;
    token0: SerializedToken;
    token1: SerializedToken;
}

export interface PoolData {
    // basic token info
    address: string;
    feeTier: number;

    token0: {
        name: string;
        symbol: string;
        address: string;
        decimals: number;
        derivedETH: number;
    };

    token1: {
        name: string;
        symbol: string;
        address: string;
        decimals: number;
        derivedETH: number;
    };

    // for tick math
    liquidity: number;
    sqrtPrice: number;
    tick: number;

    // volume
    volumeUSD: number;
    volumeUSDChange: number;
    volumeUSDWeek: number;

    // liquidity
    tvlUSD: number;
    tvlUSDChange: number;

    // prices
    token0Price: number;
    token1Price: number;

    // token amounts
    tvlToken0: number;
    tvlToken1: number;
}

export type PoolChartEntry = {
    date: number;
    volumeUSD: number;
    totalValueLockedUSD: number;
    feesUSD: number;
};

export interface PoolsState {
    // analytics data from
    byAddress: {
        [networkId: string]: {
            [address: string]: {
                data: PoolData | undefined;
                chartData: PoolChartEntry[] | undefined;
                transactions: Transaction[] | undefined;
                lastUpdated: number | undefined;
                tickData: any;
            };
        };
    };
}
