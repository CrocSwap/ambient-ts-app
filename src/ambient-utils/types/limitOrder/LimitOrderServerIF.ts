export interface LimitOrderServerIF {
    chainId: string;
    limitOrderId: string;
    pivotTime: number;
    askTick: number;
    bidTick: number;
    isBid: boolean;
    poolIdx: number;
    base: string;
    quote: string;
    user: string;
    concLiq: number;
    rewardLiq: number;
    claimableLiq: number;
    crossTime: number;
    latestUpdateTime: number;
}
