// TODO: complete this when the real API is ready
export interface BlastPositionPointsServerIF {
    points: number;
    startBlock: number;
    endBlock: number;
}
export interface BlastPositionGoldServerIF {
    gold: number;
    startBlock: number;
    endBlock: number;
}

export interface BlastRewardsDataIF {
    points: string;
    gold: string;
}
