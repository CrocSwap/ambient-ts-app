export interface UserXpIF {
    userAddress: string;
    leaderboardRank: number;
    currentLevel: number;
    recentPoints: number;
    totalPoints: number;
    pointsRemainingToNextLevel: number;
    pointsHistory: [
        {
            addedPoints: number;
            cumulativePoints: number;
            level: number;
            snapshotUnixTime: number;
        },
        {
            addedPoints: number;
            cumulativePoints: number;
            level: number;
            snapshotUnixTime: number;
        },
        {
            addedPoints: number;
            cumulativePoints: number;
            level: number;
            snapshotUnixTime: number;
        },
    ];
}
