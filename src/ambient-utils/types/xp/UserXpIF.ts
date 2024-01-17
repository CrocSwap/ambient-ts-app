export interface XpSnapshotServerIF {
    addedPoints: number;
    retroPoints: number;
    cumulativePoints: number;
    snapshotUnixTime: number;
}

export interface UserXpServerIF {
    userAddress: string;
    leaderboardRank: number;
    recentPoints: number;
    totalPoints: number;
    pointsHistory: Array<XpSnapshotServerIF>;
}
export interface XpSnapshotIF {
    addedPoints: number;
    retroPoints: number;
    cumulativePoints: number;
    level: number;
    snapshotUnixTime: number;
}

export interface UserXpIF {
    userAddress: string;
    leaderboardRank: number;
    currentLevel: number;
    recentPoints: number;
    totalPoints: number;
    pointsRemainingToNextLevel: number;
    pointsHistory: Array<XpSnapshotIF>;
}
