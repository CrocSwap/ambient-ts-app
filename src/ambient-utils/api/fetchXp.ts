import { UserXpIF } from '../types';

interface argsIF {
    user: string;
}

// function to convert level to xp
export const levelToXp = (level: number) => {
    const xp = 250 * level ** (3 / 2);
    return xp;
};

// function to convert xp to levels
export const xpToLevel = (xp: number) => {
    const level = Math.floor((xp / 250) ** (2 / 3));
    return level;
};

// function to calculate points to next level
export const pointsToNextLevel = (xp: number) => {
    const level = xpToLevel(xp);
    const pointsToNextLevel = 250 * (level + 1) ** (3 / 2) - xp;
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
        currentLevel: xpToLevel(4000000005600),
        recentPoints: 4000000000000,
        totalPoints: 4000000005600,
        pointsRemainingToNextLevel: pointsToNextLevel(4000000005600),
        pointsHistory: [
            {
                addedPoints: 4000000000000,
                cumulativePoints: 4000000005600,
                level: xpToLevel(4000000005600),
                snapshotUnixTime: 1704326400,
            },
            {
                addedPoints: 1100,
                cumulativePoints: 5600,
                level: xpToLevel(5600),
                snapshotUnixTime: 1703721600,
            },
            {
                addedPoints: 1500,
                cumulativePoints: 4500,
                level: xpToLevel(5600),
                snapshotUnixTime: 1703116800,
            },
            {
                addedPoints: 1800,
                cumulativePoints: 3000,
                level: xpToLevel(3000),
                snapshotUnixTime: 1702512000,
            },
            {
                addedPoints: 1000,
                cumulativePoints: 1200,
                level: xpToLevel(1200),
                snapshotUnixTime: 1701907200,
            },
            {
                addedPoints: 200,
                cumulativePoints: 200,
                level: xpToLevel(200),
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
            currentLevel: xpToLevel(2000000005600),
            recentPoints: 4000000000000,
            totalPoints: 4000000005600,
            pointsRemainingToNextLevel: pointsToNextLevel(4000000005600),
            pointsHistory: [
                {
                    addedPoints: 4000000000000,
                    cumulativePoints: 4000000005600,
                    level: xpToLevel(4000000005600),
                    snapshotUnixTime: 1704326400,
                },
                {
                    addedPoints: 1100,
                    cumulativePoints: 5600,
                    level: xpToLevel(5),
                    snapshotUnixTime: 1703721600,
                },
                {
                    addedPoints: 1800,
                    cumulativePoints: 3000,
                    level: xpToLevel(4),
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
            pointsRemainingToNextLevel: pointsToNextLevel(2500),
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
