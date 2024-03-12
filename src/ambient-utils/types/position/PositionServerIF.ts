export interface PositionServerIF {
    positionId: string;
    chainId: string;
    askTick: number;
    bidTick: number;
    poolIdx: number;
    base: string;
    quote: string;
    user: string;
    ambientLiq: number;
    concLiq: number;
    rewardLiq: number;
    positionType: string;
    timeFirstMint: number;
    lastMintTx: string;
    firstMintTx: string;
    aprEst: number;
}
