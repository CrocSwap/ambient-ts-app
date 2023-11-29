export interface TransactionServerIF {
    block: number;
    chainId: string;
    inBaseQty: boolean;
    isBuy: boolean;
    poolIdx: number;
    base: string;
    quote: string;
    baseFlow: number;
    quoteFlow: number;
    entityType: string;
    changeType: string;
    positionType: string;
    txTime: number;
    txHash: string;
    user: string;
    limitPrice: number;
    bidTick: number;
    askTick: number;
    txId: string;
}
