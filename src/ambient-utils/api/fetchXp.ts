import { UserXpIF, UserXpServerIF, XpSnapshotServerIF } from '../types';

interface argsIF {
    user: string;
}

// function to convert level to xp
export const levelToXp = (level: number) => {
    const xp = 250 * (level - 1) ** (3 / 2);
    return xp;
};

// function to convert xp to levels
export const xpToLevel = (xp: number) => {
    const level = Math.floor((xp / 250) ** (2 / 3)) + 1;
    return level;
};

// function to calculate points to next level
export const pointsToNextLevel = (xp: number) => {
    const nextLevel = xpToLevel(xp) + 1;
    const pointsToNextLevel = levelToXp(nextLevel) - xp;
    return pointsToNextLevel;
};

// function to calculate progress percentage to next level
export const progressToNextLevel = (xp: number) => {
    const level = xpToLevel(xp);
    const progressToNextLevel =
        ((xp - levelToXp(level)) / (levelToXp(level + 1) - levelToXp(level))) *
        100;

    return progressToNextLevel;
};

function mapUserXpResponseToUserXp(userXp: UserXpServerIF): UserXpIF {
    const currentLevel = xpToLevel(userXp.totalPoints);
    const pointsRemainingToNextLevel = pointsToNextLevel(userXp.totalPoints);

    const updatedPointsHistory = userXp.pointsHistory.map(
        (historyItem: XpSnapshotServerIF) => ({
            ...historyItem,
            level: xpToLevel(historyItem.cumulativePoints),
        }),
    );

    return {
        ...userXp,
        currentLevel,
        pointsRemainingToNextLevel,
        pointsHistory: updatedPointsHistory,
    };
}

export const fetchUserXpData = async (args: argsIF) => {
    const { user } = args;
    console.log(`Fetching Xp for ${user}`);

    // const userXpEndpoint = 'https://ambindexer.net/xp?'

    // const userXp = fetch(
    //     userXpEndpoint +
    //         new URLSearchParams({
    //             user: user,
    //         }),
    // )
    //     .then((response) => response?.json())
    //     .then((parsedResponse) => mapUserXpResponseToUserXp(parsedResponse))
    //     .catch(console.error);

    const userXpServerData: UserXpServerIF = {
        userAddress: user,
        leaderboardRank: 1,
        recentPoints: 4000000000000,
        totalPoints: 4000000005600,
        pointsHistory: [
            {
                addedPoints: 4000000000000,
                cumulativePoints: 4000000005600,
                snapshotUnixTime: 1704326400,
            },
            {
                addedPoints: 1100,
                cumulativePoints: 5600,
                snapshotUnixTime: 1703721600,
            },
            {
                addedPoints: 1500,
                cumulativePoints: 4500,
                snapshotUnixTime: 1703116800,
            },
            {
                addedPoints: 1800,
                cumulativePoints: 3000,
                snapshotUnixTime: 1702512000,
            },
            {
                addedPoints: 1000,
                cumulativePoints: 1200,
                snapshotUnixTime: 1701907200,
            },
            {
                addedPoints: 200,
                cumulativePoints: 200,
                snapshotUnixTime: 1701302400,
            },
        ],
    };
    const userXp = mapUserXpResponseToUserXp(userXpServerData);
    return userXp;
};

export const fetchXpLeadersData = async () => {
    console.log('Fetching Xp Leaders');

    // const userXpEndpoint = 'https://ambindexer.net/xp?'

    // const xpLeaders = fetch(
    //     xpLeadersEndpoint
    // )
    //     .then((response) => response?.json())

    //     .catch(console.error);

    const xpLeadersServerData: Array<UserXpServerIF> = [
        {
            userAddress: '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
            leaderboardRank: 1,
            recentPoints: 4000000000000,
            totalPoints: 4000000005600,
            pointsHistory: [
                {
                    addedPoints: 4000000000000,
                    cumulativePoints: 4000000005600,
                    snapshotUnixTime: 1704326400,
                },
                {
                    addedPoints: 1100,
                    cumulativePoints: 5600,
                    snapshotUnixTime: 1703721600,
                },
                {
                    addedPoints: 1800,
                    cumulativePoints: 3000,
                    snapshotUnixTime: 1702512000,
                },
                {
                    addedPoints: 1000,
                    cumulativePoints: 1200,
                    snapshotUnixTime: 1701907200,
                },
                {
                    addedPoints: 200,
                    cumulativePoints: 200,
                    snapshotUnixTime: 1701302400,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 2,
            recentPoints: 24000000,
            totalPoints: 25000000,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 2,
            recentPoints: 2400000,
            totalPoints: 2500000,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 2,
            recentPoints: 240000,
            totalPoints: 250000,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 2,
            recentPoints: 24000,
            totalPoints: 25000,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 2,
            recentPoints: 2400,
            totalPoints: 2500,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 2,
            recentPoints: 240,
            totalPoints: 250,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 2,
            recentPoints: 24,
            totalPoints: 25,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 2,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    cumulativePoints: 100,
                },
            ],
        },
    ];
    const xpLeaders = xpLeadersServerData.map((userXp) =>
        mapUserXpResponseToUserXp(userXp),
    );

    return xpLeaders;
};
