import { USE_MOCK_XP_DATA } from '../constants';
import { UserXpIF, UserXpServerIF, XpSnapshotServerIF } from '../types';

interface argsIF {
    user: string;
    chainId: string;
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
            level: historyItem.cumulativePoints
                ? xpToLevel(historyItem.cumulativePoints)
                : 0,
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
    const { user, chainId } = args;
    console.log(`Fetching Xp for ${user} on chain ${chainId}...`);

    const userXpEndpoint = 'https://ambindexer.bus.bz/xp/user?';

    const userXpFetchData = fetch(
        userXpEndpoint +
            new URLSearchParams({
                user: user,
                chainId: chainId || '',
            }),
    )
        .then((response) => response?.json())
        .then((parsedResponse) =>
            mapUserXpResponseToUserXp(parsedResponse.data),
        )
        .catch(console.error);

    // fake user data
    const userXpMockData: UserXpServerIF = {
        userAddress: user,
        globalPoints: 60518,
        globalRank: 7,
        weeklyPoints: 2252,
        weeklyRank: 9,
        chainPoints: 58517,
        chainRank: 7,
        chainId: '0x1',
        pointsHistory: [
            {
                addedPoints: 2252,
                cumulativePoints: 60518,
                retroPoints: 350,
                snapshotUnixTime: 1706832000,
            },
            {
                addedPoints: 2227,
                cumulativePoints: 57916,
                retroPoints: 275,
                snapshotUnixTime: 1706227200,
            },
            {
                addedPoints: 2319,
                cumulativePoints: 55414,
                retroPoints: 481,
                snapshotUnixTime: 1705622400,
            },
            {
                addedPoints: 2343,
                cumulativePoints: 52614,
                retroPoints: 827,
                snapshotUnixTime: 1705017600,
            },
            {
                addedPoints: 2298,
                cumulativePoints: 49444,
                retroPoints: 1372,
                snapshotUnixTime: 1704412800,
            },
            {
                addedPoints: 2281,
                cumulativePoints: 45774,
                retroPoints: 2153,
                snapshotUnixTime: 1703808000,
            },
            {
                addedPoints: 2189,
                cumulativePoints: 41340,
                retroPoints: 3091,
                snapshotUnixTime: 1703203200,
            },
            {
                addedPoints: 2230,
                cumulativePoints: 36060,
                retroPoints: 3923,
                snapshotUnixTime: 1702598400,
            },
            {
                addedPoints: 2063,
                cumulativePoints: 29907,
                retroPoints: 4264,
                snapshotUnixTime: 1701993600,
            },
            {
                addedPoints: 1944,
                cumulativePoints: 23580,
                retroPoints: 3923,
                snapshotUnixTime: 1701388800,
            },
            {
                addedPoints: 2037,
                cumulativePoints: 17713,
                retroPoints: 3091,
                snapshotUnixTime: 1700784000,
            },
            {
                addedPoints: 1387,
                cumulativePoints: 12585,
                retroPoints: 2153,
                snapshotUnixTime: 1700179200,
            },
            {
                addedPoints: 1444,
                cumulativePoints: 9045,
                retroPoints: 1372,
                snapshotUnixTime: 1699574400,
            },
            {
                addedPoints: 74,
                cumulativePoints: 6229,
                retroPoints: 827,
                snapshotUnixTime: 1698969600,
            },
            {
                addedPoints: 1031,
                cumulativePoints: 5328,
                retroPoints: 481,
                snapshotUnixTime: 1698364800,
            },
            {
                addedPoints: 1653,
                cumulativePoints: 3816,
                retroPoints: 275,
                snapshotUnixTime: 1697760000,
            },
            {
                addedPoints: 1538,
                cumulativePoints: 1888,
                retroPoints: 350,
                snapshotUnixTime: 1697155200,
            },
        ],
    };

    const userXp = USE_MOCK_XP_DATA
        ? mapUserXpResponseToUserXp(userXpMockData)
        : userXpFetchData;
    return userXp;
};

