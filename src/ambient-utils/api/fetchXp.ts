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
    const currentLevel = xpToLevel(userXp.globalPoints);
    const pointsRemainingToNextLevel = pointsToNextLevel(userXp.globalPoints);

    const updatedPointsHistory = userXp.pointsHistory?.map(
        (historyItem: XpSnapshotServerIF) => ({
            ...historyItem,
            level: xpToLevel(historyItem.cumulativePoints),
        }),
    );

    return {
        ...userXp,
        currentLevel,
        pointsRemainingToNextLevel,
        pointsHistory: updatedPointsHistory || undefined,
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
        globalPoints: 400005600,
        globalRank: 1000,
        weeklyPoints: 4000,
        weeklyRank: 1,
        chainPoints: 40000,
        chainRank: 3,
        chainId: '0x1',
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
    leaderboardType: 'global' | 'byWeek' | 'byChain',
    chainId?: string,
) => {
    // const xpLeadersEndpoint = 'https://ambindexer.net/xp?';

    // const xpLeaders = fetch(
    //     xpLeadersEndpoint +
    //         new URLSearchParams({
    //             leaderboardType: leaderboardType,
    //             chainId: chainId || '',
    //         }),
    // )
    //     .then((response) => response?.json())

    //     .catch(console.error);

    const xpGlobalLeadersMockServerData: Array<UserXpServerIF> = [
        {
            userAddress: '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
            globalPoints: 4000000005600,
            globalRank: 1,
        },
        {
            userAddress: '0xe09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
            globalPoints: 2000000005600,
            globalRank: 2,
        },
        {
            userAddress: '0x17bB53328943952A5dF419cC5F1771128F8f1828',
            globalPoints: 250000000,
            globalRank: 3,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            globalPoints: 245000000,
            globalRank: 4,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226ac81757E090',
            globalPoints: 25500000,
            globalRank: 5,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            globalPoints: 2300000,
            globalRank: 6,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            globalPoints: 240000,
            globalRank: 7,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            globalPoints: 160000,
            globalRank: 8,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            globalPoints: 150000,
            globalRank: 9,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            globalPoints: 140000,
            globalRank: 10,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            globalPoints: 130000,
            globalRank: 11,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            globalPoints: 120000,
            globalRank: 12,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            globalPoints: 110000,
            globalRank: 13,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            globalPoints: 100000,
            globalRank: 14,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            globalPoints: 90000,
            globalRank: 15,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            globalPoints: 80000,
            globalRank: 16,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            globalPoints: 70000,
            globalRank: 17,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            globalPoints: 65000,
            globalRank: 18,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            globalPoints: 60000,
            globalRank: 19,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            globalPoints: 55000,
            globalRank: 20,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            globalPoints: 50000,
            globalRank: 21,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            globalPoints: 40000,
            globalRank: 22,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            globalPoints: 35000,
            globalRank: 23,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            globalPoints: 33000,
            globalRank: 24,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            globalPoints: 32000,
            globalRank: 25,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            globalPoints: 31000,
            globalRank: 26,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            globalPoints: 30000,
            globalRank: 27,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            globalPoints: 21000,
            globalRank: 28,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            globalPoints: 20000,
            globalRank: 29,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            globalPoints: 18000,
            globalRank: 30,
        },
    ];
    const xpWeeklyLeadersMockServerData: Array<UserXpServerIF> = [
        {
            userAddress: '0x17bB53328943952A5dF419cC5F1771128F8f1828',
            weeklyPoints: 10000,
            weeklyRank: 1,
            globalPoints: 4005600,
        },
        {
            userAddress: '0xe09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
            weeklyPoints: 5000,
            weeklyRank: 2,
            globalPoints: 40600,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            weeklyPoints: 2000,
            weeklyRank: 3,
            globalPoints: 100005600,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            weeklyPoints: 1900,
            weeklyRank: 4,
            globalPoints: 100600,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226ac81757E090',
            weeklyPoints: 1500,
            weeklyRank: 5,
            globalPoints: 205600,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            weeklyPoints: 1000,
            weeklyRank: 6,
            globalPoints: 4505600,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            weeklyPoints: 730,
            weeklyRank: 7,
            globalPoints: 4005600,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            weeklyPoints: 500,
            weeklyRank: 8,
            globalPoints: 4000005600,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            weeklyPoints: 400,
            weeklyRank: 9,
            globalPoints: 402305600,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            weeklyPoints: 300,
            weeklyRank: 10,
            globalPoints: 305600,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            weeklyPoints: 240,
            weeklyRank: 11,
            globalPoints: 4350005600,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            weeklyPoints: 24,
            weeklyRank: 12,
            globalPoints: 2005600,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            weeklyPoints: 24,
            weeklyRank: 13,
            globalPoints: 40000,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            weeklyPoints: 2,
            weeklyRank: 14,
            globalPoints: 40205600,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            weeklyPoints: 2,
            weeklyRank: 15,
            globalPoints: 4000305600,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            weeklyPoints: 2,
            weeklyRank: 16,
            globalPoints: 4030005600,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            weeklyPoints: 2,
            weeklyRank: 17,
            globalPoints: 4600,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            weeklyPoints: 2,
            weeklyRank: 18,
            globalPoints: 4000,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            weeklyPoints: 2,
            weeklyRank: 19,
            globalPoints: 4000000005600,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            weeklyPoints: 2,
            weeklyRank: 20,
            globalPoints: 5600,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            weeklyPoints: 2,
            weeklyRank: 21,
            globalPoints: 40600,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            weeklyPoints: 2,
            weeklyRank: 22,
            globalPoints: 4000,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            weeklyPoints: 2,
            weeklyRank: 23,
            globalPoints: 4000000005600,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            weeklyPoints: 2,
            weeklyRank: 24,
            globalPoints: 5600,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            weeklyPoints: 2,
            weeklyRank: 25,
            globalPoints: 4600,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            weeklyPoints: 2,
            weeklyRank: 26,
            globalPoints: 4005600,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            weeklyPoints: 2,
            weeklyRank: 27,
            globalPoints: 4000600,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            weeklyPoints: 2,
            weeklyRank: 28,
            globalPoints: 4000,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            weeklyPoints: 2,
            weeklyRank: 29,
            globalPoints: 4000,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            weeklyPoints: 2,
            weeklyRank: 30,
            globalPoints: 4000,
        },
    ];
    const xpChainLeadersMockServerData: Array<UserXpServerIF> = [
        {
            userAddress: '0x8a8b00B332c5eD50466e31FCCdd4dc2170b4F78f',
            chainPoints: 50000,
            chainRank: 1,
            chainId: chainId,
            globalPoints: 5000000,
        },
        {
            userAddress: '0xe09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
            chainPoints: 20000,
            chainRank: 2,
            chainId: chainId,
            globalPoints: 2000000,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            chainPoints: 15000,
            chainRank: 3,
            chainId: chainId,
            globalPoints: 1500000,
        },
        {
            userAddress: '0x17bB53328943952A5dF419cC5F1771128F8f1828',
            chainPoints: 14000,
            chainRank: 4,
            chainId: chainId,
            globalPoints: 2500000,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226ac81757E090',
            chainPoints: 13000,
            chainRank: 5,
            chainId: chainId,
            globalPoints: 3500000,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            chainPoints: 240,
            chainRank: 6,
            chainId: chainId,
            globalPoints: 400005600,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            chainPoints: 230,
            chainRank: 7,
            chainId: chainId,
            globalPoints: 20005600,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            chainPoints: 220,
            chainRank: 8,
            chainId: chainId,
            globalPoints: 205600,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            chainPoints: 210,
            chainRank: 9,
            chainId: chainId,
            globalPoints: 4005600,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            chainPoints: 200,
            chainRank: 10,
            chainId: chainId,
            globalPoints: 4030005600,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            chainPoints: 190,
            chainRank: 11,
            chainId: chainId,
            globalPoints: 4600,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            chainPoints: 180,
            chainRank: 12,
            chainId: chainId,
            globalPoints: 460,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            chainPoints: 170,
            chainRank: 13,
            chainId: chainId,
            globalPoints: 4000000005600,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            chainPoints: 160,
            chainRank: 14,
            chainId: chainId,
            globalPoints: 40000,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            chainPoints: 150,
            chainRank: 15,
            chainId: chainId,
            globalPoints: 400005600,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            chainPoints: 140,
            chainRank: 16,
            chainId: chainId,
            globalPoints: 40005600,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            chainPoints: 130,
            chainRank: 17,
            chainId: chainId,
            globalPoints: 4005600,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            chainPoints: 120,
            chainRank: 18,
            chainId: chainId,
            globalPoints: 23433,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            chainPoints: 110,
            chainRank: 19,
            chainId: chainId,
            globalPoints: 346346,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            chainPoints: 100,
            chainRank: 20,
            chainId: chainId,
            globalPoints: 1234223,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            chainPoints: 90,
            chainRank: 21,
            chainId: chainId,
            globalPoints: 232,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            chainPoints: 80,
            chainRank: 22,
            chainId: chainId,
            globalPoints: 3323,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            chainPoints: 70,
            chainRank: 23,
            chainId: chainId,
            globalPoints: 4433,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            chainPoints: 60,
            chainRank: 24,
            chainId: chainId,
            globalPoints: 323,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            chainPoints: 50,
            chainRank: 25,
            chainId: chainId,
            globalPoints: 2322,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            chainPoints: 40,
            chainRank: 26,
            chainId: chainId,
            globalPoints: 644,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            chainPoints: 30,
            chainRank: 27,
            chainId: chainId,
            globalPoints: 112,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            chainPoints: 20,
            chainRank: 28,
            chainId: chainId,
            globalPoints: 235,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            chainPoints: 10,
            chainRank: 29,
            chainId: chainId,
            globalPoints: 323,
        },
        {
            userAddress: '0xa86dabFBb529a4C8186BdD52bd226aC81757E090',
            chainPoints: 1,
            chainRank: 30,
            chainId: chainId,
            globalPoints: 663,
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
