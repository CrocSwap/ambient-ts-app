export interface XpSnapshotServerIF {
    addedPoints: number;
    retroPoints: number;
    snapshotUnixTime: number;
    cumulativePoints?: number;
}

export interface UserXpServerIF {
    userAddress: string;
    globalPoints: number;
    globalRank?: number;
    weeklyPoints?: number;
    weeklyRank?: number;
    chainPoints?: number;
    chainRank?: number;
    chainId?: string;
    pointsHistory?: Array<XpSnapshotServerIF>;
}

export interface BlastUserXpServerIF {
    points: number;
    startBlock: number;
    endBlock: number;
}
export interface BlastUserGoldServerIF {
    points: number;
    startBlock: number;
    endBlock: number;
}

export interface BlastUserXpIF {
    points: string;
    gold: string;
}
export interface XpSnapshotIF {
    addedPoints: number;
    retroPoints: number;
    cumulativePoints?: number;
    level: number;
    snapshotUnixTime: number;
}

export interface UserXpIF {
    userAddress: string;
    globalPoints: number;
    globalRank?: number;
    weeklyPoints?: number;
    weeklyRank?: number;
    chainPoints?: number;
    chainRank?: number;
    chainId?: string;
    currentLevel: number;
    pointsRemainingToNextLevel: number;
    blastUserXp?: number;
    pointsHistory?: Array<XpSnapshotIF>;
}

export interface BlastXpIF {
    points: number;
}