export const fetchXpLeadersData = async (
    leaderboardType: 'global' | 'byWeek' | 'byChain',
    chainId?: string,
) => {
    console.log({ chainId });

    const xpLeadersEndpoint = 'https://ambindexer.bus.bz/xp/leaderboard?';

    const xpLeaderFetchData = fetch(
        xpLeadersEndpoint +
            new URLSearchParams({
                leaderboardType: leaderboardType,
                chainId: chainId || '',
            }),
    )
        .then((response) => response?.json())
        .then((parsedResponse) =>
            parsedResponse.data.map((userXp: UserXpIF) =>
                mapUserXpResponseToUserXp(userXp),
            ),
        )
        .catch(console.error);

    // fake data
    const xpGlobalLeadersMockServerData: Array<UserXpServerIF> = [
        {
            userAddress: '0xabc123f5d8314e0f0056c11f4d1b1234c3abc123',
            globalPoints: 178218,
            globalRank: 1,
        },
        {
            userAddress: 'vitalik.eth',
            globalPoints: 122794,
            globalRank: 2,
        },
        {
            userAddress: '0xac1234e1923456bfb2c960bb767ce383cd63ab3a',
            globalPoints: 114102,
            globalRank: 3,
        },
        {
            userAddress: 'gavinw.eth',
            globalPoints: 68883,
            globalRank: 4,
        },
        {
            userAddress: '0xb41e266bf546f313483dc6629bdb90fc52cbd6ac',
            globalPoints: 65279,
            globalRank: 5,
        },
        {
            userAddress: '0xabc.eth',
            globalPoints: 62637,
            globalRank: 6,
        },
        {
            userAddress: '0x1ab2f23e5df2de6f1474222d49c02cc4f1cc2b3a',
            globalPoints: 60518,
            globalRank: 7,
        },
        {
            userAddress: 'harvest.eth',
            globalPoints: 54984,
            globalRank: 8,
        },
        {
            userAddress: '0x9f165ce53c4a97165ab0c83c4d796f79a8f93cf8',
            globalPoints: 54172,
            globalRank: 9,
        },
        {
            userAddress: '0x1234.eth',
            globalPoints: 52299,
            globalRank: 10,
        },
        {
            userAddress: '0x43398af8653fe5b8acd12cc10cf645ed67258a23',
            globalPoints: 23461,
            globalRank: 11,
        },
        {
            userAddress: '0x42.eth',
            globalPoints: 19614,
            globalRank: 12,
        },
        {
            userAddress: '0x8cabc91193d9df2ac0bfe90191d40f23c773c171',
            globalPoints: 17659,
            globalRank: 13,
        },
        {
            userAddress: '0x6969.eth',
            globalPoints: 17141,
            globalRank: 14,
        },
        {
            userAddress: '0xbbcd2ef6cee3f5dd6b5ea118b44d9fd41af8b3a2',
            globalPoints: 16350,
            globalRank: 15,
        },
        {
            userAddress: '0x20487c28f296d3b2dab56e3f5d1aca1388f2bc6e',
            globalPoints: 14969,
            globalRank: 16,
        },
        {
            userAddress: '0x4218868b1cc5374951eb63724342c7a875595028',
            globalPoints: 13930,
            globalRank: 17,
        },
        {
            userAddress: '0x2b667303b207c6d906a8fcc380a2c307ece7021e',
            globalPoints: 13889,
            globalRank: 18,
        },
        {
            userAddress: '0x4bdde1a1e0f199b0252e593a422b9340af03086b',
            globalPoints: 13744,
            globalRank: 19,
        },
        {
            userAddress: '0xeef388d3444ae5596deaa817c50cd09d79ae6770',
            globalPoints: 13383,
            globalRank: 20,
        },
        {
            userAddress: '0xbf964bac8a438e7e498c2e5fccf0f174c3e3f7bd',
            globalPoints: 13178,
            globalRank: 21,
        },
        {
            userAddress: '0x158c3a2005499301dc353afa9d0c9c5980b5277a',
            globalPoints: 13076,
            globalRank: 22,
        },
        {
            userAddress: '0x27ef5b25c3cc65d07d09d025a514ab1af9ba2542',
            globalPoints: 12823,
            globalRank: 23,
        },
        {
            userAddress: '0x44b1490a1878d0b61811726e2cb96560022e732e',
            globalPoints: 12460,
            globalRank: 24,
        },
        {
            userAddress: '0x7cb110db7029197c3621bea8092ab1996d5dd6ca',
            globalPoints: 12332,
            globalRank: 25,
        },
        {
            userAddress: '0x69a439584ef1ba300106b9c16543eaa1de676ab1',
            globalPoints: 11059,
            globalRank: 26,
        },
        {
            userAddress: '0xb49cdb63c943e9481c9b87db5c80f5ac333d164d4',
            globalPoints: 10452,
            globalRank: 27,
        },
        {
            userAddress: '0x22e67fa925877813b744abc0917900c2b1d6ec92',
            globalPoints: 9776,
            globalRank: 28,
        },
        {
            userAddress: '0x32107bdd0b6b1daa5bd98c0c8c2ebdef65f63b4c',
            globalPoints: 9642,
            globalRank: 29,
        },
        {
            userAddress: '0x2188503a90c3224f0e6be7c124a337888c0ba453',
            globalPoints: 8412,
            globalRank: 30,
        },
    ];

    // fake data
    const xpWeeklyLeadersMockServerData: Array<UserXpServerIF> = [
        {
            userAddress: 'gavinw.eth',
            weeklyPoints: 21282,
            weeklyRank: 1,
            globalPoints: 68883,
        },
        {
            userAddress: '0xabc123f5d8314e0f0056c11f4d1b1234c3abc123',
            weeklyPoints: 17379,
            weeklyRank: 2,
            globalPoints: 178218,
        },
        {
            userAddress: 'vitalik.eth',
            weeklyPoints: 13967,
            weeklyRank: 3,
            globalPoints: 122794,
        },
        {
            userAddress: '0xac1234e1923456bfb2c960bb767ce383cd63ab3a',
            weeklyPoints: 12729,
            weeklyRank: 4,
            globalPoints: 114102,
        },
        {
            userAddress: '0xb41e266bf546f313483dc6629bdb90fc52cbd6ac',
            weeklyPoints: 8517,
            weeklyRank: 5,
            globalPoints: 65279,
        },
        {
            userAddress: 'harvest.eth',
            weeklyPoints: 7119,
            weeklyRank: 6,
            globalPoints: 54984,
        },
        {
            userAddress: '0x9f165ce53c4a97165ab0c83c4d796f79a8f93cf8',
            weeklyPoints: 2584,
            weeklyRank: 7,
            globalPoints: 54172,
        },
        {
            userAddress: '0xabc.eth',
            weeklyPoints: 2256,
            weeklyRank: 8,
            globalPoints: 62637,
        },
        {
            userAddress: '0x1ab2f23e5df2de6f1474222d49c02cc4f1cc2b3a',
            weeklyPoints: 2252,
            weeklyRank: 9,
            globalPoints: 60518,
        },
        {
            userAddress: '0x1234.eth',
            weeklyPoints: 2212,
            weeklyRank: 10,
            globalPoints: 52299,
        },
        {
            userAddress: '0x43398af8653fe5b8acd12cc10cf645ed67258a23',
            weeklyPoints: 1879,
            weeklyRank: 11,
            globalPoints: 23461,
        },
        {
            userAddress: '0x42.eth',
            weeklyPoints: 1524,
            weeklyRank: 12,
            globalPoints: 19614,
        },
        {
            userAddress: '0x8cabc91193d9df2ac0bfe90191d40f23c773c171',
            weeklyPoints: 1454,
            weeklyRank: 13,
            globalPoints: 17659,
        },
        {
            userAddress: '0x6969.eth',
            weeklyPoints: 1437,
            weeklyRank: 14,
            globalPoints: 17141,
        },
        {
            userAddress: '0xbbcd2ef6cee3f5dd6b5ea118b44d9fd41af8b3a2',
            weeklyPoints: 1193,
            weeklyRank: 15,
            globalPoints: 1193,
        },
        {
            userAddress: '0x20487c28f296d3b2dab56e3f5d1aca1388f2bc6e',
            weeklyPoints: 1089,
            weeklyRank: 16,
            globalPoints: 1525,
        },
        {
            userAddress: '0x2b667303b207c6d906a8fcc380a2c307ece7021e',
            weeklyPoints: 1001,
            weeklyRank: 17,
            globalPoints: 17141,
        },
        {
            userAddress: '0x4218868b1cc5374951eb63724342c7a875595028',
            weeklyPoints: 910,
            weeklyRank: 18,
            globalPoints: 5807,
        },
        {
            userAddress: '0x4bdde1a1e0f199b0252e593a422b9340af03086b',
            weeklyPoints: 831,
            weeklyRank: 19,
            globalPoints: 1048,
        },
        {
            userAddress: '0xbf964bac8a438e7e498c2e5fccf0f174c3e3f7bd',
            weeklyPoints: 690,
            weeklyRank: 20,
            globalPoints: 13178,
        },
        {
            userAddress: '0x2b667303b207c6d906a8fcc380a2c307ece7021e',
            weeklyPoints: 689,
            weeklyRank: 21,
            globalPoints: 3106,
        },
        {
            userAddress: '0xeef388d3444ae5596deaa817c50cd09d79ae6770',
            weeklyPoints: 673,
            weeklyRank: 22,
            globalPoints: 7272,
        },
        {
            userAddress: '0x158c3a2005499301dc353afa9d0c9c5980b5277a',
            weeklyPoints: 573,
            weeklyRank: 23,
            globalPoints: 12332,
        },
        {
            userAddress: '0x69a439584ef1ba300106b9c16543eaa1de676ab1',
            weeklyPoints: 558,
            weeklyRank: 24,
            globalPoints: 12460,
        },
        {
            userAddress: '0x7cb110db7029197c3621bea8092ab1996d5dd6ca',
            weeklyPoints: 544,
            weeklyRank: 25,
            globalPoints: 4371,
        },
        {
            userAddress: '0x44b1490a1878d0b61811726e2cb96560022e732e',
            weeklyPoints: 497,
            weeklyRank: 26,
            globalPoints: 13076,
        },
        {
            userAddress: '0x22e67fa925877813b744abc0917900c2b1d6ec92',
            weeklyPoints: 492,
            weeklyRank: 27,
            globalPoints: 19614,
        },
        {
            userAddress: '0x32107bdd0b6b1daa5bd98c0c8c2ebdef65f63b4c',
            weeklyPoints: 474,
            weeklyRank: 28,
            globalPoints: 7164,
        },
        {
            userAddress: '0x2188503a90c3224f0e6be7c124a337888c0ba453',
            weeklyPoints: 435,
            weeklyRank: 29,
            globalPoints: 7900,
        },
        {
            userAddress: '0xb49cdb63c943e9481c9b87db5c80f5ac333d164d4',
            weeklyPoints: 399,
            weeklyRank: 30,
            globalPoints: 798,
        },
    ];

    // fake data
    const xpChainLeadersMockServerData: Array<UserXpServerIF> = [
        {
            userAddress: 'vitalik.eth',
            chainPoints: 178218,
            chainRank: 1,
            chainId: '0x1',
            globalPoints: 122794,
        },
        {
            userAddress: '0xabc123f5d8314e0f0056c11f4d1b1234c3abc123',
            chainPoints: 122794,
            chainRank: 2,
            chainId: '0x1',
            globalPoints: 178218,
        },
        {
            userAddress: 'gavinw.eth',
            chainPoints: 114102,
            chainRank: 3,
            chainId: '0x1',
            globalPoints: 68883,
        },
        {
            userAddress: '0xac1234e1923456bfb2c960bb767ce383cd63ab3a',
            chainPoints: 68883,
            chainRank: 4,
            chainId: '0x1',
            globalPoints: 114102,
        },
        {
            userAddress: '0xb41e266bf546f313483dc6629bdb90fc52cbd6ac',
            chainPoints: 65279,
            chainRank: 5,
            chainId: '0x1',
            globalPoints: 65279,
        },
        {
            userAddress: 'harvest.eth',
            chainPoints: 62637,
            chainRank: 6,
            chainId: '0x1',
            globalPoints: 54984,
        },
        {
            userAddress: '0x1ab2f23e5df2de6f1474222d49c02cc4f1cc2b3a',
            chainPoints: 58517,
            chainRank: 7,
            chainId: '0x1',
            globalPoints: 60518,
        },
        {
            userAddress: '0x9f165ce53c4a97165ab0c83c4d796f79a8f93cf8',
            chainPoints: 54984,
            chainRank: 8,
            chainId: '0x1',
            globalPoints: 54172,
        },
        {
            userAddress: '0xabc.eth',
            chainPoints: 52299,
            chainRank: 9,
            chainId: '0x1',
            globalPoints: 62637,
        },
        {
            userAddress: '0x8cabc91193d9df2ac0bfe90191d40f23c773c171',
            chainPoints: 49387,
            chainRank: 10,
            chainId: '0x1',
            globalPoints: 17659,
        },
        {
            userAddress: '0x42.eth',
            chainPoints: 23461,
            chainRank: 11,
            chainId: '0x1',
            globalPoints: 19614,
        },
        {
            userAddress: '0x43398af8653fe5b8acd12cc10cf645ed67258a23',
            chainPoints: 19614,
            chainRank: 12,
            chainId: '0x1',
            globalPoints: 23461,
        },
        {
            userAddress: '0x1234.eth',
            chainPoints: 17141,
            chainRank: 13,
            chainId: '0x1',
            globalPoints: 52299,
        },
        {
            userAddress: '0x8cabc91193d9df2ac0bfe90191d40f23c773c171',
            chainPoints: 14519,
            chainRank: 14,
            chainId: '0x1',
            globalPoints: 14969,
        },
        {
            userAddress: '0x6969.eth',
            chainPoints: 13889,
            chainRank: 15,
            chainId: '0x1',
            globalPoints: 17141,
        },
        {
            userAddress: '0x4218868b1cc5374951eb63724342c7a875595028',
            chainPoints: 13744,
            chainRank: 16,
            chainId: '0x1',
            globalPoints: 13744,
        },
        {
            userAddress: '0x20487c28f296d3b2dab56e3f5d1aca1388f2bc6e',
            chainPoints: 13383,
            chainRank: 17,
            chainId: '0x1',
            globalPoints: 13383,
        },
        {
            userAddress: '0xbbcd2ef6cee3f5dd6b5ea118b44d9fd41af8b3a2',
            chainPoints: 12558,
            chainRank: 18,
            chainId: '0x1',
            globalPoints: 12823,
        },
        {
            userAddress: '0x2b667303b207c6d906a8fcc380a2c307ece7021e',
            chainPoints: 12332,
            chainRank: 19,
            chainId: '0x1',
            globalPoints: 12332,
        },
        {
            userAddress: '0x158c3a2005499301dc353afa9d0c9c5980b5277a',
            chainPoints: 11862,
            chainRank: 20,
            chainId: '0x1',
            globalPoints: 13178,
        },
        {
            userAddress: '0x27ef5b25c3cc65d07d09d025a514ab1af9ba2542',
            chainPoints: 11444,
            chainRank: 21,
            chainId: '0x1',
            globalPoints: 12460,
        },
        {
            userAddress: '0x7cb110db7029197c3621bea8092ab1996d5dd6ca',
            chainPoints: 10871,
            chainRank: 22,
            chainId: '0x1',
            globalPoints: 11059,
        },
        {
            userAddress: '0x44b1490a1878d0b61811726e2cb96560022e732e',
            chainPoints: 10452,
            chainRank: 23,
            chainId: '0x1',
            globalPoints: 10452,
        },
        {
            userAddress: '0xb49cdb63c943e9481c9b87db5c80f5ac333d164d4',
            chainPoints: 8713,
            chainRank: 24,
            chainId: '0x1',
            globalPoints: 9642,
        },
        {
            userAddress: '0x1098503a90c3224f0e6be7c124a337888c0ba564',
            chainPoints: 8412,
            chainRank: 25,
            chainId: '0x1',
            globalPoints: 8412,
        },
        {
            userAddress: '0x22e67fa925877813b744abc0917900c2b1d6ec92',
            chainPoints: 7763,
            chainRank: 26,
            chainId: '0x1',
            globalPoints: 7763,
        },
        {
            userAddress: '0x2188503a90c3224f0e6be7c124a337888c0ba453',
            chainPoints: 7625,
            chainRank: 27,
            chainId: '0x1',
            globalPoints: 9776,
        },
        {
            userAddress: '0x32107bdd0b6b1daa5bd98c0c8c2ebdef65f63b4c',
            chainPoints: 6867,
            chainRank: 28,
            chainId: '0x1',
            globalPoints: 6867,
        },
        {
            userAddress: '0x24ab32bcb59e08641453106ac9eb5dd7d7206a2',
            chainPoints: 6338,
            chainRank: 29,
            chainId: '0x1',
            globalPoints: 6338,
        },
        {
            userAddress: '0x69a439584ef1ba300106b9c16543eaa1de676ab1',
            chainPoints: 6277,
            chainRank: 30,
            chainId: '0x1',
            globalPoints: 6277,
        },
    ];

    const xpLeadersMockData =
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

    const xpLeaders = USE_MOCK_XP_DATA ? xpLeadersMockData : xpLeaderFetchData;

    return xpLeaders;
};
