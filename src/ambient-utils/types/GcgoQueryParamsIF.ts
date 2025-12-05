export interface ChainStatsServerParamsIF {
    chainId: string;
    tokenCount: number;
}

export interface AllPoolStatsServerParamsIF {
    chainId: string;
    histTime?: number;
    with24hPrices?: boolean;
}

export interface PoolStatsServerParamsIF {
    chainId: string;
    base: string;
    quote: string;
    poolIdx: number;
    histTime?: number;
    with24hPrices?: boolean;
}

export interface UserTransactionServerParamsIF {
    user: string;
    chainId: string;
    count: number;
    time?: number;
    timeBefore?: number;
    period?: number;
}

export interface UserPositionServerParamsIF
    extends UserTransactionServerParamsIF {}

export interface UserLimitOrdersServerParamsIF
    extends UserTransactionServerParamsIF {}

export interface PoolTransactionsServerParamsIF {
    chainId: string;
    base: string;
    quote: string;
    poolIdx: number;
    count: number;
    time?: number;
    timeBefore?: number;
    period?: number;
}

export interface PoolPositionServerParamsIF
    extends PoolTransactionsServerParamsIF {}

export interface PoolLimitOrdersServerParamsIF
    extends PoolTransactionsServerParamsIF {}

export interface UserPoolTransactionsServerParamsIF
    extends PoolTransactionsServerParamsIF {
    user: string;
}

export interface UserPoolPositionServerParamsIF
    extends UserPoolTransactionsServerParamsIF {}

export interface UserPoolLimitOrdersServerParamsIF
    extends UserPoolTransactionsServerParamsIF {}

export type ListableQueryParamsIF =
    | UserTransactionServerParamsIF
    | UserPositionServerParamsIF
    | UserLimitOrdersServerParamsIF
    | PoolTransactionsServerParamsIF
    | PoolPositionServerParamsIF
    | PoolLimitOrdersServerParamsIF
    | UserPoolTransactionsServerParamsIF
    | UserPoolPositionServerParamsIF
    | UserPoolLimitOrdersServerParamsIF;

export interface UserBalanceTokensServerParamsIF {
    user: string;
    chainId: string;
}

export interface LiquidityCurveServerParamsIF {
    chainId: string;
    base: string;
    quote: string;
    poolIdx: number;
}

export interface PoolCandleParamsServerIF {
    chainId: string;
    base: string;
    quote: string;
    poolIdx: number;
    period: number;
    n: number;
    time: number;
}

export interface PositionStatsServerParamsIF {
    chainId: string;
    base: string;
    quote: string;
    poolIdx: number;
    user: string;
    bidTick: number;
    askTick: number;
}

export interface LimitOrderStatsServerParamsIF
    extends PositionStatsServerParamsIF {
    isBid: boolean;
    pivotTime: number;
}
