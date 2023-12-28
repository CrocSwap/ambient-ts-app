export interface xpSnapshot {
    addedPoints: number;
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
    pointsHistory: Array<xpSnapshot>;
}
