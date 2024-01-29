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

    const userXpServerMockData: UserXpServerIF = {
        userAddress: user,
        leaderboardRank: 1,
        recentPoints: 40000,
        totalPoints: 4000000005600,
        pointsHistory: [
            {
                addedPoints: 10000,
                retroPoints: 2000,
                cumulativePoints: 4000000005600,
                snapshotUnixTime: 1705449600,
            },
            {
                addedPoints: 40000,
                retroPoints: 2500,
                cumulativePoints: 4000000005600,
                snapshotUnixTime: 1704931200,
            },
            {
                addedPoints: 40000,
                retroPoints: 2500,
                cumulativePoints: 4000000005600,
                snapshotUnixTime: 1704326400,
            },
            {
                addedPoints: 1100,
                retroPoints: 500,
                cumulativePoints: 5600,
                snapshotUnixTime: 1703721600,
            },
            {
                addedPoints: 1500,
                retroPoints: 0,
                cumulativePoints: 4500,
                snapshotUnixTime: 1703116800,
            },
            {
                addedPoints: 1800,
                retroPoints: 0,
                cumulativePoints: 3000,
                snapshotUnixTime: 1702512000,
            },
            {
                addedPoints: 1000,
                retroPoints: 0,
                cumulativePoints: 1200,
                snapshotUnixTime: 1701907200,
            },
            {
                addedPoints: 200,
                retroPoints: 0,
                cumulativePoints: 200,
                snapshotUnixTime: 1701302400,
            },
        ],
    };
    const userXp = mapUserXpResponseToUserXp(userXpServerMockData);
    return userXp;
};

