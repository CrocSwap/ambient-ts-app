import { UserXpIF } from '../types';

interface argsIF {
    user: string;
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

    //     .catch(console.error);

    const userXp: UserXpIF = {
        userAddress: user,
        leaderboardRank: 1,
        currentLevel:
            user.toLowerCase() ===
            '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc'.toLowerCase()
                ? 4
                : 5,
        recentPoints: 2000000000000,
        totalPoints: 2000000005600,
        pointsRemainingToNextLevel: 400,
        pointsHistory: [
            {
                addedPoints: 2000000000000,
                cumulativePoints: 2000000005600,
                level: 5,
                snapshotUnixTime: 1704326400,
            },
            {
                addedPoints: 1100,
                cumulativePoints: 5600,
                level: 5,
                snapshotUnixTime: 1703721600,
            },
            {
                addedPoints: 1500,
                cumulativePoints: 4500,
                level: 5,
                snapshotUnixTime: 1703116800,
            },
            {
                addedPoints: 1800,
                cumulativePoints: 3000,
                level: 4,
                snapshotUnixTime: 1702512000,
            },
            {
                addedPoints: 1000,
                cumulativePoints: 1200,
                level: 2,
                snapshotUnixTime: 1701907200,
            },
            {
                addedPoints: 200,
                cumulativePoints: 200,
                level: 1,
                snapshotUnixTime: 1701302400,
            },
        ],
    };
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

    const xpLeaders: Array<UserXpIF> = [
        {
            userAddress: '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
            leaderboardRank: 1,
            currentLevel: 4,
            recentPoints: 2000000000000,
            totalPoints: 2000000005600,
            pointsRemainingToNextLevel: 1000,
            pointsHistory: [
                {
                    addedPoints: 2000000000000,
                    cumulativePoints: 2000000005600,
                    level: 5,
                    snapshotUnixTime: 1704326400,
                },
                {
                    addedPoints: 1100,
                    cumulativePoints: 5600,
                    level: 5,
                    snapshotUnixTime: 1703721600,
                },
                {
                    addedPoints: 1800,
                    cumulativePoints: 3000,
                    level: 4,
                    snapshotUnixTime: 1702512000,
                },
                {
                    addedPoints: 1000,
                    cumulativePoints: 1200,
                    level: 2,
                    snapshotUnixTime: 1701907200,
                },
                {
                    addedPoints: 200,
                    cumulativePoints: 200,
                    level: 1,
                    snapshotUnixTime: 1701302400,
                },
            ],
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            leaderboardRank: 2,
            currentLevel: 3,
            recentPoints: 2400,
            totalPoints: 2500,
            pointsRemainingToNextLevel: 500,
            pointsHistory: [
                {
                    snapshotUnixTime: 1702512000,
                    addedPoints: 2400,
                    cumulativePoints: 2500,
                    level: 3,
                },
                {
                    snapshotUnixTime: 1701302400,
                    addedPoints: 100,
                    cumulativePoints: 100,
                    level: 1,
                },
            ],
        },
    ];
    return xpLeaders;
};