export const fetchXpLeadersData = async (
    leaderboardType: string,
    chain?: string,
) => {
    console.log('Fetching Xp Leaders');
    console.log({ chain });

    // const userXpEndpoint = 'https://ambindexer.net/xp?'

    // const xpLeaders = fetch(
    //     xpLeadersEndpoint
    // )
    //     .then((response) => response?.json())

    //     .catch(console.error);

    const xpGlobalLeadersMockServerData: Array<UserXpServerIF> = [
        {
            userAddress: '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
            leaderboardRank: 1,
            recentPoints: 4000000000000,
            totalPoints: 4000000005600,
            pointsHistory: [
                {
                    addedPoints: 4000000000000,
                    retroPoints: 500,
                    cumulativePoints: 4000000005600,
                    snapshotUnixTime: 1704326400,
                },
                {
                    addedPoints: 1100,
                    retroPoints: 200,
                    cumulativePoints: 5600,
                    snapshotUnixTime: 1703721600,
                },
                {
                    addedPoints: 1800,
                    retroPoints: 0,
                    cumulativePoints: 3000,
                    snapshotUnixTime: 1702512000,
                },
                {
                    addedPoints: 1000,
                    retroPoints: 0,
                    cumulativePoints: 1200,
                    snapshotUnixTime: 1701907200,
                },
                {
                    addedPoints: 200,
                    retroPoints: 0,
                    cumulativePoints: 200,
                    snapshotUnixTime: 1701302400,
                },
            ],
        },
        {
            userAddress: '0xe09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
            leaderboardRank: 2,
            recentPoints: 2000000000000,
            totalPoints: 2000000005600,
            pointsHistory: [
                {
                    addedPoints: 2000000000000,
                    retroPoints: 0,
                    cumulativePoints: 2000000005600,
                    snapshotUnixTime: 1704326400,
                },
                {
                    addedPoints: 1100,
                    retroPoints: 0,
                    cumulativePoints: 5600,
                    snapshotUnixTime: 1703721600,
                },
                {
                    addedPoints: 1800,
                    retroPoints: 0,
                    cumulativePoints: 3000,
                    snapshotUnixTime: 1702512000,
                },
                {
                    addedPoints: 1000,
                    retroPoints: 0,
                    cumulativePoints: 1200,
                    snapshotUnixTime: 1701907200,
                },
                {
                    addedPoints: 200,
                    retroPoints: 0,
                    cumulativePoints: 200,
                    snapshotUnixTime: 1701302400,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 3,
            recentPoints: 24000000,
            totalPoints: 25000000,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    retroPoints: 20,
                    addedPoints: 2400,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    retroPoints: 25,
                    addedPoints: 100,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 4,
            recentPoints: 23000000,
            totalPoints: 24000000,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226ac81757E090',
            leaderboardRank: 5,
            recentPoints: 2400000,
            totalPoints: 2500000,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 6,
            recentPoints: 240000,
            totalPoints: 250000,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 6,
            recentPoints: 220000,
            totalPoints: 230000,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 7,
            recentPoints: 24000,
            totalPoints: 25000,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 8,
            recentPoints: 16000,
            totalPoints: 17000,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 9,
            recentPoints: 2400,
            totalPoints: 2500,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 10,
            recentPoints: 2400,
            totalPoints: 2500,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 11,
            recentPoints: 240,
            totalPoints: 250,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 12,
            recentPoints: 24,
            totalPoints: 25,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 13,
            recentPoints: 24,
            totalPoints: 25,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 14,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 15,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 16,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 17,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 18,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 19,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 20,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 21,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 22,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 23,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 24,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 25,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 26,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 27,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 28,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 29,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 30,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
    ];
    const xpWeeklyLeadersMockServerData: Array<UserXpServerIF> = [
        {
            userAddress: '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
            leaderboardRank: 1,
            recentPoints: 1000000000000,
            totalPoints: 1000000005600,
            pointsHistory: [
                {
                    addedPoints: 1000000000000,
                    retroPoints: 500,
                    cumulativePoints: 1000000005600,
                    snapshotUnixTime: 1704326400,
                },
                {
                    addedPoints: 1100,
                    retroPoints: 200,
                    cumulativePoints: 5600,
                    snapshotUnixTime: 1703721600,
                },
                {
                    addedPoints: 1800,
                    retroPoints: 0,
                    cumulativePoints: 3000,
                    snapshotUnixTime: 1702512000,
                },
                {
                    addedPoints: 1000,
                    retroPoints: 0,
                    cumulativePoints: 1200,
                    snapshotUnixTime: 1701907200,
                },
                {
                    addedPoints: 200,
                    retroPoints: 0,
                    cumulativePoints: 200,
                    snapshotUnixTime: 1701302400,
                },
            ],
        },
        {
            userAddress: '0xe09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
            leaderboardRank: 2,
            recentPoints: 2000000000000,
            totalPoints: 2000000005600,
            pointsHistory: [
                {
                    addedPoints: 2000000000000,
                    retroPoints: 0,
                    cumulativePoints: 2000000005600,
                    snapshotUnixTime: 1704326400,
                },
                {
                    addedPoints: 1100,
                    retroPoints: 0,
                    cumulativePoints: 5600,
                    snapshotUnixTime: 1703721600,
                },
                {
                    addedPoints: 1800,
                    retroPoints: 0,
                    cumulativePoints: 3000,
                    snapshotUnixTime: 1702512000,
                },
                {
                    addedPoints: 1000,
                    retroPoints: 0,
                    cumulativePoints: 1200,
                    snapshotUnixTime: 1701907200,
                },
                {
                    addedPoints: 200,
                    retroPoints: 0,
                    cumulativePoints: 200,
                    snapshotUnixTime: 1701302400,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 3,
            recentPoints: 24000000,
            totalPoints: 25000000,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    retroPoints: 20,
                    addedPoints: 2400,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    retroPoints: 25,
                    addedPoints: 100,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 4,
            recentPoints: 23000000,
            totalPoints: 24000000,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226ac81757E090',
            leaderboardRank: 5,
            recentPoints: 2400000,
            totalPoints: 2500000,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 6,
            recentPoints: 240000,
            totalPoints: 250000,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 6,
            recentPoints: 220000,
            totalPoints: 230000,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 7,
            recentPoints: 24000,
            totalPoints: 25000,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 8,
            recentPoints: 16000,
            totalPoints: 17000,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 9,
            recentPoints: 2400,
            totalPoints: 2500,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 10,
            recentPoints: 2400,
            totalPoints: 2500,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 11,
            recentPoints: 240,
            totalPoints: 250,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 12,
            recentPoints: 24,
            totalPoints: 25,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 13,
            recentPoints: 24,
            totalPoints: 25,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 14,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 15,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 16,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 17,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 18,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 19,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 20,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 21,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 22,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 23,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 24,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 25,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 26,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 27,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 28,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 29,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 30,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
    ];
    const xpChainLeadersMockServerData: Array<UserXpServerIF> = [
        {
            userAddress: '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
            leaderboardRank: 1,
            recentPoints: 5000000000000,
            totalPoints: 5000000005600,
            pointsHistory: [
                {
                    addedPoints: 5000000000000,
                    retroPoints: 500,
                    cumulativePoints: 5000000005600,
                    snapshotUnixTime: 1704326400,
                },
                {
                    addedPoints: 1100,
                    retroPoints: 200,
                    cumulativePoints: 5600,
                    snapshotUnixTime: 1703721600,
                },
                {
                    addedPoints: 1800,
                    retroPoints: 0,
                    cumulativePoints: 3000,
                    snapshotUnixTime: 1702512000,
                },
                {
                    addedPoints: 1000,
                    retroPoints: 0,
                    cumulativePoints: 1200,
                    snapshotUnixTime: 1701907200,
                },
                {
                    addedPoints: 200,
                    retroPoints: 0,
                    cumulativePoints: 200,
                    snapshotUnixTime: 1701302400,
                },
            ],
        },
        {
            userAddress: '0xe09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
            leaderboardRank: 2,
            recentPoints: 2000000000000,
            totalPoints: 2000000005600,
            pointsHistory: [
                {
                    addedPoints: 2000000000000,
                    retroPoints: 0,
                    cumulativePoints: 2000000005600,
                    snapshotUnixTime: 1704326400,
                },
                {
                    addedPoints: 1100,
                    retroPoints: 0,
                    cumulativePoints: 5600,
                    snapshotUnixTime: 1703721600,
                },
                {
                    addedPoints: 1800,
                    retroPoints: 0,
                    cumulativePoints: 3000,
                    snapshotUnixTime: 1702512000,
                },
                {
                    addedPoints: 1000,
                    retroPoints: 0,
                    cumulativePoints: 1200,
                    snapshotUnixTime: 1701907200,
                },
                {
                    addedPoints: 200,
                    retroPoints: 0,
                    cumulativePoints: 200,
                    snapshotUnixTime: 1701302400,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 3,
            recentPoints: 24000000,
            totalPoints: 25000000,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    retroPoints: 20,
                    addedPoints: 2400,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    retroPoints: 25,
                    addedPoints: 100,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 4,
            recentPoints: 23000000,
            totalPoints: 24000000,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226ac81757E090',
            leaderboardRank: 5,
            recentPoints: 2400000,
            totalPoints: 2500000,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 6,
            recentPoints: 240000,
            totalPoints: 250000,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 6,
            recentPoints: 220000,
            totalPoints: 230000,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 7,
            recentPoints: 24000,
            totalPoints: 25000,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 8,
            recentPoints: 16000,
            totalPoints: 17000,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 9,
            recentPoints: 2400,
            totalPoints: 2500,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 10,
            recentPoints: 2400,
            totalPoints: 2500,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 11,
            recentPoints: 240,
            totalPoints: 250,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 12,
            recentPoints: 24,
            totalPoints: 25,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 13,
            recentPoints: 24,
            totalPoints: 25,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 14,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 15,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 16,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 17,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 18,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 19,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 20,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 21,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 22,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 23,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 24,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 25,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 26,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 27,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 28,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 29,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 30,
            recentPoints: 2,
            totalPoints: 2,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    retroPoints: 0,
                    cumulativePoints: 2500,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    retroPoints: 0,
                    cumulativePoints: 100,
                },
            ],
        },
    ];

    const xpLeaders =
        leaderboardType === 'byWeek'
            ? xpWeeklyLeadersMockServerData.map((userXp) =>
                  mapUserXpResponseToUserXp(userXp),
              )
            : leaderboardType === 'byChain'
            ? xpChainLeadersMockServerData.map((userXp) =>
                  mapUserXpResponseToUserXp(userXp),
              )
            : xpGlobalLeadersMockServerData.map((userXp) =>
                  mapUserXpResponseToUserXp(userXp),
              );

    return xpLeaders;
};
